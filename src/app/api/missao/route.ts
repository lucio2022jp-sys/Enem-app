/**
 * GET /api/missao
 * Retorna a missão de hoje (cria se não existir) e o progresso.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOuCriarMissaoHoje, progressoMissao } from "@/lib/missao";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const missao = await getOuCriarMissaoHoje(session.user.id);
  return NextResponse.json({
    missao,
    progresso: progressoMissao(missao),
  });
}
