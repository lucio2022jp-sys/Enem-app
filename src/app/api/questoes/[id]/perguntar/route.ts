/**
 * POST /api/questoes/[id]/perguntar
 * Body: { tipo, perguntaLivre? }
 * Retorna { resposta, tipo, fallback? }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { perguntarIA, type TipoExplicacao } from "@/lib/ai/explicador";

const TIPOS: TipoExplicacao[] = [
  "INFANTIL",
  "RESUMIDO",
  "DETALHADO",
  "ANALOGIAS",
  "PASSO_A_PASSO",
  "EXEMPLO_PARECIDO",
  "LIVRE",
];

const schema = z.object({
  tipo: z.enum(TIPOS as [TipoExplicacao, ...TipoExplicacao[]]),
  perguntaLivre: z.string().max(500).optional(),
});

function fallback(tipo: TipoExplicacao, comentario?: string): string {
  const base =
    comentario && comentario.trim().length > 0
      ? comentario
      : "Não foi possível gerar uma explicação personalizada agora. Releia o enunciado com calma e identifique a palavra-chave do que ele pede.";

  switch (tipo) {
    case "INFANTIL":
      return `${base}\n\n(Modo simples desabilitado neste ambiente — sem IA. Considere a versão acima.)`;
    case "RESUMIDO":
      return base.split(".").slice(0, 2).join(".") + ".";
    case "DETALHADO":
    case "ANALOGIAS":
    case "PASSO_A_PASSO":
    case "EXEMPLO_PARECIDO":
    case "LIVRE":
    default:
      return base;
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const q = await prisma.question.findUnique({ where: { id: params.id } });
  if (!q) {
    return NextResponse.json(
      { error: "Questão não encontrada." },
      { status: 404 },
    );
  }

  const r = await perguntarIA({
    tipo: parsed.data.tipo,
    perguntaLivre: parsed.data.perguntaLivre,
    questao: {
      enunciado: q.enunciado,
      alternativaA: q.alternativaA,
      alternativaB: q.alternativaB,
      alternativaC: q.alternativaC,
      alternativaD: q.alternativaD,
      alternativaE: q.alternativaE,
      correta: q.correta,
      area: q.area,
      conteudo: q.conteudo,
      comentario: q.comentario ?? undefined,
    },
  });

  if (!r) {
    return NextResponse.json({
      tipo: parsed.data.tipo,
      resposta: fallback(parsed.data.tipo, q.comentario ?? undefined),
      fallback: true,
    });
  }
  return NextResponse.json({ tipo: r.tipo, resposta: r.resposta });
}
