import { prisma } from "@/lib/prisma";
import { inicioDoDia } from "@/lib/utils";

export interface DailyPatch {
  questoes?: number;
  acertos?: number;
  tempo?: number;
  redacoes?: number;
  revisoes?: number;
  xp?: number;
}

/** Upsert atômico de DailyStats para hoje. */
export async function upsertDaily(userId: string, patch: DailyPatch): Promise<void> {
  const data = inicioDoDia();
  await prisma.dailyStats.upsert({
    where: { userId_data: { userId, data } },
    create: {
      userId,
      data,
      questoesResolvidas: patch.questoes ?? 0,
      acertos: patch.acertos ?? 0,
      tempoSegundos: patch.tempo ?? 0,
      redacoes: patch.redacoes ?? 0,
      revisoes: patch.revisoes ?? 0,
      xpDia: patch.xp ?? 0,
    },
    update: {
      questoesResolvidas: { increment: patch.questoes ?? 0 },
      acertos: { increment: patch.acertos ?? 0 },
      tempoSegundos: { increment: patch.tempo ?? 0 },
      redacoes: { increment: patch.redacoes ?? 0 },
      revisoes: { increment: patch.revisoes ?? 0 },
      xpDia: { increment: patch.xp ?? 0 },
    },
  });
}

/** Soma totais por dia nos últimos N dias (mais recente por último). */
export async function ultimosNDias(userId: string, n: number) {
  const inicio = inicioDoDia();
  inicio.setDate(inicio.getDate() - (n - 1));
  const rows = await prisma.dailyStats.findMany({
    where: { userId, data: { gte: inicio } },
    orderBy: { data: "asc" },
  });
  const mapa = new Map<string, (typeof rows)[number]>();
  for (const r of rows) mapa.set(r.data.toISOString().slice(0, 10), r);
  const out: Array<{
    data: Date;
    label: string;
    questoes: number;
    acertos: number;
    tempo: number;
    redacoes: number;
    revisoes: number;
    xp: number;
  }> = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(inicio);
    d.setDate(inicio.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const r = mapa.get(key);
    out.push({
      data: new Date(d),
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      questoes: r?.questoesResolvidas ?? 0,
      acertos: r?.acertos ?? 0,
      tempo: r?.tempoSegundos ?? 0,
      redacoes: r?.redacoes ?? 0,
      revisoes: r?.revisoes ?? 0,
      xp: r?.xpDia ?? 0,
    });
  }
  return out;
}

/** Ranking básico do usuário comparando últimos 7 dias com 7 dias anteriores. */
export async function ranking7d(userId: string): Promise<{
  questoesAtual: number;
  questoesAnterior: number;
  acertosAtual: number;
  acertosAnterior: number;
  tempoAtual: number;
  tempoAnterior: number;
  xpAtual: number;
  xpAnterior: number;
}> {
  const hoje = inicioDoDia();
  const inicioAtual = new Date(hoje);
  inicioAtual.setDate(hoje.getDate() - 6);
  const inicioAnterior = new Date(hoje);
  inicioAnterior.setDate(hoje.getDate() - 13);
  const rows = await prisma.dailyStats.findMany({
    where: { userId, data: { gte: inicioAnterior } },
  });
  const zero = { q: 0, a: 0, t: 0, xp: 0 };
  const atual = { ...zero };
  const anterior = { ...zero };
  for (const r of rows) {
    if (r.data >= inicioAtual) {
      atual.q += r.questoesResolvidas;
      atual.a += r.acertos;
      atual.t += r.tempoSegundos;
      atual.xp += r.xpDia;
    } else {
      anterior.q += r.questoesResolvidas;
      anterior.a += r.acertos;
      anterior.t += r.tempoSegundos;
      anterior.xp += r.xpDia;
    }
  }
  return {
    questoesAtual: atual.q,
    questoesAnterior: anterior.q,
    acertosAtual: atual.a,
    acertosAnterior: anterior.a,
    tempoAtual: atual.t,
    tempoAnterior: anterior.t,
    xpAtual: atual.xp,
    xpAnterior: anterior.xp,
  };
}
