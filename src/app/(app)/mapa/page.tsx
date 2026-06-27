import Link from "next/link";
import { Map as MapIcon, ArrowRight, CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/EmptyState";
import { AREAS, AREA_LABELS, parseJson } from "@/lib/utils";
import type { ConteudoScore } from "@/types";

export const dynamic = "force-dynamic";

interface ItemConteudo {
  conteudo: string;
  area: string;
  total: number;
  acertos: number;
  pct: number;
  status: "dominado" | "fraco" | "intermediario" | "novo";
}

function classificar(score: ConteudoScore | undefined, conteudo: string, dominados: string[], fracos: string[]): ItemConteudo["status"] {
  if (dominados.includes(conteudo)) return "dominado";
  if (fracos.includes(conteudo)) return "fraco";
  if (!score || score.total === 0) return "novo";
  return "intermediario";
}

const STATUS_META: Record<ItemConteudo["status"], { label: string; tone: "green" | "rose" | "amber" | "default"; icon: typeof CheckCircle2 }> = {
  dominado:       { label: "Dominado",      tone: "green",   icon: CheckCircle2 },
  fraco:          { label: "Ponto fraco",   tone: "rose",    icon: AlertCircle  },
  intermediario:  { label: "Em evolução",   tone: "amber",   icon: Circle       },
  novo:           { label: "Sem dados",     tone: "default", icon: Circle       },
};

export default async function MapaPage() {
  const session = await auth();
  if (!session?.user) return null;
  const userId = session.user.id;

  const [perfil, conteudosUsados] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId } }),
    prisma.question.findMany({
      select: { area: true, conteudo: true },
      distinct: ["conteudo"],
      orderBy: [{ area: "asc" }, { conteudo: "asc" }],
    }),
  ]);

  const conteudoScores = parseJson<Record<string, ConteudoScore>>(
    perfil?.conteudoScoresJson ?? null,
    {},
  );
  const dominados = parseJson<string[]>(perfil?.dominadosJson ?? null, []);
  const fracos = parseJson<string[]>(perfil?.fracosJson ?? null, []);

  // Indexa por área
  const porArea: Record<string, ItemConteudo[]> = {};
  for (const a of AREAS) porArea[a.key] = [];

  for (const q of conteudosUsados) {
    if (!q.conteudo) continue;
    const score = conteudoScores[q.conteudo];
    const status = classificar(score, q.conteudo, dominados, fracos);
    porArea[q.area] = porArea[q.area] ?? [];
    porArea[q.area].push({
      conteudo: q.conteudo,
      area: q.area,
      total: score?.total ?? 0,
      acertos: score?.acertos ?? 0,
      pct: score?.pct ?? 0,
      status,
    });
  }

  // Ordenação: fracos primeiro, depois intermediário, depois dominado, depois novo
  const ordem: Record<ItemConteudo["status"], number> = {
    fraco: 0,
    intermediario: 1,
    dominado: 2,
    novo: 3,
  };
  for (const key of Object.keys(porArea)) {
    porArea[key].sort((a, b) => ordem[a.status] - ordem[b.status] || a.conteudo.localeCompare(b.conteudo));
  }

  const totalConteudos = conteudosUsados.length;
  const totalDominados = dominados.length;
  const totalFracos = fracos.length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mapa do conhecimento</h1>
          <p className="mt-1 text-sm text-slate-500">
            Como você está em cada conteúdo do ENEM.
          </p>
        </div>
        <Link href="/questoes/proxima">
          <Button>
            Treinar agora <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardBody>
            <div className="text-xs text-slate-500">Conteúdos no banco</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{totalConteudos}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-slate-500">Dominados</div>
            <div className="mt-1 text-2xl font-bold text-emerald-600">{totalDominados}</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="text-xs text-slate-500">Pontos fracos</div>
            <div className="mt-1 text-2xl font-bold text-rose-600">{totalFracos}</div>
          </CardBody>
        </Card>
      </div>

      {totalConteudos === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<MapIcon className="h-6 w-6" />}
              title="Sem conteúdos cadastrados"
              description="Assim que o banco de questões for populado, o mapa aparece aqui."
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {AREAS.map((area) => {
            const itens = porArea[area.key] ?? [];
            if (itens.length === 0) return null;
            return (
              <Card key={area.key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-900">
                      {AREA_LABELS[area.key]}
                    </h2>
                    <span className="text-xs text-slate-500">
                      {itens.length} conteúdo{itens.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </CardHeader>
                <CardBody>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {itens.map((item) => {
                      const meta = STATUS_META[item.status];
                      const Icon = meta.icon;
                      const cor =
                        item.status === "dominado"
                          ? "border-emerald-200 bg-emerald-50"
                          : item.status === "fraco"
                            ? "border-rose-200 bg-rose-50"
                            : item.status === "intermediario"
                              ? "border-amber-200 bg-amber-50"
                              : "border-slate-200 bg-slate-50";
                      return (
                        <li key={item.conteudo}>
                          <Link
                            href={`/questoes/proxima?conteudo=${encodeURIComponent(item.conteudo)}`}
                            className={`block rounded-lg border ${cor} p-3 transition hover:shadow-sm`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-slate-900">
                                  {item.conteudo}
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge tone={meta.tone}>
                                    <Icon className="mr-1 h-3 w-3" />
                                    {meta.label}
                                  </Badge>
                                  {item.total > 0 ? (
                                    <span className="text-xs text-slate-500">
                                      {item.acertos}/{item.total} ({item.pct}%)
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
