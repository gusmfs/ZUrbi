package br.com.zurbi.modules.ocorrencia.dto;

import br.com.zurbi.shared.enums.StatusOcorrencia;
import jakarta.validation.constraints.NotNull;

public record OcorrenciaStatusPatchDTO(
        @NotNull(message = "Novo status é obrigatório") StatusOcorrencia statusNovo,
        String observacao
) {}
