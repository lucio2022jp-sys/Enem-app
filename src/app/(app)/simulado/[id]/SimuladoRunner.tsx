"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface QuestaoSim {
  id: string;
  area: string;
  disciplina: string;
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  alternativaD: string;
  alternativaE: string;
}

interface Props {
  id: string;
  titulo: string;
  duracaoMin: number;
  iniciadoEm: string;
  respostasIniciais: Record<string, string>;
  questoes: QuestaoSim[];
}

const LETRAS: ("A" | "B" | "C" | "D" | "E")[] = ["A", "B", "C", "D", "E"];

export function SimuladoRunner({
  id,
  titulo,
  duracaoMin,
  iniciadoEm,
  respostasIniciais,
  questoes,
}: Props) {
  const router = useRouter();
  const [idx, setIdx] = useState(0);
  const [respostas, setRespostas] =
    useState<Record<string, string>>(respostasIniciais);
  const [enviando, setEnviando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [salvando, setSalvando] = useState<"OK" | "SALVANDO" | "ERRO">("OK");
  const [restante, setRestante] = useState<number>(0);
  const ultimoSalvoRef = useRef<string>(JSON.stringify(respostasIniciais));

  const fim = useMemo(() => {
    const inicio = new Date(iniciadoEm).getTime();
    return inicio + duracaoMin * 60_000;
  }, [iniciadoEm, duracaoMin]);

  // Autosave debounced: salva 800ms depois da última mudança
  useEffect(() => {
    const atual = JSON.stringify(respostas);
    if (atual === ultimoSalvoRef.current) return;
    setSalvando("SALVANDO");
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/simulado/${id}/salvar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ respostas }),
        });
        if (r.ok) {
          ultimoSalvoRef.current = atual;
          setSalvando("OK");
        } else {
          setSalvando("ERRO");
        }
      } catch {
        setSalvando("ERRO");
      }
    }, 800);
    return () => clearTimeout(t);
  }, [respostas, id]);

  useEffect(() => {
    function tick() {
      const r = Math.max(0, fim - Date.now());
      setRestante(r);
      if (r === 0) finalizar();
    }
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, [fim]);

  const q = questoes[idx];
  const total = questoes.length;
  const respondidas = Object.keys(respostas).length;

  function escolher(letra: string) {
    if (!q) return;
    setRespostas((r) => ({ ...r, [q.id]: letra }));
  }

  async function finalizar() {
    if (enviando) return;
    setEnviando(true);
    try {
      const res = await fetch(`/api/simulado/${id}/finalizar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ respostas }),
      });
      if (res.ok) {
        router.push(`/simulado/${id}/resultado`);
        router.refresh();
      }
    } finally {
      setEnviando(false);
    }
  }

  async function cancelar() {
    if (cancelando) return;
    const ok = window.confirm(
      "Tem certeza que quer cancelar este simulado? Suas respostas serão perdidas.",
    );
    if (!ok) return;
    setCancelando(true);
    try {
      const r = await fetch(`/api/simulado/${id}/cancelar`, { method: "POST" });
      if (r.ok) {
        router.push("/simulado");
        router.refresh();
      }
    } finally {
      setCancelando(false);
    }
  }

  if (!q) {
    return (
      <p className="text-sm text-slate-600">
        Nenhuma questão neste simulado.
      </p>
    );
  }

  const min = Math.floor(restante / 60_000);
  const seg = Math.floor((restante % 60_000) / 1000);

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-bold text-slate-900">{titulo}</h1>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs",
                salvando === "OK" && "text-emerald-600",
                salvando === "SALVANDO" && "text-slate-500",
                salvando === "ERRO" && "text-rose-600",
              )}
              aria-live="polite"
            >
              {salvando === "OK"
                ? "Salvo"
                : salvando === "SALVANDO"
                  ? "Salvando..."
                  : "Falha ao salvar"}
            </span>
            <div
              className={cn(
                "rounded-md px-3 py-1 font-mono text-sm",
                restante < 60_000
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-700",
              )}
              aria-live="polite"
            >
              {String(min).padStart(2, "0")}:{String(seg).padStart(2, "0")}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="indigo">
                Questão {idx + 1} / {total}
              </Badge>
              <Badge>{q.area}</Badge>
              <Badge>{q.disciplina}</Badge>
            </div>
          </CardHeader>
          <CardBody>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {q.enunciado}
            </p>
            <ul className="mt-4 space-y-2">
              {LETRAS.map((l) => {
                const texto = (q as any)[`alternativa${l}`] as string;
                const escolhida = respostas[q.id] === l;
                return (
                  <li key={l}>
                    <button
                      type="button"
                      onClick={() => escolher(l)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-lg border p-3 text-left text-sm transition",
                        escolhida
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-indigo-300",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          escolhida
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-700",
                        )}
                      >
                        {l}
                      </span>
                      <span className="text-slate-800">{texto}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setIdx((i) => Math.max(0, i - 1))}
                disabled={idx === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                disabled={idx === total - 1}
              >
                Próxima
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      <aside className="space-y-3">
        <Card>
          <CardBody>
            <div className="text-sm text-slate-600">
              Respondidas: {respondidas} / {total}
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1">
              {questoes.map((qq, i) => {
                const ok = !!respostas[qq.id];
                const ativo = i === idx;
                return (
                  <button
                    key={qq.id}
                    onClick={() => setIdx(i)}
                    className={cn(
                      "h-8 rounded text-xs font-semibold transition",
                      ativo
                        ? "ring-2 ring-indigo-500"
                        : "",
                      ok
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    )}
                    aria-label={`Ir para questão ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <Button
              className="mt-4 w-full"
              onClick={finalizar}
              loading={enviando}
            >
              Finalizar simulado
            </Button>
            <Button
              className="mt-2 w-full"
              variant="ghost"
              onClick={cancelar}
              loading={cancelando}
              disabled={enviando}
            >
              Cancelar
            </Button>
          </CardBody>
        </Card>
      </aside>
    </div>
  );
}
