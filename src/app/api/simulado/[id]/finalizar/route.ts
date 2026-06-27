import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";
import { recalcularPerfil } from "@/lib/perfil/calcular";
import { registrarRevisao } from "@/lib/revisao/agendar";

const schema = z.object({
  respostas: z.record(z.string(), z.string()),
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
    return NextResponse.json({ ok: true, jaFinalizado: true });
  }

  const ids = parseJson<string[]>(sim.questionsJson, []);
  const questoes = await prisma.question.findMany({
    where: { id: { in: ids } },
  });
  const map = new Map(questoes.map((q) => [q.id, q]));

  let acertos = 0;
  for (const qid of ids) {
    const q = map.get(qid);
    if (!q) continue;
    const escolhida = parsed.data.respostas[qid] ?? "";
    const certa = escolhida === q.correta;
    if (certa) acertos++;
    await prisma.attempt.create({
      data: {
        userId: session.user.id,
        questionId: q.id,
        escolhida,
        correta: certa,
        tempoSegundos: Math.round((sim.duracaoMin * 60) / ids.length),
      },
    });
    await registrarRevisao(session.user.id, q.id, certa);
  }

  const pct = ids.length > 0 ? acertos / ids.length : 0;
  const notaEstimada = Math.round(
    Math.max(400, Math.min(1000, 400 + pct * 600)),
  );

  await prisma.simulado.update({
    where: { id: sim.id },
    data: {
      finalizadoEm: new Date(),
      respostasJson: JSON.stringify(parsed.data.respostas),
      notaEstimada,
    },
  });

  await recalcularPerfil(session.user.id);

  return NextResponse.json({ ok: true, notaEstimada });
}
