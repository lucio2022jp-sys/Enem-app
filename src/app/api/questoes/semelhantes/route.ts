import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { gerarQuestaoIA } from "@/lib/ai/geradorQuestao";
import { temIA } from "@/lib/ai/client";
import { carregarPerfil } from "@/lib/perfil/calcular";
import type { Area } from "@/types";

const schema = z.object({
  questionId: z.string(),
  quantas: z.number().int().min(1).max(5).optional(),
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

  const origem = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
  });
  if (!origem) {
    return NextResponse.json({ error: "Não encontrada." }, { status: 404 });
  }

  const quantas = parsed.data.quantas ?? 3;
  const userId = session.user.id;
  const perfil = await carregarPerfil(userId);

  const novas: any[] = [];

  if (temIA()) {
    for (let i = 0; i < quantas; i++) {
      try {
        const q = await gerarQuestaoIA({
          perfil,
          area: origem.area as Area,
          conteudo: origem.conteudo,
          dificuldade: origem.dificuldade as any,
        });
        if (!q) continue;
        const criada = await prisma.question.create({
          data: {
            year: 0,
            area: q.area,
            disciplina: q.disciplina,
            competencia: q.competencia,
            habilidade: q.habilidade,
            conteudo: q.conteudo,
            subconteudo: q.subconteudo ?? null,
            enunciado: q.enunciado,
            alternativaA: q.alternativaA,
            alternativaB: q.alternativaB,
            alternativaC: q.alternativaC,
            alternativaD: q.alternativaD,
            alternativaE: q.alternativaE,
            correta: q.correta,
            comentario: q.comentario,
            resolucaoPassoPasso: q.resolucaoPassoPasso,
            explicacaoSimplificada: q.explicacaoSimplificada,
            explicacaoDetalhada: q.explicacaoDetalhada,
            conceitosJson: JSON.stringify(q.conceitos ?? []),
            assuntosRelacionadosJson: JSON.stringify(q.assuntosRelacionados ?? []),
            dicasJson: JSON.stringify(q.dicas ?? []),
            dificuldade: q.dificuldade,
            tempoMedioSegundos: q.tempoMedioSegundos ?? 180,
            geradaPorIA: true,
            originalQuestionId: origem.id,
            tagsJson: JSON.stringify(q.tags ?? []),
          },
        });
        novas.push({
          id: criada.id,
          enunciado: criada.enunciado,
          area: criada.area,
          disciplina: criada.disciplina,
          dificuldade: criada.dificuldade,
        });
      } catch {
        // continua
      }
    }
  }

  if (novas.length === 0) {
    // Fallback: questões do banco do mesmo conteúdo
    const banco = await prisma.question.findMany({
      where: {
        area: origem.area,
        conteudo: origem.conteudo,
        NOT: { id: origem.id },
      },
      take: quantas,
    });
    for (const q of banco) {
      novas.push({
        id: q.id,
        enunciado: q.enunciado,
        area: q.area,
        disciplina: q.disciplina,
        dificuldade: q.dificuldade,
      });
    }
  }

  return NextResponse.json({ questions: novas });
}
