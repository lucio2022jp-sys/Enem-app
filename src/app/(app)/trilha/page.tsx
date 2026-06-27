import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

const tipoLabel: Record<string, string> = {
  QUESTOES: "Questões",
  REDACAO: "Redação",
  REVISAO: "Revisão",
  SIMULADO: "Simulado",
};

export default async function TrilhaPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const itens = await prisma.trackItem.findMany({
    where: { userId: session.user.id },
    orderBy: { ordem: "asc" },
  });

  if (itens.length === 0) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          title="Sem trilha"
          description="Faça o diagnóstico inicial para gerar sua trilha personalizada."
          action={
            <Link href="/diagnostico">
              <Button>Fazer diagnóstico</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Sua trilha</h1>
        <p className="mt-1 text-sm text-slate-600">
          Itens montados pra você atacar primeiro o que está mais fraco. Vão
          mudando conforme seu desempenho.
        </p>
      </header>

      <ul className="space-y-3">
        {itens.map((it) => {
          let href = `/questoes/proxima?trackItemId=${it.id}`;
          if (it.tipo === "REDACAO") href = "/redacao/nova";
          if (it.tipo === "SIMULADO") href = "/simulado";
          if (it.tipo === "REVISAO") href = `/questoes/proxima?modo=revisao`;

          return (
            <li key={it.id}>
              <Card>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      {it.concluido ? (
                        <CheckCircle2
                          className="h-6 w-6 text-emerald-500"
                          aria-label="Concluído"
                        />
                      ) : (
                        <Circle
                          className="h-6 w-6 text-slate-300"
                          aria-label="Pendente"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          {String(it.ordem).padStart(2, "0")}
                        </span>
                        <Badge tone="indigo">
                          {tipoLabel[it.tipo] ?? it.tipo}
                        </Badge>
                        <Badge>{it.area}</Badge>
                        {it.tipo === "QUESTOES" || it.tipo === "REVISAO" ? (
                          <span className="text-xs text-slate-500">
                            {it.alvoQuestoes} questões
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-1 text-base font-semibold text-slate-900">
                        {it.titulo}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {it.descricao}
                      </p>
                    </div>
                    <div className="self-center">
                      <Link href={href}>
                        <Button size="sm" variant={it.concluido ? "outline" : "primary"}>
                          {it.concluido ? "Refazer" : "Iniciar"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
