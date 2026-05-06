# Storage Flow (MinIO)

## Infrastructure
```
localhost:9000  → MinIO API (Java SDK connects here)
localhost:9001  → MinIO Console (browser, debug only)
bucket: zurbi-midias
```

## Key format
```
ocorrencias/{ocorrenciaId}/{uuid}.{extension}

Example:
ocorrencias/3f2a1b.../a9c4d2e1-....jpg
```

## What MinIO stores vs PostgreSQL

```
MinIO                              PostgreSQL (tb_midia)
─────────────────────────────      ─────────────────────────────
Physical file (bytes)              storage_key  VARCHAR(500)
                                   url_publica  VARCHAR(1000)
                                   nome_original VARCHAR(255)
                                   content_type  VARCHAR(120)
                                   tamanho_bytes BIGINT
                                   ocorrencia_id FK
```

## Upload flow

```
Controller receives MultipartFile[]
        ↓
OcorrenciaService.criar()
        ├── saves Ocorrencia → gets UUID
        └── for each file:
              StorageService.upload(file, ocorrenciaId)
                ├── validates: file != null, !empty, contentType starts with "image/"
                ├── generates key: ocorrencias/{ocorrenciaId}/{uuid}.{ext}
                ├── MinioClient.putObject() → sends bytes to MinIO
                └── returns StorageResult { storageKey, urlPublica, nomeOriginal, contentType, tamanhoBytes }
              saves Midia to PostgreSQL with StorageResult data
```

## Delete flow

**Order is critical — always delete from MinIO before PostgreSQL:**

```
1. fetch all Midia records for the Ocorrencia
2. for each Midia:
     StorageService.deletar(midia.getStorageKey())  → MinIO
3. delete Ocorrencia from PostgreSQL (CASCADE removes tb_midia rows)
```

If step 2 fails, abort — do not delete from database.  
If database has CASCADE and MinIO delete fails silently, orphan files remain in storage.

## StorageResult record

```java
public record StorageResult(
    String storageKey,
    String urlPublica,
    String nomeOriginal,
    String contentType,
    long tamanhoBytes
) {}
```

## MinioConfig on startup

```
Spring starts → MinioConfig.minioClient() bean created
                      ├── connects to MinIO (url + credentials)
                      └── checks if bucket "zurbi-midias" exists
                              ├── yes → continue
                              └── no  → creates bucket automatically
```

## Environment variables

| Variable | Local default | Docker value |
|----------|--------------|--------------|
| `MINIO_URL` | `http://localhost:9000` | `http://minio:9000` |
| `MINIO_ACCESS_KEY` | `minioadmin` | `minioadmin` |
| `MINIO_SECRET_KEY` | `minioadmin` | `minioadmin` |
| `MINIO_BUCKET` | `zurbi-midias` | `zurbi-midias` |
| `MINIO_PUBLIC_URL` | `http://localhost:9000` | `http://localhost:9000` |

> `MINIO_PUBLIC_URL` is used to build `urlPublica` in responses.  
> In production, replace with CDN or public domain URL.
