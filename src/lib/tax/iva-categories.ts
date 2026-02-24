import { IvaCategory } from "@/generated/prisma/enums";

export interface IvaRuleSeed {
  keyword: string;
  ivaCategory: IvaCategory;
  priority: number;
}

// Default global IVA classification rules for Uruguay
// These match product descriptions to the correct IVA category
export const DEFAULT_IVA_RULES: IvaRuleSeed[] = [
  // ─── TASA MÍNIMA (10%) - Alimentos básicos ──────────────────
  { keyword: "pan", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "leche", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "huevo", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "arroz", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "fideos", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "pasta", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "harina", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "aceite", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "azúcar", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "azucar", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "yerba", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "sal", ivaCategory: "MINIMA", priority: 5 },
  { keyword: "manteca", ivaCategory: "MINIMA", priority: 10 },

  // ─── TASA MÍNIMA (10%) - Carnes ─────────────────────────────
  { keyword: "carne", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "pollo", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "cerdo", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "cordero", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "pescado", ivaCategory: "MINIMA", priority: 10 },

  // ─── TASA MÍNIMA (10%) - Frutas y verduras ──────────────────
  { keyword: "fruta", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "verdura", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "manzana", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "naranja", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "banana", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "tomate", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "papa", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "cebolla", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "lechuga", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "zanahoria", ivaCategory: "MINIMA", priority: 10 },

  // ─── TASA MÍNIMA (10%) - Salud ──────────────────────────────
  { keyword: "medicamento", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "farmacia", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "comprimido", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "jarabe", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "ibuprofeno", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "paracetamol", ivaCategory: "MINIMA", priority: 10 },

  // ─── TASA MÍNIMA (10%) - Transporte, hotel, medios ──────────
  { keyword: "hotel", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "hospedaje", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "alojamiento", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "transporte", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "pasaje", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "ómnibus", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "omnibus", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "libro", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "diario", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "revista", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "periódico", ivaCategory: "MINIMA", priority: 10 },

  // ─── TASA MÍNIMA (10%) - Agua ───────────────────────────────
  { keyword: "agua corriente", ivaCategory: "MINIMA", priority: 10 },
  { keyword: "ose", ivaCategory: "MINIMA", priority: 10 },

  // ─── EXONERADO - Educación ──────────────────────────────────
  { keyword: "enseñanza", ivaCategory: "EXONERADO", priority: 10 },
  { keyword: "educación", ivaCategory: "EXONERADO", priority: 10 },
  { keyword: "educacion", ivaCategory: "EXONERADO", priority: 10 },
  { keyword: "colegio", ivaCategory: "EXONERADO", priority: 10 },
  { keyword: "universidad", ivaCategory: "EXONERADO", priority: 10 },
  { keyword: "matrícula", ivaCategory: "EXONERADO", priority: 10 },
  { keyword: "matricula", ivaCategory: "EXONERADO", priority: 10 },

  // ─── EXONERADO - Salud pública/mutual ───────────────────────
  { keyword: "mutualista", ivaCategory: "EXONERADO", priority: 10 },
  { keyword: "asse", ivaCategory: "EXONERADO", priority: 10 },

  // ─── EXONERADO - Alquiler vivienda ──────────────────────────
  { keyword: "alquiler", ivaCategory: "EXONERADO", priority: 8 },
  { keyword: "arrendamiento", ivaCategory: "EXONERADO", priority: 8 },
];
