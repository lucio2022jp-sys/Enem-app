import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { NovoSimuladoForm } from "./NovoSimuladoForm";

export const dynamic = "force-dynamic";

export default async function NovoSimuladoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Novo simulado</h1>
        <p className="mt-1 text-sm text-slate-600">
          Escolha o modo que combina com o seu momento.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">
            Escolha o modo
          </h2>
        </CardHeader>
        <CardBody>
          <NovoSimuladoForm />
        </CardBody>
      </Card>

      <div className="text-sm">
        <Link href="/simulado" className="text-indigo-600 hover:underline">
          ← voltar para a lista
        </Link>
      </div>
    </div>
  );
}
