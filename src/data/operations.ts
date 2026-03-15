export type OperationIncidentType =
  | 'viario'
  | 'iluminacao'
  | 'saneamento'
  | 'transito'
  | 'limpeza'

export type OperationIncidentSeverity = 'baixa' | 'media' | 'alta'
export type OperationIncidentStatus = 'novo' | 'em-analise' | 'encaminhado' | 'em-atendimento'

export interface OperationIncident {
  id: string
  title: string
  type: OperationIncidentType
  severity: OperationIncidentSeverity
  status: OperationIncidentStatus
  agency: string
  latitude: number
  longitude: number
  district: string
  updatedAt: string
  description: string
}

export const operationsData = {
  intro: {
    eyebrow: 'Painel da prefeitura',
    title: 'Monitoramento urbano em tempo real',
    subtitle:
      'Acompanhe ocorrências georreferenciadas, entenda padrões por tipo de problema e priorize respostas em áreas críticas da cidade.',
  },
  summary: [
    { id: 'total', label: 'Ocorrências ativas', value: '28', detail: '+6 nas últimas 24h' },
    { id: 'critical', label: 'Alta urgência', value: '7', detail: '3 em vias arteriais' },
    { id: 'average', label: 'Tempo médio de resposta', value: '18h', detail: '-12% vs. semana passada' },
    { id: 'hotspot', label: 'Bairro mais crítico', value: 'Campinas', detail: 'Concentração de ocorrências viárias' },
  ],
  insights: [
    {
      id: 'viario',
      title: 'Concentração viária',
      description: 'Buracos e falhas em pavimento se concentram nos corredores com maior fluxo de ônibus.',
    },
    {
      id: 'iluminacao',
      title: 'Iluminação recorrente',
      description: 'Ocorrências de iluminação aparecem em sequência nos mesmos quarteirões nas últimas noites.',
    },
    {
      id: 'saneamento',
      title: 'Correlação com chuva',
      description: 'Pontos de drenagem registraram aumento após o último período de chuva intensa.',
    },
  ],
  hotspots: [
    { id: 'campinas', name: 'Campinas', count: 9 },
    { id: 'centro', name: 'Setor Central', count: 6 },
    { id: 'coimbra', name: 'Setor Coimbra', count: 5 },
  ],
  incidents: [
    {
      id: 'inc-001',
      title: 'Buraco com risco de acidente',
      type: 'viario',
      severity: 'alta',
      status: 'encaminhado',
      agency: 'Infraestrutura',
      latitude: -16.6864,
      longitude: -49.2643,
      district: 'Campinas',
      updatedAt: 'Atualizado há 12 min',
      description: 'Buraco profundo em faixa de rolamento, próximo a cruzamento com alto fluxo de motos.',
    },
    {
      id: 'inc-002',
      title: 'Poste apagado em via local',
      type: 'iluminacao',
      severity: 'media',
      status: 'em-analise',
      agency: 'Iluminação Pública',
      latitude: -16.6847,
      longitude: -49.2674,
      district: 'Campinas',
      updatedAt: 'Atualizado há 25 min',
      description: 'Trecho com baixa visibilidade no período noturno, próximo a ponto de ônibus.',
    },
    {
      id: 'inc-003',
      title: 'Semáforo intermitente',
      type: 'transito',
      severity: 'alta',
      status: 'em-atendimento',
      agency: 'Mobilidade',
      latitude: -16.6881,
      longitude: -49.2618,
      district: 'Setor Central',
      updatedAt: 'Atualizado há 8 min',
      description: 'Semáforo principal em modo amarelo intermitente no horário de pico.',
    },
    {
      id: 'inc-004',
      title: 'Bueiro com retorno de água',
      type: 'saneamento',
      severity: 'media',
      status: 'novo',
      agency: 'Saneamento',
      latitude: -16.6916,
      longitude: -49.2589,
      district: 'Setor Coimbra',
      updatedAt: 'Atualizado há 31 min',
      description: 'Acúmulo de água e odor forte em esquina com histórico de alagamento.',
    },
    {
      id: 'inc-005',
      title: 'Acúmulo de lixo em canteiro',
      type: 'limpeza',
      severity: 'baixa',
      status: 'encaminhado',
      agency: 'Limpeza Urbana',
      latitude: -16.6824,
      longitude: -49.2623,
      district: 'Setor Central',
      updatedAt: 'Atualizado há 49 min',
      description: 'Resíduos acumulados próximos a faixa de pedestres e mobiliário urbano.',
    },
    {
      id: 'inc-006',
      title: 'Cratera em corredor de ônibus',
      type: 'viario',
      severity: 'alta',
      status: 'em-atendimento',
      agency: 'Infraestrutura',
      latitude: -16.6895,
      longitude: -49.2691,
      district: 'Campinas',
      updatedAt: 'Atualizado há 5 min',
      description: 'Falha extensa no pavimento afetando corredor de ônibus e veículos pesados.',
    },
    {
      id: 'inc-007',
      title: 'Faixa de pedestres apagada',
      type: 'transito',
      severity: 'media',
      status: 'novo',
      agency: 'Mobilidade',
      latitude: -16.6832,
      longitude: -49.2574,
      district: 'Setor Coimbra',
      updatedAt: 'Atualizado há 1 h',
      description: 'Sinalização horizontal comprometida em frente a escola municipal.',
    },
    {
      id: 'inc-008',
      title: 'Vazamento em tampa de inspeção',
      type: 'saneamento',
      severity: 'media',
      status: 'encaminhado',
      agency: 'Saneamento',
      latitude: -16.6868,
      longitude: -49.2559,
      district: 'Setor Central',
      updatedAt: 'Atualizado há 42 min',
      description: 'Vazamento constante com risco de desgaste do asfalto ao redor.',
    },
    {
      id: 'inc-009',
      title: 'Sequência de luminárias apagadas',
      type: 'iluminacao',
      severity: 'media',
      status: 'encaminhado',
      agency: 'Iluminação Pública',
      latitude: -16.6807,
      longitude: -49.2686,
      district: 'Campinas',
      updatedAt: 'Atualizado há 17 min',
      description: 'Trecho escuro em três postes consecutivos em área residencial.',
    },
    {
      id: 'inc-010',
      title: 'Descarte irregular em praça',
      type: 'limpeza',
      severity: 'baixa',
      status: 'em-analise',
      agency: 'Limpeza Urbana',
      latitude: -16.6902,
      longitude: -49.2648,
      district: 'Setor Coimbra',
      updatedAt: 'Atualizado há 22 min',
      description: 'Materiais de entulho deixados próximos ao mobiliário da praça.',
    },
  ] satisfies OperationIncident[],
} as const
