# zUrbi — Autenticação e Autorização (Spring Security + JWT)

## Visão Geral do Fluxo

```
1. POST /api/v1/auth/login  →  AuthController  →  AuthService
2. AuthService valida credenciais com BCrypt
3. JwtUtil gera o token com payload: { sub, email, tipo, iat, exp }
4. Token retornado ao cliente no campo "accessToken"
5. Cliente envia em toda requisição: Authorization: Bearer <token>
6. JwtAuthFilter intercepta, valida e injeta o usuário no SecurityContext
7. @PreAuthorize ou SecurityConfig controla o acesso por perfil
```

---

## JwtUtil.java

```java
@Component
public class JwtUtil {

    @Value("${zurbi.jwt.secret}")
    private String secret;

    @Value("${zurbi.jwt.expiration}")
    private long expirationMs; // 28800000 = 8 horas

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String gerarToken(Usuario usuario) {
        return Jwts.builder()
            .setSubject(usuario.getId().toString())
            .claim("email", usuario.getEmail())
            .claim("tipo", usuario.getTipo().name())
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
            .signWith(getSigningKey())
            .compact();
    }

    public Claims extrairClaims(String token) {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .getBody();
    }

    public UUID extrairUsuarioId(String token) {
        return UUID.fromString(extrairClaims(token).getSubject());
    }

    public boolean tokenValido(String token) {
        try {
            extrairClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

---

## JwtAuthFilter.java

```java
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        if (jwtUtil.tokenValido(token)) {
            UUID usuarioId = jwtUtil.extrairUsuarioId(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(usuarioId.toString());

            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}
```

---

## UserDetailsServiceImpl.java

```java
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String usuarioId) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findById(UUID.fromString(usuarioId))
            .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + usuarioId));

        return User.builder()
            .username(usuario.getId().toString())
            .password(usuario.getSenha())
            .roles(usuario.getTipo().name()) // Gera ROLE_CIDADAO ou ROLE_GESTOR
            .build();
    }
}
```

---

## SecurityConfig.java

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Rotas públicas
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/swagger-ui/**", "/api-docs/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()

                // Rotas exclusivas de Gestor
                .requestMatchers("/api/v1/dashboard/**").hasRole("GESTOR")
                .requestMatchers("/api/v1/emergencias/**").hasRole("GESTOR")
                .requestMatchers(HttpMethod.PATCH, "/api/v1/ocorrencias/*/status").hasRole("GESTOR")

                // Demais rotas requerem autenticação
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }
}
```

---

## AuthService.java

```java
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public UsuarioResponseDTO registrar(RegisterRequestDTO dto) {
        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new DataIntegrityViolationException("E-mail já cadastrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(passwordEncoder.encode(dto.senha()));
        usuario.setTipo(dto.tipo());

        return UsuarioMapper.toDTO(usuarioRepository.save(usuario));
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {
        Usuario usuario = usuarioRepository.findByEmail(dto.email())
            .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas."));

        if (!passwordEncoder.matches(dto.senha(), usuario.getSenha())) {
            throw new BadCredentialsException("Credenciais inválidas.");
        }

        String token = jwtUtil.gerarToken(usuario);

        return new LoginResponseDTO(token, UsuarioMapper.toDTO(usuario));
    }
}
```

---

## Como Obter o Usuário Autenticado nos Controllers

```java
// Opção 1: via @AuthenticationPrincipal
@GetMapping
public Page<OcorrenciaResponseDTO> listar(
    @AuthenticationPrincipal UserDetails userDetails
) {
    UUID usuarioId = UUID.fromString(userDetails.getUsername());
    Usuario usuario = usuarioService.buscarPorId(usuarioId);
    // ...
}

// Opção 2: via SecurityContextHolder
Usuario getUsuarioAutenticado() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    UUID id = UUID.fromString(auth.getName());
    return usuarioRepository.findById(id).orElseThrow();
}
```

---

## Variáveis de Ambiente (.env / application.properties)

```properties
# JWT — gerar secret com: openssl rand -base64 64
zurbi.jwt.secret=BASE64_SECRET_AQUI
zurbi.jwt.expiration=28800000

# Banco
spring.datasource.url=jdbc:postgresql://localhost:5432/zurbi
spring.datasource.username=zurbi_user
spring.datasource.password=zurbi_pass

# Webhook emergências
zurbi.emergency.webhook-url=https://sistema-externo.exemplo.com/api/chamados

# Uploads
zurbi.upload.dir=./uploads
```

---

## Dados de Teste (DataLoader para desenvolvimento)

```java
@Component
@Profile("dev") // Executar apenas com --spring.profiles.active=dev
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) return;

        usuarioRepository.saveAll(List.of(
            criarUsuario("Maria Cidadã",  "cidadao@zurbi.dev", "senha123",   TipoUsuario.CIDADAO),
            criarUsuario("José Gestor",   "gestor@zurbi.dev",  "gestor123",  TipoUsuario.GESTOR)
        ));
    }

    private Usuario criarUsuario(String nome, String email, String senha, TipoUsuario tipo) {
        Usuario u = new Usuario();
        u.setNome(nome);
        u.setEmail(email);
        u.setSenha(passwordEncoder.encode(senha));
        u.setTipo(tipo);
        return u;
    }
}
```

**Credenciais de teste:**

| Perfil | Email | Senha |
|--------|-------|-------|
| Cidadão | `cidadao@zurbi.dev` | `senha123` |
| Gestor | `gestor@zurbi.dev` | `gestor123` |
