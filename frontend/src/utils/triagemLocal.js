import { SUBCATEGORIAS_POR_CATEGORIA } from '../constants/ocorrencia';

const ORDEM = ['ILUMINACAO', 'SANEAMENTO', 'TRANSITO', 'LIMPEZA', 'VIARIO'];

const FRASES = {
  ILUMINACAO: [
    'poste apagado', 'poste caido', 'poste quebrado', 'lampada queimada', 'lampada piscando',
    'sem iluminacao', 'rua escura', 'luz apagada', 'poste danificado',
  ],
  SANEAMENTO: [
    'vazamento de agua', 'agua vazando', 'cano estourado', 'esgoto a ceu aberto',
    'esgoto transbordando', 'bueiro entupido', 'falta de agua', 'sem agua',
    'agua suja', 'mal cheiro esgoto', 'cheiro de esgoto',
  ],
  TRANSITO: [
    'placa caida', 'placa no chao', 'placa no solo', 'placa tombada', 'placa quebrada',
    'placa danificada', 'placa arrancada', 'sinal caido', 'sinal no chao', 'sinal tombado',
    'placa de transito caida', 'placa de pare caida', 'cone caido', 'cone no chao',
    'cavalete caido', 'barreira caida', 'sinalizacao caida', 'tachao', 'tacha',
  ],
  LIMPEZA: [
    'lixo acumulado', 'lixo na rua', 'lixo na calcada', 'entulho na rua', 'mato alto',
    'capina necessaria', 'podar arvore', 'restos de construcao', 'saco de lixo', 'lixeira cheia',
    'coleta nao passou', 'animal morto', 'carcaca de animal',
  ],
  VIARIO: [
    'buraco na rua', 'buraco na via', 'buraco na pista', 'buraco grande', 'cratera',
    'pavimento afundado', 'asfalto afundando', 'calcada quebrada', 'calcada irregular',
    'meio fio quebrado', 'via obstruida', 'arvore caida na via', 'galho na via',
  ],
};

const TERMOS = {
  EMERGENCIA: [
    'acidente', 'incendio', 'fogo', 'desabamento', 'emergencia', 'inundacao', 'enchente',
  ],
  ILUMINACAO: [
    'iluminacao', 'iluminacao publica', 'poste', 'postes', 'lampada', 'lampadas', 'luz',
    'apagado', 'apagada', 'escuro', 'escura', 'piscando', 'queimada', 'queimado',
  ],
  SANEAMENTO: [
    'esgoto', 'esgotamento', 'bueiro', 'bueiros', 'grelha', 'vazamento', 'vazando',
    'agua', 'cano', 'canos', 'mal cheiro', 'mau cheiro', 'transbord', 'drenagem',
  ],
  TRANSITO: [
    'transito', 'trafego', 'semaforo', 'sinaleira', 'lombada', 'placa', 'placas',
    'cone', 'cones', 'cavalete', 'sinalizacao', 'faixa de pedestre', 'faixa apagada',
    'placa de pare', 'sinal apagado', 'obstrucao da via', 'cruzamento', 'rotatoria',
  ],
  LIMPEZA: [
    'lixo', 'entulho', 'mato', 'capina', 'limpeza', 'coleta', 'cacamba', 'sujeira', 'dengue',
    'animal morto', 'carcaca', 'lixeira', 'varricao', 'podar', 'poda',
  ],
  VIARIO: [
    'buraco', 'calcada', 'pavimento', 'asfalto', 'via', 'rua', 'pista', 'ciclovia', 'meio fio',
    'afundamento', 'irregularidade', 'cratera', 'tapa buraco',
  ],
};

function normalizar(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function contem(texto, termos) {
  return termos.some((t) => texto.includes(t));
}

function inferirCategoria(texto) {
  for (const cat of ORDEM) {
    if (contem(texto, FRASES[cat])) return cat;
  }
  for (const cat of ORDEM) {
    if (contem(texto, TERMOS[cat])) return cat;
  }
  return 'VIARIO';
}

function inferirSubcategoria(texto, categoria) {
  const padrao = SUBCATEGORIAS_POR_CATEGORIA[categoria]?.[0] || '';

  if (categoria === 'VIARIO') {
    if (contem(texto, ['buraco', 'cratera', 'tapa buraco'])) return 'Buraco na via';
    if (contem(texto, ['afundamento', 'cedendo', 'irregular'])) return 'Pavimento afundado';
    if (contem(texto, ['calcada', 'passeio', 'desnivel'])) return 'Calçada quebrada';
    if (contem(texto, ['meio fio', 'guia', 'sarjeta'])) return 'Meio-fio ou guia danificada';
    if (contem(texto, ['ciclovia', 'ciclofaixa', 'ciclista'])) return 'Defeito em ciclovia ou ciclofaixa';
    if (contem(texto, ['alagamento', 'agua na rua', 'enchente na via'])) return 'Alagamento na via';
    if (contem(texto, [
      'obstrucao', 'bloqueio', 'entulho na via', 'galho', 'objeto na via',
      'arvore caida', 'galho caido', 'poste caido na via',
    ])) {
      return 'Via obstruída';
    }
  }

  if (categoria === 'ILUMINACAO') {
    if (contem(texto, ['piscando', 'intermitente'])) return 'Lâmpada piscando';
    if (contem(texto, ['queimada', 'queimado', 'nao acende'])) return 'Lâmpada queimada';
    if (contem(texto, ['danificad', 'inclinado', 'caido', 'torto', 'fio exposto', 'poste caido'])) {
      return 'Poste danificado';
    }
    if (contem(texto, ['apagado', 'escuro', 'sem luz'])) return 'Poste apagado';
  }

  if (categoria === 'SANEAMENTO') {
    if (contem(texto, ['esgoto', 'ceu aberto', 'transbord', 'mal cheiro', 'mau cheiro'])) {
      return 'Esgoto a céu aberto';
    }
    if (contem(texto, ['bueiro', 'grelha', 'entupido', 'tampa'])) return 'Bueiro entupido';
    if (contem(texto, ['falta de agua', 'sem agua', 'interrupcao'])) return 'Falta de água';
    if (contem(texto, ['alagamento', 'drenagem', 'agua parada'])) return 'Alagamento por drenagem';
    if (contem(texto, ['vazamento', 'vazando'])) return 'Vazamento de água';
  }

  if (categoria === 'TRANSITO') {
    if (contem(texto, [
      'placa caida', 'placa no chao', 'placa no solo', 'placa tombada', 'placa quebrada',
      'placa danificada', 'placa arrancada', 'sinal caido', 'sinal no chao', 'sinal tombado',
      'cone caido', 'cone no chao', 'cavalete caido', 'barreira caida', 'sinalizacao caida',
      'tachao', 'tacha', 'placa de pare caida', 'placa de transito caida',
    ])) {
      return 'Placa ou sinal caído';
    }
    if (contem(texto, ['semaforo', 'sinaleira', 'amarelo piscando', 'vermelho apagado'])) {
      return 'Semáforo defeituoso';
    }
    if (contem(texto, ['faixa de pedestre', 'faixa apagada', 'faixa sumiu'])) {
      return 'Faixa de pedestre apagada';
    }
    if (contem(texto, ['lombada', 'quebra molas', 'redutor', 'speed bump'])) {
      return 'Lombada irregular';
    }
    if (contem(texto, ['estacionado', 'interdicao', 'bloqueio da via', 'veiculo na via'])) {
      return 'Obstrução ao trânsito';
    }
    if (contem(texto, ['placa', 'sinalizacao', 'pare obrigatorio', 'sinal apagado', 'placa apagada'])) {
      return 'Sinalização apagada ou danificada';
    }
  }

  if (categoria === 'LIMPEZA') {
    if (contem(texto, ['animal morto', 'carcaca'])) return 'Animal morto na via';
    if (contem(texto, ['coleta', 'nao passou', 'lixeira cheia'])) return 'Coleta de lixo não realizada';
    if (contem(texto, ['mato', 'grama', 'capina', 'vegetacao', 'praca'])) {
      return 'Mato alto em praça ou via';
    }
    if (contem(texto, ['entulho', 'obra', 'cacamba', 'construcao'])) return 'Entulho abandonado';
    if (contem(texto, ['lixo', 'sujeira', 'acumulado'])) return 'Lixo acumulado';
  }

  return padrao;
}

function inferirUrgencia(emergencia, risco) {
  if (emergencia || risco) return 'ALTA';
  return 'MEDIA';
}

const ORGAO_POR_CATEGORIA = {
  VIARIO: { nome: 'Secretaria de Obras e Infraestrutura', sigla: 'SOI' },
  ILUMINACAO: { nome: 'Companhia Independente de Iluminação Pública', sigla: 'CIP' },
  SANEAMENTO: { nome: 'Companhia de Água e Saneamento', sigla: 'CAS' },
  TRANSITO: { nome: 'Secretaria de Obras e Infraestrutura', sigla: 'SOI' },
  LIMPEZA: { nome: 'Secretaria de Limpeza Urbana', sigla: 'SLU' },
};

const LABEL_CATEGORIA = {
  VIARIO: 'Viário',
  ILUMINACAO: 'Iluminação',
  SANEAMENTO: 'Saneamento',
  TRANSITO: 'Trânsito',
  LIMPEZA: 'Limpeza',
};

/** Classificação local quando a API de triagem não está disponível. */
export function classificarChamadoLocal({ descricao, riscoAcidente, recorrente }) {
  const texto = normalizar(descricao);
  const emergencia = contem(texto, TERMOS.EMERGENCIA);
  const categoria = inferirCategoria(texto);
  const subcategoria = inferirSubcategoria(texto, categoria);
  const urgenciaSugerida = inferirUrgencia(emergencia, Boolean(riscoAcidente));
  const orgao = emergencia
    ? { nome: 'Defesa Civil Municipal', sigla: 'DCM' }
    : ORGAO_POR_CATEGORIA[categoria];

  const motivos = [
    `Categoria ${LABEL_CATEGORIA[categoria]} identificada pelo texto.`,
    `Tipo sugerido: ${subcategoria}.`,
    orgao
      ? `Encaminhamento previsto: ${orgao.nome} (${orgao.sigla}).`
      : 'Revisão humana recomendada.',
  ];
  if (emergencia) motivos.unshift('Termos de emergência no relato.');
  if (riscoAcidente) motivos.push('Risco de acidente informado.');
  if (recorrente) motivos.push('Problema marcado como recorrente.');

  return {
    categoria,
    subcategoria,
    urgenciaSugerida,
    orgaoId: null,
    orgaoNome: orgao?.nome ?? null,
    orgaoSigla: orgao?.sigla ?? null,
    confianca: emergencia ? 78 : 72,
    motivos,
    emergencia,
    origemLocal: true,
  };
}
