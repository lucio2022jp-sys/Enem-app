"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function NovoSimuladoButton() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function criar() {
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch("/api/simulado/montar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalQuestoes: 20, tipo: "PERSONALIZADO" }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErro(j.error || "Falha ao montar simulado.");
        return;
      }
      const data = await res.json();
      router.push(`/simulado/${data.id}`);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button onClick={criar} loading={carregando}>
        Novo simulado personalizado
      </Button>
      {erro ? (
        <p role="alert" className="text-xs text-rose-600">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
