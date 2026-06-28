import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOuCriarMissaoHoje, progressoMissao } from "@/lib/missao";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

const ROTAS: Record<string, string> = {
  QUESTAO_LINGUAGENS: "/questoes/proxima?area=LINGUAGENS",
  QUESTAO_HUMANAS: "/questoes/proxima?area=HUMANAS",
  QUESTAO_NATUREZA: "/questoes/proxima?area=NATUREZA",
  QUESTAO_MATEMATICA: "/questoes/proxima?area=MATEMATICA",
  REDACAO: "/redacao/nova",
  REVISAO: "/revisao",
};

export default async function MissaoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const missao = await getOuCriarMissaoHoje(session.user.id);
  const p = progressoMissao(missao);

  const hojeStr = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <p className="text-sm text-slate-500 capitalize">{hojeStr}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Missão do dia
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Bate todas as metas e ganha {missao.xpBase} XP no fim do dia.
        </p>
      </header>

      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              Progresso geral
            </span>
            <span className="text-2xl font-bold text-indigo-600">
              {p.pct}%
            </span>
          </div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all ${
                p.completa ? "bg-emerald-500" : "bg-indigo-500"
              }`}
              style={{ width: `${p.pct}%` }}
            />
          </div>
          {p.completa ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              🎉 Missão concluída! +{missao.xpGanho ?? missao.xpBase} XP creditados.
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              {p.feito} de {p.total} atividades concluídas.
            </p>
          )}
        </CardBody>
      </Card>

      {p.itens.length === 0 ? (
        <Card>
          <CardBody className="text-sm text-slate-600">
            Não há metas para hoje. Que tal explorar livre o app?
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Atividades</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {p.itens.map((item) => {
              const rota = ROTAS[item.chave] ?? "/inicio";
              const pct = Math.min(100, Math.round((item.feito / item.alvo) * 100));
              return (
                <div
                  key={item.chave}
                  className={`flex flex-wrap items-center gap-3 rounded-lg border p-3 ${
                    item.completo
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full text-lg">
                    {item.completo ? "✅" : "⏳"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-slate-900">
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {item.feito}/{item.alvo}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full ${
                          item.completo ? "bg-emerald-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  {!item.completo ? (
                    <Link href={rota}>
                      <Button size="sm" variant="outline">
                        Fazer
                      </Button>
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
