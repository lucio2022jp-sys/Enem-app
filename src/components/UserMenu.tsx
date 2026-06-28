"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Badge } from "./ui/Badge";

interface UserMenuProps {
  nome: string;
  plano: string;
}

export function UserMenu({ nome, plano }: UserMenuProps) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const iniciais = nome
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="flex items-center gap-2 rounded-full p-1 pr-3 hover:bg-slate-100 transition"
      >
        <span
          aria-hidden
          className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
        >
          {iniciais || "?"}
        </span>
        <span className="hidden text-sm font-medium text-slate-700 sm:inline">
          {nome}
        </span>
        <Badge tone={plano === "PRO" ? "indigo" : "default"}>
          {plano === "PRO" ? "Pro" : "Free"}
        </Badge>
      </button>

      {aberto ? (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <Link
            href="/conta"
            role="menuitem"
            className="block px-4 py-2.5 text-sm hover:bg-slate-50"
            onClick={() => setAberto(false)}
          >
            Minha conta
          </Link>
          <Link
            href="/planos"
            role="menuitem"
            className="block px-4 py-2.5 text-sm hover:bg-slate-50"
            onClick={() => setAberto(false)}
          >
            Planos
          </Link>
          <Link
            href="/conta/conquistas"
            role="menuitem"
            className="block px-4 py-2.5 text-sm hover:bg-slate-50"
            onClick={() => setAberto(false)}
          >
            Conquistas
          </Link>
          <div className="border-t border-slate-100" />
          <button
            type="button"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/entrar" })}
            className="block w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50"
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  );
}
