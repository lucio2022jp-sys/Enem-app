"use client";

import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

type Tipo =
  | "INFANTIL"
  | "RESUMIDO"
  | "DETALHADO"
  | "ANALOGIAS"
  | "PASSO_A_PASSO"
  | "EXEMPLO_PARECIDO"
  | "LIVRE";

const OPCOES: Array<{ tipo: Tipo; label: string; emoji: string }> = [
  { tipo: "RESUMIDO", label: "Resumido", emoji: "⚡" },
  { tipo: "DETALHADO", label: "Detalhado", emoji: "📖" },
  { tipo: "PASSO_A_PASSO", label: "Passo a passo", emoji: "🪜" },
  { tipo: "INFANTIL", label: "Como se eu tivesse 10 anos", emoji: "👶" },
  { tipo: "ANALOGIAS", label: "Com analogias", emoji: "💡" },
  { tipo: "EXEMPLO_PARECIDO", label: "Um exemplo parecido", emoji: "🔁" },
  { tipo: "LIVRE", label: "Pergunta livre", emoji: "💬" },
];

interface Conversa {
  pergunta: string;
  resposta: string;
  carregando?: boolean;
}

export function IATutorButton({ questionId }: { questionId: string }) {
  const [aberto, setAberto] = useState(false);
  const [historico, setHistorico] = useState<Conversa[]>([]);
  const [perguntaLivre, setPerguntaLivre] = useState("");
  const [tipoEscolhido, setTipoEscolhido] = useState<Tipo | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function executar(tipo: Tipo, perguntaTexto?: string) {
    setEnviando(true);
    setTipoEscolhido(tipo);
    const labelOpcao = OPCOES.find((o) => o.tipo === tipo)?.label ?? "Pergunta";
    const labelPergunta = tipo === "LIVRE" && perguntaTexto
      ? perguntaTexto
      : labelOpcao;

    setHistorico((h) => [
      ...h,
      { pergunta: labelPergunta, resposta: "", carregando: true },
    ]);

    try {
      const res = await fetch(`/api/questoes/${questionId}/perguntar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          perguntaLivre: tipo === "LIVRE" ? perguntaTexto : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const resposta = data.resposta || "Não foi possível responder agora.";
      setHistorico((h) => {
        const last = h[h.length - 1];
        if (!last) return h;
        return [
          ...h.slice(0, -1),
          { ...last, resposta, carregando: false },
        ];
      });
    } catch {
      setHistorico((h) => {
        const last = h[h.length - 1];
        if (!last) return h;
        return [
          ...h.slice(0, -1),
          {
            ...last,
            resposta: "Erro ao falar com a IA. Tente novamente.",
            carregando: false,
          },
        ];
      });
    } finally {
      setEnviando(false);
      setTipoEscolhido(null);
    }
  }

  function submitLivre(e: React.FormEvent) {
    e.preventDefault();
    const t = perguntaLivre.trim();
    if (!t) return;
    setPerguntaLivre("");
    void executar("LIVRE", t);
  }

  if (!aberto) {
    return (
      <Button
        variant="outline"
        onClick={() => setAberto(true)}
        className="gap-1.5"
      >
        <Sparkles className="h-4 w-4 text-indigo-600" />
        Perguntar pra IA
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            IA Professora Particular
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-md p-1 text-slate-500 hover:bg-white"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-3 text-xs text-slate-600">
        Escolha como você quer a explicação. Pode pedir várias seguidas.
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {OPCOES.filter((o) => o.tipo !== "LIVRE").map((o) => (
          <button
            key={o.tipo}
            type="button"
            onClick={() => void executar(o.tipo)}
            disabled={enviando}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              tipoEscolhido === o.tipo
                ? "border-indigo-600 bg-indigo-600 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <span className="mr-1">{o.emoji}</span>
            {o.label}
          </button>
        ))}
      </div>

      {historico.length > 0 ? (
        <ul className="mb-4 space-y-3">
          {historico.map((c, i) => (
            <li key={i} className="space-y-2">
              <div className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white">
                {c.pergunta}
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                {c.carregando ? (
                  <span className="inline-flex items-center gap-2 text-slate-500">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-500" />
                    pensando...
                  </span>
                ) : (
                  c.resposta
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <form onSubmit={submitLivre} className="flex items-center gap-2">
        <input
          type="text"
          value={perguntaLivre}
          onChange={(e) => setPerguntaLivre(e.target.value)}
          placeholder="Faça sua pergunta livre..."
          className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          disabled={enviando}
        />
        <Button
          type="submit"
          size="sm"
          loading={enviando && tipoEscolhido === "LIVRE"}
          disabled={!perguntaLivre.trim()}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
}
