-- src/main/resources/db/migration/V1__create_tables.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE tb_orgao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    sigla VARCHAR(20),
    prazo_resolucao_horas INTEGER
);

CREATE TABLE tb_orgao_categorias (
    orgao_id UUID NOT NULL REFERENCES tb_orgao(id) ON DELETE CASCADE,
    categoria VARCHAR(50) NOT NULL,
    PRIMARY KEY (orgao_id, categoria)
);

CREATE TABLE tb_usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('CIDADAO', 'GESTOR')),
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE tb_ocorrencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocolo VARCHAR(30) NOT NULL UNIQUE,
    usuario_id UUID NOT NULL REFERENCES tb_usuario(id),
    orgao_id UUID REFERENCES tb_orgao(id),
    categoria VARCHAR(50) NOT NULL,
    subcategoria VARCHAR(100) NOT NULL,
    descricao TEXT,
    urgencia VARCHAR(20) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'RECEBIDO',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    endereco_aproximado VARCHAR(300),
    bairro VARCHAR(100),
    risco_acidente BOOLEAN NOT NULL DEFAULT FALSE,
    recorrente BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    resolvido_em TIMESTAMP
);

CREATE TABLE tb_atualizacao_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID NOT NULL REFERENCES tb_ocorrencia(id) ON DELETE CASCADE,
    status_anterior VARCHAR(40) NOT NULL,
    status_novo VARCHAR(40) NOT NULL,
    observacao TEXT,
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ocorrencia_status   ON tb_ocorrencia(status);
CREATE INDEX idx_ocorrencia_categoria ON tb_ocorrencia(categoria);
CREATE INDEX idx_ocorrencia_bairro   ON tb_ocorrencia(bairro);
CREATE INDEX idx_ocorrencia_usuario  ON tb_ocorrencia(usuario_id);
CREATE INDEX idx_atualizacao_ocorrencia ON tb_atualizacao_status(ocorrencia_id);