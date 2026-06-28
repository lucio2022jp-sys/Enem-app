import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { listarConquistas, semearBadges } from "@/lib/conquistas";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

const CATEGORIAS: Record<string, string> = {
  DIAGNOSTICO: "Diagnóstico",
  QUESTOES: "Questões",
  REDACAO: "Redação",
  SIMULADO: "Simulado",
  STREAK: "Sequência",
  MISSAO: "Missões",
  ESPECIAL: "Especiais",
};

function dataPt(d: Date | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default async function ConquistasPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  await semearBadges();
  const conquistas = await listarConquistas(session.user.id);
  const conquistadas = conquistas.filter((c) => c.conquistado);
  const totalPct = Math.round(
    (conquistadas.length / Math.max(1, conquistas.length)) * 100,
  );

  const porCategoria = conquistas.reduce<
    Record<string, typeof conquistas>
  >((acc, c) => {
    acc[c.categoria] = acc[c.categoria] ?? [];
    acc[c.categoria].push(c);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Conquistas</h1>
          <p className="mt-1 text-sm text-slate-600">
            {conquistadas.length} de {conquistas.length} desbloqueadas
            ({totalPct}%).
          </p>
        </div>
        <Link href="/conta" className="text-sm text-indigo-600 hover:underline">
          ← voltar pra conta
        </Link>
      </header>

      <Card>
        <CardBody>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-indigo-500"
              style={{ width: `${totalPct}%` }}
            />
          </div>
        </CardBody>
      </Card>

      {Object.entries(porCategoria).map(([cat, lista]) => (
        <Card key={cat}>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">
              {CATEGORIAS[cat] ?? cat}
            </h2>
          </CardHeader>
          <CardBody>
            <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {lista.map((b) => (
                <li
                  key={b.slug}
                  className={`relative flex flex-col items-center rounded-lg border p-4 text-center transition ${
                    b.conquistado
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-slate-200 bg-slate-50/60 opacity-60"
                  }`}
                >
                  <div className="text-4xl">{b.icone}</div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">
                    {b.titulo}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">{b.descricao}</p>
                  <div className="mt-2 text-xs">
                    {b.conquistado ? (
                      <span className="font-medium text-emerald-700">
                        ✓ {dataPt(b.conquistadoEm)}
                      </span>
                    ) : (
                      <span className="text-slate-400">Bloqueada</span>
                    )}
                  </div>
                  {b.xpRecompensa > 0 ? (
                    <div className="absolute right-2 top-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      +{b.xpRecompensa} XP
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
