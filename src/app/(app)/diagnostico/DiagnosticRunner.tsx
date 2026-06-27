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

export function DiagnosticRunner({ questoes }: RunnerProps) {
  const router = useRouter();
  const [iniciado, setIniciado] = useState(false);
  const [idx, setIdx] = useState(0);
  const [respostas, setRespostas] = useState<
    Array<{ questionId: string; escolhida: Alternativa; tempoSegundos: number }>
  >([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!iniciado) {
    return (
      <Card>
        <CardBody>
          <h1 className="text-2xl font-bold text-slate-900">
            Diagnóstico inicial
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Você vai responder {questoes.length} questões — 3 por área — pra eu
            entender onde você está hoje. Não tem segredo: responda do seu
            jeito, mesmo chutando se não souber.
          </p>
          <ul className="mt-4 list-inside list-disc text-sm text-slate-600">
            <li>Não há cronômetro de prova, mas o tempo de cada questão é registrado.</li>
            <li>Ao final, sua trilha e nota estimada são montadas automaticamente.</li>
            <li>Você só faz isso uma vez. Depois treina pela trilha.</li>
          </ul>
          <div className="mt-6">
            <Button onClick={() => setIniciado(true)}>Começar diagnóstico</Button>
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
          body: JSON.stringify({ respostas: nova }),
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
