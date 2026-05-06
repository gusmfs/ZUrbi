package br.com.zurbi.modules.ocorrencia.dto;

import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import br.com.zurbi.shared.enums.NivelUrgencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record OcorrenciaRequestDTO(
        @NotNull(message = "Usuário é obrigatório") UUID usuarioId,
        @NotNull(message = "Categoria é obrigatória") CategoriaOcorrencia categoria,
        @NotBlank(message = "Subcategoria é obrigatória") String subcategoria,
        String descricao,
        @NotNull(message = "Urgência é obrigatória") NivelUrgencia urgencia,
        @NotNull(message = "Latitude é obrigatória") Double latitude,
        @NotNull(message = "Longitude é obrigatória") Double longitude,
        String enderecoAproximado,
        String bairro,
        @NotNull(message = "Indicação de risco de acidente é obrigatória") Boolean riscoAcidente,
        @NotNull(message = "Indicação de recorrência é obrigatória") Boolean recorrente
) {}
