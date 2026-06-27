import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";
import { SimuladoRunner } from "./SimuladoRunner";

export const dynamic = "force-dynamic";

export default async function SimuladoRealizarPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const simulado = await prisma.simulado.findUnique({
    where: { id: params.id },
  });
  if (!simulado || simulado.userId !== session.user.id) notFound();
  if (simulado.finalizadoEm) {
    redirect(`/simulado/${simulado.id}/resultado`);
  }

  const ids = parseJson<string[]>(simulado.questionsJson, []);
  const questoes = await prisma.question.findMany({
    where: { id: { in: ids } },
  });
  // Mantém a ordem original
  const ordenadas = ids
    .map((id) => questoes.find((q) => q.id === id))
    .filter(Boolean) as typeof questoes;

  const respostas = parseJson<Record<string, string>>(simulado.respostasJson, {});

  return (
    <SimuladoRunner
      id={simulado.id}
      titulo={simulado.titulo}
      duracaoMin={simulado.duracaoMin}
      iniciadoEm={simulado.iniciadoEm?.toISOString() ?? new Date().toISOString()}
      respostasIniciais={respostas}
      questoes={ordenadas.map((q) => ({
        id: q.id,
        area: q.area,
        disciplina: q.disciplina,
        enunciado: q.enunciado,
        alternativaA: q.alternativaA,
        alternativaB: q.alternativaB,
        alternativaC: q.alternativaC,
        alternativaD: q.alternativaD,
        alternativaE: q.alternativaE,
      }))}
    />
  );
}
