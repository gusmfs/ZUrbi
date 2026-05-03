-- Script de inicialização do PostgreSQL para criar usuário e banco
-- Executado automaticamente na primeira inicialização do container

-- Criar usuário (compatível com PostgreSQL 16+)
DO
$$
BEGIN
  CREATE USER zurbi_user WITH PASSWORD 'zurbi_pass';
EXCEPTION WHEN DUPLICATE_OBJECT THEN
  RAISE NOTICE 'User zurbi_user already exists';
END
$$;

-- Dar permissões
ALTER USER zurbi_user CREATEDB;

-- Criar banco de dados (fora do transaction block)
CREATE DATABASE zurbi_db OWNER zurbi_user;

-- Garantir permissões no banco
GRANT ALL PRIVILEGES ON DATABASE zurbi_db TO zurbi_user;
