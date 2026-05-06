package br.com.zurbi.modules.ocorrencia;

import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import br.com.zurbi.shared.enums.StatusOcorrencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, UUID> {

    @Query("""
            SELECT o FROM Ocorrencia o
            JOIN FETCH o.usuario
            LEFT JOIN FETCH o.orgaoResponsavel
            WHERE o.id = :id
            """)
    Optional<Ocorrencia> buscarPorIdComUsuarioEOrgao(@Param("id") UUID id);

    List<Ocorrencia> findByUsuario_IdOrderByCriadoEmDesc(UUID usuarioId);

    @Query("""
            SELECT o FROM Ocorrencia o
            WHERE (:usuarioId IS NULL OR o.usuario.id = :usuarioId)
            AND (:status IS NULL OR o.status = :status)
            AND (:categoria IS NULL OR o.categoria = :categoria)
            AND (
                :bairro IS NULL
                OR TRIM(:bairro) = ''
                OR LOWER(TRIM(o.bairro)) = LOWER(TRIM(:bairro))
            )
            ORDER BY o.criadoEm DESC
            """)
    List<Ocorrencia> buscarPorFiltros(
            @Param("usuarioId") UUID usuarioId,
            @Param("status") StatusOcorrencia status,
            @Param("categoria") CategoriaOcorrencia categoria,
            @Param("bairro") String bairro
    );

    @Query(value = """
            SELECT COALESCE(MAX(CAST(regexp_replace(protocolo, '^ZUR-[0-9]{4}-', '') AS INTEGER)), 0)
            FROM tb_ocorrencia
            WHERE protocolo ~ ('^ZUR-' || CAST(:ano AS TEXT) || '-[0-9]+$')
            """, nativeQuery = true)
    int maiorSequencialPorAno(@Param("ano") int ano);
}
