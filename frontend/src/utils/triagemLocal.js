import { SUBCATEGORIAS_POR_CATEGORIA } from '../constants/ocorrencia';

const ORDEM = ['ILUMINACAO', 'SANEAMENTO', 'TRANSITO', 'LIMPEZA', 'VIARIO'];

const TERMOS = {
  EMERGENCIA: [
    'acidente', 'incendio', 'fogo', 'desabamento', 'emergencia', 'inundacao', 'enchente',
  ],
  ILUMINACAO: ['iluminacao', 'poste', 'lampada', 'luz', 'apagado', 'escuro', 'piscando'],
  SANEAMENTO: ['esgoto', 'bueiro', 'vazamento', 'agua', 'cano', 'mal cheiro', 'transbord'],
  TRANSITO: ['semaforo', 'transito', 'sinalizacao', 'faixa', 'placa', 'cruzamento'],
  LIMPEZA: [
    'lixo', 'entulho', 'mato', 'capina', 'limpeza', 'coleta', 'cacamba', 'sujeira', 'dengue',
  ],
  VIARIO: ['buraco', 'calcada', 'pavimento', 'asfalto', 'via', 'rua', 'pista'],
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
    if (contem(texto, TERMOS[cat])) return cat;
  }
  return 'VIARIO';
}

function inferirSubcategoria(texto, categoria) {
  const padrao = SUBCATEGORIAS_POR_CATEGORIA[categoria]?.[0] || '';
  if (categoria === 'LIMPEZA') {
    if (contem(texto, ['mato', 'grama', 'praca'])) return 'Mato alto em praça';
    if (contem(texto, ['entulho', 'obra'])) return 'Entulho abandonado';
    if (contem(texto, ['lixo'])) return 'Lixo acumulado';
  }
  if (categoria === 'VIARIO') {
    if (contem(texto, ['buraco', 'cratera'])) return 'Buraco na via';
    if (contem(texto, ['calcada', 'passeio'])) return 'Calçada quebrada';
    if (contem(texto, ['lixo', 'entulho'])) return 'Lixo em via pública';
  }
  if (categoria === 'ILUMINACAO') {
    if (contem(texto, ['piscando'])) return 'Lâmpada piscando';
    if (contem(texto, ['danificad', 'quebrado', 'caido'])) return 'Poste danificado';
    if (contem(texto, ['apagado', 'escuro', 'sem luz'])) return 'Poste apagado';
  }
  if (categoria === 'SANEAMENTO') {
    if (contem(texto, ['esgoto', 'cheiro'])) return 'Esgoto a céu aberto';
    if (contem(texto, ['bueiro'])) return 'Bueiro entupido';
    if (contem(texto, ['vazamento', 'agua'])) return 'Vazamento de água';
  }
  if (categoria === 'TRANSITO') {
    if (contem(texto, ['faixa'])) return 'Faixa de pedestre apagada';
    if (contem(texto, ['placa', 'sinal'])) return 'Sinalização apagada';
    if (contem(texto, ['semaforo'])) return 'Semáforo defeituoso';
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

/** Classificação offline (mesmas regras do backend v1) quando a API não está disponível. */
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
