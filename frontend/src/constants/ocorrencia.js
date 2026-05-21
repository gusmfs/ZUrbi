/** Usuário cidadão demo (seed Porto Seguro) — usado até login real com UUID. */
export const DEMO_USUARIO_CIDADAO = 'a1000001-0000-4000-8000-000000000001';

export const CATEGORIAS = [
  { value: 'VIARIO', label: 'Viário (ruas e calçadas)' },
  { value: 'ILUMINACAO', label: 'Iluminação pública' },
  { value: 'SANEAMENTO', label: 'Saneamento e água' },
  { value: 'TRANSITO', label: 'Trânsito e sinalização' },
  { value: 'LIMPEZA', label: 'Limpeza urbana' },
];

export const SUBCATEGORIAS_POR_CATEGORIA = {
  VIARIO: [
    'Buraco na via',
    'Calçada quebrada',
    'Lixo em via pública',
    'Pavimento afundado',
  ],
  ILUMINACAO: ['Poste apagado', 'Lâmpada piscando', 'Poste danificado'],
  SANEAMENTO: ['Vazamento de água', 'Esgoto a céu aberto', 'Bueiro entupido'],
  TRANSITO: [
    'Semáforo defeituoso',
    'Sinalização apagada',
    'Faixa de pedestre apagada',
  ],
  LIMPEZA: ['Entulho abandonado', 'Mato alto em praça', 'Lixo acumulado'],
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
