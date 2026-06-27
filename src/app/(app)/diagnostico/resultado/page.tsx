import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BarChart } from "@/components/BarChart";
import { AREAS, parseJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ResultadoDiagnosticoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const diag = await prisma.diagnosticResult.findUnique({
    where: { userId: session.user.id },
  });

  if (!diag) redirect("/diagnostico");

  const perfil = await prisma.studentProfile.findUnique({
    where: { userId: session.user.id },
  });

  const scores = parseJson<Record<string, number>>(diag.areaScoresJson, {});
  const dataGrafico = AREAS.map((a) => ({
    label: a.label,
    value: scores[a.key] ?? 0,
  }));

  const fracos = AREAS.filter((a) => (scores[a.key] ?? 0) < 60).map((a) => a.label);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <h1 className="text-xl font-bold text-slate-900">
            Seu diagnóstico está pronto
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Aqui está como você está hoje, por área.
          </p>
        </CardHeader>
        <CardBody>
          <BarChart data={dataGrafico} />
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AREAS.map((a) => (
              <div
                key={a.key}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center"
              >
                <div className="text-xs text-slate-500">{a.label}</div>
                <div className="text-xl font-bold text-slate-900">
                  {scores[a.key] ?? 0}%
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate-700">
            Nota ENEM estimada inicial:{" "}
            <strong>{perfil?.notaEstimadaEnem ?? "—"}</strong>
          </p>
          {fracos.length > 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              Vamos focar em: <strong>{fracos.join(", ")}</strong>.
            </p>
          ) : null}
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="text-base font-semibold text-slate-900">
            Sua trilha foi montada
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            12 atividades organizadas pra atacar seus pontos fracos primeiro.
          </p>
          <div className="mt-4">
            <Link href="/trilha">
              <Button>Ver minha trilha</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
