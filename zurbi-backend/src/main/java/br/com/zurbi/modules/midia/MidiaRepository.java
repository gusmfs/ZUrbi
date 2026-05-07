package br.com.zurbi.modules.midia;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MidiaRepository extends JpaRepository<Midia, UUID> {

    List<Midia> findByOcorrencia_IdOrderByEnviadoEmAsc(UUID ocorrenciaId);
}
