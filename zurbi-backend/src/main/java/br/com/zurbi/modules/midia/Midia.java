package br.com.zurbi.modules.midia;

import br.com.zurbi.modules.ocorrencia.Ocorrencia;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tb_midia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Midia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private Ocorrencia ocorrencia;

    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @Column(name = "url_publica", nullable = false, length = 1000)
    private String urlPublica;

    @Column(name = "nome_original", nullable = false)
    private String nomeOriginal;

    @Column(name = "content_type", nullable = false, length = 120)
    private String contentType;

    @Column(name = "tamanho_bytes", nullable = false)
    private Long tamanhoBytes;

    @Column(name = "enviado_em", nullable = false)
    private LocalDateTime enviadoEm;

    @PrePersist
    public void prePersist() {
        this.enviadoEm = LocalDateTime.now();
    }
}
