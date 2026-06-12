package br.com.zurbi.modules.usuario;

import br.com.zurbi.modules.usuario.dto.UsuarioRequestDTO;
import br.com.zurbi.modules.usuario.dto.UsuarioResponseDTO;
import br.com.zurbi.shared.exception.ResourceNotFoundException;
import br.com.zurbi.shared.validation.CpfUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioResponseDTO criar(UsuarioRequestDTO dto) {
        String cpf = CpfUtil.somenteDigitos(dto.cpf());
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new IllegalArgumentException("Email já cadastrado.");
        }
        if (usuarioRepository.existsByCpf(cpf)) {
            throw new IllegalArgumentException("CPF já cadastrado.");
        }
        Usuario entidade = Usuario.builder()
                .nome(dto.nome().trim())
                .cpf(cpf)
                .email(dto.email().trim().toLowerCase())
                .senhaHash(passwordEncoder.encode(dto.senha()))
                .tipo(dto.tipo())
                .build();
        usuarioRepository.save(entidade);
        return paraDto(entidade);
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDTO buscarPorId(UUID id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        return paraDto(u);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream().map(this::paraDto).toList();
    }

    private UsuarioResponseDTO paraDto(Usuario u) {
        return new UsuarioResponseDTO(
                u.getId(),
                u.getNome(),
                u.getEmail(),
                CpfUtil.mascarar(u.getCpf()),
                u.getTipo(),
                u.getCriadoEm()
        );
    }
}
