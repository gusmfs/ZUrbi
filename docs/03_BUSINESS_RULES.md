# zUrbi — Regras de Negócio e Services

## 1. OcorrenciaService.java

### 1.1 Criação de Ocorrência

```java
@Transactional
public OcorrenciaResponseDTO criar(OcorrenciaRequestDTO dto,
                                   List<MultipartFile> midias,
                                   UUID usuarioId) {
    // 1. Buscar o usuário autenticado
    Usuario usuario = usuarioRepository.findById(usuarioId)
        .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

    // 2. Criar e salvar a Localizacao
    Localizacao localizacao = new Localizacao();
    localizacao.setLatitude(dto.latitude());
    localizacao.setLongitude(dto.longitude());
    localizacao.setEndereco(dto.endereco());

    // 3. Gerar protocolo único
    String protocolo = protocoloGenerator.gerar(); // ex: ZUR-2026-0001

    // 4. Criar a Ocorrencia
    Ocorrencia ocorrencia = new Ocorrencia();
    ocorrencia.setTitulo(dto.titulo());
    ocorrencia.setDescricao(dto.descricao());
    ocorrencia.setUrgencia(dto.urgencia());
    ocorrencia.setStatus(StatusOcorrencia.RECEBIDO);
    ocorrencia.setProtocolo(protocolo);
    ocorrencia.setUsuario(usuario);
    ocorrencia.setLocalizacao(localizacao);

    // 5. Salvar
    ocorrencia = ocorrenciaRepository.save(ocorrencia);

    // 6. Criar primeiro registro de HistoricoStatus
    historicoStatusService.registrar(ocorrencia, StatusOcorrencia.RECEBIDO);

    // 7. Processar upload de mídias (se houver)
    if (midias != null && !midias.isEmpty()) {
        midiaService.salvar(midias, ocorrencia);
    }

    // 8. Avaliar se é emergência
    emergenciaService.avaliarEEncaminhar(ocorrencia);

    return OcorrenciaMapper.toDTO(ocorrencia);
}
```

---

### 1.2 Atualização de Status

```java
@Transactional
public OcorrenciaResponseDTO atualizarStatus(UUID id, StatusOcorrencia novoStatus) {
    Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada"));

    validarTransicaoStatus(ocorrencia.getStatus(), novoStatus);

    ocorrencia.setStatus(novoStatus);
    ocorrenciaRepository.save(ocorrencia);

    historicoStatusService.registrar(ocorrencia, novoStatus);

    return OcorrenciaMapper.toDTO(ocorrencia);
}

private void validarTransicaoStatus(StatusOcorrencia atual, StatusOcorrencia novo) {
    Map<StatusOcorrencia, List<StatusOcorrencia>> transicoesValidas = Map.of(
        StatusOcorrencia.RECEBIDO,       List.of(StatusOcorrencia.EM_ANALISE, StatusOcorrencia.CANCELADO),
        StatusOcorrencia.EM_ANALISE,     List.of(StatusOcorrencia.EM_ATENDIMENTO, StatusOcorrencia.CANCELADO),
        StatusOcorrencia.EM_ATENDIMENTO, List.of(StatusOcorrencia.RESOLVIDO, StatusOcorrencia.CANCELADO)
    );

    List<StatusOcorrencia> permitidos = transicoesValidas.getOrDefault(atual, List.of());
    if (!permitidos.contains(novo)) {
        throw new IllegalArgumentException(
            String.format("Transição de '%s' para '%s' não é permitida.", atual, novo)
        );
    }
}
```

---

### 1.3 Isolamento de Dados por Perfil

```java
public Page<OcorrenciaResponseDTO> listar(StatusOcorrencia status,
                                           NivelUrgencia urgencia,
                                           Pageable pageable,
                                           Usuario usuarioAutenticado) {
    Page<Ocorrencia> resultado;

    if (usuarioAutenticado.getTipo() == TipoUsuario.CIDADAO) {
        // Cidadão só vê as próprias ocorrências
        resultado = ocorrenciaRepository.findByUsuarioId(
            usuarioAutenticado.getId(), pageable
        );
    } else {
        // Gestor vê todas
        resultado = ocorrenciaRepository.findAll(pageable);
    }

    return resultado.map(OcorrenciaMapper::toDTO);
}

public OcorrenciaResponseDTO buscarPorId(UUID id, Usuario usuarioAutenticado) {
    Ocorrencia ocorrencia = ocorrenciaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada"));

    if (usuarioAutenticado.getTipo() == TipoUsuario.CIDADAO
            && !ocorrencia.getUsuario().getId().equals(usuarioAutenticado.getId())) {
        throw new ForbiddenException("Acesso negado a esta ocorrência.");
    }

    return OcorrenciaMapper.toDTO(ocorrencia);
}
```

---

## 2. EmergenciaService.java

### 2.1 Avaliação e Encaminhamento

```java
@Async // Executar de forma assíncrona para não bloquear o response principal
public void avaliarEEncaminhar(Ocorrencia ocorrencia) {
    if (ocorrencia.getUrgencia() != NivelUrgencia.ALTA) return;

    String orgao = determinarOrgaoDestino(ocorrencia.getTitulo(), ocorrencia.getDescricao());
    if (orgao == null) return;

    // Criar registro de emergência
    Emergencia emergencia = new Emergencia();
    emergencia.setOcorrencia(ocorrencia);
    emergencia.setOrgaoDestino(orgao);
    emergencia.setStatusEnvio(StatusEnvio.PENDENTE);
    emergenciaRepository.save(emergencia);

    // Enviar webhook
    enviarWebhook(emergencia);
}

private String determinarOrgaoDestino(String titulo, String descricao) {
    String texto = (titulo + " " + descricao).toLowerCase();
    if (texto.matches(".*(incêndio|incendio|explosão|explosao|desabamento).*")) return "Bombeiros";
    if (texto.matches(".*(acidente|vítima|vitima|ferido|atropelamento).*")) return "SAMU";
    if (texto.matches(".*(assalto|violência|violencia|crime).*")) return "Polícia Militar";
    return null;
}

private void enviarWebhook(Emergencia emergencia) {
    try {
        webhookClient.enviar(emergencia); // ver EmergenciaWebhookClient
        emergencia.setStatusEnvio(StatusEnvio.ENVIADO);
    } catch (Exception e) {
        log.error("Falha ao enviar emergência {}: {}", emergencia.getId(), e.getMessage());
        emergencia.setStatusEnvio(StatusEnvio.FALHOU);
    }
    emergenciaRepository.save(emergencia);
}
```

### 2.2 EmergenciaWebhookClient.java

```java
@Component
public class EmergenciaWebhookClient {

    @Value("${zurbi.emergency.webhook-url}")
    private String webhookUrl;

    private final RestTemplate restTemplate;

    public void enviar(Emergencia emergencia) {
        Map<String, Object> payload = Map.of(
            "protocolo", emergencia.getOcorrencia().getProtocolo(),
            "orgao", emergencia.getOrgaoDestino(),
            "ocorrencia", Map.of(
                "titulo",     emergencia.getOcorrencia().getTitulo(),
                "descricao",  emergencia.getOcorrencia().getDescricao(),
                "urgencia",   emergencia.getOcorrencia().getUrgencia(),
                "latitude",   emergencia.getOcorrencia().getLocalizacao().getLatitude(),
                "longitude",  emergencia.getOcorrencia().getLocalizacao().getLongitude(),
                "endereco",   emergencia.getOcorrencia().getLocalizacao().getEndereco()
            )
        );

        restTemplate.postForEntity(webhookUrl, payload, Void.class);
    }
}
```

---

## 3. MidiaService.java

```java
@Service
public class MidiaService {

    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10MB
    private static final List<String> TIPOS_PERMITIDOS = List.of("image/jpeg", "image/png", "video/mp4");

    @Value("${zurbi.upload.dir}")
    private String uploadDir;

    @Transactional
    public void salvar(List<MultipartFile> arquivos, Ocorrencia ocorrencia) {
        if (arquivos.size() > 5) {
            throw new IllegalArgumentException("Máximo de 5 arquivos por ocorrência.");
        }

        for (MultipartFile arquivo : arquivos) {
            validarArquivo(arquivo);
            String url = salvarNoDiscoLocal(arquivo);

            Midia midia = new Midia();
            midia.setUrl(url);
            midia.setTipo(resolverTipo(arquivo.getContentType()));
            midia.setOcorrencia(ocorrencia);
            midiaRepository.save(midia);
        }
    }

    private void validarArquivo(MultipartFile arquivo) {
        if (arquivo.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("Arquivo excede o tamanho máximo de 10MB.");
        }
        if (!TIPOS_PERMITIDOS.contains(arquivo.getContentType())) {
            throw new IllegalArgumentException("Tipo de arquivo não permitido: " + arquivo.getContentType());
        }
    }

    private String salvarNoDiscoLocal(MultipartFile arquivo) {
        String nomeArquivo = UUID.randomUUID() + "_" + arquivo.getOriginalFilename();
        Path destino = Paths.get(uploadDir, nomeArquivo);
        Files.copy(arquivo.getInputStream(), destino);
        return "/uploads/" + nomeArquivo;
    }
}
```

---

## 4. ProtocoloGenerator.java

```java
@Component
public class ProtocoloGenerator {

    private final OcorrenciaRepository ocorrenciaRepository;

    public synchronized String gerar() {
        int ano = LocalDate.now().getYear();
        long total = ocorrenciaRepository.countByAno(ano);
        return String.format("ZUR-%d-%04d", ano, total + 1);
    }
}
```

**Query adicional no repository:**
```java
@Query("SELECT COUNT(o) FROM Ocorrencia o WHERE YEAR(o.criadoEm) = :ano")
long countByAno(@Param("ano") int ano);
```

---

## 5. HistoricoStatusService.java

```java
@Service
public class HistoricoStatusService {

    private final HistoricoStatusRepository repository;

    @Transactional
    public void registrar(Ocorrencia ocorrencia, StatusOcorrencia status) {
        HistoricoStatus historico = new HistoricoStatus();
        historico.setOcorrencia(ocorrencia);
        historico.setStatus(status);
        // atualizadoEm preenchido automaticamente pela entidade
        repository.save(historico);
    }
}
```

---

## 6. Regras de Autorização (resumo)

| Ação | CIDADAO | GESTOR |
|------|---------|--------|
| Criar ocorrência | ✅ | ✅ |
| Listar ocorrências | ✅ Só as próprias | ✅ Todas |
| Ver detalhes | ✅ Só as próprias | ✅ Todas |
| Alterar status | ❌ | ✅ |
| Comentar | ✅ Só nas próprias | ✅ Todas |
| Acessar dashboard | ❌ | ✅ |
| Reenviar emergência | ❌ | ✅ |

---

## 7. Validações de Entrada (Bean Validation)

| Campo | Regra |
|-------|-------|
| `titulo` | `@NotBlank @Size(min=5, max=100)` |
| `descricao` | `@NotBlank @Size(min=10, max=2000)` |
| `urgencia` | `@NotNull` + enum válido |
| `latitude` | `@NotNull @DecimalMin("-90.0") @DecimalMax("90.0")` |
| `longitude` | `@NotNull @DecimalMin("-180.0") @DecimalMax("180.0")` |
| `endereco` | `@NotBlank` |
| `email` | `@Email @NotBlank` |
| `senha` | `@Size(min=8)` |

---

## 8. application.properties

```properties
# Datasource
spring.datasource.url=jdbc:postgresql://localhost:5432/zurbi
spring.datasource.username=zurbi_user
spring.datasource.password=zurbi_pass
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false

# Flyway
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration

# Upload
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=60MB
zurbi.upload.dir=./uploads

# JWT
zurbi.jwt.secret=TROQUE_POR_UM_SECRET_FORTE_BASE64
zurbi.jwt.expiration=28800000

# Emergências
zurbi.emergency.webhook-url=https://sistema-externo.exemplo.com/api/chamados

# Swagger
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html
```
