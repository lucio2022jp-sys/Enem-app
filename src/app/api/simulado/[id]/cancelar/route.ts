/**
 * POST /api/simulado/[id]/cancelar
 * Marca simulado como finalizado sem nota (abandonado).
 * Idempotente: já finalizado retorna ok.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const sim = await prisma.simulado.findUnique({ where: { id: params.id } });
  if (!sim || sim.userId !== session.user.id) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }
  if (sim.finalizadoEm) {
    return NextResponse.json({ ok: true });
  }

  await prisma.simulado.delete({ where: { id: sim.id } });
  return NextResponse.json({ ok: true });
}
