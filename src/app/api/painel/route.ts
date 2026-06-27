import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { carregarPerfil } from "@/lib/perfil/calcular";

const AREAS = ["LINGUAGENS", "HUMANAS", "NATUREZA", "MATEMATICA"] as const;

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const userId = session.user.id;

  const perfil = await carregarPerfil(userId);
  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: { question: true },
    orderBy: { createdAt: "asc" },
  });

  // Série temporal (acertos% por dia, últimos 30 dias)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  const porDia: Record<string, { total: number; acertos: number }> = {};
  for (const a of attempts) {
    if (a.createdAt < cutoff) continue;
    const k = a.createdAt.toISOString().slice(0, 10);
    porDia[k] = porDia[k] ?? { total: 0, acertos: 0 };
    porDia[k]!.total++;
    if (a.correta) porDia[k]!.acertos++;
  }
  const serieDiaria = Object.entries(porDia)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([data, v]) => ({
      data,
      total: v.total,
      acertos: v.acertos,
      pct: v.total > 0 ? Math.round((v.acertos / v.total) * 100) : 0,
    }));

  // Tipos de erro (distribuição)
  const tiposErro: Record<string, number> = {};
  for (const a of attempts) {
    if (a.correta) continue;
    const t = a.tipoErro ?? "DESCONHECIDO";
    tiposErro[t] = (tiposErro[t] ?? 0) + 1;
  }

  // Tempo médio por área
  const tempoArea: Record<string, { total: number; soma: number }> = {};
  for (const a of attempts) {
    const ar = a.question.area;
    tempoArea[ar] = tempoArea[ar] ?? { total: 0, soma: 0 };
    tempoArea[ar]!.total++;
    tempoArea[ar]!.soma += a.tempoSegundos;
  }
  const tempoMedioArea: Record<string, number> = {};
  for (const a of AREAS) {
    const t = tempoArea[a];
    tempoMedioArea[a] = t && t.total > 0 ? Math.round(t.soma / t.total) : 0;
  }

  // Acerto por nível de dificuldade
  const porDificuldade: Record<string, { total: number; acertos: number }> = {};
  for (const a of attempts) {
    const d = a.question.dificuldade || "MEDIO";
    porDificuldade[d] = porDificuldade[d] ?? { total: 0, acertos: 0 };
    porDificuldade[d]!.total++;
    if (a.correta) porDificuldade[d]!.acertos++;
  }
  const dificuldade: Record<string, number> = {};
  for (const k of Object.keys(porDificuldade)) {
    const v = porDificuldade[k]!;
    dificuldade[k] = v.total > 0 ? Math.round((v.acertos / v.total) * 100) : 0;
  }

  return NextResponse.json({
    perfil,
    serieDiaria,
    tiposErro,
    tempoMedioArea,
    dificuldade,
  });
}
