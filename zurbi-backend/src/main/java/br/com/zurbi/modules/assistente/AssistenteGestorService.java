package br.com.zurbi.modules.assistente;

import br.com.zurbi.config.OllamaProperties;
import br.com.zurbi.modules.assistente.dto.AssistenteChatRequestDTO;
import br.com.zurbi.modules.assistente.dto.AssistenteChatResponseDTO;
import br.com.zurbi.modules.assistente.dto.AssistenteMensagemDTO;
import br.com.zurbi.modules.assistente.dto.AssistenteStatusResponseDTO;
import br.com.zurbi.modules.ocorrencia.Ocorrencia;
import br.com.zurbi.modules.ocorrencia.OcorrenciaRepository;
import br.com.zurbi.modules.orgao.Orgao;
import br.com.zurbi.modules.orgao.OrgaoRepository;
import br.com.zurbi.modules.triagem.TriagemService;
import br.com.zurbi.modules.triagem.dto.TriagemResponseDTO;
import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import br.com.zurbi.shared.enums.NivelUrgencia;
import br.com.zurbi.shared.enums.StatusOcorrencia;
import br.com.zurbi.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssistenteGestorService {

    private static final String SYSTEM_PROMPT = """
            Assistente do zUrbi (Porto Seguro, BA). Responda em português, de forma direta e breve.
            Use só o CONTEXTO. ESTATÍSTICAS GERAIS = totais do banco (inclui resolvidos). FILA ATIVA = em aberto.
            Não invente números nem protocolos.
            Ao detalhar 2 ou mais chamados, use tabela Markdown com cabeçalho e linha separadora, colunas:
            | Protocolo | Status | Categoria | Órgão | Urgência | Bairro |
            Preencha só com dados do contexto. Para um único número ou frase curta, texto simples basta.
            Perguntas "quantos em aberto na SOI/SLU/CIP/ESB/DCM" → use CHAMADOS EM ABERTO POR ÓRGÃO (siglas no contexto).
            Se existir LISTAGEM DO FOCO DA CONVERSA e o gestor pedir tabela/lista/detalhes, use SOMENTE as linhas dessa seção.
            Nunca copie a tabela de VISÃO GERAL (prioridade alta) quando o foco for um órgão, bairro ou assunto já tratado no histórico.
            """;

    private final OllamaClient ollamaClient;
    private final OllamaProperties ollamaProperties;
    private final OcorrenciaRepository ocorrenciaRepository;
    private final OrgaoRepository orgaoRepository;
    private final TriagemService triagemService;

    public AssistenteStatusResponseDTO status() {
        boolean disponivel = ollamaClient.disponivel();
        String orientacao = disponivel
                ? "Assistente pronto. O contexto da fila é atualizado a cada mensagem."
                : "Instale e inicie o Ollama (ollama serve), depois execute: ollama pull " + ollamaProperties.getModel();
        return new AssistenteStatusResponseDTO(
                disponivel,
                ollamaProperties.isEnabled(),
                ollamaProperties.getModel(),
                ollamaProperties.getBaseUrl(),
                orientacao
        );
    }

    public AssistenteChatResponseDTO conversar(AssistenteChatRequestDTO dto) {
        List<AssistenteMensagemDTO> historico = dto.historico() != null ? dto.historico() : List.of();
        String mensagemAtual = dto.mensagem().trim();
        List<Ocorrencia> ativas = ocorrenciaRepository.listarAtivasParaAssistente();
        Optional<Orgao> focoOrgao = detectarFocoOrgao(historico, mensagemAtual);

        if (focoOrgao.isPresent() && isPedidoListagemOuDetalheOrgao(mensagemAtual)) {
            List<Ocorrencia> doOrgao = filtrarAtivosPorOrgao(ativas, focoOrgao.get());
            return new AssistenteChatResponseDTO(
                    montarRespostaListagemOrgao(focoOrgao.get(), doOrgao),
                    ollamaProperties.getModel(),
                    true
            );
        }

        String contexto = montarContexto(dto.ocorrenciaSelecionadaId(), historico, mensagemAtual, focoOrgao, ativas);
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", SYSTEM_PROMPT + "\n\nCONTEXTO:\n" + contexto));

        int maxHist = Math.max(0, ollamaProperties.getMaxHistoricoMensagens());
        int from = Math.max(0, historico.size() - maxHist);
        for (AssistenteMensagemDTO msg : historico.subList(from, historico.size())) {
            messages.add(Map.of("role", msg.role(), "content", msg.content()));
        }
        messages.add(Map.of("role", "user", "content", mensagemAtual));

        String resposta = ollamaClient.chat(messages);
        return new AssistenteChatResponseDTO(
                resposta,
                ollamaProperties.getModel(),
                true
        );
    }

    private String montarContexto(
            UUID selecionadaId,
            List<AssistenteMensagemDTO> historico,
            String mensagemAtual,
            Optional<Orgao> focoOrgao,
            List<Ocorrencia> ativas) {
        Map<StatusOcorrencia, Long> totaisPorStatus = carregarTotaisPorStatus();
        StringBuilder sb = new StringBuilder();
        sb.append("Município: Porto Seguro, BA\n");
        sb.append("Data/hora da consulta: ").append(java.time.LocalDateTime.now()).append("\n\n");

        long totalGeral = totaisPorStatus.values().stream().mapToLong(Long::longValue).sum();
        long resolvidos = totaisPorStatus.getOrDefault(StatusOcorrencia.CONCLUIDO, 0L);
        long cancelados = totaisPorStatus.getOrDefault(StatusOcorrencia.CANCELADO, 0L);
        long totalSemCancelados = totalGeral - cancelados;

        sb.append("=== ESTATÍSTICAS GERAIS DA PLATAFORMA (todos os chamados no banco) ===\n");
        sb.append("Total de chamados registrados: ").append(totalGeral).append("\n");
        sb.append("Total exceto cancelados: ").append(totalSemCancelados).append("\n");
        sb.append("Resolvidos (status Concluído): ").append(resolvidos).append("\n");
        sb.append("Cancelados: ").append(cancelados).append("\n");
        sb.append("Detalhe por status:\n");
        totaisPorStatus.forEach((status, qtd) ->
                sb.append("  - ").append(labelStatus(status)).append(": ").append(qtd).append("\n"));
        sb.append("\n");

        sb.append("=== RESUMO DA FILA ATIVA (em aberto — não inclui concluídos nem cancelados) ===\n");
        sb.append("Total ativos: ").append(ativas.size()).append("\n");
        sb.append("Sem órgão definido: ").append(ativas.stream().filter(o -> o.getOrgaoResponsavel() == null).count()).append("\n");
        sb.append("Urgência ALTA: ").append(ativas.stream().filter(o -> o.getUrgencia() == NivelUrgencia.ALTA).count()).append("\n");
        sb.append("Marcados recorrentes: ").append(ativas.stream().filter(Ocorrencia::isRecorrente).count()).append("\n");
        sb.append("Com risco de acidente: ").append(ativas.stream().filter(Ocorrencia::isRiscoAcidente).count()).append("\n\n");

        sb.append("Por status:\n");
        contarPorStatus(ativas).forEach((status, qtd) ->
                sb.append("  - ").append(labelStatus(status)).append(": ").append(qtd).append("\n"));

        sb.append("\nPor categoria:\n");
        contarPorCategoria(ativas).forEach((cat, qtd) ->
                sb.append("  - ").append(labelCategoria(cat)).append(": ").append(qtd).append("\n"));

        sb.append("\nTop bairros na fila ativa:\n");
        for (var entry : topBairros(ativas, 5)) {
            sb.append("  - ").append(entry.getKey()).append(": ").append(entry.getValue()).append("\n");
        }

        sb.append("\n=== ÓRGÃOS CADASTRADOS (referência de siglas) ===\n");
        orgaoRepository.findAll().stream()
                .sorted((a, b) -> String.CASE_INSENSITIVE_ORDER.compare(
                        a.getSigla() != null ? a.getSigla() : "",
                        b.getSigla() != null ? b.getSigla() : ""))
                .forEach(org -> sb.append("  - ")
                        .append(org.getSigla() != null ? org.getSigla() : "—")
                        .append(": ")
                        .append(org.getNome())
                        .append("\n"));

        sb.append("\n=== CHAMADOS EM ABERTO POR ÓRGÃO RESPONSÁVEL ===\n");
        sb.append("(Contagem só da fila ativa; perguntas por SOI, SLU, CIP, ESB, DCM ou nome da secretaria.)\n");
        contarAtivosPorOrgao(ativas).forEach((orgao, qtd) ->
                sb.append("  - ").append(orgao).append(": ").append(qtd).append("\n"));

        focoOrgao.ifPresent(orgao -> appendListagemFocoOrgao(sb, ativas, orgao));

        sb.append("\n=== VISÃO GERAL: PRIORIDADE ALTA E SEM ÓRGÃO (não usar se o gestor pediu tabela de um órgão específico) ===\n");
        int limite = ollamaProperties.getMaxChamadosNoContexto();
        List<Ocorrencia> prioritarios = ativas.stream()
                .filter(o -> o.getOrgaoResponsavel() == null || o.getUrgencia() == NivelUrgencia.ALTA)
                .limit(limite)
                .toList();
        if (prioritarios.isEmpty()) {
            sb.append("(Nenhum sem órgão ou com urgência alta no momento.)\n");
        } else {
            sb.append("Apenas referência global da fila — não substitui LISTAGEM DO FOCO DA CONVERSA.\n");
            sb.append("| Protocolo | Status | Categoria | Órgão | Urgência | Bairro |\n");
            sb.append("| --- | --- | --- | --- | --- | --- |\n");
            for (Ocorrencia o : prioritarios) {
                sb.append(formatarLinhaTabela(o)).append("\n");
            }
        }
        long outros = ativas.size() - prioritarios.size();
        if (outros > 0) {
            sb.append("... mais ").append(outros).append(" chamado(s) ativos com órgão e urgência não alta.\n");
        }

        if (selecionadaId != null) {
            sb.append("\n=== CHAMADO SELECIONADO PELO GESTOR ===\n");
            Ocorrencia sel = ativas.stream()
                    .filter(o -> o.getId().equals(selecionadaId))
                    .findFirst()
                    .orElseGet(() -> ocorrenciaRepository.buscarPorIdComUsuarioEOrgao(selecionadaId)
                            .orElseThrow(() -> new ResourceNotFoundException("Chamado não encontrado.")));
            sb.append(detalharChamado(sel));
            try {
                TriagemResponseDTO triagem = triagemService.calcular(sel.getId());
                sb.append("\nSugestão do motor de triagem:\n");
                sb.append("  Órgão sugerido: ").append(triagem.orgaoNome())
                        .append(" (").append(triagem.orgaoSigla()).append(")\n");
                sb.append("  Confiança: ").append(triagem.confianca()).append("%\n");
                sb.append("  Status atual: ").append(labelStatus(triagem.statusAtual())).append("\n");
                sb.append("  Status sugerido: ").append(labelStatus(triagem.statusSugerido())).append("\n");
                sb.append("  Requer revisão humana: ").append(triagem.requerRevisaoHumana() ? "sim" : "não").append("\n");
                sb.append("  Alinhado com órgão atual: ").append(triagem.alinhadoComOrgaoAtual() ? "sim" : "não").append("\n");
                if (triagem.motivos() != null && !triagem.motivos().isEmpty()) {
                    sb.append("  Motivos: ").append(String.join(" | ", triagem.motivos())).append("\n");
                }
            } catch (Exception ignored) {
                sb.append("(Triagem automática não disponível para este chamado.)\n");
            }
        }

        return sb.toString();
    }

    private static String formatarLinhaTabela(Ocorrencia o) {
        String orgao = o.getOrgaoResponsavel() != null ? o.getOrgaoResponsavel().getSigla() : "Sem órgão";
        String bairro = o.getBairro() != null ? o.getBairro() : "—";
        String categoria = labelCategoria(o.getCategoria()) + " / " + sanitizarCelulaTabela(o.getSubcategoria());
        return String.format(
                "| %s | %s | %s | %s | %s | %s |",
                sanitizarCelulaTabela(o.getProtocolo()),
                sanitizarCelulaTabela(labelStatus(o.getStatus())),
                sanitizarCelulaTabela(categoria),
                sanitizarCelulaTabela(orgao),
                o.getUrgencia(),
                sanitizarCelulaTabela(bairro)
        );
    }

    private static String sanitizarCelulaTabela(String valor) {
        if (valor == null || valor.isBlank()) {
            return "—";
        }
        return valor.replace("|", "/").replace("\n", " ").trim();
    }

    private static String detalharChamado(Ocorrencia o) {
        StringBuilder d = new StringBuilder();
        d.append("Protocolo: ").append(o.getProtocolo()).append("\n");
        d.append("Status: ").append(labelStatus(o.getStatus())).append("\n");
        d.append("Categoria: ").append(labelCategoria(o.getCategoria())).append(" / ").append(o.getSubcategoria()).append("\n");
        d.append("Urgência: ").append(o.getUrgencia()).append("\n");
        d.append("Órgão: ").append(o.getOrgaoResponsavel() != null
                ? o.getOrgaoResponsavel().getNome() + " (" + o.getOrgaoResponsavel().getSigla() + ")"
                : "não definido").append("\n");
        d.append("Bairro: ").append(o.getBairro() != null ? o.getBairro() : "—").append("\n");
        d.append("Endereço: ").append(o.getEnderecoAproximado() != null ? o.getEnderecoAproximado() : "—").append("\n");
        d.append("Risco acidente: ").append(o.isRiscoAcidente()).append(" | Recorrente: ").append(o.isRecorrente()).append("\n");
        d.append("Criado em: ").append(o.getCriadoEm()).append("\n");
        d.append("Descrição completa: ").append(o.getDescricao() != null ? o.getDescricao() : "—").append("\n");
        return d.toString();
    }

    private Map<StatusOcorrencia, Long> carregarTotaisPorStatus() {
        Map<StatusOcorrencia, Long> map = new EnumMap<>(StatusOcorrencia.class);
        for (Object[] row : ocorrenciaRepository.contarAgrupadoPorStatus()) {
            StatusOcorrencia status = (StatusOcorrencia) row[0];
            Long qtd = (Long) row[1];
            map.put(status, qtd);
        }
        return map;
    }

    private static Map<StatusOcorrencia, Long> contarPorStatus(List<Ocorrencia> lista) {
        return lista.stream().collect(Collectors.groupingBy(Ocorrencia::getStatus, Collectors.counting()));
    }

    private static Map<CategoriaOcorrencia, Long> contarPorCategoria(List<Ocorrencia> lista) {
        Map<CategoriaOcorrencia, Long> map = new EnumMap<>(CategoriaOcorrencia.class);
        lista.stream().collect(Collectors.groupingBy(Ocorrencia::getCategoria, Collectors.counting()))
                .forEach(map::put);
        return map;
    }

    private Map<String, Long> contarAtivosPorOrgao(List<Ocorrencia> ativas) {
        Map<String, Long> map = new LinkedHashMap<>();
        for (Orgao orgao : orgaoRepository.findAll()) {
            map.put(rotuloOrgao(orgao), 0L);
        }
        map.put("Sem órgão (aguardando encaminhamento)", 0L);
        for (Ocorrencia o : ativas) {
            if (o.getOrgaoResponsavel() == null) {
                map.merge("Sem órgão (aguardando encaminhamento)", 1L, Long::sum);
            } else {
                map.merge(rotuloOrgao(o.getOrgaoResponsavel()), 1L, Long::sum);
            }
        }
        return map;
    }

    private static String rotuloOrgao(Orgao orgao) {
        String sigla = orgao.getSigla() != null ? orgao.getSigla().trim() : "—";
        return sigla + " — " + orgao.getNome();
    }

    private static List<Ocorrencia> filtrarAtivosPorOrgao(List<Ocorrencia> ativas, Orgao orgao) {
        return ativas.stream()
                .filter(o -> o.getOrgaoResponsavel() != null
                        && o.getOrgaoResponsavel().getId().equals(orgao.getId()))
                .toList();
    }

    private String montarRespostaListagemOrgao(Orgao orgao, List<Ocorrencia> doOrgao) {
        if (doOrgao.isEmpty()) {
            return "Não há chamados em aberto para **" + rotuloOrgao(orgao) + "** no momento.";
        }
        StringBuilder sb = new StringBuilder();
        sb.append("**").append(doOrgao.size()).append("** chamado(s) em aberto em **")
                .append(rotuloOrgao(orgao)).append("**:\n\n");
        sb.append("| Protocolo | Status | Categoria | Órgão | Urgência | Bairro |\n");
        sb.append("| --- | --- | --- | --- | --- | --- |\n");
        for (Ocorrencia o : doOrgao) {
            sb.append(formatarLinhaTabela(o)).append("\n");
        }
        return sb.toString();
    }

    private void appendListagemFocoOrgao(StringBuilder sb, List<Ocorrencia> ativas, Orgao orgao) {
        List<Ocorrencia> doOrgao = filtrarAtivosPorOrgao(ativas, orgao);
        int limite = ollamaProperties.getMaxChamadosNoContexto();
        sb.append("\n=== LISTAGEM DO FOCO DA CONVERSA: ").append(rotuloOrgao(orgao)).append(" ===\n");
        sb.append("O gestor está falando deste órgão (histórico + mensagem atual). ");
        sb.append("Se pedir tabela, lista ou detalhes, responda SOMENTE com as linhas abaixo.\n");
        sb.append("Total em aberto neste órgão: ").append(doOrgao.size()).append("\n");
        if (doOrgao.isEmpty()) {
            sb.append("(Nenhum chamado ativo com este órgão responsável no momento.)\n");
            return;
        }
        sb.append("| Protocolo | Status | Categoria | Órgão | Urgência | Bairro |\n");
        sb.append("| --- | --- | --- | --- | --- | --- |\n");
        int exibidos = 0;
        for (Ocorrencia o : doOrgao) {
            if (exibidos >= limite) {
                break;
            }
            sb.append(formatarLinhaTabela(o)).append("\n");
            exibidos++;
        }
        if (doOrgao.size() > exibidos) {
            sb.append("... mais ").append(doOrgao.size() - exibidos)
                    .append(" chamado(s) deste órgão não listados (limite de contexto).\n");
        }
    }

    private Optional<Orgao> detectarFocoOrgao(List<AssistenteMensagemDTO> historico, String mensagemAtual) {
        Orgao naMensagemAtual = detectarOrgaoEmTexto(mensagemAtual);
        if (naMensagemAtual != null) {
            return Optional.of(naMensagemAtual);
        }
        if (historico == null || historico.isEmpty()) {
            return Optional.empty();
        }
        for (int i = historico.size() - 1; i >= 0; i--) {
            AssistenteMensagemDTO msg = historico.get(i);
            if (!"user".equals(msg.role())) {
                continue;
            }
            Orgao detectado = detectarOrgaoEmTexto(msg.content());
            if (detectado != null) {
                return Optional.of(detectado);
            }
        }
        return Optional.empty();
    }

    private Orgao detectarOrgaoEmTexto(String texto) {
        if (texto == null || texto.isBlank()) {
            return null;
        }
        String normalizado = normalizarTexto(texto);
        Orgao melhor = null;
        int melhorPos = -1;
        for (Orgao orgao : orgaoRepository.findAll()) {
            int pos = posicaoMencaoOrgao(normalizado, orgao);
            if (pos >= 0 && pos >= melhorPos) {
                melhorPos = pos;
                melhor = orgao;
            }
        }
        return melhor;
    }

    private int posicaoMencaoOrgao(String texto, Orgao orgao) {
        int melhor = -1;
        String sigla = orgao.getSigla();
        if (sigla != null && !sigla.isBlank()) {
            Pattern siglaPattern = Pattern.compile("\\b" + Pattern.quote(normalizarTexto(sigla)) + "\\b");
            var matcher = siglaPattern.matcher(texto);
            if (matcher.find()) {
                melhor = matcher.start();
            }
        }
        String nome = orgao.getNome();
        if (nome != null && !nome.isBlank()) {
            int idx = texto.indexOf(normalizarTexto(nome));
            if (idx >= 0) {
                melhor = Math.max(melhor, idx);
            }
        }
        for (String alias : aliasesOrgao(orgao)) {
            int idx = texto.indexOf(normalizarTexto(alias));
            if (idx >= 0) {
                melhor = Math.max(melhor, idx);
            }
        }
        return melhor;
    }

    private static String normalizarTexto(String texto) {
        if (texto == null) {
            return "";
        }
        String semAcentos = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return semAcentos.toLowerCase();
    }

    private static boolean isPedidoListagemOuDetalheOrgao(String mensagem) {
        if (mensagem == null || mensagem.isBlank()) {
            return false;
        }
        if (isPedidoListagem(mensagem)) {
            return true;
        }
        String t = normalizarTexto(mensagem);
        return t.contains("chamados da")
                || t.contains("chamados do")
                || t.contains("chamados na")
                || t.contains("chamados no")
                || t.contains("chamados de")
                || t.contains("liste os")
                || t.contains("liste as")
                || t.contains("mostre os")
                || t.contains("mostre as")
                || t.contains("mostrar os")
                || t.contains("quais chamados")
                || t.contains("protocolos da")
                || t.contains("protocolos do");
    }

    private static List<String> aliasesOrgao(Orgao orgao) {
        if (orgao.getSigla() == null) {
            return List.of();
        }
        return switch (orgao.getSigla().toUpperCase()) {
            case "SOI" -> List.of(
                    "secretaria de obras",
                    "sec. de obras",
                    "sec de obras",
                    "obras e infraestrutura",
                    "obras e infra");
            case "SLU" -> List.of("secretaria de limpeza", "limpeza urbana");
            case "CIP" -> List.of("coordenadoria de iluminação", "iluminação pública", "iluminacao publica");
            case "ESB" -> List.of(
                    "empresa de saneamento basico",
                    "empresa de saneamento",
                    "saneamento basico municipal");
            case "DCM" -> List.of("defesa civil", "defesa civil municipal");
            default -> List.of();
        };
    }

    private static boolean isPedidoListagem(String mensagem) {
        if (mensagem == null || mensagem.isBlank()) {
            return false;
        }
        String t = mensagem.toLowerCase();
        return t.contains("tabela")
                || t.contains("liste")
                || t.contains("listar")
                || t.contains("listagem")
                || t.contains("mostre")
                || t.contains("mostra")
                || t.contains("exiba")
                || t.contains("detalhe")
                || t.contains("protocolos")
                || t.contains("quais são")
                || t.contains("quais sao")
                || t.contains("me mostre")
                || t.contains("em linhas");
    }

    private static List<Map.Entry<String, Long>> topBairros(List<Ocorrencia> lista, int n) {
        Map<String, Long> map = new LinkedHashMap<>();
        lista.stream()
                .collect(Collectors.groupingBy(
                        o -> o.getBairro() != null && !o.getBairro().isBlank() ? o.getBairro() : "Sem bairro",
                        Collectors.counting()))
                .entrySet().stream()
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .limit(n)
                .forEach(e -> map.put(e.getKey(), e.getValue()));
        return new ArrayList<>(map.entrySet());
    }

    private static String labelStatus(StatusOcorrencia s) {
        return switch (s) {
            case RECEBIDO -> "Recebido";
            case EM_ANALISE -> "Em análise";
            case EM_ANDAMENTO -> "Em andamento";
            case CONCLUIDO -> "Concluído";
            case ENCAMINHADO_EMERGENCIA -> "Emergência";
            case CANCELADO -> "Cancelado";
        };
    }

    private static String labelCategoria(CategoriaOcorrencia c) {
        return switch (c) {
            case VIARIO -> "Viário";
            case ILUMINACAO -> "Iluminação";
            case SANEAMENTO -> "Saneamento";
            case TRANSITO -> "Trânsito";
            case LIMPEZA -> "Limpeza";
        };
    }
}
