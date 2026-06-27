import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  c1: z.number().int().min(0).max(200),
  c2: z.number().int().min(0).max(200),
  c3: z.number().int().min(0).max(200),
  c4: z.number().int().min(0).max(200),
  c5: z.number().int().min(0).max(200),
  comentario: z.string().min(10),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (session.user.role !== "PROFESSOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload inválido." }, { status: 400 });
  }

  const r = await prisma.essay.findUnique({ where: { id: params.id } });
  if (!r) return NextResponse.json({ error: "Não encontrada." }, { status: 404 });

  const total =
    parsed.data.c1 +
    parsed.data.c2 +
    parsed.data.c3 +
    parsed.data.c4 +
    parsed.data.c5;

  await prisma.essay.update({
    where: { id: r.id },
    data: {
      c1: parsed.data.c1,
      c2: parsed.data.c2,
      c3: parsed.data.c3,
      c4: parsed.data.c4,
      c5: parsed.data.c5,
      nota: total,
      comentarioProfessor: parsed.data.comentario,
      corretorId: session.user.id,
      status: "CORRIGIDA_HUMANA",
      corrigidaHumanaEm: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
