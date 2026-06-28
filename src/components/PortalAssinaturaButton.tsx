"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function PortalAssinaturaButton() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function abrir() {
    setErro(null);
    setCarregando(true);
    try {
      const r = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await r.json().catch(() => ({}));
      if (r.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setErro(data.error || "Não foi possível abrir o portal.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button onClick={abrir} loading={carregando} variant="outline">
        Gerenciar assinatura
      </Button>
      {erro ? (
        <p className="text-xs text-rose-600" role="alert">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
