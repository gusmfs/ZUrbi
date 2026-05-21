package br.com.zurbi.modules.triagem.dto;

import jakarta.validation.constraints.NotBlank;

public record TriagemClassificacaoRequestDTO(
        @NotBlank(message = "Descrição é obrigatória para classificar") String descricao,
        Boolean riscoAcidente,
        Boolean recorrente
) {}
