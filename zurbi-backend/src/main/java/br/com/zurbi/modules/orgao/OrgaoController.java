package br.com.zurbi.modules.orgao;

import br.com.zurbi.modules.orgao.dto.OrgaoRequestDTO;
import br.com.zurbi.modules.orgao.dto.OrgaoResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orgaos")
@RequiredArgsConstructor
public class OrgaoController {

    private final OrgaoService orgaoService;

    @PostMapping
    public ResponseEntity<OrgaoResponseDTO> criar(@Valid @RequestBody OrgaoRequestDTO dto) {
        OrgaoResponseDTO criado = orgaoService.criar(dto);
        return ResponseEntity.created(URI.create("/api/orgaos/" + criado.id())).body(criado);
    }

    @GetMapping
    public List<OrgaoResponseDTO> listar() {
        return orgaoService.listarTodos();
    }

    @GetMapping("/{id}")
    public OrgaoResponseDTO buscarPorId(@PathVariable UUID id) {
        return orgaoService.buscarPorId(id);
    }
}
