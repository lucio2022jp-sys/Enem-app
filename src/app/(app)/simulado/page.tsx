import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/EmptyState";
import { NovoSimuladoButton } from "./NovoSimuladoButton";

export const dynamic = "force-dynamic";

export default async function SimuladoListaPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const simulados = await prisma.simulado.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Simulados</h1>
          <p className="mt-1 text-sm text-slate-600">
            Simulado personalizado pelo seu perfil. Foca onde você precisa.
          </p>
        </div>
        <NovoSimuladoButton />
      </header>

      {simulados.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="Sem simulados ainda"
          description="Monte seu primeiro simulado personalizado em poucos segundos."
        />
      ) : (
        <ul className="space-y-2">
          {simulados.map((s) => {
            const concluido = !!s.finalizadoEm;
            return (
              <li key={s.id}>
                <Card>
                  <CardBody>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {s.titulo}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {s.totalQuestoes} questões · {s.duracaoMin} min ·{" "}
                          {new Date(s.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {concluido ? (
                          <Badge tone="green">Concluído</Badge>
                        ) : (
                          <Badge tone="amber">Em aberto</Badge>
                        )}
                        {concluido ? (
                          <Link href={`/simulado/${s.id}/resultado`}>
                            <Button size="sm" variant="outline">
                              Ver resultado
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/simulado/${s.id}`}>
                            <Button size="sm">Continuar</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
