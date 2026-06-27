import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { carregarPerfil } from "@/lib/perfil/calcular";
import { nivelDeXP, NIVEIS } from "@/lib/gamificacao";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const userId = session.user.id;
  const perfil = await carregarPerfil(userId);
  if (!perfil) return NextResponse.json({ perfil: null, nivel: null });

  const nivel = nivelDeXP(perfil.xp);
  const redacoes = await prisma.essay.count({
    where: { userId, status: { in: ["CORRIGIDA_IA", "CORRIGIDA_HUMANO"] } },
  });
  const simulados = await prisma.simulado.count({
    where: { userId, finalizadoEm: { not: null } },
  });

  return NextResponse.json({
    perfil,
    nivel,
    todosNiveis: NIVEIS,
    redacoes,
    simulados,
  });
}
