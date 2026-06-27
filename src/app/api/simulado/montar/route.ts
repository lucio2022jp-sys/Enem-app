import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { carregarPerfil } from "@/lib/perfil/calcular";
import { montarSimulado } from "@/lib/ai/montadorSimulado";

const schema = z.object({
  totalQuestoes: z.number().int().min(5).max(90).default(20),
  tipo: z.enum(["PERSONALIZADO", "COMPLETO"]).default("PERSONALIZADO"),
});

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
  const ids = await montarSimulado({
    userId,
    perfil,
    totalQuestoes: parsed.data.totalQuestoes,
    tipo: parsed.data.tipo,
  });

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "Não há questões suficientes para montar o simulado." },
      { status: 422 },
    );
  }

  const duracaoMin = Math.max(15, Math.round(ids.length * 2.5));
  const titulo =
    parsed.data.tipo === "COMPLETO"
      ? "Simulado completo"
      : "Simulado personalizado";

  const sim = await prisma.simulado.create({
    data: {
      userId,
      titulo,
      tipo: parsed.data.tipo,
      totalQuestoes: ids.length,
      duracaoMin,
      iniciadoEm: new Date(),
      questionsJson: JSON.stringify(ids),
      respostasJson: JSON.stringify({}),
    },
  });

  return NextResponse.json({ id: sim.id });
}
