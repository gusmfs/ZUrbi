package br.com.zurbi.shared.validation;

/**
 * Validação de CPF brasileiro (11 dígitos, incluindo dígitos verificadores).
 */
public final class CpfUtil {

    private CpfUtil() {}

    public static String somenteDigitos(String cpf) {
        if (cpf == null) return "";
        return cpf.replaceAll("\\D", "");
    }

    public static boolean isValido(String cpf) {
        String digits = somenteDigitos(cpf);
        if (digits.length() != 11) return false;
        if (digits.chars().distinct().count() == 1) return false;

        int d1 = calcularDigito(digits.substring(0, 9), 10);
        int d2 = calcularDigito(digits.substring(0, 9) + d1, 11);
        return digits.equals(digits.substring(0, 9) + d1 + d2);
    }

    public static String mascarar(String cpf) {
        String digits = somenteDigitos(cpf);
        if (digits.length() != 11) return "***.***.***-**";
        return "***.***.***-" + digits.substring(9);
    }

    private static int calcularDigito(String base, int pesoInicial) {
        int soma = 0;
        for (int i = 0; i < base.length(); i++) {
            soma += Character.getNumericValue(base.charAt(i)) * (pesoInicial - i);
        }
        int resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }
}
