import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

export default async function ProfessorRedacoesPage() {
  const fila = await prisma.essay.findMany({
    where: { status: "EM_REVISAO_HUMANA" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { enviadaEm: "asc" },
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">
          Fila de redações pra revisão
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {fila.length} aguardando revisão humana.
        </p>
      </header>

      {fila.length === 0 ? (
        <EmptyState
          title="Nenhuma redação na fila"
          description="Quando alunos pedirem revisão humana, elas aparecem aqui."
        />
      ) : (
        <ul className="space-y-2">
          {fila.map((r) => (
            <li key={r.id}>
              <Card>
                <CardBody>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {r.tema}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {r.user.name} · {r.user.email}
                      </p>
                      <p className="text-xs text-slate-500">
                        Enviada em{" "}
                        {new Date(r.enviadaEm).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone="amber">Nota IA: {r.nota}</Badge>
                      <Link href={`/professor/redacoes/${r.id}`}>
                        <Button size="sm">Revisar</Button>
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
