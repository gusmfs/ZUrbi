package br.com.zurbi.modules.ocorrencia;

import br.com.zurbi.modules.ocorrencia.dto.OcorrenciaRequestDTO;
import br.com.zurbi.modules.ocorrencia.dto.OcorrenciaResponseDTO;
import br.com.zurbi.modules.ocorrencia.dto.OcorrenciaStatusPatchDTO;
import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import br.com.zurbi.shared.enums.StatusOcorrencia;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ocorrencias")
@RequiredArgsConstructor
public class OcorrenciaController {

    private final OcorrenciaService ocorrenciaService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OcorrenciaResponseDTO> registrar(
            @RequestPart("dados") @Valid OcorrenciaRequestDTO dados,
            @RequestPart(value = "imagens", required = false) List<MultipartFile> imagens
    ) {
        OcorrenciaResponseDTO criado = ocorrenciaService.registrar(dados, imagens);
        return ResponseEntity.created(URI.create("/api/ocorrencias/" + criado.id())).body(criado);
    }

    @GetMapping("/{id}")
    public OcorrenciaResponseDTO buscarPorId(@PathVariable UUID id) {
        return ocorrenciaService.buscarPorId(id);
    }

    @GetMapping
    public List<OcorrenciaResponseDTO> listar(
            @RequestParam(required = false) UUID usuarioId,
            @RequestParam(required = false) StatusOcorrencia status,
            @RequestParam(required = false) CategoriaOcorrencia categoria,
            @RequestParam(required = false) String bairro
    ) {
        return ocorrenciaService.listarPorFiltros(usuarioId, status, categoria, bairro);
    }

    @PatchMapping("/{id}/status")
    public OcorrenciaResponseDTO atualizarStatus(
            @PathVariable UUID id,
            @Valid @RequestBody OcorrenciaStatusPatchDTO dto
    ) {
        return ocorrenciaService.atualizarStatus(id, dto.statusNovo(), dto.observacao());
    }
}
