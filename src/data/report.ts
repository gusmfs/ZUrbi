export const reportData = {
  intro: {
    eyebrow: 'Protótipo de usabilidade',
    title: 'Registrar ocorrência',
    subtitle:
      'Uma experiência mobile first para transformar um problema urbano em um chamado claro, rastreável e acionável.',
  },
  steps: [
    { id: 'problema', label: 'Problema', shortLabel: '1' },
    { id: 'local', label: 'Local', shortLabel: '2' },
    { id: 'urgencia', label: 'Urgência', shortLabel: '3' },
    { id: 'revisao', label: 'Revisão', shortLabel: '4' },
  ],
  categories: [
    {
      id: 'urbano',
      title: 'Urbano',
      description: 'Vias, calçadas, limpeza e sinalização.',
      subcategories: ['Buraco na via', 'Calçada danificada', 'Falta de sinalização', 'Limpeza urbana'],
    },
    {
      id: 'iluminacao',
      title: 'Iluminação',
      description: 'Postes, lâmpadas e áreas escuras.',
      subcategories: ['Poste apagado', 'Lâmpada piscando', 'Rua sem iluminação'],
    },
    {
      id: 'saneamento',
      title: 'Saneamento',
      description: 'Água, esgoto e drenagem.',
      subcategories: ['Vazamento de água', 'Bueiro entupido', 'Esgoto exposto'],
    },
    {
      id: 'transito',
      title: 'Trânsito',
      description: 'Semáforos, faixas e riscos viários.',
      subcategories: ['Semáforo com defeito', 'Faixa apagada', 'Acidente na via'],
    },
  ],
  urgencyLevels: [
    {
      id: 'baixa',
      title: 'Baixa',
      description: 'Sem risco imediato, mas precisa entrar na fila de manutenção.',
      response: 'Atualização em até 72h',
    },
    {
      id: 'media',
      title: 'Média',
      description: 'Pode agravar o tráfego ou o uso da via se não for tratado.',
      response: 'Atualização em até 24h',
    },
    {
      id: 'alta',
      title: 'Alta',
      description: 'Há risco de acidente, dano ao veículo ou insegurança para pedestres.',
      response: 'Encaminhamento prioritário',
    },
  ],
  location: {
    detectedAddress: 'Av. das Palmeiras, 1840 - Setor Central',
    coordinates: '16.6864 S, 49.2643 W',
    district: 'Campinas',
  },
  summary: {
    protocol: 'ZUR-2026-0315',
    responsibleAgency: 'Secretaria Municipal de Infraestrutura',
    predictedSla: 'Atualização em 24h · Resolução estimada em 72h',
    smartTags: ['risco-de-acidente', 'via-principal', 'zona-recorrente'],
  },
  prototypeNote:
    'Fluxo demonstrativo. A geolocalização pode ser capturada pelo navegador; foto, triagem e encaminhamento continuam simulados para fins acadêmicos.',
} as const
