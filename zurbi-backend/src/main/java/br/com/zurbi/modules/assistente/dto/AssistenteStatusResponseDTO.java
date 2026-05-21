package br.com.zurbi.modules.assistente.dto;

public record AssistenteStatusResponseDTO(
        boolean disponivel,
        boolean habilitado,
        String modelo,
        String baseUrl,
        String orientacao
) {}
