/**
 * Geocodificação reversa (coordenadas → endereço + bairro alinhados).
 */
import {
  BAIRROS_ALIASES,
  BAIRROS_ORDENADOS_BUSCA,
  CIDADE_MUNICIPIO,
} from '../constants/bairrosPortoSeguro';

const IGNORAR_BAIRRO = new Set(
  [
    CIDADE_MUNICIPIO,
    'porto seguro',
    'bahia',
    'ba',
    'brasil',
    'brazil',
    'estado da bahia',
  ].map(normalizarTexto)
);

function normalizarTexto(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

function componente(components, ...tipos) {
  for (const tipo of tipos) {
    const c = components.find((item) => item.types?.includes(tipo));
    if (c?.long_name) return c.long_name.trim();
  }
  return '';
}

/** Reconhece bairro oficial do município a partir de um trecho de texto. */
export function reconhecerBairro(texto) {
  if (!texto?.trim()) return '';
  const norm = normalizarTexto(texto);
  if (IGNORAR_BAIRRO.has(norm)) return '';

  if (BAIRROS_ALIASES[norm]) return BAIRROS_ALIASES[norm];

  for (const bairro of BAIRROS_ORDENADOS_BUSCA) {
    const bn = normalizarTexto(bairro);
    if (norm === bn || norm.includes(bn)) return bairro;
  }

  for (const [alias, oficial] of Object.entries(BAIRROS_ALIASES)) {
    if (norm.includes(alias)) return oficial;
  }
  return '';
}

/** Busca bairro conhecido em todo o endereço formatado. */
function bairroNoTextoCompleto(texto) {
  if (!texto) return '';
  const lower = texto.toLowerCase();
  for (const bairro of BAIRROS_ORDENADOS_BUSCA) {
    if (lower.includes(bairro.toLowerCase())) return bairro;
  }
  return '';
}

function bairroDosComponentes(components) {
  const candidatos = [
    componente(components, 'sublocality_level_1'),
    componente(components, 'sublocality'),
    componente(components, 'neighborhood'),
    componente(components, 'administrative_area_level_4'),
    componente(components, 'political', 'sublocality'),
  ];

  for (const c of candidatos) {
    const reconhecido = reconhecerBairro(c);
    if (reconhecido) return reconhecido;
    if (c && !IGNORAR_BAIRRO.has(normalizarTexto(c))) {
      const noCatalogo = bairroNoTextoCompleto(c);
      if (noCatalogo) return noCatalogo;
    }
  }
  return '';
}

function partesEnderecoFormatado(formatted) {
  return formatted
    .split(/[,;]/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function parteEhMetadado(parte) {
  const p = normalizarTexto(parte);
  if (IGNORAR_BAIRRO.has(p)) return true;
  if (p.includes('porto seguro')) return true;
  if (/\d{5}-?\d{3}/.test(parte)) return true;
  if (/^(ba|br|brazil|brasil)$/.test(p)) return true;
  return false;
}

/** Extrai bairro analisando segmentos do endereço (padrão BR do Google). */
function bairroDasPartes(partes) {
  for (const parte of partes) {
    const limpa = parte.replace(/\s*-\s*/g, ' ').trim();
    const antesTraco = parte.split(' - ')[0]?.trim();
    const candidatos = [reconhecerBairro(limpa), reconhecerBairro(antesTraco)];
    for (const c of candidatos) {
      if (c) return c;
    }
    const segmentos = limpa.split(' - ');
    for (const seg of segmentos) {
      const b = reconhecerBairro(seg.trim());
      if (b) return b;
    }
  }

  const semMeta = partes.filter((p) => !parteEhMetadado(p));
  for (let i = semMeta.length - 1; i >= 0; i -= 1) {
    const b = reconhecerBairro(semMeta[i]);
    if (b) return b;
  }
  return '';
}

function montarEnderecoAproximado(route, numero, bairro, formatted) {
  if (route) {
    const base = numero ? `${route}, ${numero}` : route;
    if (bairro && !normalizarTexto(base).includes(normalizarTexto(bairro))) {
      return `${base}, ${bairro}`;
    }
    return base;
  }

  if (formatted) {
    const partes = partesEnderecoFormatado(formatted).filter((p) => !parteEhMetadado(p));
    if (partes.length) {
      const linha = partes.slice(0, 3).join(', ');
      if (bairro && !normalizarTexto(linha).includes(normalizarTexto(bairro))) {
        return `${linha}, ${bairro}`;
      }
      return linha;
    }
  }

  return bairro || '';
}

function resolverBairroEEndereco({ components, formatted_address: formatted }) {
  const componentsList = components || [];
  const partes = partesEnderecoFormatado(formatted || '');

  let bairro =
    bairroDosComponentes(componentsList) ||
    bairroDasPartes(partes) ||
    bairroNoTextoCompleto(formatted || '');

  const route = componente(componentsList, 'route');
  const numero = componente(componentsList, 'street_number');
  const enderecoAproximado = montarEnderecoAproximado(route, numero, bairro, formatted);

  if (!bairro && enderecoAproximado) {
    const ultimaParte = enderecoAproximado.split(',').pop()?.trim();
    bairro = reconhecerBairro(ultimaParte) || bairroNoTextoCompleto(enderecoAproximado);
  }

  if (bairro && enderecoAproximado && !normalizarTexto(enderecoAproximado).includes(normalizarTexto(bairro))) {
    return {
      enderecoAproximado: `${enderecoAproximado}, ${bairro}`,
      bairro,
    };
  }

  return {
    enderecoAproximado: enderecoAproximado.trim(),
    bairro: (bairro || '').trim(),
  };
}

function escolherResultadoGoogle(results) {
  if (!results?.length) return null;
  const preferido = results.find((r) =>
    (r.types || []).some((t) =>
      ['street_address', 'route', 'premise', 'subpremise'].includes(t)
    )
  );
  return preferido || results[0];
}

function parseGoogleResult(result) {
  return resolverBairroEEndereco({
    components: result.address_components,
    formatted_address: result.formatted_address,
  });
}

async function reverseGeocodeGoogle(lat, lng) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key || key === 'undefined') return null;

  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    key,
    language: 'pt-BR',
    region: 'br',
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params}`
  );
  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) {
    throw new Error(data.error_message || data.status || 'Geocoding failed');
  }

  const result = escolherResultadoGoogle(data.results);
  return parseGoogleResult(result);
}

function parseNominatimResult(data) {
  const addr = data.address || {};
  const components = [];
  const route = addr.road || addr.pedestrian || addr.footway || '';
  if (route) components.push({ types: ['route'], long_name: route });
  if (addr.house_number) {
    components.push({ types: ['street_number'], long_name: addr.house_number });
  }
  const suburbio = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district;
  if (suburbio) components.push({ types: ['sublocality'], long_name: suburbio });

  return resolverBairroEEndereco({
    components,
    formatted_address: data.display_name || '',
  });
}

async function reverseGeocodeNominatim(lat, lng) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'pt-BR',
  });

  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'pt-BR',
      },
    }
  );

  if (!res.ok) throw new Error('Nominatim unavailable');
  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return parseNominatimResult(data);
}

/**
 * @returns {Promise<{ enderecoAproximado: string, bairro: string }>}
 */
export async function buscarEnderecoPorCoordenadas(lat, lng) {
  try {
    const google = await reverseGeocodeGoogle(lat, lng);
    if (google?.enderecoAproximado) return google;
  } catch {
    /* fallback */
  }

  return reverseGeocodeNominatim(lat, lng);
}
