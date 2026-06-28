import { redirect } from "next/navigation";
import Link from "next/link";
import { BookCheck, Clock, ArrowRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/EmptyState";
import { AREA_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

function diasPara(d: Date) {
  const ms = d.getTime() - Date.now();
  const dias = Math.ceil(ms / 86400000);
  return dias;
}

export default async function RevisaoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");
  const userId = session.user.id;

  const agora = new Date();
  const semana = new Date();
  semana.setDate(agora.getDate() + 7);

  const [pendentes, proximas, total] = await Promise.all([
    prisma.revisao.findMany({
      where: { userId, proximaRevisao: { lte: agora } },
      orderBy: { proximaRevisao: "asc" },
      take: 30,
      include: {
        question: {
          select: { area: true, conteudo: true, dificuldade: true },
        },
      },
    }),
    prisma.revisao.findMany({
      where: { userId, proximaRevisao: { gt: agora, lte: semana } },
      orderBy: { proximaRevisao: "asc" },
      take: 20,
      include: {
        question: { select: { area: true, conteudo: true } },
      },
    }),
    prisma.revisao.count({ where: { userId } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Revisão</h1>
          <p className="mt-1 text-sm text-slate-600">
            Repetição espaçada baseada em SM-2. Quanto mais você acerta, mais
            tempo até a próxima revisão.
          </p>
        </div>
        {pendentes.length > 0 ? (
          <Link href="/questoes/proxima?modo=revisao">
            <Button>
              Revisar agora <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        ) : null}
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardBody>
            <div className="text-xs text-slate-500">Pendentes hoje</div>
            <div className="mt-1 text-2xl font-bold text-rose-600">
              {pendentes.length}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-slate-500">Nos próximos 7 dias</div>
            <div className="mt-1 text-2xl font-bold text-amber-600">
              {proximas.length}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-slate-500">Total no banco</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {total}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">
            Pendentes ({pendentes.length})
          </h2>
        </CardHeader>
        <CardBody>
          {pendentes.length === 0 ? (
            <EmptyState
              icon={<BookCheck className="h-6 w-6" />}
              title="Sem revisões para hoje"
              description="Você está em dia. Continue resolvendo questões para alimentar a fila."
              action={
                <Link href="/questoes/proxima">
                  <Button size="sm">Resolver questões</Button>
                </Link>
              }
            />
          ) : (
            <ul className="space-y-2">
              {pendentes.map((r) => {
                const atraso = Math.max(
                  0,
                  Math.floor(
                    (agora.getTime() - r.proximaRevisao.getTime()) / 86400000,
                  ),
                );
                return (
                  <li key={r.id}>
                    <Link
                      href={`/questoes/${r.questionId}`}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="indigo">
                            {AREA_LABELS[r.question.area] ?? r.question.area}
                          </Badge>
                          <Badge>{r.question.dificuldade}</Badge>
                          <span className="text-xs text-slate-500">
                            nível dom. {r.nivelDominio}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm font-medium text-slate-700">
                          {r.question.conteudo}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">
                          {atraso > 0 ? `Atrasada ${atraso}d` : "Hoje"}
                        </div>
                        <div className="text-xs text-rose-600">
                          {r.intervaloDias}d de intervalo
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardBody>
      </Card>

      {proximas.length > 0 ? (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              Próximas (7 dias)
            </h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {proximas.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge tone="default">
                      {AREA_LABELS[r.question.area] ?? r.question.area}
                    </Badge>
                    <span className="truncate text-slate-700">
                      {r.question.conteudo}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    em {diasPara(r.proximaRevisao)}d
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
