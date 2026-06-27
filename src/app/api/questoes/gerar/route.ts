import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { carregarPerfil } from "@/lib/perfil/calcular";
import { gerarQuestaoIA } from "@/lib/ai/geradorQuestao";
import { temIA } from "@/lib/ai/client";
import type { Area, Dificuldade } from "@/types";

const schema = z.object({
  trackItemId: z.string().optional(),
  modo: z.string().optional(),
  area: z.string().optional(),
});

const AREAS: Area[] = ["LINGUAGENS", "HUMANAS", "NATUREZA", "MATEMATICA"];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const userId = session.user.id;
  const perfil = await carregarPerfil(userId);

  // Modo revisão: pega questão pendente em Revisao
  if (parsed.data.modo === "revisao") {
    const r = await prisma.revisao.findFirst({
      where: { userId, proximaRevisao: { lte: new Date() } },
      orderBy: { proximaRevisao: "asc" },
    });
    if (r) {
      return NextResponse.json({ questionId: r.questionId });
    }
  }

  // Determina área de foco
  let area: Area | undefined = undefined;

  if (
    parsed.data.area &&
    AREAS.includes(parsed.data.area as Area)
  ) {
    area = parsed.data.area as Area;
  } else if (parsed.data.trackItemId) {
    const item = await prisma.trackItem.findUnique({
      where: { id: parsed.data.trackItemId },
    });
    if (item && AREAS.includes(item.area as Area)) {
      area = item.area as Area;
    }
  }

  if (!area && perfil) {
    const ord = AREAS.slice().sort(
      (a, b) => (perfil.areaScores[a] ?? 0) - (perfil.areaScores[b] ?? 0),
    );
    area = ord[0];
  }
  if (!area) area = AREAS[Math.floor(Math.random() * 4)];

  // Tenta gerar com IA se chave existir
  if (temIA()) {
    try {
      const q = await gerarQuestaoIA({
        perfil,
        area,
        dificuldade: pickDificuldade(perfil, area),
      });
      if (q) {
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
            tagsJson: JSON.stringify(q.tags ?? []),
          },
        });
        return NextResponse.json({ questionId: criada.id, geradaPorIA: true });
      }
    } catch (e) {
      // cai no fallback
    }
  }

  // Fallback: questão do banco não respondida pelo aluno na área alvo
  const respondidas = await prisma.attempt.findMany({
    where: { userId },
    select: { questionId: true },
    distinct: ["questionId"],
  });
  const idsRespondidos = new Set(respondidas.map((a) => a.questionId));

  const candidatas = await prisma.question.findMany({
    where: { area },
    take: 50,
  });
  const naoRespondida = candidatas.find((q) => !idsRespondidos.has(q.id));
  const escolhida = naoRespondida ?? candidatas[0];

  if (!escolhida) {
    return NextResponse.json(
      { error: "Sem questões disponíveis nesta área." },
      { status: 404 },
    );
  }

  return NextResponse.json({ questionId: escolhida.id, geradaPorIA: false });
}

function pickDificuldade(
  perfil: any,
  area: Area,
): Dificuldade {
  const score = perfil?.areaScores?.[area] ?? 50;
  if (score < 50) return "FACIL";
  if (score < 75) return "MEDIO";
  return "DIFICIL";
}
