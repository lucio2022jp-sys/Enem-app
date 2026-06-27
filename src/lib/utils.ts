import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatarDataHora(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatarMinutos(segundos: number): string {
  const mm = Math.floor(segundos / 60);
  const ss = segundos % 60;
  return `${mm.toString().padStart(2, "0")}:${ss.toString().padStart(2, "0")}`;
}

export const AREAS = [
  { key: "LINGUAGENS", label: "Linguagens" },
  { key: "HUMANAS", label: "Ciências Humanas" },
  { key: "NATUREZA", label: "Ciências da Natureza" },
  { key: "MATEMATICA", label: "Matemática" },
] as const;

export const AREA_LABELS: Record<string, string> = {
  LINGUAGENS: "Linguagens",
  HUMANAS: "Ciências Humanas",
  NATUREZA: "Ciências da Natureza",
  MATEMATICA: "Matemática",
  GERAL: "Geral",
};

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return "null";
  }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Retorna a data com hora zerada (00:00:00.000) no fuso local. */
export function inicioDoDia(d: Date = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** Diferença em dias de calendário (positivo se b > a). */
export function diasEntre(a: Date, b: Date): number {
  const ms = inicioDoDia(b).getTime() - inicioDoDia(a).getTime();
  return Math.round(ms / 86400000);
}

/** Formata segundos como "1h 23min" ou "23min" ou "0min". */
export function formatarTempo(segundos: number): string {
  if (!segundos || segundos <= 0) return "0min";
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
}
