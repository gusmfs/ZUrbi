# Mudanças recentes — UX mobile e cidadão

**Projeto:** zUrbi · Porto Seguro (BA) · **maio/2026**  
**Complementa:** [resumo-implementacoes-ia.md](resumo-implementacoes-ia.md) (triagem e Central de Operações)

---

## Por que mudamos

O fluxo original (mapa + formulário lado a lado, header largo, home com dados locais) não funcionava bem no **celular**, onde a maior parte dos cidadãos acessa o canal. Ajustamos navegação, home e abertura de chamado para **mobile-first**, com identidade da **Prefeitura de Porto Seguro**.

---

## O que mudou

| Área | Resumo |
|------|--------|
| **Header** | Mobile: logo + menu hambúrguer; links em painel overlay. Desktop: barra horizontal. Removida duplicação de “Abrir chamado”. |
| **Home** | Texto oficial Porto Seguro; estatísticas e últimos relatos via **API**; “Como funciona” e carrossel com visual da marca (sem emojis). |
| **Abrir chamado** | Passo 1: mapa em cima + formulário em painel inferior. Passos 2–4: só formulário, rodapé fixo com Continuar/Enviar. Progresso em barras (Local → Tipo → Revisar → Pronto). |
| **Formulário** | Sem checkboxes de risco/recorrente (API envia `false`). Confirmação mostra **endereço**, não coordenadas. Sucesso em card limpo com protocolo. |
| **Tipos de problema** | 26 subcategorias, sem repetir lixo entre Viário e Limpeza; triagem alinhada no backend. |
| **Dados demo** | Migração **V5**: 12 protocolos marcados como concluídos (menos ruído no mapa/fila). |

---

## Estatísticas na home (API)

- **Total:** chamados ativos (exceto cancelados)  
- **Em análise:** `RECEBIDO` + `EM_ANALISE`  
- **Em andamento:** `EM_ANDAMENTO` + `ENCAMINHADO_EMERGENCIA`  
- **Resolvidos:** `CONCLUIDO`

---

## Arquivos principais

`Header.jsx/css` · `Home.jsx/css` · `RecentReportsCarousel.jsx` · `MapReport.jsx/css` · `OcorrenciaForm.jsx` · `ProblemForm.css` · `constants/ocorrencia.js` · `TriagemKeywords.java` · `V5__concluir_chamados_demo.sql`

---

## Como testar

1. `npm run dev` (frontend) + `docker compose up -d --build app` (backend/V5)  
2. Mobile (~375px): header, `/registrar` (4 passos), home com números e carrossel  
3. Ver [testing-guide.md](testing-guide.md) para cenários de triagem e API

---

## Próximos passos (opcional)

Sheet arrastável no mapa; mini-mapa na confirmação; integração completa de Acompanhar/Análise com API.

---

*Registro interno — maio/2026.*
