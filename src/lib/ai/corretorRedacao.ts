import { chamarClaude, extrairJSON, temIA } from "./client";

const SYSTEM_PROMPT = `Você é avaliador oficial de redações no padrão ENEM. Sua tarefa: corrigir uma redação dissertativo-argumentativa segundo as cinco competências, cada uma de 0 a 200, totalizando 0 a 1000.

COMPETÊNCIAS:
C1 — Domínio da norma padrão (0-200)
C2 — Compreensão da proposta e aplicação de conceitos das várias áreas (0-200)
C3 — Seleção, relação e organização de informações, fatos e argumentos (0-200)
C4 — Demonstração de conhecimento dos mecanismos linguísticos (0-200)
C5 — Elaboração de proposta de intervenção respeitando os direitos humanos (0-200)

Sua saída deve ser SOMENTE JSON válido, sem markdown:
{
  "c1": number, "c2": number, "c3": number, "c4": number, "c5": number,
  "nota": number,
  "comentario": string,
  "sugestoes": string[],
  "reescrita": string
}

A nota é a soma das cinco competências. Use múltiplos de 20 dentro de 0-200. O comentário é uma análise geral (3-5 frases). Sugestões: 4-6 melhorias específicas. Reescrita: versão revisada do texto do aluno, mantendo a tese e ampliando-a.`;

export interface CorrigirRedacaoArgs {
  tema: string;
  texto: string;
}

export interface CorrecaoIA {
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  nota: number;
  comentario: string;
  sugestoes: string[];
  reescrita: string;
}

export async function corrigirRedacao(args: CorrigirRedacaoArgs): Promise<CorrecaoIA> {
  if (!temIA()) return correcaoFallback(args);

  const userMessage = `TEMA:
${args.tema}

TEXTO DO ALUNO:
${args.texto}

Corrija agora e devolva apenas o JSON.`;

  try {
    const texto = await chamarClaude({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      maxTokens: 4000,
      temperature: 0.4,
    });
    const obj = extrairJSON<CorrecaoIA>(texto);
    const c1 = clampN(obj.c1);
    const c2 = clampN(obj.c2);
    const c3 = clampN(obj.c3);
    const c4 = clampN(obj.c4);
    const c5 = clampN(obj.c5);
    return {
      c1,
      c2,
      c3,
      c4,
      c5,
      nota: c1 + c2 + c3 + c4 + c5,
      comentario: obj.comentario || "Correção indisponível no momento.",
      sugestoes: Array.isArray(obj.sugestoes) ? obj.sugestoes : [],
      reescrita: obj.reescrita || "",
    };
  } catch (err) {
    console.error("[corrigirRedacao] falhou:", err);
    return correcaoFallback(args);
  }
}

function clampN(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(200, Math.round(v / 20) * 20));
}

function correcaoFallback(args: CorrigirRedacaoArgs): CorrecaoIA {
  const palavras = args.texto.trim().split(/\s+/).filter(Boolean).length;
  const base = Math.min(160, Math.max(80, Math.floor(palavras / 2)));
  return {
    c1: base,
    c2: base,
    c3: base,
    c4: base,
    c5: base,
    nota: base * 5,
    comentario:
      "Correção automática simulada (IA indisponível). Sua redação foi recebida e poderá ser revisada por um professor parceiro.",
    sugestoes: [
      "Revise a norma padrão antes de enviar.",
      "Garanta uma tese clara já na introdução.",
      "Use ao menos um repertório sociocultural produtivo.",
      "Apresente proposta de intervenção com agente, ação, meio e finalidade.",
    ],
    reescrita: "",
  };
}
