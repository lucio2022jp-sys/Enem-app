import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DiagnosticRunner } from "./DiagnosticRunner";
import { Card, CardBody } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function DiagnosticoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const existente = await prisma.diagnosticResult.findUnique({
    where: { userId: session.user.id },
  });
  if (existente) redirect("/diagnostico/resultado");

  // Pega 3 questões MEDIO de cada área = 12 questões
  const areas = ["LINGUAGENS", "HUMANAS", "NATUREZA", "MATEMATICA"] as const;
  const questoes: any[] = [];
  for (const area of areas) {
    const qs = await prisma.question.findMany({
      where: { area, dificuldade: "MEDIO" },
      take: 3,
      orderBy: { createdAt: "asc" },
    });
    questoes.push(...qs);
  }

  if (questoes.length < 4) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardBody>
            <h1 className="text-xl font-bold text-slate-900">
              Banco vazio
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Não há questões suficientes pra rodar o diagnóstico. Rode o seed:
              <code className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                npm run db:seed
              </code>
              .
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <DiagnosticRunner questoes={questoes} />
    </div>
  );
}
