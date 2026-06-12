package br.com.zurbi.modules.atualizacaostatus;

import br.com.zurbi.modules.ocorrencia.Ocorrencia;
import br.com.zurbi.shared.enums.StatusOcorrencia;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tb_atualizacao_status")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AtualizacaoStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private Ocorrencia ocorrencia;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusOcorrencia statusAnterior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusOcorrencia statusNovo;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    @PrePersist
    public void prePersist() {
        this.atualizadoEm = LocalDateTime.now();
    }
}