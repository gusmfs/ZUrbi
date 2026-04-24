# zUrbi — Visão Geral do Projeto

## O que é o zUrbi?

O zUrbi é uma **plataforma de monitoramento e gestão urbana proativa** que conecta cidadãos à gestão pública. O sistema permite que cidadãos registrem ocorrências urbanas (buracos, postes quebrados, vazamentos, etc.) e que gestores públicos acompanhem, priorizem e resolvam essas demandas com base em dados.

**Tagline:** Ver · Priorizar · Agir

---

## Contexto do Sistema

O backend do zUrbi expõe uma API REST consumida por:

1. **Aplicativo do Cidadão** — registro de ocorrências, acompanhamento de status, envio de fotos e geolocalização.
2. **Painel do Gestor Público** — dashboard com mapa inteligente, métricas, filtros por categoria/bairro e gerenciamento de demandas.
3. **Sistema Externo de Emergências** — recebe chamados de alta urgência encaminhados automaticamente (SAMU, Polícia, Bombeiros).

---

## Atores do Sistema

| Ator | Descrição |
|------|-----------|
| `CIDADAO` | Usuário comum que registra ocorrências pelo app |
| `GESTOR` | Funcionário público com acesso ao painel de monitoramento |
| `SISTEMA_EXTERNO` | Serviço externo que recebe encaminhamentos de emergência via webhook |

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Linguagem | Java 17+ |
| Framework | Spring Boot 3.x |
| Persistência | Spring Data JPA + Hibernate |
| Banco de Dados | PostgreSQL |
| Migrações de Schema | Flyway |
| Autenticação | Spring Security + JWT (biblioteca `jjwt`) |
| Upload de Arquivos | Spring Multipart (`MultipartFile`) |
| Validação | Bean Validation (Jakarta — `@Valid`, `@NotBlank`, etc.) |
| HTTP Client (webhook) | `RestTemplate` ou `WebClient` (Spring WebFlux) |
| Build | Maven |
| Documentação da API | SpringDoc OpenAPI 2.x (Swagger UI em `/swagger-ui.html`) |
| Testes | JUnit 5 + Mockito + Spring Boot Test |

---

## Dependências Maven (pom.xml)

```xml
<dependencies>
    <!-- Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- Segurança -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- JPA + Hibernate -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>

    <!-- Validação -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- PostgreSQL Driver -->
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
        <scope>runtime</scope>
    </dependency>

    <!-- Flyway -->
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-core</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>

    <!-- Swagger/OpenAPI -->
    <dependency>
        <groupId>org.springdoc</groupId>
        <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
        <version>2.3.0</version>
    </dependency>

    <!-- Lombok (reduz boilerplate) -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>

    <!-- Testes -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

## Estrutura de Pacotes

```
com.zurbi/
├── ZurbiApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   └── OpenApiConfig.java
├── modules/
│   ├── auth/
│   │   ├── AuthController.java
│   │   ├── AuthService.java
│   │   └── dto/
│   │       ├── LoginRequestDTO.java
│   │       ├── LoginResponseDTO.java
│   │       └── RegisterRequestDTO.java
│   ├── usuario/
│   │   ├── Usuario.java
│   │   ├── TipoUsuario.java          ← enum
│   │   ├── UsuarioRepository.java
│   │   ├── UsuarioService.java
│   │   └── dto/UsuarioResponseDTO.java
│   ├── ocorrencia/
│   │   ├── Ocorrencia.java
│   │   ├── StatusOcorrencia.java     ← enum
│   │   ├── NivelUrgencia.java        ← enum
│   │   ├── OcorrenciaRepository.java
│   │   ├── OcorrenciaService.java
│   │   ├── OcorrenciaController.java
│   │   └── dto/
│   │       ├── OcorrenciaRequestDTO.java
│   │       ├── OcorrenciaResponseDTO.java
│   │       └── AtualizarStatusDTO.java
│   ├── localizacao/
│   │   ├── Localizacao.java
│   │   └── LocalizacaoRepository.java
│   ├── midia/
│   │   ├── Midia.java
│   │   ├── TipoMidia.java            ← enum
│   │   ├── MidiaService.java
│   │   └── MidiaRepository.java
│   ├── comentario/
│   │   ├── Comentario.java
│   │   ├── ComentarioService.java
│   │   ├── ComentarioController.java
│   │   └── dto/
│   ├── historico/
│   │   ├── HistoricoStatus.java
│   │   └── HistoricoStatusRepository.java
│   ├── emergencia/
│   │   ├── Emergencia.java
│   │   ├── StatusEnvio.java          ← enum
│   │   ├── EmergenciaService.java
│   │   ├── EmergenciaController.java
│   │   └── EmergenciaWebhookClient.java
│   └── dashboard/
│       ├── DashboardController.java
│       ├── DashboardService.java
│       └── dto/
│           ├── MetricasDTO.java
│           ├── OcorrenciaMapaDTO.java
│           └── HotspotDTO.java
├── shared/
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── ResourceNotFoundException.java
│   │   └── ForbiddenException.java
│   ├── security/
│   │   ├── JwtUtil.java
│   │   ├── JwtAuthFilter.java
│   │   └── UserDetailsServiceImpl.java
│   └── util/
│       └── ProtocoloGenerator.java
└── resources/
    ├── application.properties
    └── db/migration/
        ├── V1__create_usuarios.sql
        ├── V2__create_ocorrencias.sql
        ├── V3__create_localizacoes.sql
        ├── V4__create_midias.sql
        ├── V5__create_comentarios.sql
        ├── V6__create_historico_status.sql
        └── V7__create_emergencias.sql
```

---

## Documentos de Referência

| Arquivo | Conteúdo |
|---------|----------|
| `01_DATA_MODEL.md` | Entidades JPA com anotações, enums, relacionamentos e scripts Flyway |
| `02_API_ROUTES.md` | Todos os endpoints REST com contratos de request/response |
| `03_BUSINESS_RULES.md` | Regras de negócio, fluxos de status, validações e lógica dos Services |
| `04_AUTH.md` | Configuração completa de Spring Security + JWT |
| `05_DIAGRAMS.md` | Referência textual dos diagramas UML do projeto |
