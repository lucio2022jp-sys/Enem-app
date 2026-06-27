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
  const r = await prisma.essay.findUnique({ where: { id: params.id } });
  if (!r) return NextResponse.json({ error: "Não encontrada." }, { status: 404 });
  if (r.userId !== session.user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  if (r.status !== "CORRIGIDA_IA") {
    return NextResponse.json(
      { error: "Só é possível pedir revisão após a correção da IA." },
      { status: 400 },
    );
  }
  await prisma.essay.update({
    where: { id: r.id },
    data: { status: "EM_REVISAO_HUMANA" },
  });
  return NextResponse.json({ ok: true });
}
