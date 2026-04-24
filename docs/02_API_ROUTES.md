# zUrbi — Rotas da API (Spring Boot REST)

## Convenções

- **Base URL:** `/api/v1`
- **Autenticação:** Bearer Token JWT no header `Authorization: Bearer <token>`
- **Content-Type padrão:** `application/json`
- **Upload de arquivos:** `multipart/form-data`
- Rotas marcadas com 🔒 exigem autenticação (`@SecurityRequirement`).
- Rotas marcadas com 👑 exigem perfil `GESTOR`.

---

## Auth — `AuthController.java`

**Mapeamento base:** `/api/v1/auth`

### `POST /auth/register`

```java
@PostMapping("/register")
@ResponseStatus(HttpStatus.CREATED)
public UsuarioResponseDTO register(@RequestBody @Valid RegisterRequestDTO dto)
```

**RegisterRequestDTO:**
```java
public record RegisterRequestDTO(
    @NotBlank String nome,
    @Email @NotBlank String email,
    @Size(min = 8) String senha,
    @NotNull TipoUsuario tipo
) {}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "nome": "João Silva",
  "email": "joao@email.com",
  "tipo": "CIDADAO",
  "criadoEm": "2026-04-13T00:00:00"
}
```

**Erros:** `400` (validação), `409` (email já existe)

---

### `POST /auth/login`

```java
@PostMapping("/login")
public LoginResponseDTO login(@RequestBody @Valid LoginRequestDTO dto)
```

**LoginRequestDTO:**
```java
public record LoginRequestDTO(
    @Email @NotBlank String email,
    @NotBlank String senha
) {}
```

**Response `200`:**
```json
{
  "accessToken": "eyJhbGci...",
  "usuario": {
    "id": "uuid",
    "nome": "João Silva",
    "tipo": "CIDADAO"
  }
}
```

**Erros:** `401` (credenciais inválidas)

---

## Ocorrências — `OcorrenciaController.java`

**Mapeamento base:** `/api/v1/ocorrencias`

### `POST /ocorrencias` 🔒

Cria uma nova ocorrência. Aceita multipart para upload de fotos.

```java
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
@ResponseStatus(HttpStatus.CREATED)
public OcorrenciaResponseDTO criar(
    @RequestPart("dados") @Valid OcorrenciaRequestDTO dto,
    @RequestPart(value = "midias", required = false) List<MultipartFile> midias,
    @AuthenticationPrincipal UserDetails userDetails
)
```

**OcorrenciaRequestDTO:**
```java
public record OcorrenciaRequestDTO(
    @NotBlank @Size(min = 5, max = 100) String titulo,
    @NotBlank @Size(min = 10, max = 2000) String descricao,
    @NotNull NivelUrgencia urgencia,
    @NotNull @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
    @NotNull @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
    @NotBlank String endereco
) {}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "titulo": "Buraco na via",
  "descricao": "Buraco profundo na faixa da direita...",
  "status": "RECEBIDO",
  "urgencia": "ALTA",
  "protocolo": "ZUR-2026-0315",
  "localizacao": {
    "latitude": -19.27177,
    "longitude": -40.31591,
    "endereco": "Avenida Virgílio Grassi, São Sebastião"
  },
  "midias": [],
  "criadoEm": "2026-04-13T10:00:00"
}
```

**Comportamento automático (no Service):**
- Gera protocolo único (`ProtocoloGenerator`).
- Cria `HistoricoStatus` com `RECEBIDO`.
- Avalia se deve criar `Emergencia` (ver `03_BUSINESS_RULES.md`).

---

### `GET /ocorrencias` 🔒

```java
@GetMapping
public Page<OcorrenciaResponseDTO> listar(
    @RequestParam(required = false) StatusOcorrencia status,
    @RequestParam(required = false) NivelUrgencia urgencia,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @AuthenticationPrincipal UserDetails userDetails
)
```

- **CIDADAO:** retorna apenas as suas próprias ocorrências.
- **GESTOR:** retorna todas.

**Response `200`:**
```json
{
  "content": [...],
  "totalElements": 42,
  "totalPages": 3,
  "number": 0,
  "size": 20
}
```

---

### `GET /ocorrencias/{id}` 🔒

```java
@GetMapping("/{id}")
public OcorrenciaResponseDTO buscarPorId(
    @PathVariable UUID id,
    @AuthenticationPrincipal UserDetails userDetails
)
```

- **CIDADAO:** lança `ForbiddenException` se a ocorrência não lhe pertencer.
- Retorna objeto completo com `historico`, `midias`, `comentarios` e `emergencia`.

**Erros:** `403`, `404`

---

### `PATCH /ocorrencias/{id}/status` 🔒 👑

```java
@PatchMapping("/{id}/status")
public OcorrenciaResponseDTO atualizarStatus(
    @PathVariable UUID id,
    @RequestBody @Valid AtualizarStatusDTO dto
)
```

**AtualizarStatusDTO:**
```java
public record AtualizarStatusDTO(@NotNull StatusOcorrencia status) {}
```

- Valida se a transição de status é permitida (ver `03_BUSINESS_RULES.md`).
- Cria novo registro em `HistoricoStatus`.

**Erros:** `400` (transição inválida), `404`

---

## Comentários — `ComentarioController.java`

**Mapeamento base:** `/api/v1/ocorrencias/{ocorrenciaId}/comentarios`

### `POST /ocorrencias/{ocorrenciaId}/comentarios` 🔒

```java
@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public ComentarioResponseDTO adicionar(
    @PathVariable UUID ocorrenciaId,
    @RequestBody @Valid ComentarioRequestDTO dto,
    @AuthenticationPrincipal UserDetails userDetails
)
```

**ComentarioRequestDTO:**
```java
public record ComentarioRequestDTO(@NotBlank String mensagem) {}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "mensagem": "Equipe agendada para amanhã às 9h.",
  "usuario": { "id": "uuid", "nome": "Gestor João", "tipo": "GESTOR" },
  "criadoEm": "2026-04-13T12:00:00"
}
```

---

### `GET /ocorrencias/{ocorrenciaId}/comentarios` 🔒

```java
@GetMapping
public List<ComentarioResponseDTO> listar(@PathVariable UUID ocorrenciaId)
```

---

## Dashboard — `DashboardController.java`

**Mapeamento base:** `/api/v1/dashboard`  
**Acesso:** apenas `GESTOR` 👑

### `GET /dashboard/metricas`

```java
@GetMapping("/metricas")
public MetricasDTO obterMetricas()
```

**Response `200`:**
```json
{
  "totalAtivas": 28,
  "altaUrgencia": 7,
  "tempoMedioRespostaHoras": 18,
  "bairroMaisCritico": "Campinas",
  "porStatus": {
    "RECEBIDO": 12,
    "EM_ANALISE": 9,
    "EM_ATENDIMENTO": 7,
    "RESOLVIDO": 152
  }
}
```

---

### `GET /dashboard/mapa`

```java
@GetMapping("/mapa")
public List<OcorrenciaMapaDTO> obterDadosMapa(
    @RequestParam(required = false) StatusOcorrencia status,
    @RequestParam(required = false) NivelUrgencia urgencia
)
```

**OcorrenciaMapaDTO:**
```java
public record OcorrenciaMapaDTO(
    UUID id,
    String titulo,
    NivelUrgencia urgencia,
    StatusOcorrencia status,
    Double latitude,
    Double longitude
) {}
```

---

### `GET /dashboard/hotspots`

```java
@GetMapping("/hotspots")
public List<HotspotDTO> obterHotspots()
```

**HotspotDTO:**
```java
public record HotspotDTO(String bairro, long total, long altaUrgencia) {}
```

---

## Emergências — `EmergenciaController.java`

**Mapeamento base:** `/api/v1/emergencias`  
**Acesso:** apenas `GESTOR` 👑

### `GET /emergencias`

```java
@GetMapping
public List<EmergenciaResponseDTO> listar()
```

### `POST /emergencias/{id}/reenviar`

```java
@PostMapping("/{id}/reenviar")
public EmergenciaResponseDTO reenviar(@PathVariable UUID id)
```

Força reenvio do webhook para emergências com `statusEnvio = FALHOU`.

---

## Tratamento Global de Erros — `GlobalExceptionHandler.java`

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponseDTO handleValidation(MethodArgumentNotValidException ex) { ... }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponseDTO handleNotFound(ResourceNotFoundException ex) { ... }

    @ExceptionHandler(ForbiddenException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponseDTO handleForbidden(ForbiddenException ex) { ... }

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponseDTO handleConflict(DataIntegrityViolationException ex) { ... }
}
```

**Formato padrão do erro:**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "O campo 'urgencia' é obrigatório.",
  "statusCode": 400,
  "timestamp": "2026-04-13T10:00:00"
}
```

**ErrorResponseDTO:**
```java
public record ErrorResponseDTO(
    String error,
    String message,
    int statusCode,
    LocalDateTime timestamp
) {}
```
