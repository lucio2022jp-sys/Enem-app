import { chamarClaude, extrairJSON, temIA } from "./client";

const SYSTEM_PROMPT = `Você é professor especialista no ENEM, dedicado a explicar questões em múltiplas camadas de profundidade. Para uma questão fornecida, produza:

- resolucaoPassoPasso: resolução técnica passo a passo
- explicacaoSimplificada: explicação simples e direta, com analogias
- explicacaoDetalhada: explicação aprofundada, com contexto histórico ou disciplinar
- conceitos: lista dos conceitos-chave envolvidos
- assuntosRelacionados: assuntos correlatos para revisão
- dicas: 3 a 5 dicas práticas pro aluno

Responda SOMENTE com JSON válido, sem markdown:
{
  "resolucaoPassoPasso": string,
  "explicacaoSimplificada": string,
  "explicacaoDetalhada": string,
  "conceitos": string[],
  "assuntosRelacionados": string[],
  "dicas": string[]
}`;

export interface ExplicarArgs {
  questao: {
    enunciado: string;
    alternativaA: string;
    alternativaB: string;
    alternativaC: string;
    alternativaD: string;
    alternativaE: string;
    correta: string;
    area: string;
    conteudo: string;
  };
}

export interface ExplicacaoIA {
  resolucaoPassoPasso: string;
  explicacaoSimplificada: string;
  explicacaoDetalhada: string;
  conceitos: string[];
  assuntosRelacionados: string[];
  dicas: string[];
}

export async function explicar(args: ExplicarArgs): Promise<ExplicacaoIA | null> {
  if (!temIA()) return null;

  const userMessage = `Área: ${args.questao.area} | Conteúdo: ${args.questao.conteudo}

Enunciado: ${args.questao.enunciado}

A) ${args.questao.alternativaA}
B) ${args.questao.alternativaB}
C) ${args.questao.alternativaC}
D) ${args.questao.alternativaD}
E) ${args.questao.alternativaE}

Correta: ${args.questao.correta}

Gere a explicação completa em JSON.`;

  try {
    const texto = await chamarClaude({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      maxTokens: 2000,
      temperature: 0.5,
    });
    const obj = extrairJSON<ExplicacaoIA>(texto);
    return {
      resolucaoPassoPasso: obj.resolucaoPassoPasso || "",
      explicacaoSimplificada: obj.explicacaoSimplificada || "",
      explicacaoDetalhada: obj.explicacaoDetalhada || "",
      conceitos: Array.isArray(obj.conceitos) ? obj.conceitos : [],
      assuntosRelacionados: Array.isArray(obj.assuntosRelacionados)
        ? obj.assuntosRelacionados
        : [],
      dicas: Array.isArray(obj.dicas) ? obj.dicas : [],
    };
  } catch (err) {
    console.error("[explicar] falhou:", err);
    return null;
  }
}
