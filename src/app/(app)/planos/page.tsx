import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AssinarProButton } from "./AssinarProButton";

export const dynamic = "force-dynamic";

export default async function PlanosPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  const isPro = session.user.plan === "PRO";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Planos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Escolha o que combina com seu momento.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Free</h2>
              {!isPro ? <Badge tone="indigo">Plano atual</Badge> : null}
            </div>
            <p className="text-sm text-slate-600">Pra quem está começando.</p>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <span className="text-3xl font-bold text-slate-900">R$ 0</span>
              <span className="text-sm text-slate-500">/mês</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <Item>20 questões por mês</Item>
              <Item>1 redação corrigida por IA por mês</Item>
              <Item>Diagnóstico inicial</Item>
              <Item>Trilha personalizada básica</Item>
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-indigo-700">Pro</h2>
              {isPro ? <Badge tone="green">Plano atual</Badge> : null}
            </div>
            <p className="text-sm text-slate-600">Treino sério, sem limites.</p>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <span className="text-3xl font-bold text-slate-900">
                R$ 29,90
              </span>
              <span className="text-sm text-slate-500">/mês</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-700">
              <Item>Questões geradas por IA ilimitadas</Item>
              <Item>Redação ilimitada com correção IA</Item>
              <Item>Revisão de redação por professor parceiro</Item>
              <Item>Simulados personalizados</Item>
              <Item>Revisão espaçada inteligente</Item>
              <Item>Trilha adaptativa avançada</Item>
            </ul>
            <div className="mt-5">
              {isPro ? (
                <p className="text-sm text-emerald-700">
                  Você já tem o plano Pro ativo.
                </p>
              ) : (
                <AssinarProButton />
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      <span>{children}</span>
    </li>
  );
}
