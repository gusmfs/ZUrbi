package br.com.zurbi.modules.atualizacaostatus.dto;

import br.com.zurbi.shared.enums.StatusOcorrencia;

import java.time.LocalDateTime;

public record AtualizacaoStatusResponseDTO(
        StatusOcorrencia statusAnterior,
        StatusOcorrencia statusNovo,
        String observacao,
        LocalDateTime atualizadoEm
) {}
