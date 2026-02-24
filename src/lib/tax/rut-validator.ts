export function validateRut(rut: string): {
  valid: boolean;
  formatted: string;
  clean: string;
} {
  const clean = rut.replace(/\D/g, "");

  if (clean.length !== 12) {
    return { valid: false, formatted: rut, clean };
  }

  // Uruguayan RUT check digit algorithm (modulo 11)
  const weights = [4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const digits = clean.slice(0, 11).split("").map(Number);
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? 0 : 11 - remainder;

  const valid = checkDigit === Number(clean[11]);
  const formatted = `${clean.slice(0, 2)}-${clean.slice(2, 9)}-${clean.slice(9, 12)}`;

  return { valid, formatted, clean };
}

export function formatRut(rut: string): string {
  const clean = rut.replace(/\D/g, "");
  if (clean.length !== 12) return rut;
  return `${clean.slice(0, 2)}-${clean.slice(2, 9)}-${clean.slice(9, 12)}`;
}
