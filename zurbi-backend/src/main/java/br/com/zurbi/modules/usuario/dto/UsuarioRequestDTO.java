package br.com.zurbi.modules.usuario.dto;

import br.com.zurbi.shared.enums.TipoUsuario;
import br.com.zurbi.shared.validation.CpfValid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioRequestDTO(
        @NotBlank(message = "Nome é obrigatório") @Size(min = 3, max = 150, message = "Nome deve ter entre 3 e 150 caracteres") String nome,
        @NotBlank(message = "CPF é obrigatório") @CpfValid String cpf,
        @NotBlank(message = "Email é obrigatório") @Email(message = "Email inválido") String email,
        @NotBlank(message = "Senha é obrigatória") @Size(min = 6, max = 100, message = "Senha deve ter no mínimo 6 caracteres") String senha,
        @NotNull(message = "Tipo de usuário é obrigatório") TipoUsuario tipo
) {}
