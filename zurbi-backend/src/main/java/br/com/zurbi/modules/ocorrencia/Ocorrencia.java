// src/main/java/br/com/zurbi/modules/ocorrencia/Ocorrencia.java
package br.com.zurbi.modules.ocorrencia;

import br.com.zurbi.modules.orgao.Orgao;
import br.com.zurbi.modules.usuario.Usuario;
import br.com.zurbi.shared.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tb_ocorrencia")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Ocorrencia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String protocolo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "orgao_id")
    private Orgao orgaoResponsavel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaOcorrencia categoria;

    @Column(nullable = false)
    private String subcategoria;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NivelUrgencia urgencia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusOcorrencia status;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column
    private String enderecoAproximado;

    @Column
    private String bairro;

    @Column(nullable = false)
    private boolean riscoAcidente;

    @Column(nullable = false)
    private boolean recorrente;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    @Column
    private LocalDateTime resolvidoEm;

    @PrePersist
    public void prePersist() {
        this.criadoEm = LocalDateTime.now();
        this.status = StatusOcorrencia.RECEBIDO;
    }
}