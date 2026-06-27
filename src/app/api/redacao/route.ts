import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { corrigirRedacao } from "@/lib/ai/corretorRedacao";

const schema = z.object({
  tema: z.string().min(5).max(300),
  texto: z.string().min(50, "Texto muito curto."),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Payload inválido." },
      { status: 400 },
    );
  }

  // Cria primeiro com status EM_CORRECAO_IA
  const redacao = await prisma.essay.create({
    data: {
      userId: session.user.id,
      tema: parsed.data.tema,
      texto: parsed.data.texto,
      status: "EM_CORRECAO_IA",
    },
  });

  // Chama IA — fallback determinístico se falhar
  let correcao;
  try {
    correcao = await corrigirRedacao({
      tema: parsed.data.tema,
      texto: parsed.data.texto,
    });
  } catch {
    correcao = {
      c1: 120,
      c2: 120,
      c3: 120,
      c4: 120,
      c5: 120,
      nota: 600,
      comentario:
        "Não foi possível chamar a correção automática agora. Sua redação foi salva. Tente solicitar revisão humana ou aguarde.",
      sugestoes: [
        "Reveja a estrutura dissertativa-argumentativa.",
        "Confirme proposta de intervenção com 5 elementos.",
      ],
      reescrita: "",
    };
  }

  const atualizada = await prisma.essay.update({
    where: { id: redacao.id },
    data: {
      c1: correcao.c1,
      c2: correcao.c2,
      c3: correcao.c3,
      c4: correcao.c4,
      c5: correcao.c5,
      nota: correcao.nota,
      comentarioIA: correcao.comentario,
      sugestoesJson: JSON.stringify(correcao.sugestoes ?? []),
      reescrita: correcao.reescrita ?? null,
      status: "CORRIGIDA_IA",
      corrigidaIAem: new Date(),
    },
  });

  return NextResponse.json({ id: atualizada.id });
}
