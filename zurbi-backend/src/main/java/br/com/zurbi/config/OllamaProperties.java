package br.com.zurbi.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "zurbi.ollama")
public class OllamaProperties {

    private boolean enabled = true;
    private String baseUrl = "http://localhost:11434";
    private String model = "llama3.2";
    private int timeoutSeconds = 300;
    private int maxHistoricoMensagens = 8;
    private int maxChamadosNoContexto = 18;
    /** Limite de tokens gerados (resposta mais rápida). */
    private int maxTokensResposta = 320;
    private int numCtx = 2048;
    private int keepAliveMinutes = 15;
}
