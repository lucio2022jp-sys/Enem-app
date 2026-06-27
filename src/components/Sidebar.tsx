"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Route,
  ListChecks,
  PenLine,
  Trophy,
  CreditCard,
  User,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const links = [
    { href: "/inicio", label: "Início", icon: Home },
    { href: "/trilha", label: "Trilha", icon: Route },
    { href: "/questoes", label: "Questões", icon: ListChecks },
    { href: "/redacao", label: "Redação", icon: PenLine },
    { href: "/simulado", label: "Simulados", icon: Trophy },
    { href: "/planos", label: "Planos", icon: CreditCard },
    { href: "/conta", label: "Conta", icon: User },
  ];

  const isProf = role === "PROFESSOR" || role === "ADMIN";

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:flex md:flex-col">
      <div className="mb-6">
        <Link href="/inicio">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Navegação principal">
        {links.map((l) => {
          const Icon = l.icon;
          const active = pathname?.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {l.label}
            </Link>
          );
        })}

        {isProf ? (
          <>
            <div className="mt-4 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Professor
            </div>
            <Link
              href="/professor/redacoes"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                pathname?.startsWith("/professor/redacoes")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Redações
            </Link>
            <Link
              href="/professor/questoes"
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                pathname?.startsWith("/professor/questoes")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-100",
              )}
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Questões IA
            </Link>
          </>
        ) : null}
      </nav>

      <div className="pt-4 text-xs text-slate-400">
        v0.1 · feito pra treinar
      </div>
    </aside>
  );
}
