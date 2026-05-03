package br.com.zurbi.modules.usuario.dto;

import br.com.zurbi.shared.enums.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UsuarioRequestDTO(
        @NotBlank(message = "Nome é obrigatório") String nome,
        @NotBlank(message = "Email é obrigatório") @Email(message = "Email inválido") String email,
        @NotBlank(message = "Senha é obrigatória") String senha,
        @NotNull(message = "Tipo de usuário é obrigatório") TipoUsuario tipo
) {}
