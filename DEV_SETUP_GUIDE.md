# Guia de Setup de Desenvolvimento — Docker

## Status da Aplicação

Quando o comando `docker-compose -f docker-compose.dev.yml up --build` terminar, você verá mensagens assim:

```
zurbi-app-dev | 2026-05-03 15:30:00.000 INFO 1 --- [main] b.c.z.ZurbiApplication : Started ZurbiApplication in X seconds
zurbi-postgres | (healthcheck passed)
zurbi-minio | (started)
```

---

## Validar que tudo está funcionando

### 1. **Verificar se a app está rodando**
```bash
curl http://localhost:8080/api/health
```
Esperado: resposta `200 OK` com status

### 2. **Verificar o banco de dados**
**Opção A: Via Beekeeper Studio**
1. Abra Beekeeper Studio
2. Create New Connection → PostgreSQL
3. Preencha:
   - Host: `localhost`
   - Port: `5432`
   - Username: `zurbi_user`
   - Password: `zurbi_pass`
   - Database: `zurbi_db`
4. Teste a conexão → deve funcionar

5. Clique em `flyway_schema_history` — você deve ver as 3 migrações executadas:
   - V1__create_tables.sql
   - V2__seed_data.sql
   - V3__create_midia_table.sql

**Opção B: Via linha de comando (psql)**
```bash
psql -h localhost -U zurbi_user -d zurbi_db
# Digite a senha: zurbi_pass

# No prompt postgres:
zurbi_db=# \dt  # lista todas as tabelas
zurbi_db=# SELECT * FROM flyway_schema_history;  # mostra migrações executadas
```

### 3. **Verificar logs da aplicação**
```bash
docker-compose -f docker-compose.dev.yml logs -f app
```

### 4. **Testar um endpoint da API**
```bash
# Criar um usuário
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

## Desenvolvimento com Hot-Reload

Agora você pode **editar código** e as mudanças **recarregam automaticamente**:

1. Edite um arquivo em `src/main/java/...`
2. Salve o arquivo
3. Spring DevTools detecta a mudança em ~5 segundos
4. App reinicia automaticamente
5. Veja a mudança em `docker-compose -f docker-compose.dev.yml logs -f app`

---

## Parar/Resetar

```bash
# Ver logs em tempo real
docker-compose -f docker-compose.dev.yml logs -f

# Parar containers (mantém dados)
docker-compose -f docker-compose.dev.yml down

# Parar e resetar banco (remove volumes)
docker-compose -f docker-compose.dev.yml down -v

# Parar tudo
docker-compose -f docker-compose.dev.yml down
```

---

## Se algo deu errado

### App não inicia
```bash
# Ver erro completo
docker-compose -f docker-compose.dev.yml logs app
```

### PostgreSQL não conecta
Pode ser porta 5432 já em uso:
```bash
# Ver o que está usando 5432
lsof -i :5432

# Matar processo (se necessário)
kill -9 <PID>
```

### MinIO não abre
Console está em `http://localhost:9001`
- User: `minioadmin`
- Senha: `minioadmin`

---

## Próximos passos

1. ✅ Validar com `curl http://localhost:8080/api/health`
2. ✅ Conectar ao banco no Beekeeper
3. ✅ Ver migrações em `flyway_schema_history`
4. ✅ Testar criar um usuário via curl acima

**Está tudo funcionando? Avise quando estiver pronto para os próximos passos!**
