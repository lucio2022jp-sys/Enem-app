import Link from "next/link";
import {
  ListChecks,
  PenLine,
  Sparkles,
  BookCheck,
  ArrowRight,
  Flame,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Trophy,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BarChart } from "@/components/BarChart";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/EmptyState";
import { AREAS, parseJson } from "@/lib/utils";
import { nivelDeXP } from "@/lib/gamificacao";
import { ranking7d, ultimosNDias } from "@/lib/daily";
import { getOuCriarMissaoHoje, progressoMissao } from "@/lib/missao";

export const dynamic = "force-dynamic";

function fmtTempo(seg: number): string {
  if (seg < 60) return `${seg}s`;
  const m = Math.floor(seg / 60);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  return `${h}h${(m % 60).toString().padStart(2, "0")}`;
}

function Delta({
  atual,
  anterior,
  sufixo = "",
}: {
  atual: number;
  anterior: number;
  sufixo?: string;
}) {
  const diff = atual - anterior;
  if (anterior === 0 && atual === 0) {
    return (
      <span className="inline-flex items-center text-xs text-slate-500">
        <Minus className="mr-1 h-3 w-3" /> sem dados
      </span>
    );
  }
  if (diff === 0) {
    return (
      <span className="inline-flex items-center text-xs text-slate-500">
        <Minus className="mr-1 h-3 w-3" /> igual
      </span>
    );
  }
  const positivo = diff > 0;
  const Icon = positivo ? TrendingUp : TrendingDown;
  const cor = positivo ? "text-emerald-600" : "text-rose-600";
  return (
    <span className={`inline-flex items-center text-xs font-medium ${cor}`}>
      <Icon className="mr-1 h-3 w-3" />
      {positivo ? "+" : ""}
      {diff}
      {sufixo} vs 7d anteriores
    </span>
  );
}

export default async function InicioPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user) return null;
  const userId = session.user.id;

  const [
    perfil,
    trilha,
    redacoesCount,
    revisoesPendentes,
    proximaRevisao,
    rank,
    dias7,
  ] = await Promise.all([
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
    prisma.revisao.findFirst({
      where: { userId },
      orderBy: { proximaRevisao: "asc" },
      include: { question: { select: { area: true, conteudo: true } } },
    }),
    ranking7d(userId),
    ultimosNDias(userId, 7),
  ]);

  const missaoHoje = await getOuCriarMissaoHoje(userId);
  const missao = missaoHoje ? progressoMissao(missaoHoje) : null;
  const nivel = nivelDeXP(perfil?.xp ?? 0);

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

  const pctAcertos7d =
    rank.questoesAtual > 0
      ? Math.round((rank.acertosAtual / rank.questoesAtual) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Olá, {session.user.name?.split(" ")[0] ?? "estudante"}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {nivel.info.emoji} {nivel.info.label} • {nivel.xp} XP
            {nivel.faltaParaProximo > 0
              ? ` • faltam ${nivel.faltaParaProximo} XP pro próximo`
              : " • nível máximo"}
          </p>
        </div>
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

      {/* Faixa de gamificação: nível + streak + missão */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-2xl">
                {nivel.info.emoji}
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500">Nível</div>
                <div className="text-base font-semibold text-slate-900">
                  {nivel.info.label}
                </div>
              </div>
            </div>
            <div
              className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuenow={Math.round(nivel.progresso * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-indigo-500"
                style={{ width: `${Math.round(nivel.progresso * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {nivel.xp} XP
              {nivel.faltaParaProximo > 0
                ? ` • faltam ${nivel.faltaParaProximo} pro próximo nível`
                : ""}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Flame className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500">Streak atual</div>
                <div className="text-base font-semibold text-slate-900">
                  {perfil?.streakDias ?? 0} dia
                  {(perfil?.streakDias ?? 0) === 1 ? "" : "s"}
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Melhor: <strong>{perfil?.melhorStreak ?? 0} dias</strong>
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <Target className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500">Missão diária</div>
                <div className="text-base font-semibold text-slate-900">
                  {missao && missao.total > 0
                    ? `${missao.feito}/${missao.total}`
                    : "—"}
                </div>
              </div>
            </div>
            {missao && missao.total > 0 ? (
              <>
                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100"
                  role="progressbar"
                  aria-valuenow={missao.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${missao.pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {missao.completa
                    ? "Missão concluída"
                    : `${missao.pct}% concluído`}
                </p>
              </>
            ) : (
              <p className="mt-3 text-xs text-slate-500">
                Faça o diagnóstico pra desbloquear missões.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

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

        {/* Resumo da semana com comparativo */}
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              Últimos 7 dias
            </h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {rank.questoesAtual}
                </div>
                <div className="text-xs text-slate-500">questões</div>
                <div className="mt-1">
                  <Delta
                    atual={rank.questoesAtual}
                    anterior={rank.questoesAnterior}
                  />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {pctAcertos7d}%
                </div>
                <div className="text-xs text-slate-500">acertos</div>
                <div className="mt-1">
                  <Delta
                    atual={rank.acertosAtual}
                    anterior={rank.acertosAnterior}
                  />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">
                  {fmtTempo(rank.tempoAtual)}
                </div>
                <div className="text-xs text-slate-500">tempo estudo</div>
                <div className="mt-1">
                  <Delta
                    atual={Math.round(rank.tempoAtual / 60)}
                    anterior={Math.round(rank.tempoAnterior / 60)}
                    sufixo="min"
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Nota estimada ENEM:{" "}
                <strong className="text-slate-900">
                  {perfil?.notaEstimadaEnem ?? "—"}
                </strong>
              </span>
              <span className="text-slate-500">
                XP da semana:{" "}
                <strong className="text-slate-900">{rank.xpAtual}</strong>
              </span>
            </div>
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
              Revisões
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
            ) : proximaRevisao ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-600">
                  Sem revisões pra hoje. Próxima:
                </p>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">
                    {proximaRevisao.question.area} •{" "}
                    {proximaRevisao.question.conteudo}
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {proximaRevisao.proximaRevisao.toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<BookCheck className="h-6 w-6" />}
                title="Nenhuma revisão agendada"
                description="Responda algumas questões pra começar a revisar com espaçamento."
              />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Atividade dos últimos 7 dias */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Atividade diária
            </h2>
            <Link
              href="/painel"
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
              Ver painel completo
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          <BarChart
            data={dias7.map((d) => ({ label: d.label, value: d.questoes }))}
          />
          <p className="mt-2 text-xs text-slate-500">
            Questões respondidas por dia.
          </p>
        </CardBody>
      </Card>

      {/* Atalhos */}
      <div className="grid gap-3 sm:grid-cols-4">
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
                Envie texto pra correção. Total: {redacoesCount}
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
        <Link href="/painel" className="block">
          <Card className="transition hover:border-indigo-300">
            <CardBody>
              <Trophy className="h-5 w-5 text-indigo-600" />
              <h3 className="mt-2 text-sm font-semibold text-slate-900">
                Painel
              </h3>
              <p className="text-xs text-slate-500">
                Suas estatísticas completas.
              </p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
}
