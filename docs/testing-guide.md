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
# Look for: "Started ZurbiApplication" + Flyway V1, V2, V3 applied
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
