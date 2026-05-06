package br.com.zurbi.shared.storage;

public record StorageResult(
        String storageKey,
        String urlPublica,
        String nomeOriginal,
        String contentType,
        long tamanhoBytes
) {}
