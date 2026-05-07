package br.com.zurbi.modules.orgao;

import br.com.zurbi.modules.orgao.dto.OrgaoRequestDTO;
import br.com.zurbi.modules.orgao.dto.OrgaoResponseDTO;
import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import br.com.zurbi.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrgaoService {

    private final OrgaoRepository orgaoRepository;

    @Transactional
    public OrgaoResponseDTO criar(OrgaoRequestDTO dto) {
        Orgao orgao = Orgao.builder()
                .nome(dto.nome())
                .sigla(dto.sigla())
                .categoriasAtendidas(new ArrayList<>(dto.categoriasAtendidas()))
                .prazoResolucaoHoras(dto.prazoResolucaoHoras())
                .build();
        orgaoRepository.save(orgao);
        return paraDto(orgao);
    }

    @Transactional(readOnly = true)
    public OrgaoResponseDTO buscarPorId(UUID id) {
        Orgao o = orgaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Órgão não encontrado."));
        return paraDto(o);
    }

    @Transactional(readOnly = true)
    public List<OrgaoResponseDTO> listarTodos() {
        return orgaoRepository.findAll().stream().map(this::paraDto).toList();
    }

    @Transactional(readOnly = true)
    public List<OrgaoResponseDTO> buscarPorCategoria(CategoriaOcorrencia categoria) {
        return orgaoRepository.findByCategoriasAtendidasContaining(categoria).stream()
                .map(this::paraDto)
                .toList();
    }

    private OrgaoResponseDTO paraDto(Orgao o) {
        List<CategoriaOcorrencia> categorias =
                o.getCategoriasAtendidas() != null ? List.copyOf(o.getCategoriasAtendidas()) : List.of();
        return new OrgaoResponseDTO(
                o.getId(),
                o.getNome(),
                o.getSigla(),
                categorias,
                o.getPrazoResolucaoHoras()
        );
    }
}
