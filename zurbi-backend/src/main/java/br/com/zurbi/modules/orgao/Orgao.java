package br.com.zurbi.modules.orgao;

import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tb_orgao")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Orgao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column
    private String sigla;

    @ElementCollection
    @CollectionTable(
        name = "tb_orgao_categorias",
        joinColumns = @JoinColumn(name = "orgao_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "categoria")
    private List<CategoriaOcorrencia> categoriasAtendidas;

    @Column
    private Integer prazoResolucaoHoras;
}