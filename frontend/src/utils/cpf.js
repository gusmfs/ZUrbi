/** Remove tudo que não for dígito. */
export function somenteDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

/** Formata CPF enquanto digita: 000.000.000-00 */
export function formatarCpf(valor) {
  const digits = somenteDigitos(valor).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function calcularDigito(base, pesoInicial) {
  let soma = 0;
  for (let i = 0; i < base.length; i += 1) {
    soma += Number(base[i]) * (pesoInicial - i);
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/** Valida CPF brasileiro (11 dígitos + verificadores). */
export function cpfValido(cpf) {
  const digits = somenteDigitos(cpf);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const d1 = calcularDigito(digits.slice(0, 9), 10);
  const d2 = calcularDigito(digits.slice(0, 9) + d1, 11);
  return digits === digits.slice(0, 9) + String(d1) + String(d2);
}

export function mascararCpf(cpf) {
  const digits = somenteDigitos(cpf);
  if (digits.length !== 11) return '***.***.***-**';
  return `***.***.***-${digits.slice(9)}`;
}
