import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { parseJson } from "@/lib/utils";
import { PedirRevisaoButton } from "./PedirRevisaoButton";

export const dynamic = "force-dynamic";

const COMP_LABEL = [
  "C1 — Domínio da norma culta",
  "C2 — Compreensão do tema",
  "C3 — Argumentação",
  "C4 — Mecanismos linguísticos",
  "C5 — Proposta de intervenção",
];

export default async function RedacaoDetalhePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const redacao = await prisma.essay.findUnique({ where: { id: params.id } });
  if (!redacao) notFound();
  if (redacao.userId !== session.user.id) {
    return notFound();
  }

  const sugestoes = parseJson<string[]>(redacao.sugestoesJson, []);
  const competencias = [redacao.c1, redacao.c2, redacao.c3, redacao.c4, redacao.c5];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {redacao.tema}
              </h1>
              <p className="text-xs text-slate-500">
                Enviada em{" "}
                {new Date(redacao.enviadaEm).toLocaleString("pt-BR")}
              </p>
            </div>
            <Badge tone="indigo">{redacao.status.replaceAll("_", " ")}</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <article className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
            {redacao.texto}
          </article>
        </CardBody>
      </Card>

      {redacao.status === "EM_CORRECAO_IA" ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-600">
              Correção em andamento. Atualize esta página em alguns segundos.
            </p>
          </CardBody>
        </Card>
      ) : null}

      {(redacao.status === "CORRIGIDA_IA" ||
        redacao.status === "EM_REVISAO_HUMANA" ||
        redacao.status === "CORRIGIDA_HUMANA") && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-baseline justify-between">
                <h2 className="text-base font-semibold text-slate-900">
                  Correção da IA
                </h2>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Nota total</div>
                  <div className="text-3xl font-bold text-indigo-600">
                    {redacao.nota}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {competencias.map((v, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700">{COMP_LABEL[i]}</span>
                      <span className="font-medium text-slate-900">
                        {v} / 200
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${(v / 200) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {redacao.comentarioIA ? (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">
                    Comentário geral
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">
                    {redacao.comentarioIA}
                  </p>
                </div>
              ) : null}

              {sugestoes.length > 0 ? (
                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold text-slate-900">
                    Sugestões pra próxima
                  </h3>
                  <ul className="list-inside list-disc text-sm text-slate-700">
                    {sugestoes.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {redacao.reescrita ? (
                <details className="mt-6 rounded-lg border border-slate-200 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                    Ver versão reescrita
                  </summary>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {redacao.reescrita}
                  </p>
                </details>
              ) : null}
            </CardBody>
          </Card>

          {redacao.status === "CORRIGIDA_IA" ? (
            <Card>
              <CardBody>
                <h3 className="text-sm font-semibold text-slate-900">
                  Quer revisão humana?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Um professor parceiro revê sua redação e dá comentário extra.
                  Disponível no plano Pro.
                </p>
                <div className="mt-3">
                  <PedirRevisaoButton id={redacao.id} />
                </div>
              </CardBody>
            </Card>
          ) : null}

          {redacao.status === "EM_REVISAO_HUMANA" ? (
            <Card>
              <CardBody>
                <p className="text-sm text-slate-600">
                  Em fila pra revisão humana. Avisaremos quando estiver pronta.
                </p>
              </CardBody>
            </Card>
          ) : null}

          {redacao.status === "CORRIGIDA_HUMANA" && redacao.comentarioProfessor ? (
            <Card>
              <CardHeader>
                <h2 className="text-base font-semibold text-slate-900">
                  Comentário do professor
                </h2>
              </CardHeader>
              <CardBody>
                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {redacao.comentarioProfessor}
                </p>
              </CardBody>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}
