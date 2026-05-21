/** Usuário cidadão demo (seed Porto Seguro) — usado até login real com UUID. */
export const DEMO_USUARIO_CIDADAO = 'a1000001-0000-4000-8000-000000000001';

export const CATEGORIAS = [
  { value: 'VIARIO', label: 'Viário (ruas e calçadas)' },
  { value: 'ILUMINACAO', label: 'Iluminação pública' },
  { value: 'SANEAMENTO', label: 'Saneamento e água' },
  { value: 'TRANSITO', label: 'Trânsito e sinalização' },
  { value: 'LIMPEZA', label: 'Limpeza urbana' },
];

/**
 * Tipos de problema por categoria — distintos entre si (sem duplicar lixo/entulho em Viário e Limpeza).
 */
export const SUBCATEGORIAS_POR_CATEGORIA = {
  VIARIO: [
    'Buraco na via',
    'Pavimento afundado',
    'Calçada quebrada',
    'Meio-fio ou guia danificada',
    'Via obstruída',
    'Defeito em ciclovia ou ciclofaixa',
    'Alagamento na via',
  ],
  ILUMINACAO: [
    'Poste apagado',
    'Lâmpada queimada',
    'Lâmpada piscando',
    'Poste danificado',
  ],
  SANEAMENTO: [
    'Vazamento de água',
    'Esgoto a céu aberto',
    'Bueiro entupido',
    'Falta de água',
    'Alagamento por drenagem',
  ],
  TRANSITO: [
    'Semáforo defeituoso',
    'Placa ou sinal caído',
    'Sinalização apagada ou danificada',
    'Faixa de pedestre apagada',
    'Lombada irregular',
    'Obstrução ao trânsito',
  ],
  LIMPEZA: [
    'Lixo acumulado',
    'Entulho abandonado',
    'Mato alto em praça ou via',
    'Coleta de lixo não realizada',
    'Animal morto na via',
  ],
};

export const URGENCIAS = [
  {
    value: 'BAIXA',
    label: 'Baixa',
    description: 'Não afeta circulação imediata; pode aguardar fila normal.',
  },
  {
    value: 'MEDIA',
    label: 'Média',
    description: 'Incomoda ou pode afetar segurança em médio prazo.',
  },
  {
    value: 'ALTA',
    label: 'Alta',
    description: 'Risco relevante de acidente ou dano grave.',
  },
];

/** Centro e limites do mapa — Porto Seguro (demo). */
export const MAPA_PORTO_SEGURO = {
  center: { lat: -16.4498, lng: -39.0643 },
  bounds: {
    north: -16.41,
    south: -16.49,
    east: -39.02,
    west: -39.11,
  },
  zoom: 14,
};
