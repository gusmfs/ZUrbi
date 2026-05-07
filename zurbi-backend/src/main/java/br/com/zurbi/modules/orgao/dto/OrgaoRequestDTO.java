package br.com.zurbi.modules.orgao.dto;

import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record OrgaoRequestDTO(
        @NotBlank(message = "Nome é obrigatório") String nome,
        String sigla,
        @NotEmpty(message = "Informe ao menos uma categoria atendida") List<CategoriaOcorrencia> categoriasAtendidas,
        Integer prazoResolucaoHoras
) {}
