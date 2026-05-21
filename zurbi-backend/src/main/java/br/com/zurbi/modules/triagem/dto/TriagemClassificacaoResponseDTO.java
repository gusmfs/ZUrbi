package br.com.zurbi.modules.triagem.dto;

import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import br.com.zurbi.shared.enums.NivelUrgencia;

import java.util.List;
import java.util.UUID;

/** Resultado da triagem antes do registro da ocorrência (abertura de chamado). */
public record TriagemClassificacaoResponseDTO(
        CategoriaOcorrencia categoria,
        String subcategoria,
        NivelUrgencia urgenciaSugerida,
        UUID orgaoId,
        String orgaoNome,
        String orgaoSigla,
        int confianca,
        List<String> motivos,
        boolean emergencia
) {}
