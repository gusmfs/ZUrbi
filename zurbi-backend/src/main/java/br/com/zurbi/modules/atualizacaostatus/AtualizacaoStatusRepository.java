package br.com.zurbi.modules.atualizacaostatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AtualizacaoStatusRepository extends JpaRepository<AtualizacaoStatus, UUID> {

    List<AtualizacaoStatus> findByOcorrencia_IdOrderByAtualizadoEmAsc(UUID ocorrenciaId);
}
