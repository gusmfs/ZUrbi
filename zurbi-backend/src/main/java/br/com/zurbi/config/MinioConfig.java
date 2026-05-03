package br.com.zurbi.config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
public class MinioConfig {

    @Bean
    public MinioClient minioClient(
            @Value("${minio.url}") String url,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey,
            @Value("${minio.region:}") String region
    ) {
        String endpoint = url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
        var builder = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey);
        if (StringUtils.hasText(region)) {
            builder.region(region);
        }
        return builder.build();
    }

    @Bean
    public ApplicationRunner garantirBucketMinio(
            MinioClient minioClient,
            @Value("${minio.bucket}") String bucket,
            @Value("${minio.region:}") String region
    ) {
        return args -> {
            boolean existe = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!existe) {
                var make = MakeBucketArgs.builder().bucket(bucket);
                if (StringUtils.hasText(region)) {
                    make.region(region);
                }
                minioClient.makeBucket(make.build());
                log.info("Bucket MinIO criado: {}", bucket);
            }
        };
    }
}
