"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import { cn, formatarMinutos, AREA_LABELS } from "@/lib/utils";
import type { Alternativa } from "@/types";

export interface PlayerQuestion {
  id: string;
  area: string;
  disciplina: string;
  conteudo: string;
  dificuldade: string;
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  alternativaD: string;
  alternativaE: string;
  correta?: Alternativa;
  comentario?: string;
  resolucaoPassoPasso?: string;
  explicacaoSimplificada?: string;
  conceitos?: string[];
  dicas?: string[];
}

interface QuestionPlayerProps {
  question: PlayerQuestion;
  onAnswer?: (escolhida: Alternativa, tempoSegundos: number) => Promise<{
    correta: boolean;
    correctAlternative: Alternativa;
    comentario?: string;
    resolucaoPassoPasso?: string;
    explicacaoSimplificada?: string;
    conceitos?: string[];
    dicas?: string[];
    tipoErro?: string | null;
    explicacaoErro?: string | null;
  } | void> | void;
  showResultadoImediato?: boolean;
  numero?: number;
  total?: number;
  modoSimulado?: boolean;
  respostaInicial?: Alternativa | null;
}

const LETRAS: Alternativa[] = ["A", "B", "C", "D", "E"];

export function QuestionPlayer({
  question,
  onAnswer,
  showResultadoImediato = true,
  numero,
  total,
  modoSimulado = false,
  respostaInicial = null,
}: QuestionPlayerProps) {
  const [escolhida, setEscolhida] = useState<Alternativa | null>(
    respostaInicial,
  );
  const [enviada, setEnviada] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [enviando, setEnviando] = useState(false);
  const [inicio] = useState(() => Date.now());
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const segundos = Math.floor((agora - inicio) / 1000);

  const alternativas = useMemo(
    () =>
      [
        question.alternativaA,
        question.alternativaB,
        question.alternativaC,
        question.alternativaD,
        question.alternativaE,
      ].map((t, i) => ({ letra: LETRAS[i], texto: t })),
    [question],
  );

  async function enviar() {
    if (!escolhida || enviada || !onAnswer) return;
    setEnviando(true);
    try {
      const r = await onAnswer(escolhida, segundos);
      if (modoSimulado) {
        setEnviada(true);
        return;
      }
      if (r) setResultado(r);
      setEnviada(true);
    } finally {
      setEnviando(false);
    }
  }

  const correta = resultado?.correctAlternative ?? question.correta;

  return (
    <Card>
      <CardBody>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {numero && total ? (
              <Badge tone="slate">
                {numero}/{total}
              </Badge>
            ) : null}
            <Badge tone="indigo">
              {AREA_LABELS[question.area] ?? question.area}
            </Badge>
            <Badge>{question.disciplina}</Badge>
            <Badge
              tone={
                question.dificuldade === "FACIL"
                  ? "green"
                  : question.dificuldade === "DIFICIL"
                  ? "rose"
                  : "amber"
              }
            >
              {question.dificuldade}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatarMinutos(segundos)}
          </div>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
          {question.enunciado}
        </p>

        <fieldset className="mt-5 space-y-2" aria-label="Alternativas">
          {alternativas.map((alt) => {
            const selecionada = escolhida === alt.letra;
            const isCorreta = enviada && correta === alt.letra;
            const isErrada =
              enviada && selecionada && correta !== alt.letra;

            return (
              <label
                key={alt.letra}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition-colors",
                  enviada
                    ? isCorreta
                      ? "border-emerald-300 bg-emerald-50"
                      : isErrada
                      ? "border-rose-300 bg-rose-50"
                      : "border-slate-200 bg-white"
                    : selecionada
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-slate-200 bg-white hover:border-slate-300",
                )}
              >
                <input
                  type="radio"
                  name={`q-${question.id}`}
                  value={alt.letra}
                  className="mt-0.5 h-4 w-4 accent-indigo-600"
                  checked={selecionada}
                  onChange={() => !enviada && setEscolhida(alt.letra)}
                  disabled={enviada}
                />
                <span className="flex-1">
                  <span className="mr-2 font-semibold text-slate-700">
                    {alt.letra})
                  </span>
                  <span className="text-slate-800">{alt.texto}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        {!enviada ? (
          <div className="mt-5 flex justify-end">
            <Button onClick={enviar} loading={enviando} disabled={!escolhida}>
              {modoSimulado ? "Salvar resposta" : "Responder"}
            </Button>
          </div>
        ) : null}

        {enviada && showResultadoImediato && resultado ? (
          <div className="mt-6 space-y-4">
            <div
              role="status"
              className={cn(
                "rounded-lg border px-4 py-3 text-sm font-medium",
                resultado.correta
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800",
              )}
            >
              {resultado.correta
                ? "Resposta correta. Bom trabalho."
                : `Resposta incorreta. Gabarito: ${correta}.`}
              {resultado.tipoErro && resultado.tipoErro !== "NENHUM" ? (
                <span className="ml-2 text-xs font-normal">
                  Tipo de erro identificado: <strong>{resultado.tipoErro}</strong>
                </span>
              ) : null}
            </div>

            {resultado.explicacaoErro ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <strong className="font-semibold">Onde você tropeçou: </strong>
                {resultado.explicacaoErro}
              </div>
            ) : null}

            <section>
              <h4 className="text-sm font-semibold text-slate-900">
                Comentário
              </h4>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {resultado.comentario ?? question.comentario}
              </p>
            </section>

            {resultado.resolucaoPassoPasso || question.resolucaoPassoPasso ? (
              <section>
                <h4 className="text-sm font-semibold text-slate-900">
                  Resolução passo a passo
                </h4>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {resultado.resolucaoPassoPasso ??
                    question.resolucaoPassoPasso}
                </p>
              </section>
            ) : null}

            {(resultado.explicacaoSimplificada ||
              question.explicacaoSimplificada) ? (
              <section>
                <h4 className="text-sm font-semibold text-slate-900">
                  Em palavras simples
                </h4>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {resultado.explicacaoSimplificada ??
                    question.explicacaoSimplificada}
                </p>
              </section>
            ) : null}

            {(resultado.conceitos ?? question.conceitos)?.length ? (
              <section>
                <h4 className="text-sm font-semibold text-slate-900">
                  Conceitos
                </h4>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
                  {(resultado.conceitos ?? question.conceitos)!.map((c: string) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {(resultado.dicas ?? question.dicas)?.length ? (
              <section>
                <h4 className="text-sm font-semibold text-slate-900">Dicas</h4>
                <ul className="mt-1 list-inside list-disc text-sm text-slate-700">
                  {(resultado.dicas ?? question.dicas)!.map((c: string) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}
