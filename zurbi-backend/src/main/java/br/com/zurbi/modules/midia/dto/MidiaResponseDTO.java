package br.com.zurbi.modules.midia.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record MidiaResponseDTO(
        UUID id,
        String nomeOriginal,
        String urlPublica,
        String contentType,
        Long tamanhoBytes,
        LocalDateTime enviadoEm
) {}
