/**
 * POST /api/simulado/[id]/salvar
 * Body: { respostas: Record<questionId, "A"|"B"|"C"|"D"|"E"> }
 * Salva respostas parciais. Idempotente.
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  respostas: z.record(z.string(), z.enum(["A", "B", "C", "D", "E"])),
});

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
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const sim = await prisma.simulado.findUnique({ where: { id: params.id } });
  if (!sim || sim.userId !== session.user.id) {
    return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  }
  if (sim.finalizadoEm) {
    return NextResponse.json({ ok: true, finalizado: true });
  }

  await prisma.simulado.update({
    where: { id: sim.id },
    data: { respostasJson: JSON.stringify(parsed.data.respostas) },
  });

  return NextResponse.json({ ok: true });
}
