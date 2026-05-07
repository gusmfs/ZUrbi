# zUrbi — Arquitetura do Projeto

## Stack

- **Java 21** + **Spring Boot 3.4.5**
- **PostgreSQL 16** via Docker
- **MinIO** para armazenamento de imagens (compatível com S3)
- **Flyway** para versionamento do banco
- **Lombok** para redução de boilerplate

---

## Princípios de organização

- Estrutura por **feature**, não por camada — tudo relativo a `ocorrencia` fica junto
- **DTOs** sempre separados das entidades — entidade nunca sai direta no response
- **Repositories** são interfaces puras — lógica fica no Service
- **StorageService** é a única classe que conhece o MinIO — isolamento total

---

## Estrutura de pastas

```
zurbi-backend/
├── docker-compose.yml          # postgres + minio + app
├── Dockerfile                  # build em 2 estágios (JDK builder + JRE final)
├── pom.xml
└── src/main/
    ├── java/br/com/zurbi/
    │   ├── ZurbiApplication.java
    │   │
    │   ├── config/
    │   │   ├── MinioConfig.java          # cria bean MinioClient + garante bucket
    │   │   └── DatabaseConfig.java
    │   │
    │   ├── shared/
    │   │   ├── enums/                    # StatusOcorrencia, Categoria, Urgencia, TipoUsuario
    │   │   ├── storage/
    │   │   │   └── StorageService.java   # upload e delete no MinIO
    │   │   └── exception/
    │   │       ├── GlobalExceptionHandler.java
    │   │       └── ResourceNotFoundException.java
    │   │
    │   └── modules/
    │       ├── usuario/
    │       ├── orgao/
    │       ├── ocorrencia/
    │       ├── midia/
    │       └── atualizacaostatus/
    │
    └── resources/
        ├── application.properties
        └── db/migration/
            ├── V1__create_tables.sql
            └── V2__create_midia_table.sql
```

---

## Anatomia de um módulo

Cada módulo segue o mesmo padrão de 4 camadas:

```
modulo/
├── Entidade.java           # @Entity JPA — apenas mapeamento, sem lógica
├── EntidadeRepository.java # interface JpaRepository<Entidade, UUID>
├── EntidadeService.java    # regras de negócio, orquestra repository e outros services
├── EntidadeController.java # @RestController — recebe request, chama service, retorna DTO
└── dto/
    ├── EntidadeRequestDTO.java  # entrada — com validações @NotBlank, @NotNull
    └── EntidadeResponseDTO.java # saída — nunca inclui senha ou dados sensíveis
```

---

## Fluxo de uma requisição

```
HTTP Request
    │
    ▼
Controller        recebe e valida o DTO de entrada
    │
    ▼
Service           executa a regra de negócio
    │             pode chamar StorageService para imagens
    │             pode chamar outros Services
    ▼
Repository        persiste ou consulta no PostgreSQL
    │
    ▼
Controller        converte entidade para DTO de saída
    │
    ▼
HTTP Response
```

---

## Módulo Ocorrencia — fluxo de registro (POST)

```
multipart/form-data (dados + imagens)
    │
    ▼
OcorrenciaController
    │
    ▼
OcorrenciaService
    ├── gera protocolo ZUR-{ANO}-{seq}
    ├── busca Orgao pela categoria (OrgaoRepository)
    ├── salva Ocorrencia (status = RECEBIDO)
    ├── para cada imagem:
    │       StorageService.upload() → MinIO
    │       salva Midia com metadados + URL
    └── insere AtualizacaoStatus (RECEBIDO)
```

---

## Configuração por ambiente

`application.properties` usa variáveis com fallback local:

```properties
# Em desenvolvimento local (sem Docker):
# usa os valores após os ":"

spring.datasource.url=${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/zurbi_db}
minio.url=${MINIO_URL:http://localhost:9000}
```

No `docker-compose.yml` as variáveis de ambiente sobrescrevem os fallbacks automaticamente.

---

## Migrações do banco

| Arquivo | Conteúdo |
|---|---|
| `V1__create_tables.sql` | Cria todas as tabelas e índices |
| `V2__create_midia_table.sql` | Cria `tb_midia` |

**Regra:** nunca editar um arquivo de migração já executado. Sempre criar um novo `V{n}__descricao.sql`.
