import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
        Erro 404
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Página não encontrada
      </h1>
      <p className="mt-2 max-w-md text-slate-600">
        O conteúdo que você procurou não existe mais ou foi movido. Volte pra
        sua trilha de estudos.
      </p>
      <div className="mt-6">
        <Link href="/inicio">
          <Button>Voltar para o início</Button>
        </Link>
      </div>
    </div>
  );
}
