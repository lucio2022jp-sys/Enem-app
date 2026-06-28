"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { QuestionPlayer, type PlayerQuestion } from "@/components/QuestionPlayer";
import { IATutorButton } from "@/components/IATutorButton";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import type { Alternativa } from "@/types";

interface SolverProps {
  question: PlayerQuestion;
}

export function QuestaoSolver({ question }: SolverProps) {
  const [carregandoSemelhantes, setCarregandoSemelhantes] = useState(false);
  const [semelhantes, setSemelhantes] = useState<any[] | null>(null);
  const [erroSemelhantes, setErroSemelhantes] = useState<string | null>(null);
  const [respondida, setRespondida] = useState(false);
  const { push } = useToast();

  async function onAnswer(escolhida: Alternativa, tempoSegundos: number) {
    const res = await fetch("/api/questoes/responder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        escolhida,
        tempoSegundos,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || "Erro ao salvar resposta");
    }
    const data = await res.json();
    setRespondida(true);
    // Toasts encadeados de ganhos
    const g = data.ganhos;
    if (g) {
      setTimeout(() => {
        if (data.correta) push(`+${5} XP ⚡`, "success");
        else push(`+1 XP (errou, mas tentou)`, "info");
      }, 100);
      if (g.subiu && g.novoNivelLabel) {
        setTimeout(() => {
          push(`Subiu pro nível ${g.novoNivelLabel}! ${g.novoNivelEmoji ?? ""}`, "success");
        }, 1100);
      }
      if (g.missaoCompleta) {
        setTimeout(() => {
          push("Missão do dia concluída! +50 XP 🎯", "success");
        }, 2100);
      }
      if (Array.isArray(g.conquistas) && g.conquistas.length > 0) {
        g.conquistas.forEach((slug: string, i: number) => {
          setTimeout(() => {
            push(`Nova conquista desbloqueada: ${slug.replace(/-/g, " ")} 🏅`, "success");
          }, 3100 + i * 1000);
        });
      }
    }
    return data;
  }

  async function buscarSemelhantes() {
    setCarregandoSemelhantes(true);
    setErroSemelhantes(null);
    try {
      const res = await fetch("/api/questoes/semelhantes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErroSemelhantes(j.error || "Falha ao gerar semelhantes.");
        return;
      }
      const data = await res.json();
      setSemelhantes(data.questions ?? []);
    } finally {
      setCarregandoSemelhantes(false);
    }
  }

  return (
    <div className="space-y-4">
      <QuestionPlayer question={question} onAnswer={onAnswer} />

      {respondida ? (
        <>
          <IATutorButton questionId={question.id} />
          <div className="flex flex-wrap gap-2">
            <Link href="/questoes/proxima">
              <Button>
                Próxima questão <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={buscarSemelhantes}
              loading={carregandoSemelhantes}
            >
              <Sparkles className="mr-1 h-4 w-4" /> Ver semelhantes
            </Button>
          </div>
        </>
      ) : null}

      {erroSemelhantes ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {erroSemelhantes}
        </div>
      ) : null}

      {semelhantes && semelhantes.length > 0 ? (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">
            Questões semelhantes
          </h3>
          <ul className="space-y-2">
            {semelhantes.map((q) => (
              <li key={q.id}>
                <Card>
                  <CardBody>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="indigo">{q.area}</Badge>
                      <Badge>{q.disciplina}</Badge>
                      <Badge tone="amber">{q.dificuldade}</Badge>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-slate-700">
                      {q.enunciado}
                    </p>
                    <div className="mt-3">
                      <Link href={`/questoes/${q.id}`}>
                        <Button size="sm">Resolver</Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
