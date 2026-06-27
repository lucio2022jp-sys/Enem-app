"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function NovoSimuladoButton() {
  return (
    <Link href="/simulado/novo">
      <Button>Novo simulado</Button>
    </Link>
  );
}
