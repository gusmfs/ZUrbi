/**
 * Bairros oficiais do município de Porto Seguro — BA.
 * Fonte: lista oficial fornecida pela prefeitura (cadastro de chamados).
 */
export const BAIRROS_PORTO_SEGURO = [
  'Areião',
  "Arraial d'Ajuda",
  'Baianão',
  'Bairro Novo',
  'Bairro Paraguai',
  'Cambolo',
  'Campinho',
  'Campinho II',
  'Caraíva',
  'Centro',
  'Cidade Alta',
  'Fontana I',
  'Fontana II',
  'Frei Calixto',
  'Jardim Atlântico',
  'Jardim Limoeiro',
  'Mirante / Mirante de Caravelas',
  'Miraporto',
  'Mundaí',
  'Nilo Fraga',
  'Outeiro da Glória',
  'Outeiro de São Francisco',
  'Pacatá',
  'Paraíso dos Pataxós',
  'Parque Ecológico',
  'Parque Ecológico Paulo Souto',
  'Parracho',
  'Pindorama',
  'Porto Alegre',
  'Quinta do Descobrimento',
  'Residencial Parque Ecológico',
  'Riacho Doce',
  'Rogério Pinto',
  'Sapoti',
  'Sunset',
  'Tabapiri / Tabapiry',
  'Taperapuã',
  'Terra dos Pássaros',
  'Trancoso',
  'Ubaldinópolis',
  'Vale Verde',
  'Vera Cruz',
  'Vila Jardim',
  'Vila Valdete',
  'Vila Vitória',
  'Village I',
  'Village II',
  'Village III',
];

/** Nomes antigos ou variantes (geocodificação) → bairro oficial. */
export const BAIRROS_ALIASES = {
  'outeiro da gloria': 'Outeiro da Glória',
  'paraiso dos pataxos': 'Paraíso dos Pataxós',
  'taperapua': 'Taperapuã',
  'tabapiri': 'Tabapiri / Tabapiry',
  'tabapiry': 'Tabapiri / Tabapiry',
  'fontana': 'Fontana I',
  'alto mundai': 'Mundaí',
  'baixo mundai': 'Mundaí',
  'cidade baiana': 'Cidade Alta',
  'pequi': 'Parque Ecológico',
  'barrancos': 'Vale Verde',
  'village': 'Village I',
};

export const CIDADE_MUNICIPIO = 'Porto Seguro';

/** Maior nome primeiro — evita match parcial errado na geocodificação. */
export const BAIRROS_ORDENADOS_BUSCA = [...BAIRROS_PORTO_SEGURO].sort(
  (a, b) => b.length - a.length
);
