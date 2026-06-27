import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Minha conta</h1>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">Dados</h2>
        </CardHeader>
        <CardBody>
          <dl className="space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <dt className="text-slate-500">Nome</dt>
              <dd>{session.user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">E-mail</dt>
              <dd>{session.user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Perfil</dt>
              <dd>{session.user.role}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Plano</dt>
              <dd>
                {session.user.plan === "PRO" ? (
                  <Badge tone="green">Pro</Badge>
                ) : (
                  <Badge>Free</Badge>
                )}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button type="submit" variant="outline">
              Sair da conta
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
