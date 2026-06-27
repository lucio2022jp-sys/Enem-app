"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Layers, Clock, Target, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AREAS, AREA_LABELS } from "@/lib/utils";

type Modo = "OFICIAL" | "AREA" | "TEMPO" | "FRAQUEZAS" | "LIVRE";

const MODOS: Array<{
  key: Modo;
  titulo: string;
  descricao: string;
  Icon: typeof Trophy;
}> = [
  {
    key: "OFICIAL",
    titulo: "Oficial",
    descricao: "180 questões nos moldes do ENEM, 5h30 de duração.",
    Icon: Trophy,
  },
  {
    key: "AREA",
    titulo: "Por área",
    descricao: "Escolha uma ou mais áreas do conhecimento.",
    Icon: Layers,
  },
  {
    key: "TEMPO",
    titulo: "Cronometrado",
    descricao: "Defina duração e quantidade. Treine sob pressão.",
    Icon: Clock,
  },
  {
    key: "FRAQUEZAS",
    titulo: "Fraquezas",
    descricao: "Foca nas áreas em que você tem mais erros.",
    Icon: Target,
  },
  {
    key: "LIVRE",
    titulo: "Livre",
    descricao: "Quantidade livre, sem filtros.",
    Icon: Shuffle,
  },
];

export function NovoSimuladoForm() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("OFICIAL");
  const [total, setTotal] = useState(20);
  const [duracao, setDuracao] = useState<number | "">("");
  const [areas, setAreas] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function toggleArea(a: string) {
    setAreas((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a],
    );
  }

  async function criar() {
    setErro(null);

    if (modo === "AREA" && areas.length === 0) {
      setErro("Selecione pelo menos uma área.");
      return;
    }

    setCarregando(true);
    try {
      const body: Record<string, unknown> = {
        tipo: modo,
        totalQuestoes: modo === "OFICIAL" ? 180 : total,
      };
      if (modo === "AREA") body.areas = areas;
      if (modo === "TEMPO" && typeof duracao === "number") {
        body.duracaoMin = duracao;
      }

      const res = await fetch("/api/simulado/montar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {MODOS.map((m) => {
          const ativo = modo === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setModo(m.key)}
              className={`flex items-start gap-3 rounded-lg border p-3 text-left transition ${
                ativo
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <span
                className={`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-md ${
                  ativo ? "bg-indigo-500 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <m.Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {m.titulo}
                </span>
                <span className="block text-xs text-slate-500">
                  {m.descricao}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {modo !== "OFICIAL" ? (
        <div>
          <label
            htmlFor="total"
            className="block text-xs font-medium text-slate-600"
          >
            Quantidade de questões
          </label>
          <input
            id="total"
            type="number"
            min={5}
            max={90}
            value={total}
            onChange={(e) =>
              setTotal(Math.max(5, Math.min(90, Number(e.target.value) || 5)))
            }
            className="mt-1 w-32 rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      ) : null}

      {modo === "TEMPO" ? (
        <div>
          <label
            htmlFor="duracao"
            className="block text-xs font-medium text-slate-600"
          >
            Duração em minutos
          </label>
          <input
            id="duracao"
            type="number"
            min={5}
            max={360}
            value={duracao}
            onChange={(e) => {
              const v = e.target.value;
              setDuracao(v === "" ? "" : Number(v));
            }}
            placeholder={`${Math.max(15, Math.round(total * 2.5))}`}
            className="mt-1 w-32 rounded-md border border-slate-200 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      ) : null}

      {modo === "AREA" ? (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">Áreas</p>
          <div className="flex flex-wrap gap-2">
            {AREAS.map((a) => {
              const ativo = areas.includes(a.key);
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => toggleArea(a.key)}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    ativo
                      ? "border-indigo-500 bg-indigo-500 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {AREA_LABELS[a.key]}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col items-start gap-2">
        <Button onClick={criar} loading={carregando}>
          Montar simulado
        </Button>
        {erro ? (
          <p role="alert" className="text-xs text-rose-600">
            {erro}
          </p>
        ) : null}
      </div>
    </div>
  );
}
