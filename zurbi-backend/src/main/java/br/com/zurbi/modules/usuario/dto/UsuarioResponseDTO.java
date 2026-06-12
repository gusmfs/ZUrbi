package br.com.zurbi.modules.usuario.dto;

import br.com.zurbi.shared.enums.TipoUsuario;

import java.time.LocalDateTime;
import java.util.UUID;

public record UsuarioResponseDTO(
        UUID id,
        String nome,
        String email,
        String cpfMascarado,
        TipoUsuario tipo,
        LocalDateTime criadoEm
) {}
