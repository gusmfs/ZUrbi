package br.com.zurbi.modules.orgao.dto;

import br.com.zurbi.shared.enums.CategoriaOcorrencia;

import java.util.List;
import java.util.UUID;

public record OrgaoResponseDTO(
        UUID id,
        String nome,
        String sigla,
        List<CategoriaOcorrencia> categoriasAtendidas,
        Integer prazoResolucaoHoras
) {}
