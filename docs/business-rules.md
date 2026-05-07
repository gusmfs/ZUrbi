# zUrbi — Regras de Negócio

## O que é o zUrbi

Plataforma de monitoramento urbano que conecta **cidadãos** e **gestores públicos**. Cidadãos registram ocorrências urbanas (buracos, postes queimados, vazamentos etc.) e gestores analisam, priorizam e resolvem via painel com mapa inteligente.

---

## Perfis de usuário

| Perfil | O que pode fazer |
|---|---|
| `CIDADAO` | Registrar ocorrências, anexar fotos, acompanhar status |
| `GESTOR` | Ver painel de análise, atualizar status, filtrar por área/categoria |

---

## Ciclo de vida de uma ocorrência

```
RECEBIDO → EM_ANALISE → EM_ANDAMENTO → CONCLUIDO
                                  ↘ ENCAMINHADO_EMERGENCIA
         → CANCELADO (qualquer etapa)
```

- Toda mudança de status gera um registro em `tb_atualizacao_status` — nunca sobrescreve, sempre insere
- O status inicial é sempre `RECEBIDO`, definido automaticamente no `@PrePersist`
- `resolvidoEm` é preenchido apenas quando o status muda para `CONCLUIDO`

---

## Registro de ocorrência

1. Cidadão envia dados + fotos via `multipart/form-data`
2. Sistema gera protocolo no formato `ZUR-{ANO}-{sequencial}` (ex: `ZUR-2026-0315`)
3. Sistema busca o `Orgao` responsável automaticamente pela `categoria` da ocorrência
4. Imagens são enviadas ao MinIO — banco armazena apenas metadados e URL
5. Primeiro `AtualizacaoStatus` é inserido com status `RECEBIDO`

---

## Níveis de urgência

| Nível | SLA esperado | Comportamento |
|---|---|---|
| `BAIXA` | Até 72h | Entra na fila normal |
| `MEDIA` | Até 24h | Prioridade intermediária |
| `ALTA` | Prioritário | Encaminhamento imediato |

---

## Categorias e encaminhamento automático

Cada `Orgao` declara quais categorias atende (`categoriasAtendidas`). No momento do registro, o sistema busca o órgão pela categoria da ocorrência e o associa automaticamente.

Categorias disponíveis: `VIARIO`, `ILUMINACAO`, `SANEAMENTO`, `TRANSITO`, `LIMPEZA`

---

## Imagens

- Apenas arquivos do tipo `image/*` são aceitos
- Limite: 10MB por arquivo, 30MB por requisição
- Chave no MinIO: `ocorrencias/{ocorrenciaId}/{uuid}.{extensao}`
- Banco armazena: `storageKey`, `urlPublica`, `nomeOriginal`, `contentType`, `tamanhoBytes`
- Ao deletar uma ocorrência, as imagens no MinIO devem ser removidas antes da deleção no banco

---

## Regras gerais

- Senha nunca armazenada em texto puro — usar `BCryptPasswordEncoder`
- Entidades nunca expostas diretamente — sempre converter para DTO
- IDs são UUID em todas as tabelas
- `orgao_id` em `tb_ocorrencia` é nullable — preenchido após triagem, não no registro
