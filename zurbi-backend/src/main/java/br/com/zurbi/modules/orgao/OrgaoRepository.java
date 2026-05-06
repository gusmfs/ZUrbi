package br.com.zurbi.modules.orgao;

import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrgaoRepository extends JpaRepository<Orgao, UUID> {

    Optional<Orgao> findFirstByCategoriasAtendidasContaining(CategoriaOcorrencia categoria);

    List<Orgao> findByCategoriasAtendidasContaining(CategoriaOcorrencia categoria);
}
