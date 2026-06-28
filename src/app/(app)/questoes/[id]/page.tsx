import { notFound, redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QuestaoSolver } from "./QuestaoSolver";

export const dynamic = "force-dynamic";

const TIPO_ERRO_LABEL_CURTO: Record<string, string> = {
  CONHECIMENTO: "Conteúdo",
  INTERPRETACAO: "Interpretação",
  CALCULO: "Cálculo",
  DISTRACAO: "Distração",
  TEMPO: "Tempo",
  GRAFICO: "Gráfico",
  TABELA: "Tabela",
  RACIOCINIO: "Raciocínio",
  CONCEITUAL: "Conceitual",
  ESTRATEGIA: "Estratégia",
};

export default async function QuestaoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const q = await prisma.question.findUnique({ where: { id: params.id } });
  if (!q) notFound();

  const tentativas = await prisma.attempt.findMany({
    where: { userId: session.user.id, questionId: q.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const totalTentativas = tentativas.length;
  const acertosTotais = tentativas.filter((t) => t.correta).length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
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

      {totalTentativas > 0 ? (
        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Suas tentativas anteriores
              </h2>
              <span className="text-xs text-slate-500">
                {acertosTotais} acertos em {totalTentativas}{" "}
                {totalTentativas === 1 ? "tentativa" : "tentativas"}
              </span>
            </div>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {tentativas.map((t) => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  {t.correta ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-600" />
                  )}
                  <span className="text-slate-700">
                    Marcou <strong>{t.escolhida}</strong>
                  </span>
                  <span className="text-slate-500">
                    em {t.tempoSegundos}s
                  </span>
                  {!t.correta && t.tipoErro && TIPO_ERRO_LABEL_CURTO[t.tipoErro] ? (
                    <Badge tone="amber">
                      {TIPO_ERRO_LABEL_CURTO[t.tipoErro]}
                    </Badge>
                  ) : null}
                  <span className="ml-auto text-xs text-slate-400">
                    {new Date(t.createdAt).toLocaleString("pt-BR")}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
