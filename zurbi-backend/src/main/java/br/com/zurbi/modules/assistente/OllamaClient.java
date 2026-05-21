package br.com.zurbi.modules.assistente;

import br.com.zurbi.config.OllamaProperties;
import br.com.zurbi.shared.exception.OllamaIndisponivelException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OllamaClient {

    private final OllamaProperties properties;
    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public boolean disponivel() {
        if (!properties.isEnabled()) {
            return false;
        }
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.getBaseUrl() + "/api/tags"))
                    .timeout(Duration.ofSeconds(5))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() == 200;
        } catch (Exception e) {
            log.debug("Ollama indisponível: {}", e.getMessage());
            return false;
        }
    }

    public String chat(List<Map<String, String>> messages) {
        if (!properties.isEnabled()) {
            throw new OllamaIndisponivelException("Assistente desabilitado na configuração do servidor.");
        }
        if (!disponivel()) {
            throw new OllamaIndisponivelException(
                    "Ollama não está acessível. Inicie o serviço (ollama serve), baixe o modelo "
                            + "(ollama pull " + properties.getModel() + ") e confira a URL "
                            + properties.getBaseUrl() + ".");
        }

        try {
            Map<String, Object> options = new LinkedHashMap<>();
            options.put("num_predict", properties.getMaxTokensResposta());
            options.put("num_ctx", properties.getNumCtx());
            options.put("temperature", 0.2);

            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", properties.getModel());
            body.put("messages", messages);
            body.put("stream", false);
            body.put("keep_alive", properties.getKeepAliveMinutes() + "m");
            body.put("options", options);

            String jsonBody = objectMapper.writeValueAsString(body);
            log.debug("Ollama chat: modelo={}, mensagens={}", properties.getModel(), messages.size());
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.getBaseUrl() + "/api/chat"))
                    .timeout(Duration.ofSeconds(properties.getTimeoutSeconds()))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                log.warn("Ollama respondeu {}: {}", response.statusCode(), response.body());
                throw new OllamaIndisponivelException("Ollama retornou erro HTTP " + response.statusCode() + ".");
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode content = root.path("message").path("content");
            if (content.isMissingNode() || content.asText().isBlank()) {
                throw new OllamaIndisponivelException("Resposta vazia do modelo Ollama.");
            }
            return content.asText().trim();
        } catch (OllamaIndisponivelException e) {
            throw e;
        } catch (Exception e) {
            log.error("Falha ao chamar Ollama", e);
            String detalhe = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            if (detalhe.contains("timed out") || detalhe.contains("timeout")) {
                throw new OllamaIndisponivelException(
                        "O modelo demorou mais de " + properties.getTimeoutSeconds() + "s. "
                                + "Aguarde na primeira pergunta (carrega o modelo) ou use um modelo menor: "
                                + "defina ZURBI_OLLAMA_MODEL=qwen2.5:1.5b no .env e reinicie o app.");
            }
            throw new OllamaIndisponivelException("Não foi possível obter resposta do Ollama: " + detalhe);
        }
    }
}
