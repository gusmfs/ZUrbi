package br.com.zurbi.modules.triagem;



import br.com.zurbi.modules.atualizacaostatus.AtualizacaoStatus;

import br.com.zurbi.modules.atualizacaostatus.AtualizacaoStatusRepository;

import br.com.zurbi.modules.ocorrencia.Ocorrencia;

import br.com.zurbi.modules.ocorrencia.OcorrenciaRepository;

import br.com.zurbi.modules.ocorrencia.OcorrenciaService;

import br.com.zurbi.modules.ocorrencia.dto.OcorrenciaResponseDTO;

import br.com.zurbi.modules.orgao.Orgao;

import br.com.zurbi.modules.orgao.OrgaoRepository;

import br.com.zurbi.modules.triagem.dto.TriagemClassificacaoRequestDTO;
import br.com.zurbi.modules.triagem.dto.TriagemClassificacaoResponseDTO;
import br.com.zurbi.modules.triagem.dto.TriagemResponseDTO;

import br.com.zurbi.shared.enums.CategoriaOcorrencia;

import br.com.zurbi.shared.enums.NivelUrgencia;

import br.com.zurbi.shared.enums.StatusOcorrencia;

import br.com.zurbi.shared.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;



import java.time.LocalDateTime;

import java.util.ArrayList;

import java.util.List;

import java.util.Objects;

import java.util.UUID;



@Service

@RequiredArgsConstructor

public class TriagemService {



    private static final int CONFIANCA_MAX = 98;

    private static final int CONFIANCA_SEM_ORGAO = 62;

    private static final int CONFIANCA_DESALINHADO = 71;



    private final OcorrenciaRepository ocorrenciaRepository;

    private final OrgaoRepository orgaoRepository;

    private final AtualizacaoStatusRepository atualizacaoStatusRepository;

    private final OcorrenciaService ocorrenciaService;



    @Transactional(readOnly = true)

    public TriagemResponseDTO calcular(UUID ocorrenciaId) {

        Ocorrencia ocorrencia = carregarOcorrencia(ocorrenciaId);

        return paraDto(ocorrencia, avaliar(ocorrencia));

    }

    /**
     * Classifica descrição do cidadão (antes de criar a ocorrência) — categoria, tipo e órgão sugeridos.
     */
    @Transactional(readOnly = true)
    public TriagemClassificacaoResponseDTO classificarTexto(TriagemClassificacaoRequestDTO dto) {
        String texto = TriagemKeywords.normalizar(dto.descricao());
        boolean emergencia = TriagemKeywords.textoIndicaEmergencia(texto);
        boolean risco = Boolean.TRUE.equals(dto.riscoAcidente());

        CategoriaOcorrencia categoriaInferida = TriagemKeywords.inferirCategoria(texto);
        CategoriaOcorrencia categoria = categoriaInferida != null
                ? categoriaInferida
                : CategoriaOcorrencia.VIARIO;

        String subcategoria = TriagemKeywords.inferirSubcategoria(texto, categoria);
        if (subcategoria == null || subcategoria.isBlank()) {
            subcategoria = TriagemKeywords.subcategoriaPadrao(categoria);
        }

        NivelUrgencia urgenciaSugerida = inferirUrgenciaClassificacao(emergencia, risco, categoria, texto);

        Orgao orgaoSugerido = resolverOrgao(categoria, emergencia);
        List<String> motivos = new ArrayList<>();
        int confianca = 55;

        if (emergencia) {
            confianca += 20;
            motivos.add("Termos de emergência no relato — prioridade elevada.");
        }
        if (categoriaInferida != null) {
            confianca += 22;
            motivos.add("Categoria " + labelCategoria(categoriaInferida) + " identificada pelo texto.");
        } else {
            confianca += 8;
            motivos.add("Categoria padrão viário — revise se necessário.");
        }
        motivos.add("Tipo sugerido: " + subcategoria + ".");
        if (orgaoSugerido != null) {
            confianca += 15;
            motivos.add(String.format(
                    "Encaminhamento previsto: %s (%s).",
                    orgaoSugerido.getNome(),
                    orgaoSugerido.getSigla()));
        } else {
            motivos.add("Nenhum órgão cadastrado para esta categoria.");
            confianca = Math.min(confianca, CONFIANCA_SEM_ORGAO);
        }
        if (risco) {
            confianca += 5;
            motivos.add("Risco de acidente informado pelo cidadão.");
        }
        if (Boolean.TRUE.equals(dto.recorrente())) {
            confianca += 3;
        }
        confianca = Math.min(CONFIANCA_MAX, confianca);

        return new TriagemClassificacaoResponseDTO(
                categoria,
                subcategoria,
                urgenciaSugerida,
                orgaoSugerido != null ? orgaoSugerido.getId() : null,
                orgaoSugerido != null ? orgaoSugerido.getNome() : null,
                orgaoSugerido != null ? orgaoSugerido.getSigla() : null,
                confianca,
                List.copyOf(motivos),
                emergencia
        );
    }

    private static NivelUrgencia inferirUrgenciaClassificacao(
            boolean emergencia,
            boolean riscoAcidente,
            CategoriaOcorrencia categoria,
            String texto
    ) {
        if (emergencia || riscoAcidente) {
            return NivelUrgencia.ALTA;
        }
        if (categoria == CategoriaOcorrencia.SANEAMENTO
                && TriagemKeywords.contemAlguma(texto, List.of("esgoto", "ceu aberto", "transbord"))) {
            return NivelUrgencia.ALTA;
        }
        if (TriagemKeywords.contemAlguma(texto, List.of("urgente", "grave", "perigoso", "imediato"))) {
            return NivelUrgencia.ALTA;
        }
        if (TriagemKeywords.contemAlguma(texto, List.of("pequeno", "leve", "cosmetico", "estetico"))) {
            return NivelUrgencia.BAIXA;
        }
        return NivelUrgencia.MEDIA;
    }

    @Transactional

    public OcorrenciaResponseDTO aplicar(UUID ocorrenciaId, String observacaoGestor) {

        Ocorrencia ocorrencia = carregarOcorrencia(ocorrenciaId);



        if (ocorrencia.getStatus() == StatusOcorrencia.CANCELADO) {

            throw new IllegalArgumentException("Não é possível aplicar triagem em ocorrência cancelada.");

        }



        ResultadoTriagem resultado = avaliar(ocorrencia);

        if (resultado.orgaoSugerido() == null) {

            throw new IllegalArgumentException(

                    "Triagem não identificou órgão responsável. Revisão manual necessária.");

        }



        StatusOcorrencia statusAnterior = ocorrencia.getStatus();

        StatusOcorrencia statusNovo = resultado.statusSugerido();

        boolean alteraStatus = statusNovo != statusAnterior

                && statusAnterior != StatusOcorrencia.CONCLUIDO;



        UUID orgaoAnteriorId = ocorrencia.getOrgaoResponsavel() != null

                ? ocorrencia.getOrgaoResponsavel().getId()

                : null;

        boolean alteraOrgao = !Objects.equals(orgaoAnteriorId, resultado.orgaoSugerido().getId());



        if (!alteraStatus && !alteraOrgao) {

            return ocorrenciaService.buscarPorId(ocorrenciaId);

        }



        ocorrencia.setOrgaoResponsavel(resultado.orgaoSugerido());



        if (alteraStatus) {

            ocorrencia.setStatus(statusNovo);

            if (statusNovo == StatusOcorrencia.CONCLUIDO) {

                ocorrencia.setResolvidoEm(LocalDateTime.now());

            }

        }



        ocorrenciaRepository.save(ocorrencia);



        String observacao = montarObservacaoHistorico(resultado, observacaoGestor);

        atualizacaoStatusRepository.save(AtualizacaoStatus.builder()

                .ocorrencia(ocorrencia)

                .statusAnterior(statusAnterior)

                .statusNovo(alteraStatus ? statusNovo : statusAnterior)

                .observacao(observacao)

                .build());



        return ocorrenciaService.buscarPorId(ocorrenciaId);

    }



    private Ocorrencia carregarOcorrencia(UUID id) {

        return ocorrenciaRepository.buscarPorIdComUsuarioEOrgao(id)

                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada."));

    }



    private ResultadoTriagem avaliar(Ocorrencia ocorrencia) {

        String texto = textoCombinado(ocorrencia);

        boolean emergencia = TriagemKeywords.textoIndicaEmergencia(texto);

        CategoriaOcorrencia categoriaInferida = TriagemKeywords.inferirCategoria(texto);



        CategoriaOcorrencia categoriaParaOrgao = resolverCategoriaParaOrgao(

                ocorrencia.getCategoria(),

                categoriaInferida

        );



        Orgao orgaoSugerido = resolverOrgao(categoriaParaOrgao, emergencia);

        List<String> motivos = new ArrayList<>();

        int confianca = 0;

        boolean keywordRelevante = false;



        if (emergencia) {

            keywordRelevante = true;

            confianca += 20;

            motivos.add("Termos de emergência detectados no texto — encaminhamento prioritário (Defesa Civil).");

        }



        if (categoriaInferida != null) {

            keywordRelevante = true;

            if (categoriaInferida == ocorrencia.getCategoria()) {

                confianca += 25;

                motivos.add(String.format(

                        "Palavras-chave confirmam categoria %s.",

                        labelCategoria(categoriaInferida)));

            } else {

                confianca += 18;

                motivos.add(String.format(

                        "Texto indica categoria %s (registrada como %s) — órgão sugerido pela análise do texto.",

                        labelCategoria(categoriaInferida),

                        labelCategoria(ocorrencia.getCategoria())));

            }

        }



        if (orgaoSugerido != null) {

            confianca += 40;

            motivos.add(String.format(

                    "Órgão %s (%s) atende chamados de %s.",

                    orgaoSugerido.getNome(),

                    orgaoSugerido.getSigla(),

                    labelCategoria(categoriaParaOrgao)));

            if (orgaoAtendeCategoria(orgaoSugerido, categoriaParaOrgao)) {

                confianca += 10;

            }

        } else {

            motivos.add("Nenhum órgão cadastrado atende esta categoria — revisão humana necessária.");

        }



        switch (ocorrencia.getUrgencia()) {

            case ALTA -> {

                confianca += 15;

                motivos.add("Urgência alta elevou prioridade na fila.");

            }

            case MEDIA -> confianca += 8;

            default -> { }

        }



        if (ocorrencia.isRiscoAcidente()) {

            confianca += 5;

            motivos.add("Flag de risco de acidente detectada.");

        }



        if (ocorrencia.getOrgaoResponsavel() == null) {

            confianca = Math.min(confianca, CONFIANCA_SEM_ORGAO);

            motivos.add("Órgão ainda não atribuído — re-triagem recomendada.");

        } else if (orgaoSugerido != null

                && !ocorrencia.getOrgaoResponsavel().getId().equals(orgaoSugerido.getId())) {

            confianca = Math.min(confianca, CONFIANCA_DESALINHADO);

            motivos.add("Órgão atual difere da sugestão automática.");

        }



        if (!keywordRelevante && orgaoSugerido != null) {

            confianca += 5;

        }



        confianca = Math.min(CONFIANCA_MAX, confianca);

        if (orgaoSugerido == null && confianca < 45) {

            confianca = 45;

        }



        boolean requerRevisao = orgaoSugerido == null;

        StatusOcorrencia statusSugerido = resolverStatusSugerido(ocorrencia.getStatus(), emergencia);

        int prioridade = calcularPrioridade(ocorrencia, emergencia);



        boolean alinhado = ocorrencia.getOrgaoResponsavel() != null

                && orgaoSugerido != null

                && ocorrencia.getOrgaoResponsavel().getId().equals(orgaoSugerido.getId());



        return new ResultadoTriagem(

                orgaoSugerido,

                statusSugerido,

                prioridade,

                confianca,

                List.copyOf(motivos),

                requerRevisao,

                alinhado

        );

    }



    /**

     * Se o texto indica outra categoria com clareza, prioriza a inferência para escolher o órgão

     * (reduz erro na triagem automática no registro).

     */

    private static CategoriaOcorrencia resolverCategoriaParaOrgao(

            CategoriaOcorrencia registrada,

            CategoriaOcorrencia inferida

    ) {

        if (inferida != null && inferida != registrada) {

            return inferida;

        }

        return registrada;

    }



    private Orgao resolverOrgao(CategoriaOcorrencia categoria, boolean emergencia) {

        if (emergencia) {

            return orgaoRepository.findBySigla("DCM").orElse(null);

        }

        if (categoria == CategoriaOcorrencia.TRANSITO) {

            return orgaoRepository.findBySigla("SOI")

                    .or(() -> orgaoRepository.findFirstByCategoriasAtendidasContaining(categoria))

                    .orElse(null);

        }

        return orgaoRepository.findFirstByCategoriasAtendidasContaining(categoria).orElse(null);

    }



    private static StatusOcorrencia resolverStatusSugerido(StatusOcorrencia atual, boolean emergencia) {

        if (atual == StatusOcorrencia.CONCLUIDO || atual == StatusOcorrencia.CANCELADO) {

            return atual;

        }

        if (emergencia) {

            return StatusOcorrencia.ENCAMINHADO_EMERGENCIA;

        }

        if (atual == StatusOcorrencia.RECEBIDO) {

            return StatusOcorrencia.EM_ANALISE;

        }

        return atual;

    }



    private static int calcularPrioridade(Ocorrencia ocorrencia, boolean emergencia) {

        int score = 40;

        if (ocorrencia.getUrgencia() == NivelUrgencia.ALTA) {

            score += 30;

        } else if (ocorrencia.getUrgencia() == NivelUrgencia.MEDIA) {

            score += 15;

        }

        if (ocorrencia.isRiscoAcidente()) {

            score += 20;

        }

        if (ocorrencia.isRecorrente()) {

            score += 10;

        }

        if (emergencia) {

            score += 15;

        }

        return Math.min(100, score);

    }



    private static boolean orgaoAtendeCategoria(Orgao orgao, CategoriaOcorrencia categoria) {

        return orgao.getCategoriasAtendidas() != null

                && orgao.getCategoriasAtendidas().contains(categoria);

    }



    private static String textoCombinado(Ocorrencia ocorrencia) {

        return TriagemKeywords.normalizar(

                (ocorrencia.getSubcategoria() != null ? ocorrencia.getSubcategoria() : "")

                        + " "

                        + (ocorrencia.getDescricao() != null ? ocorrencia.getDescricao() : ""));

    }



    private static String labelCategoria(CategoriaOcorrencia categoria) {

        return switch (categoria) {

            case VIARIO -> "Viário";

            case ILUMINACAO -> "Iluminação";

            case SANEAMENTO -> "Saneamento";

            case TRANSITO -> "Trânsito";

            case LIMPEZA -> "Limpeza";

        };

    }



    private static String montarObservacaoHistorico(ResultadoTriagem resultado, String observacaoGestor) {

        Orgao orgao = resultado.orgaoSugerido();

        String orgaoLabel = orgao.getSigla() != null ? orgao.getSigla() + " — " + orgao.getNome() : orgao.getNome();

        String motivo = resultado.motivos().isEmpty() ? "regras automáticas" : resultado.motivos().get(0);

        String base = "Triagem automática: encaminhado para " + orgaoLabel + " — " + motivo;

        if (observacaoGestor != null && !observacaoGestor.isBlank()) {

            return base + " | Gestor: " + observacaoGestor.trim();

        }

        return base;

    }



    private TriagemResponseDTO paraDto(Ocorrencia ocorrencia, ResultadoTriagem resultado) {

        Orgao orgao = resultado.orgaoSugerido();

        return new TriagemResponseDTO(

                ocorrencia.getId(),

                ocorrencia.getProtocolo(),

                orgao != null ? orgao.getId() : null,

                orgao != null ? orgao.getNome() : null,

                orgao != null ? orgao.getSigla() : null,

                ocorrencia.getStatus(),

                resultado.statusSugerido(),

                resultado.prioridadeScore(),

                resultado.confianca(),

                resultado.motivos(),

                resultado.requerRevisaoHumana(),

                resultado.alinhadoComOrgaoAtual()

        );

    }



    private record ResultadoTriagem(

            Orgao orgaoSugerido,

            StatusOcorrencia statusSugerido,

            int prioridadeScore,

            int confianca,

            List<String> motivos,

            boolean requerRevisaoHumana,

            boolean alinhadoComOrgaoAtual

    ) {}

}


