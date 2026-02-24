import { IvaCategory } from "@/generated/prisma/enums";

export const IVA_RATES: Record<IvaCategory, number> = {
  BASICA: 22.0,
  MINIMA: 10.0,
  EXPORTACION: 0.0,
  EXONERADO: 0.0,
};

export const IVA_LABELS: Record<IvaCategory, string> = {
  BASICA: "Básica (22%)",
  MINIMA: "Mínima (10%)",
  EXPORTACION: "Exportación (0%)",
  EXONERADO: "Exonerado (0%)",
};

export const IVA_COLORS: Record<IvaCategory, string> = {
  BASICA: "bg-red-100 text-red-800",
  MINIMA: "bg-yellow-100 text-yellow-800",
  EXPORTACION: "bg-blue-100 text-blue-800",
  EXONERADO: "bg-green-100 text-green-800",
};
