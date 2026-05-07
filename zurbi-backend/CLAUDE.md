# zUrbi Backend

Urban monitoring platform. Citizens report urban incidents with photos; officials resolve via dashboard.

## Stack
Java 21 · Spring Boot 3.4.5 · PostgreSQL 16 · MinIO · Flyway · Lombok · Maven

## Commands
```bash
docker compose up postgres minio -d  # infra first
mvn spring-boot:run                  # run app
mvn clean package                    # build
mvn test                             # tests
docker compose up --build            # full docker
```

## Modules
`usuario` · `orgao` · `ocorrencia` · `midia` · `atualizacaostatus` · `health`

## Module pattern
```
modulo/
├── Entidade.java            # @Entity, @PrePersist, FetchType.LAZY
├── EntidadeRepository.java  # extends JpaRepository<Entidade, UUID>
├── EntidadeService.java     # business logic, converts to DTO
├── EntidadeController.java  # receives DTO → calls service → returns ResponseDTO
└── dto/
    ├── EntidadeRequestDTO.java   # @NotBlank @NotNull @Email
    └── EntidadeResponseDTO.java  # no passwords, no sensitive data
```

## Enums
```
StatusOcorrencia:    RECEBIDO → EM_ANALISE → EM_ANDAMENTO → CONCLUIDO
                                                          ↘ ENCAMINHADO_EMERGENCIA
                     CANCELADO (any stage)
CategoriaOcorrencia: VIARIO · ILUMINACAO · SANEAMENTO · TRANSITO · LIMPEZA
NivelUrgencia:       BAIXA (72h) · MEDIA (24h) · ALTA (prioritário)
TipoUsuario:         CIDADAO · GESTOR
```

## Non-negotiable rules
- Never return entity directly → always DTO
- Never plain text password → BCrypt only
- Never edit executed migration → create new `V{n}__description.sql`
- Never access Repository from Controller → always through Service
- Status change → always insert AtualizacaoStatus, never overwrite
- Image delete → remove from MinIO before PostgreSQL

## Migrations (`src/main/resources/db/migration/`)
- V1 → core tables + indices
- V2 → seed data  
- V3 → tb_midia

## Docs (read before implementing)
- `docs/api-endpoints.md` → endpoints, payloads, HTTP status
- `docs/error-handling.md` → exceptions, response format
- `docs/storage-flow.md` → MinIO upload/delete flow
- `docs/testing-guide.md` → curl examples, test sequence
- `docs/business-rules.md` → flows, urgency, categories
- `docs/database.md` → tables, FKs, indices
- `docs/project-architecture.md` → patterns, component roles
- `docs/anti-patterns.md` → not do

#BEHAVIOR:
- follow_existing_patterns
- no_overengineering
- minimal_code_changes
- prefer consistency over creativity
- reuse existing structure
- preserve architecture clean code
- document complex functions