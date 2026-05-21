package br.com.zurbi.modules.assistente.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record AssistenteChatRequestDTO(
        @NotBlank(message = "Mensagem é obrigatória")
        @Size(max = 4000, message = "Mensagem muito longa")
        String mensagem,
        UUID ocorrenciaSelecionadaId,
        @Valid List<AssistenteMensagemDTO> historico
) {}
