import type { Nivel } from "@/types";
import { prisma } from "@/lib/prisma";

export interface NivelInfo {
  nivel: Nivel;
  indice: number;
  label: string;
  emoji: string;
  /** XP mínimo desse nível */
  xpMinimo: number;
  /** XP do próximo nível (Infinity se é o último) */
  xpProximo: number;
}

export const NIVEIS: NivelInfo[] = [
  { nivel: "INICIANTE",    indice: 0, label: "Iniciante",     emoji: "🌱", xpMinimo: 0,     xpProximo: 200    },
  { nivel: "APRENDIZ",     indice: 1, label: "Aprendiz",      emoji: "📚", xpMinimo: 200,   xpProximo: 600    },
  { nivel: "PERSISTENTE",  indice: 2, label: "Persistente",   emoji: "💪", xpMinimo: 600,   xpProximo: 1500   },
  { nivel: "ESTRATEGISTA", indice: 3, label: "Estrategista",  emoji: "🎯", xpMinimo: 1500,  xpProximo: 3500   },
  { nivel: "ELITE",        indice: 4, label: "Elite",         emoji: "⚡", xpMinimo: 3500,  xpProximo: 7000   },
  { nivel: "ESPECIALISTA", indice: 5, label: "Especialista",  emoji: "🧠", xpMinimo: 7000,  xpProximo: 12000  },
  { nivel: "MESTRE",       indice: 6, label: "Mestre",        emoji: "🏆", xpMinimo: 12000, xpProximo: 20000  },
  { nivel: "LENDA_ENEM",   indice: 7, label: "Lenda do ENEM", emoji: "👑", xpMinimo: 20000, xpProximo: Infinity },
];

export const XP_POR_EVENTO = {
  acerto: 5,
  erro: 1,
  simuladoFinalizado: 50,
  redacaoEnviada: 30,
  missaoDiaria: 50,
  diagnostico: 20,
} as const;

export interface NivelResumo {
  info: NivelInfo;
  xp: number;
  faltaParaProximo: number;
  /** 0..1 — progresso dentro do nível atual */
  progresso: number;
}

export function nivelDeXP(xp: number): NivelResumo {
  const seguro = Math.max(0, Math.floor(xp));
  let info = NIVEIS[0];
  for (const n of NIVEIS) {
    if (seguro >= n.xpMinimo) info = n;
  }
  const proximo = info.xpProximo;
  const faixa = proximo === Infinity ? 1 : proximo - info.xpMinimo;
  const dentro = seguro - info.xpMinimo;
  const progresso = proximo === Infinity ? 1 : Math.min(1, dentro / faixa);
  const falta = proximo === Infinity ? 0 : proximo - seguro;
  return { info, xp: seguro, faltaParaProximo: falta, progresso };
}

export function nivelInfo(nivel: Nivel): NivelInfo {
  return NIVEIS.find((n) => n.nivel === nivel) ?? NIVEIS[0];
}

/**
 * Adiciona XP ao perfil do aluno e atualiza o nível.
 * Cria o perfil se não existir. Retorna estado novo + flag de subida de nível.
 */
export async function adicionarXP(
  userId: string,
  xpDelta: number,
): Promise<{ xp: number; nivel: Nivel; subiu: boolean; novoNivel: NivelInfo | null }> {
  if (xpDelta === 0) {
    const sp = await prisma.studentProfile.findUnique({ where: { userId } });
    return {
      xp: sp?.xp ?? 0,
      nivel: (sp?.nivel as Nivel) ?? "INICIANTE",
      subiu: false,
      novoNivel: null,
    };
  }
  const sp = await prisma.studentProfile.upsert({
    where: { userId },
    create: { userId, xp: Math.max(0, xpDelta) },
    update: { xp: { increment: xpDelta } },
  });
  const resumo = nivelDeXP(sp.xp);
  const antigo = nivelInfo((sp.nivel as Nivel) ?? "INICIANTE");
  const subiu = resumo.info.indice > antigo.indice;
  if (resumo.info.nivel !== sp.nivel) {
    await prisma.studentProfile.update({
      where: { userId },
      data: { nivel: resumo.info.nivel },
    });
  }
  return {
    xp: sp.xp,
    nivel: resumo.info.nivel,
    subiu,
    novoNivel: subiu ? resumo.info : null,
  };
}
