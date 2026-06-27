import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { carregarPerfil } from "@/lib/perfil/calcular";
import { montarSimulado } from "@/lib/ai/montadorSimulado";
import type { Area } from "@/types";

const schema = z.object({
  totalQuestoes: z.number().int().min(5).max(180).default(20),
  tipo: z
    .enum([
      "OFICIAL",
      "AREA",
      "TEMPO",
      "FRAQUEZAS",
      "LIVRE",
      "PERSONALIZADO",
      "COMPLETO",
    ])
    .default("PERSONALIZADO"),
  areas: z
    .array(z.enum(["LINGUAGENS", "HUMANAS", "NATUREZA", "MATEMATICA"]))
    .optional(),
  conteudos: z.array(z.string()).optional(),
  duracaoMin: z.number().int().min(5).max(360).optional(),
});

const TITULOS: Record<string, string> = {
  OFICIAL: "Simulado oficial",
  AREA: "Simulado por área",
  TEMPO: "Simulado cronometrado",
  FRAQUEZAS: "Simulado de fraquezas",
  LIVRE: "Simulado livre",
  PERSONALIZADO: "Simulado personalizado",
  COMPLETO: "Simulado completo",
};

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

  // OFICIAL ignora total recebido (sempre 180)
  const totalReal =
    parsed.data.tipo === "OFICIAL" ? 180 : parsed.data.totalQuestoes;

  const ids = await montarSimulado({
    userId,
    perfil,
    totalQuestoes: totalReal,
    tipo: parsed.data.tipo,
    areas: parsed.data.areas as Area[] | undefined,
    conteudos: parsed.data.conteudos,
  });

  if (ids.length === 0) {
    return NextResponse.json(
      { error: "Não há questões suficientes para montar o simulado." },
      { status: 422 },
    );
  }

  const duracaoMin =
    parsed.data.duracaoMin ??
    (parsed.data.tipo === "OFICIAL"
      ? 330
      : Math.max(15, Math.round(ids.length * 2.5)));

  const titulo = TITULOS[parsed.data.tipo] ?? "Simulado";

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
