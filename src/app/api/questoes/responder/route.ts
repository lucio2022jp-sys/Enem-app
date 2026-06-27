import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recalcularPerfil, carregarPerfil } from "@/lib/perfil/calcular";
import { agendarRevisao } from "@/lib/revisao/agendar";
import { classificarErro } from "@/lib/ai/classificadorErro";
import { parseJson } from "@/lib/utils";
import { aoResponderQuestao } from "@/lib/eventos";
import type { Area } from "@/types";

const schema = z.object({
  questionId: z.string(),
  escolhida: z.enum(["A", "B", "C", "D", "E"]),
  tempoSegundos: z.number().int().nonnegative(),
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
  const questao = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
  });
  if (!questao) {
    return NextResponse.json(
      { error: "Questão não encontrada." },
      { status: 404 },
    );
  }

  const correto = questao.correta === parsed.data.escolhida;

  // Classifica erro com IA (se houver chave) — fallback silencioso
  let tipoErro: string | null = null;
  let explicacaoErro: string | null = null;
  if (!correto) {
    try {
      const perfil = await carregarPerfil(userId);
      const r = await classificarErro({
        questao: {
          enunciado: questao.enunciado,
          alternativaA: questao.alternativaA,
          alternativaB: questao.alternativaB,
          alternativaC: questao.alternativaC,
          alternativaD: questao.alternativaD,
          alternativaE: questao.alternativaE,
          correta: questao.correta as any,
          conteudo: questao.conteudo,
          area: questao.area,
          tempoMedioSegundos: questao.tempoMedioSegundos,
        },
        alternativaEscolhida: parsed.data.escolhida,
        tempoGasto: parsed.data.tempoSegundos,
        perfil,
      });
      tipoErro = r.tipoErro;
      explicacaoErro = r.explicacao;
    } catch {
      tipoErro = "CONHECIMENTO";
    }
  } else {
    tipoErro = "NENHUM";
  }

  await prisma.attempt.create({
    data: {
      userId,
      questionId: questao.id,
      escolhida: parsed.data.escolhida,
      correta: correto,
      tempoSegundos: parsed.data.tempoSegundos,
      tipoErro,
      explicacaoErro,
    },
  });

  // Atualiza estatísticas da questão
  const stats = await prisma.attempt.aggregate({
    where: { questionId: questao.id },
    _count: true,
  });
  const acertosQ = await prisma.attempt.count({
    where: { questionId: questao.id, correta: true },
  });
  const totalQ = stats._count || 1;
  await prisma.question.update({
    where: { id: questao.id },
    data: {
      vezesUtilizada: { increment: 1 },
      percentualAcertos: Math.round((acertosQ / totalQ) * 100) / 100,
    },
  });

  await agendarRevisao({ userId, questionId: questao.id, acerto: correto });
  await recalcularPerfil(userId);
  const ganhos = await aoResponderQuestao({
    userId,
    area: questao.area as Area,
    correta: correto,
    tempoSegundos: parsed.data.tempoSegundos,
  });

  return NextResponse.json({
    correta: correto,
    correctAlternative: questao.correta,
    comentario: questao.comentario,
    resolucaoPassoPasso: questao.resolucaoPassoPasso,
    explicacaoSimplificada: questao.explicacaoSimplificada,
    conceitos: parseJson<string[]>(questao.conceitosJson, []),
    dicas: parseJson<string[]>(questao.dicasJson, []),
    tipoErro,
    explicacaoErro,
    ganhos,
  });
}
