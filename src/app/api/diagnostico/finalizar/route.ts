import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalcularPerfil } from "@/lib/perfil/calcular";
import { gerarTrilhaInicial } from "@/lib/trilha/gerar";
import { agendarRevisao } from "@/lib/revisao/agendar";

const respostaSchema = z.object({
  questionId: z.string(),
  escolhida: z.enum(["A", "B", "C", "D", "E"]),
  tempoSegundos: z.number().int().nonnegative(),
});

const schema = z.object({
  respostas: z.array(respostaSchema).min(1),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const userId = session.user.id;

  // Carrega questões para validar gabarito e área
  const ids = parsed.data.respostas.map((r) => r.questionId);
  const questoes = await prisma.question.findMany({
    where: { id: { in: ids } },
  });
  const mapa = new Map(questoes.map((q) => [q.id, q]));

  const areaCount: Record<string, { total: number; acertos: number }> = {};

  for (const r of parsed.data.respostas) {
    const q = mapa.get(r.questionId);
    if (!q) continue;
    const correto = q.correta === r.escolhida;
    const cur = areaCount[q.area] ?? { total: 0, acertos: 0 };
    cur.total += 1;
    if (correto) cur.acertos += 1;
    areaCount[q.area] = cur;

    await prisma.attempt.create({
      data: {
        userId,
        questionId: r.questionId,
        escolhida: r.escolhida,
        correta: correto,
        tempoSegundos: r.tempoSegundos,
      },
    });

    await prisma.question.update({
      where: { id: r.questionId },
      data: { vezesUtilizada: { increment: 1 } },
    });

    await agendarRevisao({ userId, questionId: r.questionId, acerto: correto });
  }

  const areaScores: Record<string, number> = {};
  for (const a of ["LINGUAGENS", "HUMANAS", "NATUREZA", "MATEMATICA"]) {
    const c = areaCount[a];
    areaScores[a] = c && c.total > 0 ? Math.round((c.acertos / c.total) * 100) : 0;
  }

  await prisma.diagnosticResult.upsert({
    where: { userId },
    create: {
      userId,
      areaScoresJson: JSON.stringify(areaScores),
    },
    update: {
      areaScoresJson: JSON.stringify(areaScores),
      completedAt: new Date(),
    },
  });

  await recalcularPerfil(userId);
  await gerarTrilhaInicial(userId, { areaScores });

  return NextResponse.json({ ok: true, areaScores });
}
