/**
 * Sistema de badges/conquistas.
 *
 * Cada badge tem um slug único e regra de unlock.
 * verificarBadges(userId, evento) é chamado pelos hooks de eventos.
 */
import { prisma } from "@/lib/prisma";
import { adicionarXP } from "@/lib/gamificacao";

export type EventoBadge =
  | "DIAGNOSTICO"
  | "QUESTAO"
  | "REDACAO"
  | "SIMULADO"
  | "STREAK"
  | "MISSAO";

interface BadgeDef {
  slug: string;
  titulo: string;
  descricao: string;
  icone: string;
  categoria: string;
  xpRecompensa: number;
  ordem: number;
}

export const BADGES: BadgeDef[] = [
  // Diagnóstico
  {
    slug: "primeiro-passo",
    titulo: "Primeiro passo",
    descricao: "Concluiu o diagnóstico inicial",
    icone: "🧭",
    categoria: "DIAGNOSTICO",
    xpRecompensa: 25,
    ordem: 1,
  },
  // Questões
  {
    slug: "questoes-10",
    titulo: "Aquecendo",
    descricao: "Resolveu 10 questões",
    icone: "🔥",
    categoria: "QUESTOES",
    xpRecompensa: 30,
    ordem: 2,
  },
  {
    slug: "questoes-50",
    titulo: "No ritmo",
    descricao: "Resolveu 50 questões",
    icone: "⚡",
    categoria: "QUESTOES",
    xpRecompensa: 60,
    ordem: 3,
  },
  {
    slug: "questoes-100",
    titulo: "Centurião",
    descricao: "Resolveu 100 questões",
    icone: "💯",
    categoria: "QUESTOES",
    xpRecompensa: 100,
    ordem: 4,
  },
  {
    slug: "questoes-500",
    titulo: "Maratonista",
    descricao: "Resolveu 500 questões",
    icone: "🎯",
    categoria: "QUESTOES",
    xpRecompensa: 250,
    ordem: 5,
  },
  // Redação
  {
    slug: "primeira-redacao",
    titulo: "Primeira redação",
    descricao: "Enviou sua primeira redação",
    icone: "✍️",
    categoria: "REDACAO",
    xpRecompensa: 40,
    ordem: 10,
  },
  {
    slug: "redacao-900",
    titulo: "Nota 900+",
    descricao: "Tirou 900 ou mais em uma redação",
    icone: "🏆",
    categoria: "REDACAO",
    xpRecompensa: 200,
    ordem: 11,
  },
  // Simulado
  {
    slug: "primeiro-simulado",
    titulo: "Sob pressão",
    descricao: "Concluiu seu primeiro simulado",
    icone: "🎓",
    categoria: "SIMULADO",
    xpRecompensa: 50,
    ordem: 20,
  },
  {
    slug: "simulado-oficial",
    titulo: "Ensaio geral",
    descricao: "Completou um simulado no modo oficial",
    icone: "🥇",
    categoria: "SIMULADO",
    xpRecompensa: 150,
    ordem: 21,
  },
  // Streak
  {
    slug: "streak-3",
    titulo: "3 dias seguidos",
    descricao: "Estudou 3 dias em sequência",
    icone: "🔥",
    categoria: "STREAK",
    xpRecompensa: 30,
    ordem: 30,
  },
  {
    slug: "streak-7",
    titulo: "Semana cheia",
    descricao: "Estudou 7 dias seguidos",
    icone: "🌟",
    categoria: "STREAK",
    xpRecompensa: 70,
    ordem: 31,
  },
  {
    slug: "streak-30",
    titulo: "Mês inteiro",
    descricao: "Estudou 30 dias seguidos",
    icone: "👑",
    categoria: "STREAK",
    xpRecompensa: 300,
    ordem: 32,
  },
  // Missão
  {
    slug: "missao-completa",
    titulo: "Missão concluída",
    descricao: "Bateu sua primeira missão do dia",
    icone: "✅",
    categoria: "MISSAO",
    xpRecompensa: 30,
    ordem: 40,
  },
  {
    slug: "missao-7",
    titulo: "Consistente",
    descricao: "Concluiu 7 missões diárias",
    icone: "📅",
    categoria: "MISSAO",
    xpRecompensa: 80,
    ordem: 41,
  },
];

/** Garante que todos os badges existem no banco. Idempotente. */
export async function semearBadges(): Promise<void> {
  for (const b of BADGES) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      create: {
        slug: b.slug,
        titulo: b.titulo,
        descricao: b.descricao,
        icone: b.icone,
        categoria: b.categoria,
        xpRecompensa: b.xpRecompensa,
        ordem: b.ordem,
      },
      update: {
        titulo: b.titulo,
        descricao: b.descricao,
        icone: b.icone,
        categoria: b.categoria,
        xpRecompensa: b.xpRecompensa,
        ordem: b.ordem,
      },
    });
  }
}

/** Concede badge ao usuário se ainda não tiver. Retorna true se conquistado. */
async function conceder(userId: string, slug: string): Promise<boolean> {
  const badge = await prisma.badge.findUnique({ where: { slug } });
  if (!badge) return false;
  const existente = await prisma.userBadge.findUnique({
    where: { userId_badgeId: { userId, badgeId: badge.id } },
  });
  if (existente) return false;
  await prisma.userBadge.create({
    data: { userId, badgeId: badge.id },
  });
  if (badge.xpRecompensa > 0) {
    await adicionarXP(userId, badge.xpRecompensa);
  }
  return true;
}

/**
 * Verifica e concede badges após eventos. Retorna slugs conquistados nesta chamada.
 */
export async function verificarBadges(
  userId: string,
  evento: EventoBadge,
): Promise<string[]> {
  const conquistados: string[] = [];

  // Garante que os badges existem (lazy)
  const totalBadges = await prisma.badge.count();
  if (totalBadges === 0) await semearBadges();

  const dispatch = async (slug: string) => {
    if (await conceder(userId, slug)) conquistados.push(slug);
  };

  switch (evento) {
    case "DIAGNOSTICO": {
      const tem = await prisma.diagnosticResult.findUnique({
        where: { userId },
      });
      if (tem) await dispatch("primeiro-passo");
      break;
    }
    case "QUESTAO": {
      const total = await prisma.attempt.count({ where: { userId } });
      if (total >= 10) await dispatch("questoes-10");
      if (total >= 50) await dispatch("questoes-50");
      if (total >= 100) await dispatch("questoes-100");
      if (total >= 500) await dispatch("questoes-500");
      break;
    }
    case "REDACAO": {
      const total = await prisma.essay.count({ where: { userId } });
      if (total >= 1) await dispatch("primeira-redacao");
      const top = await prisma.essay.findFirst({
        where: { userId, nota: { gte: 900 } },
      });
      if (top) await dispatch("redacao-900");
      break;
    }
    case "SIMULADO": {
      const total = await prisma.simulado.count({
        where: { userId, finalizadoEm: { not: null } },
      });
      if (total >= 1) await dispatch("primeiro-simulado");
      const oficial = await prisma.simulado.findFirst({
        where: { userId, tipo: "OFICIAL", finalizadoEm: { not: null } },
      });
      if (oficial) await dispatch("simulado-oficial");
      break;
    }
    case "STREAK": {
      const sp = await prisma.studentProfile.findUnique({ where: { userId } });
      const s = sp?.streakDias ?? 0;
      if (s >= 3) await dispatch("streak-3");
      if (s >= 7) await dispatch("streak-7");
      if (s >= 30) await dispatch("streak-30");
      break;
    }
    case "MISSAO": {
      const c = await prisma.missaoDiaria.count({
        where: { userId, concluidaEm: { not: null } },
      });
      if (c >= 1) await dispatch("missao-completa");
      if (c >= 7) await dispatch("missao-7");
      break;
    }
  }

  return conquistados;
}

export async function listarConquistas(userId: string) {
  const all = await prisma.badge.findMany({
    orderBy: { ordem: "asc" },
  });
  const meus = await prisma.userBadge.findMany({
    where: { userId },
    select: { badgeId: true, conquistadoEm: true },
  });
  const map = new Map(meus.map((m) => [m.badgeId, m.conquistadoEm]));
  return all.map((b) => ({
    slug: b.slug,
    titulo: b.titulo,
    descricao: b.descricao,
    icone: b.icone,
    categoria: b.categoria,
    xpRecompensa: b.xpRecompensa,
    conquistado: map.has(b.id),
    conquistadoEm: map.get(b.id) ?? null,
  }));
}
