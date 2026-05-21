package br.com.zurbi.modules.assistente.dto;

public record AssistenteChatResponseDTO(
        String resposta,
        String modelo,
        boolean ollamaDisponivel
) {}
