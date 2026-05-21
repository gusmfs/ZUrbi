package br.com.zurbi.modules.triagem;

import br.com.zurbi.modules.ocorrencia.dto.OcorrenciaResponseDTO;
import br.com.zurbi.modules.triagem.dto.AplicarTriagemRequestDTO;
import br.com.zurbi.modules.triagem.dto.TriagemResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ocorrencias")
@RequiredArgsConstructor
public class TriagemController {

    private final TriagemService triagemService;

    @GetMapping("/{id}/triagem")
    public TriagemResponseDTO consultar(@PathVariable UUID id) {
        return triagemService.calcular(id);
    }

    @PostMapping("/{id}/triagem/aplicar")
    public ResponseEntity<OcorrenciaResponseDTO> aplicar(
            @PathVariable UUID id,
            @RequestBody(required = false) AplicarTriagemRequestDTO body
    ) {
        String observacao = body != null ? body.observacaoGestor() : null;
        OcorrenciaResponseDTO atualizado = triagemService.aplicar(id, observacao);
        return ResponseEntity.ok(atualizado);
    }
}
