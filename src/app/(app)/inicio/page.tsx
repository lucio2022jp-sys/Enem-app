import Link from "next/link";
import {
  ListChecks,
  PenLine,
  Sparkles,
  BookCheck,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BarChart } from "@/components/BarChart";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/EmptyState";
import { AREAS, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InicioPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const userId = session.user.id;

  const [perfil, trilha, redacoesCount, revisoesPendentes, semana] =
    await Promise.all([
      prisma.studentProfile.findUnique({ where: { userId } }),
      prisma.trackItem.findMany({
        where: { userId, concluido: false },
        orderBy: { ordem: "asc" },
        take: 1,
      }),
      prisma.essay.count({ where: { userId } }),
      prisma.revisao.count({
        where: { userId, proximaRevisao: { lte: new Date() } },
      }),
      (async () => {
        const desde = new Date();
        desde.setDate(desde.getDate() - 7);
        const attempts = await prisma.attempt.findMany({
          where: { userId, createdAt: { gte: desde } },
        });
        const acertos = attempts.filter((a) => a.correta).length;
        return {
          total: attempts.length,
          acertos,
          pct: attempts.length
            ? Math.round((acertos / attempts.length) * 100)
            : 0,
        };
      })(),
    ]);

  const upgraded = searchParams?.upgraded === "1";

  const areaScores = parseJson<Record<string, number>>(
    perfil?.areaScoresJson ?? null,
    {},
  );
  const dataGrafico = AREAS.map((a) => ({
    label: a.label,
    value: areaScores[a.key] ?? 0,
  }));

  const proximoItem = trilha[0];

  const tipoLabel: Record<string, string> = {
    QUESTOES: "Questões",
    REDACAO: "Redação",
    REVISAO: "Revisão",
    SIMULADO: "Simulado",
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">
          Olá, {session.user.name?.split(" ")[0] ?? "estudante"}
        </h1>
        <Link href="/questoes/proxima">
          <Button>
            Continuar treino <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </header>

      {upgraded ? (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          Plano Pro ativado. Aproveite as questões e simulados ilimitados.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Próxima ação */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              Próxima ação
            </h2>
          </CardHeader>
          <CardBody>
            {proximoItem ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="indigo">
                    {tipoLabel[proximoItem.tipo] ?? proximoItem.tipo}
                  </Badge>
                  <Badge>{proximoItem.area}</Badge>
                </div>
                <h3 className="text-base font-semibold text-slate-900">
                  {proximoItem.titulo}
                </h3>
                <p className="text-sm text-slate-600">
                  {proximoItem.descricao}
                </p>
                <Link
                  href={
                    proximoItem.tipo === "REDACAO"
                      ? "/redacao/nova"
                      : proximoItem.tipo === "SIMULADO"
                      ? "/simulado"
                      : `/questoes/proxima?trackItemId=${proximoItem.id}`
                  }
                >
                  <Button size="sm">
                    Iniciar <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={<Sparkles className="h-6 w-6" />}
                title="Trilha em dia"
                description="Você concluiu tudo. Faça um simulado pra avaliar evolução."
                action={
                  <Link href="/simulado">
                    <Button size="sm">Ir aos simulados</Button>
                  </Link>
                }
              />
            )}
          </CardBody>
        </Card>

        {/* Resumo da semana */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              Resumo da semana
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {semana.total}
                </div>
                <div className="text-xs text-slate-500">questões</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {semana.pct}%
                </div>
                <div className="text-xs text-slate-500">acertos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {redacoesCount}
                </div>
                <div className="text-xs text-slate-500">redações totais</div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Nota estimada ENEM:{" "}
              <strong className="text-slate-900">
                {perfil?.notaEstimadaEnem ?? "—"}
              </strong>
            </p>
          </CardBody>
        </Card>

        {/* Progresso por área */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              Progresso por área
            </h2>
          </CardHeader>
          <CardBody>
            <BarChart data={dataGrafico} />
          </CardBody>
        </Card>

        {/* Revisões */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              Revisões pendentes
            </h2>
          </CardHeader>
          <CardBody>
            {revisoesPendentes > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">
                  Você tem <strong>{revisoesPendentes}</strong> questões
                  agendadas pra revisar hoje.
                </p>
                <Link href="/questoes/proxima?modo=revisao">
                  <Button size="sm">
                    Fazer revisão <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : (
              <EmptyState
                icon={<BookCheck className="h-6 w-6" />}
                title="Sem revisões hoje"
                description="Bons hábitos. Volte amanhã pra manter o ritmo."
              />
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Link href="/questoes" className="block">
          <Card className="transition hover:border-indigo-300">
            <CardBody>
              <ListChecks className="h-5 w-5 text-indigo-600" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Banco de questões
              </h3>
              <p className="text-xs text-slate-500">
                Pratique por área e nível.
              </p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/redacao" className="block">
          <Card className="transition hover:border-indigo-300">
            <CardBody>
              <PenLine className="h-5 w-5 text-indigo-600" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Redação
              </h3>
              <p className="text-xs text-slate-500">
                Envie texto pra correção.
              </p>
            </CardBody>
          </Card>
        </Link>
        <Link href="/simulado" className="block">
          <Card className="transition hover:border-indigo-300">
            <CardBody>
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Simulado
              </h3>
              <p className="text-xs text-slate-500">
                Avalie como estaria hoje.
              </p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
