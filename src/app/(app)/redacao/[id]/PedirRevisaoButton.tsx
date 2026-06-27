"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function PedirRevisaoButton({ id }: { id: string }) {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function pedir() {
    setErro(null);
    setCarregando(true);
    try {
      const res = await fetch(`/api/redacao/${id}/pedir-revisao`, {
        method: "POST",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErro(j.error || "Não foi possível solicitar agora.");
        return;
      }
      router.refresh();
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={pedir} loading={carregando}>
        Pedir revisão de professor
      </Button>
      {erro ? (
        <p role="alert" className="text-sm text-rose-600">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
