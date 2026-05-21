# Testing Guide

## Local credentials
```
API:      http://localhost:8080/api
Postgres: localhost:5432 / zurbi_db / zurbi_user / zurbi_pass
MinIO:    http://localhost:9001 / minioadmin / minioadmin
```

## Startup checklist
```bash
docker compose up postgres minio -d   # start infra
docker compose ps                     # confirm "healthy"
mvn spring-boot:run                   # start app
# Look for: "Started ZurbiApplication" + Flyway V1–V4 applied
```

---

## Seed demo Porto Seguro (V4)

A migração `V4__seed_porto_seguro.sql` insere dados de demonstração:

- 12 cidadãos + 1 gestor (senha dev: `senha123`)
- 5 órgãos com categorias de atendimento
- **50 ocorrências** em Porto Seguro (BA), 15 bairros, protocolos `ZUR-2026-0001` … `ZUR-2026-0050`
- Histórico de status em `tb_atualizacao_status`

**Reset do banco** (aplica V4 do zero):

```bash
docker compose down -v
docker compose up --build -d
```

**Consultas rápidas:**

```bash
# Listar todas (50)
curl http://localhost:8080/api/ocorrencias

# Filtrar por bairro
curl "http://localhost:8080/api/ocorrencias?bairro=Centro"
curl "http://localhost:8080/api/ocorrencias?bairro=Tancredo%20Neves"

# Filtrar por categoria e status
curl "http://localhost:8080/api/ocorrencias?categoria=ILUMINACAO&status=RECEBIDO"

# Detalhe com histórico
curl http://localhost:8080/api/ocorrencias/c3000001-0000-4000-8000-000000000001
```

**SQL (container `zurbi-db`):**

```bash
docker exec zurbi-db psql -U zurbi_user -d zurbi_db -c "SELECT COUNT(*) FROM tb_ocorrencia;"
docker exec zurbi-db psql -U zurbi_user -d zurbi_db -c "SELECT bairro, COUNT(*) FROM tb_ocorrencia GROUP BY bairro ORDER BY 2 DESC;"
```

---

## Test sequence (order matters — dependencies exist)

### 1. Create Orgao
```bash
curl -X POST http://localhost:8080/api/orgaos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Secretaria Municipal de Infraestrutura",
    "sigla": "SMI",
    "categoriasAtendidas": ["VIARIO"],
    "prazoResolucaoHoras": 72
  }'
# Save the returned "id" as ORGAO_ID
```

### 2. Create Usuario
```bash
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@zurbi.com",
    "senha": "123456",
    "tipo": "CIDADAO"
  }'
# Save the returned "id" as USUARIO_ID
```

### 3. Register Ocorrencia with image
```bash
curl -X POST http://localhost:8080/api/ocorrencias \
  -F 'dados={
    "usuarioId": "<USUARIO_ID>",
    "categoria": "VIARIO",
    "subcategoria": "Buraco na via",
    "descricao": "Buraco profundo próximo ao cruzamento",
    "urgencia": "ALTA",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "enderecoAproximado": "Av. Paulista, 1000",
    "bairro": "Bela Vista",
    "riscoAcidente": true,
    "recorrente": false
  };type=application/json' \
  -F 'imagens=@/path/to/image.jpg'
# Save the returned "id" as OCORRENCIA_ID
# Save the returned "protocolo" (ZUR-2026-XXXX)
```

### 4. Get Ocorrencia (verify midias + historico)
```bash
curl http://localhost:8080/api/ocorrencias/<OCORRENCIA_ID>
# Expect: midias[] with urlPublica, historico[] with RECEBIDO entry
```

### 5. Update status
```bash
curl -X PATCH http://localhost:8080/api/ocorrencias/<OCORRENCIA_ID>/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "EM_ANALISE", "observacao": "Equipe técnica acionada" }'
```

### 6. Get Ocorrencia again (verify historico has 2 entries)
```bash
curl http://localhost:8080/api/ocorrencias/<OCORRENCIA_ID>
# historico[] should have: RECEBIDO → EM_ANALISE
```

### 7. Filter by status (gestor panel)
```bash
curl "http://localhost:8080/api/ocorrencias?status=EM_ANALISE"
curl "http://localhost:8080/api/ocorrencias?categoria=VIARIO&bairro=Bela%20Vista"
curl "http://localhost:8080/api/ocorrencias?usuarioId=<USUARIO_ID>"
```

### 8. Triagem automática (Fase 1)

Chamados do seed **sem órgão** e ainda ativos: `ZUR-2026-0040`, `ZUR-2026-0046` (LIMPEZA, `EM_ANALISE`).

```bash
# Consultar sugestão (somente leitura)
curl http://localhost:8080/api/ocorrencias/c3000001-0000-4000-8000-000000000040/triagem

# Aplicar encaminhamento (persiste orgao + histórico)
curl -X POST http://localhost:8080/api/ocorrencias/c3000001-0000-4000-8000-000000000040/triagem/aplicar \
  -H "Content-Type: application/json" \
  -d '{"observacaoGestor": "Confirmado na Central de Operações"}'

# Conferir detalhe após aplicar
curl http://localhost:8080/api/ocorrencias/c3000001-0000-4000-8000-000000000040
```

Exemplo ILUMINACAO → CIP:

```bash
curl http://localhost:8080/api/ocorrencias/c3000001-0000-4000-8000-000000000011/triagem
```

Emergência (termos na descrição) → DCM e status `ENCAMINHADO_EMERGENCIA` quando status permitir alteração.

---

## Verify image in MinIO
After step 3, open `http://localhost:9001` in browser.  
Navigate to `zurbi-midias` bucket → `ocorrencias/` → confirm file exists.

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused 5432` | Postgres not running | `docker compose up postgres -d` |
| `Connection refused 9000` | MinIO not running | `docker compose up minio -d` |
| `Flyway checksum mismatch` | Edited executed migration | Never edit V1/V2/V3 — create new Vn |
| `validate` schema error | Entity field missing in DB | Check entity matches migration |
| `404` on ocorrencia POST | No Orgao for that categoria | Create Orgao first (step 1) |
| `415` on multipart POST | Missing `;type=application/json` on dados field | Add content type to -F dados |
| Port 8080 in use | Another instance running | Kill process or change port |
