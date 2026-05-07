# zUrbi — Relacionamentos do Banco de Dados

## Visão geral

```
tb_usuario ──────────────────────── tb_ocorrencia
                                         │
tb_orgao ────────────────────────────────┤
   │                                     │
tb_orgao_categorias          ┌───────────┴───────────┐
                             │                       │
                    tb_atualizacao_status          tb_midia
```

---

## Tabelas e relacionamentos

### `tb_usuario` → `tb_ocorrencia`
- **Tipo:** 1 para N
- **Campo:** `tb_ocorrencia.usuario_id` (FK, NOT NULL)
- **Regra:** Um usuário pode ter zero ou várias ocorrências. Toda ocorrência pertence a exatamente um usuário.

---

### `tb_orgao` → `tb_ocorrencia`
- **Tipo:** 1 para N
- **Campo:** `tb_ocorrencia.orgao_id` (FK, **nullable**)
- **Regra:** `orgao_id` começa nulo e é preenchido automaticamente no registro pela categoria da ocorrência. Um órgão pode ter várias ocorrências.

---

### `tb_orgao` → `tb_orgao_categorias`
- **Tipo:** 1 para N (tabela auxiliar de coleção)
- **Campo:** `tb_orgao_categorias.orgao_id` (FK, NOT NULL)
- **Regra:** Cada linha representa uma categoria que o órgão atende. Mapeado com `@ElementCollection` no Java. Usado para encaminhamento automático.

```sql
-- Exemplo: buscar órgão pela categoria
SELECT o.* FROM tb_orgao o
JOIN tb_orgao_categorias c ON c.orgao_id = o.id
WHERE c.categoria = 'VIARIO';
```

---

### `tb_ocorrencia` → `tb_atualizacao_status`
- **Tipo:** 1 para N
- **Campo:** `tb_atualizacao_status.ocorrencia_id` (FK, NOT NULL, CASCADE DELETE)
- **Regra:** Cada mudança de status gera um novo registro — nunca atualiza o anterior. Sempre ordenar por `atualizado_em ASC` para exibir o histórico.

---

### `tb_ocorrencia` → `tb_midia`
- **Tipo:** 1 para N
- **Campo:** `tb_midia.ocorrencia_id` (FK, NOT NULL, CASCADE DELETE)
- **Regra:** Uma ocorrência pode ter zero ou várias fotos. O arquivo físico fica no MinIO; o banco armazena apenas metadados e a URL pública.

---

## Mapeamento Java → SQL

| Entidade Java | Tabela SQL | Anotação principal |
|---|---|---|
| `Usuario` | `tb_usuario` | `@Entity` |
| `Orgao` | `tb_orgao` | `@Entity` |
| `Orgao.categoriasAtendidas` | `tb_orgao_categorias` | `@ElementCollection` |
| `Ocorrencia` | `tb_ocorrencia` | `@Entity` |
| `AtualizacaoStatus` | `tb_atualizacao_status` | `@Entity` |
| `Midia` | `tb_midia` | `@Entity` |

---

## Índices criados

| Tabela | Coluna indexada | Motivo |
|---|---|---|
| `tb_ocorrencia` | `status` | Filtro do painel do gestor |
| `tb_ocorrencia` | `categoria` | Encaminhamento e filtros |
| `tb_ocorrencia` | `bairro` | Hotspots por região |
| `tb_ocorrencia` | `usuario_id` | Listar ocorrências do cidadão |
| `tb_atualizacao_status` | `ocorrencia_id` | Buscar histórico da ocorrência |
| `tb_midia` | `ocorrencia_id` | Buscar fotos da ocorrência |
