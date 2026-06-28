import Link from "next/link";
import { redirect } from "next/navigation";
import { PenLine } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/EmptyState";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; tone: any }> = {
  ENVIADA: { label: "Enviada", tone: "slate" },
  EM_CORRECAO_IA: { label: "Em correção (IA)", tone: "amber" },
  CORRIGIDA_IA: { label: "Corrigida pela IA", tone: "indigo" },
  EM_REVISAO_HUMANA: { label: "Em revisão humana", tone: "amber" },
  CORRIGIDA_HUMANA: { label: "Revisada por professor", tone: "green" },
};

export default async function RedacaoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const redacoes = await prisma.essay.findMany({
    where: { userId: session.user.id },
    orderBy: { enviadaEm: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Redações</h1>
          <p className="mt-1 text-sm text-slate-600">
            Suas redações enviadas e correções.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/redacao-exemplo" target="_blank">
            <Button variant="outline">Ver exemplo corrigido</Button>
          </Link>
          <Link href="/redacao/nova">
            <Button>Nova redação</Button>
          </Link>
        </div>
      </header>

      {redacoes.length === 0 ? (
        <EmptyState
          icon={<PenLine className="h-6 w-6" />}
          title="Nenhuma redação ainda"
          description="Comece com a primeira. A IA dá nota nas 5 competências e um professor pode revisar."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/redacao-exemplo" target="_blank">
                <Button variant="outline">Ver exemplo</Button>
              </Link>
              <Link href="/redacao/nova">
                <Button>Começar agora</Button>
              </Link>
            </div>
          }
        />
      ) : (
        <ul className="space-y-2">
          {redacoes.map((r) => {
            const meta = STATUS_LABEL[r.status] ?? {
              label: r.status,
              tone: "slate",
            };
            return (
              <li key={r.id}>
                <Card>
                  <CardBody>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {r.tema}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {new Date(r.enviadaEm).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-700">
                      <span>
                        Nota: <strong>{r.nota}</strong>
                      </span>
                      <span className="text-xs text-slate-500">
                        C1 {r.c1} · C2 {r.c2} · C3 {r.c3} · C4 {r.c4} · C5 {r.c5}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Link href={`/redacao/${r.id}`}>
                        <Button size="sm" variant="outline">
                          Ver correção
                        </Button>
                      </Link>
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
