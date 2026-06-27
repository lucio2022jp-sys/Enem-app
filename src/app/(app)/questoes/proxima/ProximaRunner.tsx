"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface RunnerProps {
  trackItemId?: string;
  modo?: string;
  area?: string;
}

export function ProximaRunner({ trackItemId, modo, area }: RunnerProps) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      setErro(null);
      setCarregando(true);
      try {
        const res = await fetch("/api/questoes/gerar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackItemId, modo, area }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          if (!cancelado) setErro(j.error || "Falha ao gerar questão.");
          return;
        }
        const data = await res.json();
        if (!cancelado && data.questionId) {
          router.push(`/questoes/${data.questionId}`);
        }
      } catch (e) {
        if (!cancelado) setErro("Erro inesperado.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [trackItemId, modo, area, router]);

  if (erro) {
    return (
      <div className="space-y-3">
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {erro}
        </div>
        <Button onClick={() => location.reload()}>Tentar de novo</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm text-slate-600">
      <div className="h-3 w-3 animate-pulse rounded-full bg-indigo-500" />
      {carregando ? "Carregando questão..." : "Redirecionando..."}
    </div>
  );
}
