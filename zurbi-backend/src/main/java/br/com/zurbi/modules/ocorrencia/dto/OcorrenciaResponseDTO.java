package br.com.zurbi.modules.ocorrencia.dto;

import br.com.zurbi.modules.atualizacaostatus.dto.AtualizacaoStatusResponseDTO;
import br.com.zurbi.modules.midia.dto.MidiaResponseDTO;
import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import br.com.zurbi.shared.enums.NivelUrgencia;
import br.com.zurbi.shared.enums.StatusOcorrencia;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OcorrenciaResponseDTO(
        UUID id,
        String protocolo,
        UUID usuarioId,
        String usuarioNome,
        UUID orgaoId,
        String orgaoNome,
        CategoriaOcorrencia categoria,
        String subcategoria,
        String descricao,
        NivelUrgencia urgencia,
        StatusOcorrencia status,
        Double latitude,
        Double longitude,
        String enderecoAproximado,
        String bairro,
        boolean riscoAcidente,
        boolean recorrente,
        LocalDateTime criadoEm,
        LocalDateTime resolvidoEm,
        List<MidiaResponseDTO> midias,
        List<AtualizacaoStatusResponseDTO> historico
) {}
