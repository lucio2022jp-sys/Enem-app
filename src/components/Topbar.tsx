import Link from "next/link";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

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
      <UserMenu nome={nome} plano={plano} />
    </header>
  );
}
