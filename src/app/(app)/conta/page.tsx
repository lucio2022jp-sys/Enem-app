import { redirect } from "next/navigation";
import Link from "next/link";
import { Flame, Trophy, Target, BookOpen, BarChart3 } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { carregarPerfil } from "@/lib/perfil/calcular";
import { nivelDeXP } from "@/lib/gamificacao";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PortalAssinaturaButton } from "@/components/PortalAssinaturaButton";
import { AREAS, AREA_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const userId = session.user.id;
  const [perfil, redacoes, simulados] = await Promise.all([
    carregarPerfil(userId),
    prisma.essay.count({
      where: { userId, status: { in: ["CORRIGIDA_IA", "CORRIGIDA_HUMANO"] } },
    }),
    prisma.simulado.count({
      where: { userId, finalizadoEm: { not: null } },
    }),
  ]);

  const nivel = perfil ? nivelDeXP(perfil.xp) : null;
  const acertoPct =
    perfil && perfil.totalQuestoes > 0
      ? Math.round((perfil.totalAcertos / perfil.totalQuestoes) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Minha conta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Seus dados, plano e o resumo do seu desempenho.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Dados</h2>
        </CardHeader>
        <CardBody>
          <dl className="space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <dt className="text-slate-500">Nome</dt>
              <dd>{session.user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">E-mail</dt>
              <dd>{session.user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Perfil</dt>
              <dd>{session.user.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Plano</dt>
              <dd>
                {session.user.plan === "PRO" ? (
                  <Badge tone="green">Pro</Badge>
                ) : (
                  <Badge>Free</Badge>
                )}
              </dd>
            </div>
          </dl>
          {session.user.plan === "PRO" ? (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs text-slate-500">
                Atualizar cartão, baixar recibo ou cancelar a assinatura:
              </p>
              <PortalAssinaturaButton />
            </div>
          ) : (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <Link href="/planos">
                <Button size="sm">Conhecer o Pro</Button>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>

      {perfil && nivel ? (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              Perfil de aluno
            </h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>
                  {nivel.info.emoji}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {nivel.info.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {nivel.xp} XP
                    {nivel.faltaParaProximo > 0
                      ? ` · faltam ${nivel.faltaParaProximo} pro próximo`
                      : " · nível máximo"}
                  </p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1 text-sm text-slate-700">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>{perfil.streakDias} dias seguidos</span>
              </div>
            </div>

            <div
              className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
              aria-hidden
            >
              <div
                className="h-full bg-indigo-500 transition-all"
                style={{ width: `${Math.round(nivel.progresso * 100)}%` }}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-4">
              <Stat
                Icon={BarChart3}
                label="Nota ENEM estimada"
                value={
                  perfil.notaEstimadaEnem != null
                    ? String(perfil.notaEstimadaEnem)
                    : "—"
                }
              />
              <Stat
                Icon={Target}
                label="Acerto"
                value={`${acertoPct}%`}
                sub={`${perfil.totalAcertos}/${perfil.totalQuestoes}`}
              />
              <Stat Icon={Trophy} label="Simulados" value={String(simulados)} />
              <Stat Icon={BookOpen} label="Redações" value={String(redacoes)} />
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Desempenho por área
              </p>
              <ul className="space-y-2">
                {AREAS.map((a) => {
                  const pct = perfil.areaScores[a.key] ?? 0;
                  return (
                    <li key={a.key}>
                      <div className="mb-1 flex justify-between text-xs text-slate-600">
                        <span>{AREA_LABELS[a.key]}</span>
                        <span className="font-medium text-slate-900">
                          {pct}%
                        </span>
                      </div>
                      <div
                        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
                        aria-hidden
                      >
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {perfil.fracos.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Conteúdos a reforçar
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {perfil.fracos.slice(0, 8).map((c) => (
                    <span
                      key={c}
                      className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/painel">
                <Button size="sm" variant="outline">
                  Ver painel completo
                </Button>
              </Link>
              <Link href="/mapa">
                <Button size="sm" variant="outline">
                  Mapa do conhecimento
                </Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="text-sm text-slate-600">
            Você ainda não tem perfil calculado. Faça o{" "}
            <Link href="/diagnostico" className="text-indigo-600 hover:underline">
              diagnóstico inicial
            </Link>{" "}
            pra liberar seu painel.
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline">
              Sair da conta
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function Stat({
  Icon,
  label,
  value,
  sub,
}: {
  Icon: typeof Flame;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
      {sub ? <p className="text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}
