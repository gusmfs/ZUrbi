/**
 * Paleta zUrbi — extraída da logo (z/b azul, U/i amarelo, r verde).
 * Referência complementar: LOGO_SETUP.md (#003366, #00AA44).
 */
export const ZURBI_BRAND = {
  blue: '#2A7FD6',
  yellow: '#F0B429',
  green: '#35B56A',
  blueDark: '#003366',
  greenDark: '#00AA44',
};

/** Ciclo para gráficos com várias séries/barras */
export const ZURBI_CHART_PALETTE = [
  ZURBI_BRAND.blue,
  ZURBI_BRAND.yellow,
  ZURBI_BRAND.green,
  '#5BA3E0',
  '#F5C956',
  '#5BC985',
  '#1E6BB8',
  '#D99E1F',
  '#2A9D5C',
];

export function chartColorByIndex(index) {
  return ZURBI_CHART_PALETTE[index % ZURBI_CHART_PALETTE.length];
}
