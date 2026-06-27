import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function ProfessorQuestoesPage() {
  const total = await prisma.question.count();
  const porArea = await prisma.question.groupBy({
    by: ["area"],
    _count: { _all: true },
  });
  const recentes = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Banco de questões
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {total} questões cadastradas.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {porArea.map((a) => (
          <Card key={a.area}>
            <CardBody>
              <div className="text-xs text-slate-500">{a.area}</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {a._count._all}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2 className="mt-4 text-base font-semibold text-slate-900">
        Últimas adicionadas
      </h2>
      <ul className="space-y-2">
        {recentes.map((q) => (
          <li key={q.id}>
            <Card>
              <CardBody>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="indigo">{q.area}</Badge>
                  <Badge>{q.disciplina}</Badge>
                  <Badge tone="amber">{q.dificuldade}</Badge>
                  {q.geradaPorIA ? <Badge tone="green">IA</Badge> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                  {q.enunciado}
                </p>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
