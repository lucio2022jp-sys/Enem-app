import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardBody } from "@/components/ui/Card";
import Link from "next/link";
import { ProximaRunner } from "./ProximaRunner";

export const dynamic = "force-dynamic";

export default async function ProximaQuestaoPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const trackItemId =
    typeof searchParams?.trackItemId === "string"
      ? searchParams.trackItemId
      : undefined;
  const modo =
    typeof searchParams?.modo === "string" ? searchParams.modo : undefined;
  const area =
    typeof searchParams?.area === "string" ? searchParams.area : undefined;

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardBody>
          <h1 className="text-xl font-bold text-slate-900">
            Próxima questão sob medida
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Estou montando uma questão calibrada pra você. Pode levar alguns
            segundos.
          </p>
          <div className="mt-4">
            <ProximaRunner
              trackItemId={trackItemId}
              modo={modo}
              area={area}
            />
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Sem chave da IA configurada? Eu seleciono uma do banco com base no
            seu perfil.
          </p>
          <div className="mt-4">
            <Link href="/questoes" className="text-sm text-indigo-600">
              Voltar ao banco de questões
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
