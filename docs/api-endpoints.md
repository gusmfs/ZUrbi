# API Endpoints

Base URL: `http://localhost:8080/api`

## Usuario
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/usuarios` | `UsuarioRequestDTO` | `201 UsuarioResponseDTO` |
| GET | `/usuarios/{id}` | — | `200 UsuarioResponseDTO` |

**UsuarioRequestDTO**
```json
{ "nome": "string", "email": "string", "senha": "string", "tipo": "CIDADAO|GESTOR" }
```

---

## Orgao
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/orgaos` | `OrgaoRequestDTO` | `201 OrgaoResponseDTO` |
| GET | `/orgaos` | — | `200 List<OrgaoResponseDTO>` |
| GET | `/orgaos/{id}` | — | `200 OrgaoResponseDTO` |

**OrgaoRequestDTO**
```json
{
  "nome": "string",
  "sigla": "string",
  "categoriasAtendidas": ["VIARIO|ILUMINACAO|SANEAMENTO|TRANSITO|LIMPEZA"],
  "prazoResolucaoHoras": 72
}
```

---

## Ocorrencia
| Method | Path | Body | Response |
|--------|------|------|----------|
| POST | `/ocorrencias` | `multipart/form-data` | `201 OcorrenciaResponseDTO` |
| GET | `/ocorrencias/{id}` | — | `200 OcorrenciaResponseDTO` |
| GET | `/ocorrencias` | query params | `200 List<OcorrenciaResponseDTO>` |
| PATCH | `/ocorrencias/{id}/status` | `{ status, observacao }` | `200 OcorrenciaResponseDTO` |
| PATCH | `/ocorrencias/{id}/orgao` | `{ orgaoId?, observacao? }` | `200 OcorrenciaResponseDTO` |
| GET | `/ocorrencias/{id}/triagem` | — | `200 TriagemResponseDTO` |
| POST | `/ocorrencias/{id}/triagem/aplicar` | `{ observacaoGestor? }` | `200 OcorrenciaResponseDTO` |

### Triagem (pré-registro — abertura de chamado)

| Método | Path | Body | Response |
|--------|------|------|----------|
| POST | `/triagem/classificar` | `{ descricao, riscoAcidente?, recorrente? }` | `200 TriagemClassificacaoResponseDTO` |

Retorna `categoria`, `subcategoria`, `urgenciaSugerida`, `orgaoId`, `orgaoNome`, `orgaoSigla`, `confianca`, `motivos`, `emergencia` (sem persistir ocorrência).

**TriagemResponseDTO**
```json
{
  "ocorrenciaId": "uuid",
  "protocolo": "ZUR-2026-0040",
  "orgaoId": "uuid",
  "orgaoNome": "Secretaria de Limpeza Urbana",
  "orgaoSigla": "SLU",
  "statusAtual": "EM_ANALISE",
  "statusSugerido": "EM_ANALISE",
  "prioridadeScore": 65,
  "confianca": 88,
  "motivos": ["Categoria Limpeza mapeada ao órgão SLU (SLU)."],
  "requerRevisaoHumana": false,
  "alinhadoComOrgaoAtual": false
}
```

**POST /triagem/aplicar** — body opcional; persiste órgão sugerido, atualiza status quando aplicável e grava histórico. Retorna `400` se cancelada ou sem órgão sugerido.

**POST multipart/form-data fields**
```
dados (application/json):
{
  "usuarioId": "uuid",
  "categoria": "VIARIO|ILUMINACAO|SANEAMENTO|TRANSITO|LIMPEZA",
  "subcategoria": "string",
  "descricao": "string",
  "urgencia": "BAIXA|MEDIA|ALTA",
  "latitude": -23.5505,
  "longitude": -46.6333,
  "enderecoAproximado": "string",
  "bairro": "string",
  "riscoAcidente": false,
  "recorrente": false
}
imagens: File[] (image/*, max 10MB each, 30MB total)
```

**GET /ocorrencias query params**
```
?usuarioId=uuid
?status=RECEBIDO|EM_ANALISE|EM_ANDAMENTO|CONCLUIDO|ENCAMINHADO_EMERGENCIA|CANCELADO
?categoria=VIARIO|ILUMINACAO|SANEAMENTO|TRANSITO|LIMPEZA
?bairro=string
```

---

## Response patterns
- `201` → POST that creates a resource
- `200` → GET and PATCH
- `404` → resource not found
- `400` → validation error
- `500` → unexpected error

**OcorrenciaResponseDTO includes:**
- All incident fields + `protocolo`
- `orgaoResponsavel` (name + sigla)
- `midias[]` → list of MidiaResponseDTO
- `historico[]` → list of AtualizacaoStatusResponseDTO ordered ASC
