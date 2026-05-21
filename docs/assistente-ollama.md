# Capítulo — Implantação do assistente com Ollama (zUrbi)

## 1. Posicionamento no projeto

O zUrbi incorpora IA em **duas camadas**. A primeira — e principal — é o **motor de triagem por regras** (vocabulário e lógica no backend), usado na abertura do chamado e na Central de Operações. A segunda é um **assistente conversacional em fase piloto**, disponível na Central (`/central-ia`), que consulta a fila em linguagem natural com apoio de um **modelo de linguagem executado localmente via Ollama**.

Esta camada **não substitui** a triagem oficial: o gestor continua confirmando encaminhamentos pelo fluxo de triagem; o assistente apenas **resume e lista** dados já persistidos no banco. O projeto trata essa integração como **início da experimentação com LLM no código**, sujeita a ajustes de modelo, desempenho e qualidade das respostas.

---

## 2. Arquitetura da solução

```text
Gestor (navegador)
    → Frontend React (chat na Central)
    → API Spring Boot  (/api/assistente/status | /chat)
    → Montagem de contexto (PostgreSQL: fila ativa, órgãos, contagens)
    → Ollama (localhost:11434 ou container)
    → Resposta em texto / tabela Markdown
```

| Componente | Responsabilidade |
|------------|------------------|
| `CentralIAAssistente.jsx` | Interface do chat, histórico de mensagens, chips de sugestão |
| `AssistenteGestorService` | Prompt do sistema, contexto dinâmico, detecção de órgão em foco |
| `OllamaClient` | Chamada HTTP ao endpoint `/api/chat` do Ollama |
| PostgreSQL | Fonte única de verdade para números, protocolos e órgãos |

O backend envia ao modelo: estatísticas da plataforma, resumo da fila ativa, contagem por órgão (SOI, SLU, CIP, ESB, DCM), e — quando o gestor fala de uma secretaria — uma **listagem filtrada** só daquele órgão. Para pedidos de **tabela ou lista** com órgão identificado, a resposta pode ser **montada diretamente no Java**, sem depender do modelo, evitando linhas incorretas de outros departamentos.

---

## 3. Implantação do Ollama

### 3.1 Pré-requisitos

- Aplicação zUrbi em execução (backend na porta `8080`, banco com seed demo).
- [Ollama](https://ollama.com) instalado na máquina do desenvolvedor ou servidor de demonstração.

### 3.2 Instalação e modelo

```bash
# Serviço local (deixar rodando em um terminal)
ollama serve

# Modelo padrão configurado no projeto (leve, resposta mais rápida)
ollama pull qwen2.5:1.5b

# Alternativa com mais qualidade e maior latência
ollama pull llama3.2
```

### 3.3 Configuração no backend

Propriedades em `application.properties` (sobrescritas por variáveis de ambiente):

| Propriedade | Padrão | Função |
|-------------|--------|--------|
| `zurbi.ollama.enabled` | `true` | Liga/desliga o assistente |
| `zurbi.ollama.base-url` | `http://localhost:11434` | URL do Ollama |
| `zurbi.ollama.model` | `qwen2.5:1.5b` | Modelo carregado no Ollama |
| `zurbi.ollama.timeout-seconds` | `120` | Tempo máximo de espera |
| `zurbi.ollama.max-chamados-no-contexto` | `8` | Limite de linhas na listagem enviada ao modelo |

Com o backend no **Docker** e o Ollama no **host Windows/Mac**, usar `ZURBI_OLLAMA_BASE_URL=http://host.docker.internal:11434` no `docker-compose.yml`.

### 3.4 Validação

```bash
curl http://localhost:8080/api/assistente/status
```

Resposta esperada: `disponivel: true` e nome do modelo. No frontend, abrir a Central de Operações, clicar no assistente (FAB) e enviar, por exemplo: *Quantos chamados em aberto na SOI?*

---

## 4. Comportamento esperado e limitações

**O assistente é útil para:** totais da fila, chamados sem órgão, resolvidos, perguntas por secretaria (nome ou sigla), e pedidos de tabela após definir o órgão na conversa.

**Limitações conscientes desta versão:**

- Modelos pequenos podem ignorar instruções; por isso listagens críticas usam resposta **determinística** no servidor.
- Respostas podem demorar (timeout ampliado no proxy Vite e no backend).
- Requer Ollama ativo na máquina — sem ele, a API retorna orientação de instalação (`503` / mensagem no chat).
- Não há aprendizado com histórico municipal nem envio de dados para nuvem; tudo roda **on-premise** na demo.

---

## 5. Relação com a evolução da IA no zUrbi

A implantação do Ollama valida o canal **gestor ↔ dados da fila em linguagem natural**, enquanto o motor de regras permanece como base auditável. Próximos passos naturais: ampliar intenções cobertas, endurecer testes automatizados do contexto, avaliar modelos maiores apenas onde a latência for aceitável, e manter métricas de acurácia separadas para **triagem** e **assistente**.

Para procedimentos de teste passo a passo, ver também a seção *Assistente Ollama* em `docs/testing-guide.md`.
