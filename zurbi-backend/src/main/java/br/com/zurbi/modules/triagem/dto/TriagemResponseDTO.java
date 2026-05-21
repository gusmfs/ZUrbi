package br.com.zurbi.modules.triagem.dto;

import br.com.zurbi.shared.enums.StatusOcorrencia;

import java.util.List;
import java.util.UUID;

public record TriagemResponseDTO(
        UUID ocorrenciaId,
        String protocolo,
        UUID orgaoId,
        String orgaoNome,
        String orgaoSigla,
        StatusOcorrencia statusAtual,
        StatusOcorrencia statusSugerido,
        int prioridadeScore,
        int confianca,
        List<String> motivos,
        boolean requerRevisaoHumana,
        boolean alinhadoComOrgaoAtual
) {}
