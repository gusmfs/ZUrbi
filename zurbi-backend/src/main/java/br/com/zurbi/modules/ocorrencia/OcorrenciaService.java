package br.com.zurbi.modules.ocorrencia;

import br.com.zurbi.modules.atualizacaostatus.AtualizacaoStatus;
import br.com.zurbi.modules.atualizacaostatus.AtualizacaoStatusRepository;
import br.com.zurbi.modules.atualizacaostatus.dto.AtualizacaoStatusResponseDTO;
import br.com.zurbi.modules.midia.Midia;
import br.com.zurbi.modules.midia.MidiaRepository;
import br.com.zurbi.modules.midia.dto.MidiaResponseDTO;
import br.com.zurbi.modules.ocorrencia.dto.OcorrenciaRequestDTO;
import br.com.zurbi.modules.ocorrencia.dto.OcorrenciaResponseDTO;
import br.com.zurbi.modules.orgao.Orgao;
import br.com.zurbi.modules.orgao.OrgaoRepository;
import br.com.zurbi.modules.usuario.Usuario;
import br.com.zurbi.modules.usuario.UsuarioRepository;
import br.com.zurbi.shared.enums.CategoriaOcorrencia;
import br.com.zurbi.shared.enums.StatusOcorrencia;
import br.com.zurbi.shared.exception.ResourceNotFoundException;
import br.com.zurbi.shared.storage.StorageResult;
import br.com.zurbi.shared.storage.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Year;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OcorrenciaService {

    private final OcorrenciaRepository ocorrenciaRepository;
    private final UsuarioRepository usuarioRepository;
    private final OrgaoRepository orgaoRepository;
    private final MidiaRepository midiaRepository;
    private final AtualizacaoStatusRepository atualizacaoStatusRepository;
    private final StorageService storageService;

    @Transactional
    public OcorrenciaResponseDTO registrar(OcorrenciaRequestDTO dto, List<MultipartFile> imagens) {
        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        Orgao orgao = orgaoRepository
                .findFirstByCategoriasAtendidasContaining(dto.categoria())
                .orElse(null);

        String protocolo = gerarProtocolo();

        Ocorrencia ocorrencia = Ocorrencia.builder()
                .protocolo(protocolo)
                .usuario(usuario)
                .orgaoResponsavel(orgao)
                .categoria(dto.categoria())
                .subcategoria(dto.subcategoria())
                .descricao(dto.descricao())
                .urgencia(dto.urgencia())
                .latitude(dto.latitude())
                .longitude(dto.longitude())
                .enderecoAproximado(dto.enderecoAproximado())
                .bairro(dto.bairro())
                .riscoAcidente(Boolean.TRUE.equals(dto.riscoAcidente()))
                .recorrente(Boolean.TRUE.equals(dto.recorrente()))
                .build();

        Ocorrencia salva = ocorrenciaRepository.save(ocorrencia);

        List<MultipartFile> arquivos = filtrarImagens(imagens);
        for (MultipartFile arquivo : arquivos) {
            StorageResult resultado = storageService.upload(arquivo, salva.getId());
            Midia midia = Midia.builder()
                    .ocorrencia(salva)
                    .storageKey(resultado.storageKey())
                    .urlPublica(resultado.urlPublica())
                    .nomeOriginal(resultado.nomeOriginal())
                    .contentType(resultado.contentType())
                    .tamanhoBytes(resultado.tamanhoBytes())
                    .build();
            midiaRepository.save(midia);
        }

        atualizacaoStatusRepository.save(AtualizacaoStatus.builder()
                .ocorrencia(salva)
                .statusAnterior(StatusOcorrencia.RECEBIDO)
                .statusNovo(StatusOcorrencia.RECEBIDO)
                .observacao("Registro inicial")
                .build());

        return buscarPorId(salva.getId());
    }

    @Transactional(readOnly = true)
    public OcorrenciaResponseDTO buscarPorId(UUID id) {
        Ocorrencia o = ocorrenciaRepository.buscarPorIdComUsuarioEOrgao(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada."));
        List<Midia> midias = midiaRepository.findByOcorrencia_IdOrderByEnviadoEmAsc(id);
        List<AtualizacaoStatus> historico = atualizacaoStatusRepository.findByOcorrencia_IdOrderByAtualizadoEmAsc(id);
        return montarDetalhe(o, midias, historico);
    }

    @Transactional(readOnly = true)
    public List<OcorrenciaResponseDTO> listarPorFiltros(
            UUID usuarioId,
            StatusOcorrencia status,
            CategoriaOcorrencia categoria,
            String bairro
    ) {
        String bairroNorm = normalizarBairro(bairro);
        boolean filtrarBairro = bairroNorm != null;
        return ocorrenciaRepository.buscarPorFiltros(usuarioId, status, categoria, filtrarBairro, bairroNorm).stream()
                .map(this::paraResumo)
                .toList();
    }

    @Transactional
    public OcorrenciaResponseDTO atualizarStatus(UUID id, StatusOcorrencia statusNovo, String observacao) {
        Ocorrencia o = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada."));
        StatusOcorrencia anterior = o.getStatus();

        atualizacaoStatusRepository.save(AtualizacaoStatus.builder()
                .ocorrencia(o)
                .statusAnterior(anterior)
                .statusNovo(statusNovo)
                .observacao(observacao)
                .build());

        o.setStatus(statusNovo);
        if (statusNovo == StatusOcorrencia.CONCLUIDO) {
            o.setResolvidoEm(LocalDateTime.now());
        }
        ocorrenciaRepository.save(o);

        return buscarPorId(id);
    }

    @Transactional
    public OcorrenciaResponseDTO atualizarOrgao(UUID id, UUID orgaoId, String observacao) {
        Ocorrencia o = ocorrenciaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ocorrência não encontrada."));

        if (o.getStatus() == StatusOcorrencia.CANCELADO) {
            throw new IllegalArgumentException("Não é possível alterar órgão de ocorrência cancelada.");
        }

        UUID orgaoAnteriorId = o.getOrgaoResponsavel() != null ? o.getOrgaoResponsavel().getId() : null;
        if (Objects.equals(orgaoAnteriorId, orgaoId)) {
            return buscarPorId(id);
        }

        Orgao orgaoNovo = null;
        if (orgaoId != null) {
            orgaoNovo = orgaoRepository.findById(orgaoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Órgão não encontrado."));
        }

        o.setOrgaoResponsavel(orgaoNovo);
        ocorrenciaRepository.save(o);

        StatusOcorrencia status = o.getStatus();
        String obs = montarObservacaoOrgao(orgaoNovo, observacao);
        atualizacaoStatusRepository.save(AtualizacaoStatus.builder()
                .ocorrencia(o)
                .statusAnterior(status)
                .statusNovo(status)
                .observacao(obs)
                .build());

        return buscarPorId(id);
    }

    private static String montarObservacaoOrgao(Orgao orgaoNovo, String observacaoGestor) {
        String base = orgaoNovo == null
                ? "Órgão removido na fila de triagem (Kanban)"
                : "Encaminhado para " + (orgaoNovo.getSigla() != null ? orgaoNovo.getSigla() : orgaoNovo.getNome())
                + " via fila Kanban";
        if (observacaoGestor != null && !observacaoGestor.isBlank()) {
            return base + " | " + observacaoGestor.trim();
        }
        return base;
    }

    private String gerarProtocolo() {
        int ano = Year.now().getValue();
        int proximo = ocorrenciaRepository.maiorSequencialPorAno(ano) + 1;
        return String.format("ZUR-%d-%04d", ano, proximo);
    }

    private static List<MultipartFile> filtrarImagens(List<MultipartFile> imagens) {
        if (imagens == null || imagens.isEmpty()) {
            return List.of();
        }
        List<MultipartFile> lista = new ArrayList<>();
        for (MultipartFile f : imagens) {
            if (f != null && !f.isEmpty()) {
                lista.add(f);
            }
        }
        return lista;
    }

    private static String normalizarBairro(String bairro) {
        if (bairro == null || bairro.isBlank()) {
            return null;
        }
        return bairro.trim();
    }

    private OcorrenciaResponseDTO paraResumo(Ocorrencia o) {
        touchUsuario(o);
        touchOrgao(o);
        return montarDetalhe(o, List.of(), List.of());
    }

    private void touchUsuario(Ocorrencia o) {
        if (o.getUsuario() != null) {
            o.getUsuario().getNome();
        }
    }

    private void touchOrgao(Ocorrencia o) {
        if (o.getOrgaoResponsavel() != null) {
            o.getOrgaoResponsavel().getNome();
        }
    }

    private OcorrenciaResponseDTO montarDetalhe(Ocorrencia o, List<Midia> midias, List<AtualizacaoStatus> historico) {
        UUID orgaoId = o.getOrgaoResponsavel() != null ? o.getOrgaoResponsavel().getId() : null;
        String orgaoNome = o.getOrgaoResponsavel() != null ? o.getOrgaoResponsavel().getNome() : null;

        List<MidiaResponseDTO> midiasDto = midias.stream().map(this::paraMidiaDto).toList();
        List<AtualizacaoStatusResponseDTO> histDto = historico.stream().map(this::paraHistoricoDto).toList();

        return new OcorrenciaResponseDTO(
                o.getId(),
                o.getProtocolo(),
                o.getUsuario().getId(),
                o.getUsuario().getNome(),
                orgaoId,
                orgaoNome,
                o.getCategoria(),
                o.getSubcategoria(),
                o.getDescricao(),
                o.getUrgencia(),
                o.getStatus(),
                o.getLatitude(),
                o.getLongitude(),
                o.getEnderecoAproximado(),
                o.getBairro(),
                o.isRiscoAcidente(),
                o.isRecorrente(),
                o.getCriadoEm(),
                o.getResolvidoEm(),
                midiasDto,
                histDto
        );
    }

    private MidiaResponseDTO paraMidiaDto(Midia m) {
        return new MidiaResponseDTO(
                m.getId(),
                m.getNomeOriginal(),
                m.getUrlPublica(),
                m.getContentType(),
                m.getTamanhoBytes(),
                m.getEnviadoEm()
        );
    }

    private AtualizacaoStatusResponseDTO paraHistoricoDto(AtualizacaoStatus a) {
        return new AtualizacaoStatusResponseDTO(
                a.getStatusAnterior(),
                a.getStatusNovo(),
                a.getObservacao(),
                a.getAtualizadoEm()
        );
    }
}
