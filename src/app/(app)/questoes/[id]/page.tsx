import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QuestaoSolver } from "./QuestaoSolver";

export const dynamic = "force-dynamic";

export default async function QuestaoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const q = await prisma.question.findUnique({ where: { id: params.id } });
  if (!q) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <QuestaoSolver
        question={{
          id: q.id,
          area: q.area,
          disciplina: q.disciplina,
          conteudo: q.conteudo,
          dificuldade: q.dificuldade,
          enunciado: q.enunciado,
          alternativaA: q.alternativaA,
          alternativaB: q.alternativaB,
          alternativaC: q.alternativaC,
          alternativaD: q.alternativaD,
          alternativaE: q.alternativaE,
        }}
      />
    </div>
  );
}
