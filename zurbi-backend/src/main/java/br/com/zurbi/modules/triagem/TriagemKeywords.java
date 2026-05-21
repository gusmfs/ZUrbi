package br.com.zurbi.modules.triagem;

import br.com.zurbi.shared.enums.CategoriaOcorrencia;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

/**
 * Vocabulário de palavras-chave para triagem por regras (v1).
 * Termos sem acento — a busca normaliza o texto do chamado antes de comparar.
 */
public final class TriagemKeywords {

    private TriagemKeywords() {}

    /** Ordem de inferência: categorias mais específicas primeiro. */
    public static final List<CategoriaOcorrencia> ORDEM_INFERENCIA = List.of(
            CategoriaOcorrencia.ILUMINACAO,
            CategoriaOcorrencia.SANEAMENTO,
            CategoriaOcorrencia.TRANSITO,
            CategoriaOcorrencia.LIMPEZA,
            CategoriaOcorrencia.VIARIO
    );

    public static final List<String> EMERGENCIA = List.of(
            "acidente", "colisao", "batida", "choque", "atropelamento", "atropelado",
            "incendio", "fogo", "chamas", "explosao", "explodiu", "desabamento",
            "desabou", "rompimento", "urgencia maxima", "risco de vida", "ferido",
            "feridos", "vitima", "vitimas", "emergencia", "socorro", "ambulancia",
            "corpo de bombeiros", "bombeiro", "inundacao", "enchente", "alagamento grave",
            "arvore caida", "galho caido", "poste caido", "fio partido", "fio caido",
            "choque eletrico", "curto circuito perigoso"
    );

    public static final List<String> ILUMINACAO = List.of(
            "iluminacao", "iluminacao publica", "luz publica", "poste", "postes",
            "poste apagado", "poste quebrado", "poste danificado", "poste inclinado",
            "poste torto", "lampada", "lampadas", "luminaria", "luminarias", "refletor",
            "escuro", "escuridao", "sem luz", "apagado", "apagada", "queimada", "queimado",
            "piscando", "intermitente", "falha na luz", "trecho escuro", "buraco de luz",
            "rele", "reator", "fio de iluminacao", "braco de poste", "braco quebrado"
    );

    public static final List<String> SANEAMENTO = List.of(
            "saneamento", "esgoto", "esgotamento", "fossa", "fossa septica", "esgoto a ceu aberto",
            "ceu aberto", "bueiro", "bueiros", "boca de lobo", "grelha", "tampa de bueiro",
            "vazamento", "vazando", "vazamentos", "agua parada", "agua suja", "agua servida",
            "cano", "cano rompido", "tubulacao", "tubo", "hidrometro", "rede de agua",
            "rede de esgoto", "mal cheiro", "mau cheiro", "odor", "cheiro forte",
            "transbordando", "transbordo", "alagamento", "encharcado", "poça", "poca d'agua",
            "drenagem", "dreno", "vala", "galeria pluvial", "manutencao de esgoto"
    );

    /** Frases compostas — checadas antes da lista geral de categoria. */
    public static final List<String> FRASES_TRANSITO = List.of(
            "placa caida", "placa no chao", "placa no solo", "placa tombada", "placa quebrada",
            "placa danificada", "placa arrancada", "sinal caido", "sinal no chao", "sinal tombado",
            "placa de transito caida", "placa de pare caida", "cone caído", "cone caido", "cone no chao",
            "cavalete caido", "barreira caida", "sinalizacao caida", "tachao", "tacha"
    );

    public static final List<String> FRASES_LIMPEZA = List.of(
            "lixo acumulado", "lixo na rua", "lixo na calcada", "entulho na rua", "mato alto",
            "capina necessaria", "podar arvore", "restos de construcao", "saco de lixo", "lixeira cheia",
            "coleta nao passou", "animal morto", "carcaca de animal"
    );

    public static final List<String> FRASES_SANEAMENTO = List.of(
            "vazamento de agua", "agua vazando", "cano estourado", "esgoto a ceu aberto",
            "esgoto transbordando", "bueiro entupido", "bueiro entupido", "falta de agua", "sem agua",
            "agua suja", "mal cheiro esgoto", "cheiro de esgoto"
    );

    public static final List<String> FRASES_ILUMINACAO = List.of(
            "poste apagado", "poste caido", "poste quebrado", "lampada queimada", "lampada piscando",
            "sem iluminacao", "rua escura", "luz apagada", "poste danificado"
    );

    public static final List<String> FRASES_VIARIO = List.of(
            "buraco na rua", "buraco na via", "buraco na pista", "buraco grande", "cratera",
            "pavimento afundado", "asfalto afundando", "calcada quebrada", "calcada irregular",
            "meio fio quebrado", "via obstruida", "arvore caida na via", "galho na via"
    );

    public static final List<String> TRANSITO = List.of(
            "transito", "trafego", "traffic", "semaforo", "semaforos", "sinaleira", "sinaleiras",
            "lombada", "quebra molas", "redutor de velocidade", "placa", "placas", "cone", "cones",
            "cavalete", "cavaletes", "baliza", "defensa", "sinalizacao", "sinalizacao viaria",
            "placa de transito", "placa de pare", "pare obrigatorio", "placa de velocidade",
            "faixa de pedestre", "faixa apagada", "speed bump", "radar", "fiscalizacao eletronica",
            "cruzamento", "retorno", "rotatoria", "rotunda", "conversao proibida", "mao dupla",
            "congestionamento", "engarrafamento", "obstrucao da via", "interdicao", "desvio",
            "sinal apagado", "amarelo piscando", "vermelho apagado", "controlador de transito",
            "sinal vertical", "sinal de transito", "proibido estacionar", "estacionamento proibido"
    );

    public static final List<String> LIMPEZA = List.of(
            "limpeza", "limpeza urbana", "lixo", "lixeira", "lixeiras", "coleta", "coleta de lixo",
            "entulho", "entulhos", "residuo", "residuos", "descarte irregular", "descarte de lixo",
            "mato", "mato alto", "capina", "rocagem", "rocada", "vegetacao", "grama alta", "gramado",
            "praca suja", "area verde", "podar", "poda", "galhos", "restos de poda", "restos de obra",
            "animal morto", "carcaca", "sujeira", "imundicia", "varricao", "varrer", "cacamba",
            "cacambas", "descarte de entulho", "lixo acumulado", "foco de dengue", "mosquito",
            "coleta nao passou", "lixeira cheia", "lixeira transbordando", "saco de lixo", "resto de muro"
    );

    public static final List<String> VIARIO = List.of(
            "viario", "via publica", "rua", "avenida", "estrada", "pista", "pavimento",
            "pavimentacao", "asfalto", "asfalt", "buraco", "buracos", "cratera", "afundamento",
            "pavimento afundado", "solado", "calçada", "calcada", "calcamento", "passeio",
            "meio fio", "meio-fio", "guia", "sarjeta", "irregularidade", "desnivel", "desnível",
            "trinca", "fissura", "remendo", "tapa buraco", "obra na via", "intervencao viaria",
            "ciclovia", "ciclofaixa", "via obstruida", "obstrucao na via", "ponte", "pontilhao",
            "muro de arrimo", "talude",
            "queda de barreira", "erosao", "erosão", "bueiro sem tampa", "tampa quebrada"
    );

    public static List<String> porCategoria(CategoriaOcorrencia categoria) {
        return switch (categoria) {
            case ILUMINACAO -> ILUMINACAO;
            case SANEAMENTO -> SANEAMENTO;
            case TRANSITO -> TRANSITO;
            case LIMPEZA -> LIMPEZA;
            case VIARIO -> VIARIO;
        };
    }

    public static boolean textoIndicaEmergencia(String textoNormalizado) {
        return contemAlguma(textoNormalizado, EMERGENCIA);
    }

    public static boolean textoIndicaCategoria(String textoNormalizado, CategoriaOcorrencia categoria) {
        return contemAlguma(textoNormalizado, porCategoria(categoria));
    }

    /** Primeira categoria cuja lista de termos aparece no texto (ordem de especificidade). */
    public static CategoriaOcorrencia inferirCategoria(String textoNormalizado) {
        if (contemAlguma(textoNormalizado, FRASES_ILUMINACAO)) {
            return CategoriaOcorrencia.ILUMINACAO;
        }
        if (contemAlguma(textoNormalizado, FRASES_SANEAMENTO)) {
            return CategoriaOcorrencia.SANEAMENTO;
        }
        if (contemAlguma(textoNormalizado, FRASES_TRANSITO)) {
            return CategoriaOcorrencia.TRANSITO;
        }
        if (contemAlguma(textoNormalizado, FRASES_LIMPEZA)) {
            return CategoriaOcorrencia.LIMPEZA;
        }
        if (contemAlguma(textoNormalizado, FRASES_VIARIO)) {
            return CategoriaOcorrencia.VIARIO;
        }
        for (CategoriaOcorrencia categoria : ORDEM_INFERENCIA) {
            if (textoIndicaCategoria(textoNormalizado, categoria)) {
                return categoria;
            }
        }
        return null;
    }

    /** Subcategoria padrão exibida no formulário quando não há termo específico. */
    public static String subcategoriaPadrao(CategoriaOcorrencia categoria) {
        return switch (categoria) {
            case VIARIO -> "Buraco na via";
            case ILUMINACAO -> "Poste apagado";
            case SANEAMENTO -> "Vazamento de água";
            case TRANSITO -> "Semáforo defeituoso";
            case LIMPEZA -> "Lixo acumulado";
        };
    }

    /**
     * Tipo de problema (subcategoria) alinhado às opções do formulário / seed.
     */
    public static String inferirSubcategoria(String textoNormalizado, CategoriaOcorrencia categoria) {
        if (categoria == null || textoNormalizado == null) {
            return null;
        }
        return switch (categoria) {
            case VIARIO -> inferirSubcategoriaViario(textoNormalizado);
            case ILUMINACAO -> inferirSubcategoriaIluminacao(textoNormalizado);
            case SANEAMENTO -> inferirSubcategoriaSaneamento(textoNormalizado);
            case TRANSITO -> inferirSubcategoriaTransito(textoNormalizado);
            case LIMPEZA -> inferirSubcategoriaLimpeza(textoNormalizado);
        };
    }

    private static String inferirSubcategoriaViario(String texto) {
        if (contemAlguma(texto, List.of("buraco", "cratera", "tapa buraco"))) {
            return "Buraco na via";
        }
        if (contemAlguma(texto, List.of("afundamento", "pavimento afundado", "asfalto cedendo", "cedendo", "irregular"))) {
            return "Pavimento afundado";
        }
        if (contemAlguma(texto, List.of("calcada", "passeio", "desnivel"))) {
            return "Calçada quebrada";
        }
        if (contemAlguma(texto, List.of("meio fio", "guia", "sarjeta"))) {
            return "Meio-fio ou guia danificada";
        }
        if (contemAlguma(texto, List.of("ciclovia", "ciclofaixa", "ciclista"))) {
            return "Defeito em ciclovia ou ciclofaixa";
        }
        if (contemAlguma(texto, List.of("alagamento na via", "agua na rua", "enchente na via"))) {
            return "Alagamento na via";
        }
        if (contemAlguma(texto, List.of(
                "obstrucao", "bloqueio", "entulho na via", "galho", "objeto na via",
                "arvore caida", "galho caido", "poste caido na via"
        ))) {
            return "Via obstruída";
        }
        return subcategoriaPadrao(CategoriaOcorrencia.VIARIO);
    }

    private static String inferirSubcategoriaIluminacao(String texto) {
        if (contemAlguma(texto, List.of("piscando", "intermitente"))) {
            return "Lâmpada piscando";
        }
        if (contemAlguma(texto, List.of("queimada", "queimado", "nao acende"))) {
            return "Lâmpada queimada";
        }
        if (contemAlguma(texto, List.of("danificad", "inclinado", "torto", "quebrado", "caido", "fio exposto"))) {
            return "Poste danificado";
        }
        if (contemAlguma(texto, List.of("apagado", "escuro", "sem luz"))) {
            return "Poste apagado";
        }
        return subcategoriaPadrao(CategoriaOcorrencia.ILUMINACAO);
    }

    private static String inferirSubcategoriaSaneamento(String texto) {
        if (contemAlguma(texto, List.of("esgoto", "ceu aberto", "transbord", "mal cheiro", "mau cheiro"))) {
            return "Esgoto a céu aberto";
        }
        if (contemAlguma(texto, List.of("bueiro", "boca de lobo", "grelha", "tampa", "entupido"))) {
            return "Bueiro entupido";
        }
        if (contemAlguma(texto, List.of("falta de agua", "sem agua", "interrupcao"))) {
            return "Falta de água";
        }
        if (contemAlguma(texto, List.of("alagamento", "drenagem", "agua parada"))) {
            return "Alagamento por drenagem";
        }
        if (contemAlguma(texto, List.of("vazamento", "vazando"))) {
            return "Vazamento de água";
        }
        return subcategoriaPadrao(CategoriaOcorrencia.SANEAMENTO);
    }

    private static String inferirSubcategoriaTransito(String texto) {
        if (contemAlguma(texto, List.of(
                "placa caida", "placa no chao", "placa no solo", "placa tombada", "placa quebrada",
                "placa danificada", "placa arrancada", "sinal caido", "sinal no chao", "sinal tombado",
                "cone caido", "cone no chao", "cavalete caido", "barreira caida", "sinalizacao caida",
                "tachao", "tacha", "placa de pare caida", "placa de transito caida"
        ))) {
            return "Placa ou sinal caído";
        }
        if (contemAlguma(texto, List.of("semaforo", "sinaleira", "amarelo piscando", "vermelho apagado"))) {
            return "Semáforo defeituoso";
        }
        if (contemAlguma(texto, List.of("faixa de pedestre", "faixa apagada", "faixa sumiu"))) {
            return "Faixa de pedestre apagada";
        }
        if (contemAlguma(texto, List.of("lombada", "quebra molas", "redutor", "speed bump"))) {
            return "Lombada irregular";
        }
        if (contemAlguma(texto, List.of("estacionado", "interdicao", "bloqueio da via", "veiculo na via"))) {
            return "Obstrução ao trânsito";
        }
        if (contemAlguma(texto, List.of("placa", "sinalizacao", "pare obrigatorio", "sinal apagado", "placa apagada"))) {
            return "Sinalização apagada ou danificada";
        }
        return subcategoriaPadrao(CategoriaOcorrencia.TRANSITO);
    }

    private static String inferirSubcategoriaLimpeza(String texto) {
        if (contemAlguma(texto, List.of("animal morto", "carcaca"))) {
            return "Animal morto na via";
        }
        if (contemAlguma(texto, List.of("coleta", "nao passou", "lixeira cheia"))) {
            return "Coleta de lixo não realizada";
        }
        if (contemAlguma(texto, List.of("mato", "grama alta", "capina", "praca", "vegetacao"))) {
            return "Mato alto em praça ou via";
        }
        if (contemAlguma(texto, List.of("entulho", "obra", "construcao", "cacamba"))) {
            return "Entulho abandonado";
        }
        if (contemAlguma(texto, List.of("lixo", "sujeira", "acumulado"))) {
            return "Lixo acumulado";
        }
        return subcategoriaPadrao(CategoriaOcorrencia.LIMPEZA);
    }

    public static boolean contemAlguma(String textoNormalizado, List<String> termos) {
        if (textoNormalizado == null || textoNormalizado.isBlank()) {
            return false;
        }
        for (String termo : termos) {
            String t = normalizar(termo);
            if (!t.isEmpty() && textoNormalizado.contains(t)) {
                return true;
            }
        }
        return false;
    }

    public static String normalizar(String texto) {
        if (texto == null || texto.isBlank()) {
            return "";
        }
        String semAcento = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return semAcento.toLowerCase(Locale.ROOT);
    }
}
