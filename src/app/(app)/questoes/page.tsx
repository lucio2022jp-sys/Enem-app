import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AREAS, AREA_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

const POR_PAGINA = 20;

export default async function QuestoesPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const area = typeof searchParams?.area === "string" ? searchParams.area : "";
  const dif =
    typeof searchParams?.dif === "string" ? searchParams.dif : "";
  const pagina = Math.max(
    1,
    Number(typeof searchParams?.p === "string" ? searchParams.p : "1") || 1,
  );

  const where: any = {};
  if (area) where.area = area;
  if (dif) where.dificuldade = dif;

  const [total, questoes] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pagina - 1) * POR_PAGINA,
      take: POR_PAGINA,
      select: {
        id: true,
        enunciado: true,
        area: true,
        disciplina: true,
        conteudo: true,
        dificuldade: true,
      },
    }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Banco de questões
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {total} questões disponíveis. Pratique livremente ou peça a próxima
            sob medida pelo seu perfil.
          </p>
        </div>
        <Link href="/questoes/proxima">
          <Button>Próxima sob medida</Button>
        </Link>
      </header>

      <form className="flex flex-wrap gap-2" method="get">
        <select
          name="area"
          defaultValue={area}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          aria-label="Área"
        >
          <option value="">Todas as áreas</option>
          {AREAS.map((a) => (
            <option key={a.key} value={a.key}>
              {a.label}
            </option>
          ))}
        </select>
        <select
          name="dif"
          defaultValue={dif}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          aria-label="Dificuldade"
        >
          <option value="">Qualquer dificuldade</option>
          <option value="FACIL">Fácil</option>
          <option value="MEDIO">Médio</option>
          <option value="DIFICIL">Difícil</option>
        </select>
        <Button type="submit" variant="outline" size="sm">
          Filtrar
        </Button>
      </form>

      <ul className="space-y-2">
        {questoes.map((q) => (
          <li key={q.id}>
            <Card>
              <CardBody>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="indigo">{AREA_LABELS[q.area] ?? q.area}</Badge>
                  <Badge>{q.disciplina}</Badge>
                  <Badge
                    tone={
                      q.dificuldade === "FACIL"
                        ? "green"
                        : q.dificuldade === "DIFICIL"
                        ? "rose"
                        : "amber"
                    }
                  >
                    {q.dificuldade}
                  </Badge>
                  <span className="text-xs text-slate-500">{q.conteudo}</span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm text-slate-700">
                  {q.enunciado}
                </p>
                <div className="mt-3">
                  <Link href={`/questoes/${q.id}`}>
                    <Button size="sm">Resolver</Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          </li>
        ))}
      </ul>

      {totalPaginas > 1 ? (
        <nav
          className="flex items-center justify-between text-sm text-slate-600"
          aria-label="Paginação"
        >
          {pagina > 1 ? (
            <Link
              href={`?p=${pagina - 1}${area ? `&area=${area}` : ""}${
                dif ? `&dif=${dif}` : ""
              }`}
              className="font-medium text-indigo-600"
            >
              ← Anterior
            </Link>
          ) : (
            <span />
          )}
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          {pagina < totalPaginas ? (
            <Link
              href={`?p=${pagina + 1}${area ? `&area=${area}` : ""}${
                dif ? `&dif=${dif}` : ""
              }`}
              className="font-medium text-indigo-600"
            >
              Próxima →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
