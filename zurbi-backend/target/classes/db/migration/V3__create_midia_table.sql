-- tb_midia — metadados das fotos (arquivo no MinIO)

CREATE TABLE tb_midia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID NOT NULL REFERENCES tb_ocorrencia(id) ON DELETE CASCADE,
    storage_key VARCHAR(500) NOT NULL,
    url_publica VARCHAR(1000) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    content_type VARCHAR(120) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    enviado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_midia_ocorrencia ON tb_midia(ocorrencia_id);
