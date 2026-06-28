import { chamarClaude, extrairJSON, temIA } from "./client";

/* =========================
 * IA Professora Particular
 * ========================= */

export type TipoExplicacao =
  | "INFANTIL"
  | "RESUMIDO"
  | "DETALHADO"
  | "ANALOGIAS"
  | "PASSO_A_PASSO"
  | "EXEMPLO_PARECIDO"
  | "LIVRE";

export const TIPO_LABEL: Record<TipoExplicacao, string> = {
  INFANTIL: "Explica como se eu tivesse 10 anos",
  RESUMIDO: "Resumido",
  DETALHADO: "Detalhado",
  ANALOGIAS: "Usando analogias",
  PASSO_A_PASSO: "Passo a passo",
  EXEMPLO_PARECIDO: "Um exemplo parecido",
  LIVRE: "Pergunta livre",
};

const SYSTEM_PERGUNTAR = `Você é um professor particular do ENEM, paciente e direto, que adapta o nível da explicação ao que o aluno pedir. Responda em português brasileiro, com formatação simples (sem markdown complexo, sem títulos H1).

Regras:
- Não invente alternativas diferentes do gabarito.
- Evite jargão desnecessário.
- Quando indicado, use analogias do dia a dia, comparações e exemplos concretos.
- Mantenha foco no que o aluno pediu.
- Limite-se a no máximo 400 palavras.`;

interface QuestaoExp {
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  alternativaD: string;
  alternativaE: string;
  correta: string;
  area: string;
  conteudo: string;
  comentario?: string;
}

export interface PerguntarArgs {
  questao: QuestaoExp;
  tipo: TipoExplicacao;
  perguntaLivre?: string;
}

function questaoBloco(q: QuestaoExp): string {
  return `Área: ${q.area} | Conteúdo: ${q.conteudo}

Enunciado:
${q.enunciado}

A) ${q.alternativaA}
B) ${q.alternativaB}
C) ${q.alternativaC}
D) ${q.alternativaD}
E) ${q.alternativaE}

Gabarito: ${q.correta}`;
}

function instrucao(tipo: TipoExplicacao, perguntaLivre?: string): string {
  switch (tipo) {
    case "INFANTIL":
      return "Explique o porquê da alternativa correta como se o aluno tivesse 10 anos. Use frases curtas, vocabulário simples e exemplos do cotidiano.";
    case "RESUMIDO":
      return "Em até 4 frases, explique por que a alternativa correta é a certa. Vá direto ao ponto.";
    case "DETALHADO":
      return "Faça uma explicação aprofundada: conceito por trás, contexto disciplinar e por que cada alternativa errada está errada. Até 400 palavras.";
    case "ANALOGIAS":
      return "Use 2 ou 3 analogias do dia a dia para tornar o raciocínio intuitivo. Liste as analogias com hífen no início da linha.";
    case "PASSO_A_PASSO":
      return "Explique a resolução em passos numerados (1., 2., 3., ...), mostrando cada decisão de cálculo ou raciocínio até chegar à correta.";
    case "EXEMPLO_PARECIDO":
      return "Crie um exemplo análogo (mesmo conceito, contexto diferente), mostre como ele se resolve e termine com um paralelo com a questão original.";
    case "LIVRE":
      return `O aluno fez a seguinte pergunta sobre a questão. Responda de forma clara e específica.\n\nPergunta do aluno: ${perguntaLivre || ""}`;
  }
}

export async function perguntarIA(
  args: PerguntarArgs,
): Promise<{ resposta: string; tipo: TipoExplicacao } | null> {
  if (!temIA()) return null;

  const user = `${questaoBloco(args.questao)}

${args.questao.comentario ? `Resolução oficial: ${args.questao.comentario}\n\n` : ""}TAREFA:
${instrucao(args.tipo, args.perguntaLivre)}`;

  try {
    const texto = await chamarClaude({
      systemPrompt: SYSTEM_PERGUNTAR,
      userMessage: user,
      maxTokens: 800,
      temperature: 0.5,
    });
    return { resposta: texto.trim(), tipo: args.tipo };
  } catch (e) {
    console.error("[perguntarIA] falhou:", e);
    return null;
  }
}

/* =========================
 * Função legada usada na geração de questão
 * ========================= */

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
