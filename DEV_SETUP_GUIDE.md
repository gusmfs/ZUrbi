# Guia de Setup de Desenvolvimento

## Pré-requisitos

- Docker + Docker Compose instalados
- Arquivo `.env` na raiz do projeto (já existe — não comitar com senhas reais)

> **Porta 5433:** o PostgreSQL do Docker roda na porta `5433` porque a `5432` já está ocupada pelo PostgreSQL instalado localmente na máquina. Dentro dos containers, a comunicação continua em `5432`.

---

## Subir o ambiente de desenvolvimento

```bash
# Na raiz do projeto (onde está o docker-compose.dev.yml)
docker compose -f docker-compose.dev.yml up --build
```

Quando terminar você verá:

```
zurbi-app-dev | Started ZurbiApplication in X seconds
zurbi-db      | (healthcheck passed)
zurbi-minio   | (started)
```

---

## Validar que tudo está funcionando

### 1. App respondendo

```bash
curl http://localhost:8080/api/health
```

Esperado: `200 OK`

---

### 2. Banco de dados

**Via Beekeeper Studio**

1. Abra o Beekeeper Studio
2. New Connection → PostgreSQL
3. Preencha:
   - Host: `localhost`
   - Port: **`5433`** ← não é a padrão, use 5433
   - Username: `zurbi_user`
   - Password: `zurbi_pass`
   - Database: `zurbi_db`
4. Teste a conexão
5. Abra `flyway_schema_history` — deve mostrar 3 migrações executadas:
   - `V1__create_tables`
   - `V2__seed_data`
   - `V3__create_midia_table`

**Via linha de comando**

```bash
psql -h localhost -p 5433 -U zurbi_user -d zurbi_db
# Senha: zurbi_pass

zurbi_db=# \dt                              # lista tabelas
zurbi_db=# SELECT * FROM flyway_schema_history;  # migrações
```

---

### 3. MinIO (armazenamento de imagens)

Console disponível em `http://localhost:9001`
- User: `minioadmin`
- Senha: `minioadmin`

---

### 4. Testar um endpoint

```bash
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "senha123",
    "tipo": "CIDADAO"
  }'
```

Esperado: resposta com `id`, `nome`, `email`, `tipo`, `criadoEm`

---

## Hot-reload (edição sem reiniciar)

O Spring DevTools está ativo no ambiente dev:

1. Edite um arquivo em `zurbi-backend/src/main/java/...`
2. Salve
3. Em ~5 segundos o app reinicia automaticamente
4. Acompanhe: `docker compose -f docker-compose.dev.yml logs -f app`

---

## Comandos úteis

```bash
# Logs em tempo real
docker compose -f docker-compose.dev.yml logs -f

# Parar containers (mantém dados)
docker compose -f docker-compose.dev.yml down

# Parar e apagar banco (reset completo)
docker compose -f docker-compose.dev.yml down -v

# Rebuild da imagem da app
docker compose -f docker-compose.dev.yml up --build app
```

---

## Troubleshooting

### App não sobe

```bash
docker compose -f docker-compose.dev.yml logs app
```

### Erro de conexão com o banco

Confirme que está usando a porta `5433` (não `5432`) nas ferramentas externas.  
Internamente entre containers a porta é `5432` — isso é normal.

### MinIO não abre

Acesse `http://localhost:9001` (console) ou `http://localhost:9000` (API).
