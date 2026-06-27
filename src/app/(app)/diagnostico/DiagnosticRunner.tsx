"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QuestionPlayer } from "@/components/QuestionPlayer";
import type { Alternativa } from "@/types";

interface RunnerProps {
  questoes: any[];
}

interface PreDiagnostico {
  dificuldades: string[];
  autoavaliacao?: "INICIANTE" | "INTERMEDIARIO" | "AVANCADO";
  objetivo?: string;
  horasDisponiveisSemana?: number;
}

const AREAS_DIFICULDADE = [
  "Matemática",
  "Português / interpretação",
  "Redação",
  "Física",
  "Química",
  "Biologia",
  "História",
  "Geografia",
  "Filosofia / Sociologia",
  "Inglês / Espanhol",
];

export function DiagnosticRunner({ questoes }: RunnerProps) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"intro" | "pre" | "questoes">("intro");
  const [pre, setPre] = useState<PreDiagnostico>({ dificuldades: [] });
  const [idx, setIdx] = useState(0);
  const [respostas, setRespostas] = useState<
    Array<{ questionId: string; escolhida: Alternativa; tempoSegundos: number }>
  >([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (etapa === "intro") {
    return (
      <Card>
        <CardBody>
          <h1 className="text-2xl font-bold text-slate-900">
            Diagnóstico inicial
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Em 2 passos rápidos eu monto sua trilha:
          </p>
          <ol className="mt-3 list-inside list-decimal text-sm text-slate-600">
            <li>Um questionário curto sobre suas dificuldades e objetivo.</li>
            <li>{questoes.length} questões — 3 por área — pra medir onde você está.</li>
          </ol>
          <p className="mt-3 text-xs text-slate-500">
            Você só faz isso uma vez. Depois treina pela trilha.
          </p>
          <div className="mt-6">
            <Button onClick={() => setEtapa("pre")}>Começar</Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  if (etapa === "pre") {
    function toggle(area: string) {
      setPre((p) => {
        const tem = p.dificuldades.includes(area);
        return {
          ...p,
          dificuldades: tem
            ? p.dificuldades.filter((d) => d !== area)
            : [...p.dificuldades, area],
        };
      });
    }

    return (
      <Card>
        <CardBody>
          <h2 className="text-lg font-bold text-slate-900">Sobre você</h2>
          <p className="mt-1 text-sm text-slate-600">
            Marque as áreas onde sente mais dificuldade. Pode marcar várias.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AREAS_DIFICULDADE.map((a) => {
              const ativo = pre.dificuldades.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggle(a)}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    ativo
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                  aria-pressed={ativo}
                >
                  {a}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Como você se descreve no ENEM hoje?
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {(["INICIANTE", "INTERMEDIARIO", "AVANCADO"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPre((p) => ({ ...p, autoavaliacao: v }))}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${
                      pre.autoavaliacao === v
                        ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {v === "INICIANTE"
                      ? "Iniciante"
                      : v === "INTERMEDIARIO"
                        ? "Intermediário"
                        : "Avançado"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="objetivo"
                className="block text-sm font-medium text-slate-700"
              >
                Qual seu objetivo? (opcional)
              </label>
              <input
                id="objetivo"
                type="text"
                placeholder="Ex: passar em medicina na UFRJ"
                value={pre.objetivo ?? ""}
                onChange={(e) =>
                  setPre((p) => ({ ...p, objetivo: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="horas"
                className="block text-sm font-medium text-slate-700"
              >
                Horas disponíveis por semana (opcional)
              </label>
              <input
                id="horas"
                type="number"
                min={0}
                max={80}
                value={pre.horasDisponiveisSemana ?? ""}
                onChange={(e) =>
                  setPre((p) => ({
                    ...p,
                    horasDisponiveisSemana: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                className="mt-1 block w-32 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button variant="outline" onClick={() => setEtapa("intro")}>
              Voltar
            </Button>
            <Button onClick={() => setEtapa("questoes")}>
              Continuar para as questões
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  const atual = questoes[idx];

  async function responder(escolhida: Alternativa, tempoSegundos: number) {
    const nova = [
      ...respostas,
      { questionId: atual.id, escolhida, tempoSegundos },
    ];
    setRespostas(nova);

    if (idx + 1 < questoes.length) {
      setTimeout(() => setIdx(idx + 1), 200);
    } else {
      setEnviando(true);
      try {
        const res = await fetch("/api/diagnostico/finalizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ respostas: nova, preDiagnostico: pre }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setErro(j.error || "Falha ao salvar diagnóstico.");
          return;
        }
        router.push("/diagnostico/resultado");
        router.refresh();
      } finally {
        setEnviando(false);
      }
    }
  }

  if (enviando) {
    return (
      <Card>
        <CardBody>
          <h2 className="text-base font-semibold text-slate-900">
            Calculando seu perfil...
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Estou montando sua trilha agora. Só um segundo.
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs font-medium text-slate-500">
        Questão {idx + 1} de {questoes.length}
      </div>
      <QuestionPlayer
        key={atual.id}
        question={atual}
        numero={idx + 1}
        total={questoes.length}
        showResultadoImediato={false}
        modoSimulado
        onAnswer={async (escolhida, tempo) => {
          await responder(escolhida, tempo);
        }}
      />
      {erro ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {erro}
        </div>
      ) : null}
    </div>
  );
}
