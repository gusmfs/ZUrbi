# zUrbi — Referência de Diagramas UML

Este documento descreve os diagramas UML do projeto em formato textual para consulta do desenvolvedor durante a implementação.

---

## 1. Diagrama de Caso de Uso

### Ator: Cidadão
| Caso de Uso | Mapeamento no Backend |
|-------------|----------------------|
| Cadastrar-se & Login | `POST /api/v1/auth/register` e `POST /api/v1/auth/login` |
| Registrar ocorrência | `POST /api/v1/ocorrencias` |
| Anexar foto | `POST /api/v1/ocorrencias` (campo `midias` no multipart) |
| Enviar localização | campos `latitude`, `longitude`, `endereco` no DTO |
| Classificar urgência | campo `urgencia` no `OcorrenciaRequestDTO` |

### Ator: Gestor Público
| Caso de Uso | Mapeamento no Backend |
|-------------|----------------------|
| Cadastrar-se & Login | `POST /api/v1/auth/register` (tipo=GESTOR) |
| Painel de Ocorrências | `GET /api/v1/dashboard/metricas` |
| Visualizar mapa inteligente | `GET /api/v1/dashboard/mapa` + `GET /api/v1/dashboard/hotspots` |
| Analisar dados | `GET /api/v1/dashboard/metricas` |

### Ator: Sistema Externo
| Caso de Uso | Mapeamento no Backend |
|-------------|----------------------|
| Receber chamados | `EmergenciaWebhookClient.enviar()` faz POST no endpoint externo |

### Extensão automática
- `Classificar urgência` → `Encaminhar emergência`: disparado em `EmergenciaService.avaliarEEncaminhar()` quando `urgencia = ALTA` e contém palavras-chave de risco.

---

## 2. Diagrama de Sequência — Criar Ocorrência

```
Usuário → App (Frontend) → OcorrenciaController → OcorrenciaService → Repositórios → Banco de Dados
                                                        ↓
                                               EmergenciaService (@Async)
                                                        ↓
                                               EmergenciaWebhookClient → Sistema Externo
```

**Passos em código:**
1. `POST /api/v1/ocorrencias` chega no `OcorrenciaController`
2. `JwtAuthFilter` valida o token e injeta o usuário no `SecurityContext`
3. `OcorrenciaController` delega para `OcorrenciaService.criar()`
4. `OcorrenciaService` cria `Localizacao`, gera protocolo, salva `Ocorrencia`
5. `HistoricoStatusService.registrar()` cria o primeiro entry de status
6. `MidiaService.salvar()` processa os uploads (se existirem)
7. `EmergenciaService.avaliarEEncaminhar()` roda assincronamente (`@Async`)
8. Se for emergência: `EmergenciaWebhookClient.enviar()` faz POST no sistema externo
9. `OcorrenciaController` retorna `201 Created` com o `OcorrenciaResponseDTO`

---

## 3. Diagrama de Atividades — Fluxo do Cidadão

```
[Início]
    ↓
[Usuário faz login]  →  POST /auth/login  →  JWT gerado
    ↓
[Seleciona "Nova ocorrência"]
    ↓
[Etapa 1 - Problema]
    Preenche: titulo, descricao, categoria, foto (MultipartFile)
    ↓
[Etapa 2 - Local]
    Captura: latitude, longitude  (Geolocation API do app)
    Frontend faz reverse geocoding → preenche 'endereco'
    ↓
[Etapa 3 - Urgência]
    Seleciona: BAIXA | MEDIA | ALTA
    ↓
[Etapa 4 - Revisão]
    App monta OcorrenciaRequestDTO + arquivos
    POST /api/v1/ocorrencias (multipart/form-data)
    ↓
[Backend processa]
    ↓
[É emergência?]
    ├── NÃO → status = RECEBIDO, entra na fila normal
    └── SIM → EmergenciaService cria Emergencia + envia webhook assíncrono
    ↓
[Retorno 201] com protocolo ZUR-XXXX-YYYY
    ↓
[App exibe tela de confirmação]
```

---

## 4. Diagrama de Classes → Entidades JPA

```
┌──────────────────────┐          ┌──────────────────────────┐
│       Usuario        │          │        Ocorrencia         │
├──────────────────────┤  1    *  ├──────────────────────────┤
│ UUID id              │──────────│ UUID id                  │
│ String nome          │          │ String titulo            │
│ String email         │          │ String descricao         │
│ String senha         │          │ StatusOcorrencia status  │
│ TipoUsuario tipo     │          │ NivelUrgencia urgencia   │
│ LocalDateTime criado │          │ String protocolo         │
└──────────────────────┘          │ FK usuario_id            │
          │                       │ FK localizacao_id        │
          │ 1..*                  │ LocalDateTime criadoEm   │
          ▼                       └──────────────────────────┘
┌──────────────────────┐                    │
│      Comentario      │          ┌─────────┴──────────────────────────────┐
├──────────────────────┤          │          │              │               │
│ UUID id              │          ▼          ▼              ▼               ▼
│ String mensagem      │  ┌────────────┐ ┌────────┐ ┌──────────────┐ ┌──────────┐
│ FK usuario_id        │  │Localizacao │ │ Midia  │ │HistoricoStat.│ │Emergencia│
│ FK ocorrencia_id     │  ├────────────┤ ├────────┤ ├──────────────┤ ├──────────┤
│ LocalDateTime criado │  │ UUID id    │ │ UUID id│ │ UUID id      │ │ UUID id  │
└──────────────────────┘  │ latitude   │ │ url    │ │ status       │ │orgao     │
                          │ longitude  │ │ tipo   │ │ FK ocorr_id  │ │statusEnv │
                          │ endereco   │ │FK ocorr│ │ atualizadoEm │ │FK ocorr  │
                          └────────────┘ └────────┘ └──────────────┘ └──────────┘
```

---

## Notas para o Desenvolvedor

- O diagrama de sequência representa o **happy path**. Tratar erros conforme `GlobalExceptionHandler`.
- O `@Async` na `EmergenciaService` exige `@EnableAsync` na classe de configuração principal ou em `SecurityConfig`.
- As transições de status do diagrama de atividades são validadas em `OcorrenciaService.validarTransicaoStatus()`.
- O diagrama de classes mapeia diretamente para as entidades JPA em `01_DATA_MODEL.md`.
