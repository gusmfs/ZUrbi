package br.com.zurbi.modules.assistente;

import br.com.zurbi.modules.assistente.dto.AssistenteChatRequestDTO;
import br.com.zurbi.modules.assistente.dto.AssistenteChatResponseDTO;
import br.com.zurbi.modules.assistente.dto.AssistenteStatusResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assistente")
@RequiredArgsConstructor
public class AssistenteController {

    private final AssistenteGestorService assistenteGestorService;

    @GetMapping("/status")
    public AssistenteStatusResponseDTO status() {
        return assistenteGestorService.status();
    }

    @PostMapping("/chat")
    public AssistenteChatResponseDTO chat(@Valid @RequestBody AssistenteChatRequestDTO dto) {
        return assistenteGestorService.conversar(dto);
    }
}
