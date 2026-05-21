package br.com.zurbi.modules.ocorrencia.dto;

import java.util.UUID;

public record OcorrenciaOrgaoPatchDTO(
        UUID orgaoId,
        String observacao
) {}
