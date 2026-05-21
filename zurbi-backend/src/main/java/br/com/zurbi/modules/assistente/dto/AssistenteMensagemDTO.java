package br.com.zurbi.modules.assistente.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record AssistenteMensagemDTO(
        @NotBlank @Pattern(regexp = "user|assistant", message = "role deve ser user ou assistant")
        String role,
        @NotBlank String content
) {}
