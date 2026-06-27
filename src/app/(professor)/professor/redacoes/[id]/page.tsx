import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RevisaoForm } from "./RevisaoForm";

export const dynamic = "force-dynamic";

export default async function ProfessorRedacaoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const r = await prisma.essay.findUnique({
    where: { id: params.id },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!r) notFound();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <h1 className="text-lg font-bold text-slate-900">{r.tema}</h1>
            <p className="text-xs text-slate-500">
              {r.user.name} · {r.user.email}
            </p>
          </CardHeader>
          <CardBody>
            <article className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-800">
              {r.texto}
            </article>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Correção atual (IA)
              </h2>
              <Badge tone="indigo">Nota IA: {r.nota}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>C1: {r.c1}</li>
              <li>C2: {r.c2}</li>
              <li>C3: {r.c3}</li>
              <li>C4: {r.c4}</li>
              <li>C5: {r.c5}</li>
            </ul>
            {r.comentarioIA ? (
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                {r.comentarioIA}
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <RevisaoForm
        id={r.id}
        valoresIA={{ c1: r.c1, c2: r.c2, c3: r.c3, c4: r.c4, c5: r.c5 }}
      />
    </div>
  );
}
