"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

interface FormProps {
  id: string;
  valoresIA: { c1: number; c2: number; c3: number; c4: number; c5: number };
}

export function RevisaoForm({ id, valoresIA }: FormProps) {
  const router = useRouter();
  const [valores, setValores] = useState(valoresIA);
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const total = valores.c1 + valores.c2 + valores.c3 + valores.c4 + valores.c5;

  function setComp(k: keyof typeof valores, v: number) {
    setValores((s) => ({ ...s, [k]: v }));
  }

  async function enviar() {
    setErro(null);
    if (comentario.trim().length < 10) {
      setErro("Escreva um comentário (mínimo 10 caracteres).");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch(`/api/redacao/${id}/corrigir-humano`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...valores, comentario }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErro(j.error || "Falha ao salvar.");
        return;
      }
      router.push("/professor/redacoes");
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-base font-semibold text-slate-900">Sua revisão</h2>
        <p className="text-xs text-slate-500">
          Ajuste as 5 competências (0-200) e comente.
        </p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {(["c1", "c2", "c3", "c4", "c5"] as const).map((k, i) => (
            <div key={k}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <Label htmlFor={`comp-${k}`}>Competência {i + 1}</Label>
                <input
                  type="number"
                  min={0}
                  max={200}
                  step={20}
                  value={valores[k]}
                  onChange={(e) =>
                    setComp(
                      k,
                      Math.max(0, Math.min(200, Number(e.target.value) || 0)),
                    )
                  }
                  className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                />
              </div>
              <input
                id={`comp-${k}`}
                type="range"
                min={0}
                max={200}
                step={20}
                value={valores[k]}
                onChange={(e) => setComp(k, Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-baseline justify-between border-t border-slate-200 pt-3">
          <span className="text-sm text-slate-600">Nota total</span>
          <span className="text-3xl font-bold text-indigo-600">{total}</span>
        </div>

        <div className="mt-4">
          <Label htmlFor="coment">Comentário do professor</Label>
          <Textarea
            id="coment"
            rows={6}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Aponte pontos fortes e o que melhorar."
          />
        </div>

        {erro ? (
          <p role="alert" className="mt-2 text-sm text-rose-600">
            {erro}
          </p>
        ) : null}

        <div className="mt-4 flex justify-end">
          <Button onClick={enviar} loading={enviando}>
            Concluir revisão
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
