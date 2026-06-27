import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BarChart } from "@/components/BarChart";
import { parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SimuladoResultadoPage({
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
  if (!simulado.finalizadoEm) {
    redirect(`/simulado/${simulado.id}`);
  }

  const ids = parseJson<string[]>(simulado.questionsJson, []);
  const respostas = parseJson<Record<string, string>>(simulado.respostasJson, {});
  const questoes = await prisma.question.findMany({
    where: { id: { in: ids } },
  });
  const map = new Map(questoes.map((q) => [q.id, q]));

  const erradas: typeof questoes = [];
  const porArea: Record<string, { total: number; acertos: number }> = {};
  let acertos = 0;

  for (const qid of ids) {
    const q = map.get(qid);
    if (!q) continue;
    const resp = respostas[qid];
    const certo = resp && resp === q.correta;
    porArea[q.area] = porArea[q.area] || { total: 0, acertos: 0 };
    porArea[q.area].total++;
    if (certo) {
      porArea[q.area].acertos++;
      acertos++;
    } else {
      erradas.push(q);
    }
  }

  const dataChart = Object.entries(porArea).map(([area, v]) => ({
    label: areaLabel(area),
    value: v.total > 0 ? Math.round((v.acertos / v.total) * 100) : 0,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-slate-900">
            Resultado do simulado
          </h1>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-xs text-slate-500">Acertos</div>
              <div className="text-2xl font-bold text-slate-900">
                {acertos}/{ids.length}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">% Acerto</div>
              <div className="text-2xl font-bold text-slate-900">
                {ids.length > 0
                  ? Math.round((acertos / ids.length) * 100)
                  : 0}
                %
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Nota estimada</div>
              <div className="text-2xl font-bold text-indigo-600">
                {simulado.notaEstimada ?? "-"}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">
            Desempenho por área
          </h2>
        </CardHeader>
        <CardBody>
          <BarChart data={dataChart} unit="%" />
        </CardBody>
      </Card>

      {erradas.length > 0 ? (
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-slate-900">
              Onde você errou
            </h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {erradas.map((q) => (
                <li
                  key={q.id}
                  className="rounded-lg border border-slate-200 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="indigo">{areaLabel(q.area)}</Badge>
                    <Badge>{q.disciplina}</Badge>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                    {q.enunciado}
                  </p>
                  <div className="mt-2">
                    <Link href={`/questoes/${q.id}`}>
                      <Button size="sm" variant="outline">
                        Ver explicação
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}

function areaLabel(a: string): string {
  switch (a) {
    case "LINGUAGENS":
      return "Linguagens";
    case "HUMANAS":
      return "Humanas";
    case "NATUREZA":
      return "Natureza";
    case "MATEMATICA":
      return "Matemática";
    default:
      return a;
  }
}
