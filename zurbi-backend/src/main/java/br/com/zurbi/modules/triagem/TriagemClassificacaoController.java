package br.com.zurbi.modules.triagem;

import br.com.zurbi.modules.triagem.dto.TriagemClassificacaoRequestDTO;
import br.com.zurbi.modules.triagem.dto.TriagemClassificacaoResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/triagem")
@RequiredArgsConstructor
public class TriagemClassificacaoController {

    private final TriagemService triagemService;

    @PostMapping("/classificar")
    public TriagemClassificacaoResponseDTO classificar(
            @Valid @RequestBody TriagemClassificacaoRequestDTO dto
    ) {
        return triagemService.classificarTexto(dto);
    }
}
