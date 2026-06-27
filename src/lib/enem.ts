import { diasEntre } from "@/lib/utils";

function parseDate(v: string | undefined, fallback: string): Date {
  const s = v && v.length > 0 ? v : fallback;
  const d = new Date(`${s}T00:00:00`);
  return Number.isNaN(d.getTime()) ? new Date(`${fallback}T00:00:00`) : d;
}

export const DATA_ENEM_DIA1: Date = parseDate(
  process.env.NEXT_PUBLIC_ENEM_DIA1,
  "2026-11-08",
);
export const DATA_ENEM_DIA2: Date = parseDate(
  process.env.NEXT_PUBLIC_ENEM_DIA2,
  "2026-11-15",
);

export function diasParaEnem(now: Date = new Date()): {
  diasDia1: number;
  diasDia2: number;
  proximoDia: 1 | 2;
  proximaData: Date;
  ano: number;
} {
  const diasDia1 = diasEntre(now, DATA_ENEM_DIA1);
  const diasDia2 = diasEntre(now, DATA_ENEM_DIA2);
  const proximoDia: 1 | 2 = diasDia1 >= 0 ? 1 : 2;
  const proximaData = proximoDia === 1 ? DATA_ENEM_DIA1 : DATA_ENEM_DIA2;
  return {
    diasDia1,
    diasDia2,
    proximoDia,
    proximaData,
    ano: DATA_ENEM_DIA1.getFullYear(),
  };
}
