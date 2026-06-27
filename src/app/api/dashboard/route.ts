import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { carregarPerfil, recalcularPerfil } from "@/lib/perfil/calcular";
import { progressoMissaoHoje } from "@/lib/eventos";
import { ranking7d } from "@/lib/daily";
import { prisma } from "@/lib/prisma";
import { nivelDeXP } from "@/lib/gamificacao";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const userId = session.user.id;

  let perfil = await carregarPerfil(userId);
  if (!perfil) {
    perfil = await recalcularPerfil(userId);
  }

  const { missao, progresso } = await progressoMissaoHoje(userId);
  const ranking = await ranking7d(userId);
  const nivel = nivelDeXP(perfil.xp);

  // Próxima revisão pendente
  const proximaRevisao = await prisma.revisao.findFirst({
    where: { userId, proximaRevisao: { lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) } },
    orderBy: { proximaRevisao: "asc" },
    include: { question: { select: { area: true, conteudo: true } } },
  });

  return NextResponse.json({
    perfil,
    nivel,
    missao,
    progressoMissao: progresso,
    ranking,
    proximaRevisao: proximaRevisao
      ? {
          id: proximaRevisao.id,
          dueAt: proximaRevisao.proximaRevisao,
          area: proximaRevisao.question.area,
          conteudo: proximaRevisao.question.conteudo,
        }
      : null,
  });
}
