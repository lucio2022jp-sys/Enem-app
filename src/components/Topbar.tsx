import Link from "next/link";
import { Badge } from "./ui/Badge";
import { Logo } from "./Logo";

interface TopbarProps {
  nome: string;
  plano: string;
}

export function Topbar({ nome, plano }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="md:hidden">
        <Link href="/inicio">
          <Logo />
        </Link>
      </div>
      <div className="hidden text-sm text-slate-500 md:block">
        Bom estudo, foco no treino.
      </div>
      <div className="flex items-center gap-3">
        <Badge tone={plano === "PRO" ? "indigo" : "default"}>
          {plano === "PRO" ? "Plano Pro" : "Plano Free"}
        </Badge>
        <span className="hidden text-sm font-medium text-slate-700 sm:inline">
          {nome}
        </span>
      </div>
    </header>
  );
}
