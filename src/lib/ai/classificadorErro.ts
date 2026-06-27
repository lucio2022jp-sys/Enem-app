import { chamarClaude, extrairJSON, temIA } from "./client";
import type { PerfilAluno, TipoErro } from "@/types";

const TIPOS_VALIDOS: TipoErro[] = [
  "CONHECIMENTO",
  "INTERPRETACAO",
  "CALCULO",
  "DISTRACAO",
  "TEMPO",
  "GRAFICO",
  "TABELA",
  "RACIOCINIO",
  "CONCEITUAL",
  "ESTRATEGIA",
];

const SYSTEM_PROMPT = `Você é um especialista em diagnóstico cognitivo de erros em provas do ENEM. Sua tarefa: receber uma questão, a alternativa que o aluno escolheu, o tempo gasto e o perfil do aluno, e classificar o ERRO em UM dos tipos abaixo:

CONHECIMENTO — falta de conteúdo específico
INTERPRETACAO — erro ao interpretar o enunciado/texto
CALCULO — erro aritmético/algébrico
DISTRACAO — descuido, erro bobo
TEMPO — pressa por tempo
GRAFICO — erro ao ler gráfico
TABELA — erro ao ler tabela
RACIOCINIO — falha lógica
CONCEITUAL — confusão de conceito
ESTRATEGIA — escolha ruim de método

Responda SOMENTE em JSON válido (sem markdown, sem texto extra) no formato:
{ "tipoErro": "<UM_DOS_TIPOS>", "explicacao": "explicação curta em pt-BR (máx 3 frases)" }`;

export interface ClassificarErroArgs {
  questao: {
    enunciado: string;
    alternativaA: string;
    alternativaB: string;
    alternativaC: string;
    alternativaD: string;
    alternativaE: string;
    correta: string;
    conteudo: string;
    area: string;
    tempoMedioSegundos: number;
  };
  alternativaEscolhida: string;
  tempoGasto: number;
  perfil?: PerfilAluno | null;
}

export async function classificarErro(args: ClassificarErroArgs): Promise<{
  tipoErro: TipoErro;
  explicacao: string;
}> {
  if (!temIA()) return classificacaoFallback(args);

  const userMessage = `QUESTÃO:
Área: ${args.questao.area} | Conteúdo: ${args.questao.conteudo}
Tempo médio esperado: ${args.questao.tempoMedioSegundos}s

Enunciado: ${args.questao.enunciado}

A) ${args.questao.alternativaA}
B) ${args.questao.alternativaB}
C) ${args.questao.alternativaC}
D) ${args.questao.alternativaD}
E) ${args.questao.alternativaE}

Correta: ${args.questao.correta}
Aluno escolheu: ${args.alternativaEscolhida}
Tempo gasto: ${args.tempoGasto}s

PERFIL DO ALUNO:
- Acerto geral: ${args.perfil ? Math.round(((args.perfil.totalAcertos) / Math.max(1, args.perfil.totalQuestoes)) * 100) : 0}%
- Conteúdos fracos: ${args.perfil?.fracos.join(", ") || "—"}

Classifique o erro e explique brevemente.`;

  try {
    const texto = await chamarClaude({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      maxTokens: 400,
      temperature: 0.3,
    });
    const obj = extrairJSON<{ tipoErro: string; explicacao: string }>(texto);
    const tipo = (obj.tipoErro || "").toUpperCase();
    const valido = TIPOS_VALIDOS.includes(tipo as TipoErro)
      ? (tipo as TipoErro)
      : "CONHECIMENTO";
    return {
      tipoErro: valido,
      explicacao: obj.explicacao || "Sem explicação detalhada.",
    };
  } catch (err) {
    console.error("[classificarErro] falhou:", err);
    return classificacaoFallback(args);
  }
}

function classificacaoFallback(args: ClassificarErroArgs): {
  tipoErro: TipoErro;
  explicacao: string;
} {
  if (args.tempoGasto > args.questao.tempoMedioSegundos * 1.8) {
    return {
      tipoErro: "TEMPO",
      explicacao: "Você passou bem mais tempo do que o esperado nesta questão.",
    };
  }
  if (args.tempoGasto < args.questao.tempoMedioSegundos * 0.4) {
    return {
      tipoErro: "DISTRACAO",
      explicacao: "Resposta muito rápida — possível descuido.",
    };
  }
  return {
    tipoErro: "CONHECIMENTO",
    explicacao: "Reveja o conteúdo desta questão e refaça com calma.",
  };
}
