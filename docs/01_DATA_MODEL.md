# zUrbi — Modelo de Dados (JPA + Flyway)

## Enums

```java
// TipoUsuario.java
public enum TipoUsuario { CIDADAO, GESTOR }

// StatusOcorrencia.java
public enum StatusOcorrencia { RECEBIDO, EM_ANALISE, EM_ATENDIMENTO, RESOLVIDO, CANCELADO }

// NivelUrgencia.java
public enum NivelUrgencia { BAIXA, MEDIA, ALTA }

// TipoMidia.java
public enum TipoMidia { IMAGEM, VIDEO }

// StatusEnvio.java
public enum StatusEnvio { PENDENTE, ENVIADO, FALHOU }
```

---

## Entidades JPA

### Usuario.java

```java
@Entity
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @Email
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String senha; // armazenar hash bcrypt

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoUsuario tipo;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Ocorrencia> ocorrencias = new ArrayList<>();

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Comentario> comentarios = new ArrayList<>();
}
```

---

### Localizacao.java

```java
@Entity
@Table(name = "localizacoes")
@Getter @Setter @NoArgsConstructor
public class Localizacao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String endereco;

    @OneToOne(mappedBy = "localizacao")
    private Ocorrencia ocorrencia;
}
```

---

### Ocorrencia.java

```java
@Entity
@Table(name = "ocorrencias")
@Getter @Setter @NoArgsConstructor
public class Ocorrencia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false)
    private String titulo;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusOcorrencia status = StatusOcorrencia.RECEBIDO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NivelUrgencia urgencia;

    @Column(nullable = false, unique = true)
    private String protocolo; // ex: ZUR-2026-0001

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "localizacao_id", nullable = false)
    private Localizacao localizacao;

    @OneToMany(mappedBy = "ocorrencia", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Midia> midias = new ArrayList<>();

    @OneToMany(mappedBy = "ocorrencia", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("criadoEm ASC")
    private List<Comentario> comentarios = new ArrayList<>();

    @OneToMany(mappedBy = "ocorrencia", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("atualizadoEm ASC")
    private List<HistoricoStatus> historico = new ArrayList<>();

    @OneToOne(mappedBy = "ocorrencia", cascade = CascadeType.ALL)
    private Emergencia emergencia;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
```

---

### Midia.java

```java
@Entity
@Table(name = "midias")
@Getter @Setter @NoArgsConstructor
public class Midia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String url;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMidia tipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private Ocorrencia ocorrencia;
}
```

---

### Comentario.java

```java
@Entity
@Table(name = "comentarios")
@Getter @Setter @NoArgsConstructor
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensagem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private Ocorrencia ocorrencia;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}
```

---

### HistoricoStatus.java

```java
@Entity
@Table(name = "historico_status")
@Getter @Setter @NoArgsConstructor
public class HistoricoStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusOcorrencia status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ocorrencia_id", nullable = false)
    private Ocorrencia ocorrencia;

    @Column(name = "atualizado_em", nullable = false, updatable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();
}
```

---

### Emergencia.java

```java
@Entity
@Table(name = "emergencias")
@Getter @Setter @NoArgsConstructor
public class Emergencia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ocorrencia_id", nullable = false, unique = true)
    private Ocorrencia ocorrencia;

    @Column(name = "orgao_destino", nullable = false)
    private String orgaoDestino; // ex: "SAMU", "Bombeiros", "Polícia Militar"

    @Enumerated(EnumType.STRING)
    @Column(name = "status_envio", nullable = false)
    private StatusEnvio statusEnvio = StatusEnvio.PENDENTE;

    @Column(name = "enviado_em", nullable = false, updatable = false)
    private LocalDateTime enviadoEm = LocalDateTime.now();
}
```

---

## Migrations Flyway

### V1__create_usuarios.sql
```sql
CREATE TABLE usuarios (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome      VARCHAR(255) NOT NULL,
    email     VARCHAR(255) NOT NULL UNIQUE,
    senha     VARCHAR(255) NOT NULL,
    tipo      VARCHAR(20)  NOT NULL CHECK (tipo IN ('CIDADAO', 'GESTOR')),
    criado_em TIMESTAMP    NOT NULL DEFAULT NOW()
);
```

### V2__create_localizacoes.sql
```sql
CREATE TABLE localizacoes (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    latitude  DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    endereco  VARCHAR(500) NOT NULL
);
```

### V3__create_ocorrencias.sql
```sql
CREATE TABLE ocorrencias (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo         VARCHAR(100) NOT NULL,
    descricao      TEXT NOT NULL,
    status         VARCHAR(30)  NOT NULL DEFAULT 'RECEBIDO',
    urgencia       VARCHAR(10)  NOT NULL CHECK (urgencia IN ('BAIXA', 'MEDIA', 'ALTA')),
    protocolo      VARCHAR(20)  NOT NULL UNIQUE,
    usuario_id     UUID NOT NULL REFERENCES usuarios(id),
    localizacao_id UUID NOT NULL UNIQUE REFERENCES localizacoes(id),
    criado_em      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ocorrencia_status    ON ocorrencias(status);
CREATE INDEX idx_ocorrencia_urgencia  ON ocorrencias(urgencia);
CREATE INDEX idx_ocorrencia_usuario   ON ocorrencias(usuario_id);
CREATE INDEX idx_ocorrencia_criado_em ON ocorrencias(criado_em DESC);
```

### V4__create_midias.sql
```sql
CREATE TABLE midias (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url           VARCHAR(500) NOT NULL,
    tipo          VARCHAR(10)  NOT NULL CHECK (tipo IN ('IMAGEM', 'VIDEO')),
    ocorrencia_id UUID NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE
);
```

### V5__create_comentarios.sql
```sql
CREATE TABLE comentarios (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mensagem      TEXT NOT NULL,
    usuario_id    UUID NOT NULL REFERENCES usuarios(id),
    ocorrencia_id UUID NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
    criado_em     TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### V6__create_historico_status.sql
```sql
CREATE TABLE historico_status (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status        VARCHAR(30) NOT NULL,
    ocorrencia_id UUID NOT NULL REFERENCES ocorrencias(id) ON DELETE CASCADE,
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historico_ocorrencia ON historico_status(ocorrencia_id);
```

### V7__create_emergencias.sql
```sql
CREATE TABLE emergencias (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ocorrencia_id UUID NOT NULL UNIQUE REFERENCES ocorrencias(id),
    orgao_destino VARCHAR(100) NOT NULL,
    status_envio  VARCHAR(20)  NOT NULL DEFAULT 'PENDENTE',
    enviado_em    TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## Repositories

```java
// OcorrenciaRepository.java
public interface OcorrenciaRepository extends JpaRepository<Ocorrencia, UUID> {

    Page<Ocorrencia> findByUsuarioId(UUID usuarioId, Pageable pageable);

    Page<Ocorrencia> findByStatus(StatusOcorrencia status, Pageable pageable);

    Page<Ocorrencia> findByUrgencia(NivelUrgencia urgencia, Pageable pageable);

    // Para o mapa do dashboard
    @Query("SELECT o FROM Ocorrencia o JOIN FETCH o.localizacao WHERE o.status != 'RESOLVIDO'")
    List<Ocorrencia> findAllAtivasComLocalizacao();

    // Para métricas
    long countByStatus(StatusOcorrencia status);
    long countByUrgencia(NivelUrgencia urgencia);
}

// UsuarioRepository.java
public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
}

// EmergenciaRepository.java
public interface EmergenciaRepository extends JpaRepository<Emergencia, UUID> {
    List<Emergencia> findByStatusEnvio(StatusEnvio statusEnvio);
}
```
