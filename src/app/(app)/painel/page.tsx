import Link from "next/link";
import { BarChart3, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/EmptyState";
import { AREAS, AREA_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TIPO_ERRO_LABEL: Record<string, string> = {
  CONHECIMENTO: "Conhecimento",
  INTERPRETACAO: "Interpretação",
  CALCULO: "Cálculo",
  DISTRACAO: "Distração",
  TEMPO: "Tempo",
  GRAFICO: "Gráfico",
  TABELA: "Tabela",
  RACIOCINIO: "Raciocínio",
  CONCEITUAL: "Conceitual",
  ESTRATEGIA: "Estratégia",
  NENHUM: "Não classificado",
};

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function PainelPage() {
  const session = await auth();
  if (!session?.user) return null;
  const userId = session.user.id;

  const since = new Date();
  since.setDate(since.getDate() - 29);
  since.setHours(0, 0, 0, 0);

  const [attempts, totalGeral] = await Promise.all([
    prisma.attempt.findMany({
      where: { userId, createdAt: { gte: since } },
      include: { question: { select: { area: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.attempt.count({ where: { userId } }),
  ]);

  // KPIs 30 dias
  const total = attempts.length;
  const acertos = attempts.filter((a) => a.correta).length;
  const pct = total > 0 ? Math.round((acertos / total) * 100) : 0;
  const tempoMedio =
    total > 0
      ? Math.round(attempts.reduce((s, a) => s + a.tempoSegundos, 0) / total)
      : 0;

  // Série diária
  const diaMap: Map<string, { total: number; acertos: number }> = new Map();
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    diaMap.set(ymd(d), { total: 0, acertos: 0 });
  }
  for (const a of attempts) {
    const k = ymd(a.createdAt);
    const cur = diaMap.get(k);
    if (cur) {
      cur.total++;
      if (a.correta) cur.acertos++;
    }
  }
  const serie = Array.from(diaMap.entries()).map(([dia, v]) => ({
    dia,
    total: v.total,
    acertos: v.acertos,
    pct: v.total > 0 ? Math.round((v.acertos / v.total) * 100) : 0,
  }));
  const picoTotal = Math.max(1, ...serie.map((s) => s.total));

  // Por área
  const porArea = AREAS.map((a) => {
    const ofArea = attempts.filter((x) => x.question.area === a.key);
    const t = ofArea.length;
    const ac = ofArea.filter((x) => x.correta).length;
    return {
      key: a.key,
      label: AREA_LABELS[a.key],
      total: t,
      acertos: ac,
      pct: t > 0 ? Math.round((ac / t) * 100) : 0,
    };
  });

  // Tipos de erro
  const errosPorTipo: Record<string, number> = {};
  for (const a of attempts) {
    if (a.correta) continue;
    const tipo = a.tipoErro || "NENHUM";
    errosPorTipo[tipo] = (errosPorTipo[tipo] ?? 0) + 1;
  }
  const tiposErro = Object.entries(errosPorTipo)
    .map(([tipo, qtd]) => ({ tipo, qtd }))
    .sort((a, b) => b.qtd - a.qtd);
  const picoErro = Math.max(1, ...tiposErro.map((t) => t.qtd));

  if (totalGeral === 0) {
    return (
      <div className="mx-auto max-w-5xl">
        <Card>
          <CardBody>
            <EmptyState
              icon={<BarChart3 className="h-6 w-6" />}
              title="Sem dados ainda"
              description="Responda algumas questões pra ver suas estatísticas aqui."
              action={
                <Link href="/questoes/proxima">
                  <Button>Começar a treinar</Button>
                </Link>
              }
            />
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Painel</h1>
        <p className="mt-1 text-sm text-slate-500">Seus últimos 30 dias.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <BarChart3 className="h-3.5 w-3.5" /> Questões
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{total}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" /> Aproveitamento
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-600">{pct}%</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Tempo médio
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-900">
              {tempoMedio}s
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <AlertTriangle className="h-3.5 w-3.5" /> Erros
            </div>
            <div className="mt-1 text-2xl font-bold text-rose-600">
              {total - acertos}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">
            Evolução diária
          </h2>
        </CardHeader>
        <CardBody>
          <div className="flex h-32 items-end gap-1">
            {serie.map((d) => {
              const h = (d.total / picoTotal) * 100;
              const acH = d.total > 0 ? (d.acertos / picoTotal) * 100 : 0;
              return (
                <div
                  key={d.dia}
                  className="group relative flex-1"
                  title={`${d.dia}: ${d.acertos}/${d.total} (${d.pct}%)`}
                >
                  <div
                    className="w-full rounded-t bg-slate-200"
                    style={{ height: `${h}%`, minHeight: d.total > 0 ? "2px" : "0" }}
                  >
                    <div
                      className="w-full rounded-t bg-emerald-500"
                      style={{ height: `${d.total > 0 ? (d.acertos / d.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>{serie[0]?.dia}</span>
            <span>{serie[serie.length - 1]?.dia}</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-500" /> acertos
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-slate-200" /> erros
            </span>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              Por área
            </h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-3">
              {porArea.map((a) => (
                <li key={a.key}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                    <span className="font-medium text-slate-700">{a.label}</span>
                    <span>
                      {a.total > 0 ? `${a.acertos}/${a.total} · ${a.pct}%` : "sem dados"}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500"
                      style={{ width: `${a.pct}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              Tipos de erro
            </h2>
          </CardHeader>
          <CardBody>
            {tiposErro.length === 0 ? (
              <p className="text-sm text-slate-500">
                Sem erros nos últimos 30 dias. Bom trabalho.
              </p>
            ) : (
              <ul className="space-y-2">
                {tiposErro.map((t) => (
                  <li key={t.tipo}>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-medium text-slate-700">
                        {TIPO_ERRO_LABEL[t.tipo] ?? t.tipo}
                      </span>
                      <span>{t.qtd}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-rose-400"
                        style={{ width: `${(t.qtd / picoErro) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
