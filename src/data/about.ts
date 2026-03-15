export const aboutData = {
  intro: {
    title: 'Como o zUrbi funciona',
    lead: 'O zUrbi é uma plataforma digital que ajuda governos a identificar problemas urbanos antes que se tornem crises, cruzando dados públicos com participação cidadã.',
  },
  manifesto: {
    title: 'Manifesto',
    text: 'Acreditamos em cidades mais inteligentes, transparentes e responsivas. Tecnologia e dados devem servir para resolver problemas urbanos antes que virem emergência — com o cidadão no centro e o governo como fiscalizador que prioriza e acompanha.',
  },
  flow: [
    {
      step: 1,
      title: 'Cidadão registra',
      description: 'O cidadão reporta ocorrências pela plataforma, com localização (GPS), categoria e nível de urgência.',
    },
    {
      step: 2,
      title: 'Sistema cruza dados',
      description: 'O sistema cruza o registro com dados públicos (atendimentos, trânsito, iluminação, saúde) e prioriza.',
    },
    {
      step: 3,
      title: 'Órgão atua',
      description: 'O chamado é encaminhado ao órgão responsável, com prazos de atualização e resolução.',
    },
    {
      step: 4,
      title: 'Governo monitora',
      description: 'O governo acompanha o andamento, prazos e eficiência em um painel central de monitoramento.',
    },
  ],
  modules: [
    {
      id: 'mapa',
      title: 'Mapa inteligente',
      description: 'Visualização de ocorrências, zonas de risco e indicadores urbanos em um único mapa.',
    },
    {
      id: 'registro',
      title: 'Registro de ocorrências',
      description: 'Cards por tipo de serviço (urbano, água, energia, saúde, transporte) com subcategorias.',
    },
    {
      id: 'encaminhamento',
      title: 'Encaminhamento automático',
      description: 'Urgências direcionadas aos órgãos corretos (SAMU, polícia, bombeiros, prefeitura).',
    },
    {
      id: 'prazos',
      title: 'Gestão de prazos',
      description: 'Prazos de atualização e resolução visíveis para cidadão, órgão e governo.',
    },
    {
      id: 'painel',
      title: 'Painel governamental',
      description: 'Análise de demandas por setor, tempo de resposta e regiões com problemas recorrentes.',
    },
    {
      id: 'dados',
      title: 'Integração de dados',
      description: 'Cruzamento com dados oficiais de segurança, mobilidade e serviços públicos.',
    },
  ],
  useCases: [
    'Iluminação pública com falhas',
    'Buracos e falhas em vias',
    'Alta incidência de acidentes',
    'Infraestrutura urbana precária',
    'Vazamentos e saneamento',
    'Semáforos com defeito',
    'Regiões com maior demanda de atendimento',
    'Análise de recorrência e prevenção',
  ],
  future: {
    title: 'Visão futura do ecossistema',
    description: 'O zUrbi pretende evoluir para uma plataforma unificada de gestão de serviços públicos: diferentes órgãos compartilham dados, o cidadão usa um único canal e o governo monitora eficiência e qualidade em tempo real.',
  },
  storytelling: {
    title: 'Um caso simulado',
    subtitle: 'Da rua ao reparo: como o zUrbi conecta cidadão, dados e gestão pública.',
    steps: [
      {
        id: '1',
        title: 'O problema na via',
        description: 'Ana percebe um buraco grande na rua do bairro. Além do incômodo, ela sabe que pode causar acidentes ou danos a veículos. Em vez de só reclamar, ela decide registrar no zUrbi.',
      },
      {
        id: '2',
        title: 'Registro pelo app',
        description: 'Ana abre o app, escolhe a categoria "Urbano" e a opção relacionada a via. Ela tira uma foto do buraco, a localização é registrada automaticamente pelo GPS e ela informa o nível de urgência. O chamado é enviado em segundos.',
      },
      {
        id: '3',
        title: 'Prefeitura recebe e agenda',
        description: 'O zUrbi classifica o chamado e o encaminha ao setor responsável. A prefeitura recebe no painel a foto, o endereço e a prioridade, agenda a vistoria e acompanha o status pela plataforma.',
      },
      {
        id: '4',
        title: 'Reparo da via',
        description: 'A equipe da prefeitura vai até o local, faz a vistoria e executa o reparo do buraco. O chamado é atualizado no sistema e marcado como concluído. A via volta a ficar em condições seguras.',
      },
    ],
  },
} as const
