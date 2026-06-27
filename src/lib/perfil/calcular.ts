import { prisma } from "@/lib/prisma";
import { parseJson, clamp } from "@/lib/utils";
import type { PerfilAluno, ConteudoScore, Nivel } from "@/types";

const AREAS = ["LINGUAGENS", "HUMANAS", "NATUREZA", "MATEMATICA"] as const;

export async function recalcularPerfil(userId: string): Promise<PerfilAluno> {
  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: { question: true },
    orderBy: { createdAt: "asc" },
  });

  const total = attempts.length;
  const acertos = attempts.filter((a) => a.correta).length;
  const erros = total - acertos;
  const tempoMedio =
    total > 0
      ? Math.round(attempts.reduce((s, a) => s + a.tempoSegundos, 0) / total)
      : 0;

  // Áreas
  const areaScores: Record<string, number> = {};
  for (const area of AREAS) {
    const ofArea = attempts.filter((a) => a.question.area === area);
    if (ofArea.length === 0) {
      areaScores[area] = 0;
      continue;
    }
    const ac = ofArea.filter((a) => a.correta).length;
    areaScores[area] = Math.round((ac / ofArea.length) * 100);
  }

  // Competências / Habilidades / Conteúdo
  const competenciaMap = new Map<string, { total: number; acertos: number }>();
  const habilidadeMap = new Map<string, { total: number; acertos: number }>();
  const conteudoMap = new Map<
    string,
    { total: number; acertos: number; area: string }
  >();

  for (const a of attempts) {
    const c = a.question.competencia || "—";
    const h = a.question.habilidade || "—";
    const k = a.question.conteudo || "—";
    bumpMap(competenciaMap, c, a.correta);
    bumpMap(habilidadeMap, h, a.correta);
    const cur = conteudoMap.get(k) ?? { total: 0, acertos: 0, area: a.question.area };
    cur.total += 1;
    if (a.correta) cur.acertos += 1;
    conteudoMap.set(k, cur);
  }

  const competenciaScores = pctMap(competenciaMap);
  const habilidadeScores = pctMap(habilidadeMap);
  const conteudoScores: Record<string, ConteudoScore> = {};
  const dominados: string[] = [];
  const fracos: string[] = [];
  for (const [key, v] of conteudoMap) {
    const pct = v.total > 0 ? Math.round((v.acertos / v.total) * 100) : 0;
    conteudoScores[key] = { area: v.area, total: v.total, acertos: v.acertos, pct };
    if (v.total >= 5 && pct >= 80) dominados.push(key);
    if (v.total >= 3 && pct < 50) fracos.push(key);
  }

  // Nota estimada ENEM
  const validas = AREAS.filter((a) =>
    attempts.some((at) => at.question.area === a),
  );
  let notaEstimada: number | null = null;
  if (validas.length > 0) {
    const media =
      validas.reduce((s, a) => s + areaScores[a]!, 0) / validas.length;
    notaEstimada = clamp(Math.round(400 + media * 4), 400, 1000);
  }

  // Frequência últimos 30 dias
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const datas = new Set<string>();
  for (const a of attempts) {
    if (a.createdAt >= cutoff) {
      datas.add(a.createdAt.toISOString().slice(0, 10));
    }
  }
  const frequenciaDias = Array.from(datas).sort();

  // Últimos erros
  const ultimosErros = attempts
    .filter((a) => !a.correta)
    .slice(-5)
    .map((a) => ({
      enunciado: a.question.enunciado.slice(0, 200),
      conteudo: a.question.conteudo,
      tipoErro: a.tipoErro ?? null,
      area: a.question.area,
    }));

  await prisma.studentProfile.upsert({
    where: { userId },
    create: {
      userId,
      totalQuestoes: total,
      totalAcertos: acertos,
      totalErros: erros,
      tempoMedioSegundos: tempoMedio,
      areaScoresJson: JSON.stringify(areaScores),
      competenciaScoresJson: JSON.stringify(competenciaScores),
      habilidadeScoresJson: JSON.stringify(habilidadeScores),
      conteudoScoresJson: JSON.stringify(conteudoScores),
      dominadosJson: JSON.stringify(dominados),
      fracosJson: JSON.stringify(fracos),
      notaEstimadaEnem: notaEstimada,
      frequenciaDiasJson: JSON.stringify(frequenciaDias),
    },
    update: {
      totalQuestoes: total,
      totalAcertos: acertos,
      totalErros: erros,
      tempoMedioSegundos: tempoMedio,
      areaScoresJson: JSON.stringify(areaScores),
      competenciaScoresJson: JSON.stringify(competenciaScores),
      habilidadeScoresJson: JSON.stringify(habilidadeScores),
      conteudoScoresJson: JSON.stringify(conteudoScores),
      dominadosJson: JSON.stringify(dominados),
      fracosJson: JSON.stringify(fracos),
      notaEstimadaEnem: notaEstimada,
      frequenciaDiasJson: JSON.stringify(frequenciaDias),
      ultimaAtualizacao: new Date(),
    },
  });

  const sp = await prisma.studentProfile.findUnique({ where: { userId } });

  const perfil: PerfilAluno = {
    totalQuestoes: total,
    totalAcertos: acertos,
    totalErros: erros,
    tempoMedioSegundos: tempoMedio,
    areaScores,
    competenciaScores,
    habilidadeScores,
    conteudoScores,
    dominados,
    fracos,
    notaEstimadaEnem: notaEstimada,
    frequenciaDias,
    xp: sp?.xp ?? 0,
    nivel: (sp?.nivel as Nivel) ?? "INICIANTE",
    streakDias: sp?.streakDias ?? 0,
    melhorStreak: sp?.melhorStreak ?? 0,
    ultimosErros,
  };

  return perfil;
}

function bumpMap(
  map: Map<string, { total: number; acertos: number }>,
  key: string,
  correta: boolean,
) {
  const cur = map.get(key) ?? { total: 0, acertos: 0 };
  cur.total += 1;
  if (correta) cur.acertos += 1;
  map.set(key, cur);
}

function pctMap(
  map: Map<string, { total: number; acertos: number }>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of map) {
    out[k] = v.total > 0 ? Math.round((v.acertos / v.total) * 100) : 0;
  }
  return out;
}

export async function carregarPerfil(userId: string): Promise<PerfilAluno | null> {
  const sp = await prisma.studentProfile.findUnique({ where: { userId } });
  if (!sp) return null;
  return {
    totalQuestoes: sp.totalQuestoes,
    totalAcertos: sp.totalAcertos,
    totalErros: sp.totalErros,
    tempoMedioSegundos: sp.tempoMedioSegundos,
    areaScores: parseJson(sp.areaScoresJson, {}),
    competenciaScores: parseJson(sp.competenciaScoresJson, {}),
    habilidadeScores: parseJson(sp.habilidadeScoresJson, {}),
    conteudoScores: parseJson(sp.conteudoScoresJson, {}),
    dominados: parseJson(sp.dominadosJson, []),
    fracos: parseJson(sp.fracosJson, []),
    notaEstimadaEnem: sp.notaEstimadaEnem,
    frequenciaDias: parseJson(sp.frequenciaDiasJson, []),
    xp: sp.xp,
    nivel: sp.nivel as Nivel,
    streakDias: sp.streakDias,
    melhorStreak: sp.melhorStreak,
  };
}
