import { prisma } from "@/lib/prisma";
import { inicioDoDia, parseJson } from "@/lib/utils";
import { XP_POR_EVENTO } from "@/lib/gamificacao";
import type { MissaoDiaria } from "@prisma/client";
import type { Area } from "@/types";

type AreaKey = "LINGUAGENS" | "HUMANAS" | "NATUREZA" | "MATEMATICA";

const ALVO_FORTE = 5;
const ALVO_FRACO = 10;
const ALVO_PADRAO = 7;

/** Calcula alvos da missão de hoje baseado no perfil e dia da semana. */
async function calcularAlvos(userId: string) {
  const sp = await prisma.studentProfile.findUnique({ where: { userId } });
  const areaScores: Record<string, number> = parseJson(
    sp?.areaScoresJson ?? "{}",
    {},
  );
  const alvo = (area: AreaKey): number => {
    const pct = areaScores[area];
    if (pct === undefined) return ALVO_PADRAO;
    if (pct >= 70) return ALVO_FORTE;
    if (pct <= 40) return ALVO_FRACO;
    return ALVO_PADRAO;
  };

  // Redação a cada 3 dias (baseado no dia do ano)
  const hoje = inicioDoDia();
  const inicioAno = new Date(hoje.getFullYear(), 0, 0);
  const diaAno = Math.floor((hoje.getTime() - inicioAno.getTime()) / 86400000);
  const alvoRedacao = diaAno % 3 === 0 ? 1 : 0;

  // Revisões pendentes (capadas em 10)
  const pendentes = await prisma.revisao.count({
    where: { userId, proximaRevisao: { lte: new Date() } },
  });
  const alvoRevisoes = Math.min(10, pendentes);

  return {
    alvoLinguagens: alvo("LINGUAGENS"),
    alvoHumanas: alvo("HUMANAS"),
    alvoNatureza: alvo("NATUREZA"),
    alvoMatematica: alvo("MATEMATICA"),
    alvoRedacao,
    alvoRevisoes,
  };
}

/** Busca a missão de hoje ou cria uma nova. */
export async function getOuCriarMissaoHoje(userId: string): Promise<MissaoDiaria> {
  const data = inicioDoDia();
  const existente = await prisma.missaoDiaria.findUnique({
    where: { userId_data: { userId, data } },
  });
  if (existente) return existente;
  const alvos = await calcularAlvos(userId);
  return prisma.missaoDiaria.create({
    data: { userId, data, ...alvos },
  });
}

export type ProgressoTipo =
  | "QUESTAO_LINGUAGENS"
  | "QUESTAO_HUMANAS"
  | "QUESTAO_NATUREZA"
  | "QUESTAO_MATEMATICA"
  | "REDACAO"
  | "REVISAO";

export function tipoParaArea(area: Area): ProgressoTipo {
  switch (area) {
    case "LINGUAGENS": return "QUESTAO_LINGUAGENS";
    case "HUMANAS": return "QUESTAO_HUMANAS";
    case "NATUREZA": return "QUESTAO_NATUREZA";
    case "MATEMATICA": return "QUESTAO_MATEMATICA";
  }
}

/** Incrementa o progresso da missão de hoje. Retorna { premiada, missao }. */
export async function incrementarProgresso(
  userId: string,
  tipo: ProgressoTipo,
): Promise<{ premiada: boolean; missao: MissaoDiaria }> {
  const missao = await getOuCriarMissaoHoje(userId);
  const campoMap: Record<ProgressoTipo, keyof MissaoDiaria> = {
    QUESTAO_LINGUAGENS: "concluidoLinguagens",
    QUESTAO_HUMANAS: "concluidoHumanas",
    QUESTAO_NATUREZA: "concluidoNatureza",
    QUESTAO_MATEMATICA: "concluidoMatematica",
    REDACAO: "concluidoRedacao",
    REVISAO: "concluidoRevisoes",
  };
  const campo = campoMap[tipo];

  const atualizada = await prisma.missaoDiaria.update({
    where: { id: missao.id },
    data: { [campo]: { increment: 1 } },
  });

  const prog = progressoMissao(atualizada);
  if (prog.completa && !atualizada.concluidaEm) {
    const xp = atualizada.xpBase;
    const final = await prisma.missaoDiaria.update({
      where: { id: atualizada.id },
      data: { concluidaEm: new Date(), xpGanho: xp },
    });
    return { premiada: true, missao: final };
  }
  return { premiada: false, missao: atualizada };
}

export interface ProgressoMissao {
  total: number;
  feito: number;
  pct: number;
  completa: boolean;
  itens: Array<{
    chave: ProgressoTipo;
    label: string;
    alvo: number;
    feito: number;
    completo: boolean;
  }>;
}

export function progressoMissao(m: MissaoDiaria): ProgressoMissao {
  const base: Array<{ chave: ProgressoTipo; label: string; alvo: number; feito: number }> = [
    { chave: "QUESTAO_LINGUAGENS", label: "Questões de Linguagens",       alvo: m.alvoLinguagens,  feito: m.concluidoLinguagens },
    { chave: "QUESTAO_HUMANAS",    label: "Questões de Humanas",          alvo: m.alvoHumanas,     feito: m.concluidoHumanas },
    { chave: "QUESTAO_NATUREZA",   label: "Questões de Natureza",         alvo: m.alvoNatureza,    feito: m.concluidoNatureza },
    { chave: "QUESTAO_MATEMATICA", label: "Questões de Matemática",       alvo: m.alvoMatematica,  feito: m.concluidoMatematica },
    { chave: "REDACAO",            label: "Redação",                      alvo: m.alvoRedacao,     feito: m.concluidoRedacao },
    { chave: "REVISAO",            label: "Revisões pendentes",           alvo: m.alvoRevisoes,    feito: m.concluidoRevisoes },
  ];
  const itens: ProgressoMissao["itens"] = base
    .filter((i) => i.alvo > 0)
    .map((i) => ({ ...i, completo: i.feito >= i.alvo }));

  const total = itens.reduce((s, i) => s + i.alvo, 0);
  const feito = itens.reduce((s, i) => s + Math.min(i.feito, i.alvo), 0);
  const pct = total > 0 ? Math.round((feito / total) * 100) : 0;
  const completa = itens.length > 0 && itens.every((i) => i.completo);
  return { total, feito, pct, completa, itens };
}

export const XP_MISSAO_DIARIA = XP_POR_EVENTO.missaoDiaria;
