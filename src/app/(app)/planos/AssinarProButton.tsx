"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AssinarProButton() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(false);

  async function assinar() {
    setCarregando(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      if (res.ok) {
        router.push("/inicio?upgraded=1");
        router.refresh();
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <Button onClick={assinar} loading={carregando} className="w-full">
      Assinar Pro
    </Button>
  );
}
