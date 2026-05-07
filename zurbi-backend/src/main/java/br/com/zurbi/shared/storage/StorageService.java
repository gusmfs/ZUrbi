package br.com.zurbi.shared.storage;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.public-url:http://localhost:9000}")
    private String publicUrl;

    public StorageResult upload(MultipartFile arquivo, UUID ocorrenciaId) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo de imagem vazio ou ausente.");
        }
        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.toLowerCase(Locale.ROOT).startsWith("image/")) {
            throw new IllegalArgumentException("Apenas arquivos image/* são aceitos.");
        }

        String nomeOriginal = arquivo.getOriginalFilename() != null ? arquivo.getOriginalFilename() : "imagem";
        String extensao = FilenameUtils.getExtension(nomeOriginal);
        if (extensao == null || extensao.isBlank()) {
            extensao = extensaoPorContentType(contentType);
        }
        extensao = extensao.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");

        String nomeArquivo = UUID.randomUUID() + "." + extensao;
        String storageKey = "ocorrencias/" + ocorrenciaId + "/" + nomeArquivo;

        try (InputStream inputStream = arquivo.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(storageKey)
                            .stream(inputStream, arquivo.getSize(), -1)
                            .contentType(contentType)
                            .build()
            );
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao enviar arquivo ao armazenamento: " + e.getMessage(), e);
        }

        String urlPublica = montarUrlPublica(storageKey);
        return new StorageResult(storageKey, urlPublica, nomeOriginal, contentType, arquivo.getSize());
    }

    public void deletar(String storageKey) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucket)
                            .object(storageKey)
                            .build()
            );
        } catch (Exception e) {
            throw new IllegalStateException("Falha ao remover arquivo do armazenamento: " + e.getMessage(), e);
        }
    }

    private String montarUrlPublica(String storageKey) {
        String base = publicUrl.endsWith("/") ? publicUrl.substring(0, publicUrl.length() - 1) : publicUrl;
        return base + "/" + bucket + "/" + storageKey;
    }

    private static String extensaoPorContentType(String contentType) {
        String ct = contentType.toLowerCase(Locale.ROOT);
        if (ct.contains("jpeg") || ct.contains("jpg")) return "jpg";
        if (ct.contains("png")) return "png";
        if (ct.contains("webp")) return "webp";
        if (ct.contains("gif")) return "gif";
        return "img";
    }
}
