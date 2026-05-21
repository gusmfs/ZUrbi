-- Marca chamados demo como CONCLUIDO (solicitado para demonstração / mapa da Central).

INSERT INTO tb_atualizacao_status (id, ocorrencia_id, status_anterior, status_novo, observacao, atualizado_em)
SELECT
    gen_random_uuid(),
    o.id,
    o.status,
    'CONCLUIDO',
    'Problema resolvido',
    NOW()
FROM tb_ocorrencia o
WHERE o.protocolo IN (
    'ZUR-2026-0036',
    'ZUR-2026-0006',
    'ZUR-2026-0021',
    'ZUR-2026-0032',
    'ZUR-2026-0045',
    'ZUR-2026-0041',
    'ZUR-2026-0011',
    'ZUR-2026-0026',
    'ZUR-2026-0027',
    'ZUR-2026-0049',
    'ZUR-2026-0034',
    'ZUR-2026-0004'
)
  AND o.status <> 'CONCLUIDO';

UPDATE tb_ocorrencia
SET status = 'CONCLUIDO',
    resolvido_em = COALESCE(resolvido_em, criado_em + INTERVAL '5 days')
WHERE protocolo IN (
    'ZUR-2026-0036',
    'ZUR-2026-0006',
    'ZUR-2026-0021',
    'ZUR-2026-0032',
    'ZUR-2026-0045',
    'ZUR-2026-0041',
    'ZUR-2026-0011',
    'ZUR-2026-0026',
    'ZUR-2026-0027',
    'ZUR-2026-0049',
    'ZUR-2026-0034',
    'ZUR-2026-0004'
)
  AND status <> 'CONCLUIDO';
