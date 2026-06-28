import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { NovaRedacaoForm } from "./NovaRedacaoForm";

export const dynamic = "force-dynamic";

export default async function NovaRedacaoPage() {
  const session = await auth();
  if (!session?.user) redirect("/entrar");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
        <div className="flex-1">
          <p className="font-medium">Antes de começar:</p>
          <p className="mt-0.5 text-indigo-800/90">
            Quer ver como a IA corrige uma redação real?{" "}
            <Link
              href="/redacao-exemplo"
              target="_blank"
              className="font-medium underline"
            >
              Ver exemplo corrigido
            </Link>
            .
          </p>
        </div>
      </div>
      <NovaRedacaoForm />
    </div>
  );
}
