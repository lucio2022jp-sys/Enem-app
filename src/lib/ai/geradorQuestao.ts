import { chamarClaude, extrairJSON, temIA } from "./client";
import type { Area, Dificuldade, PerfilAluno, QuestaoIA } from "@/types";

const SYSTEM_PROMPT = `Você é um especialista em elaboração de questões no padrão do ENEM. Sua missão é gerar questões inéditas, de alta qualidade, mantendo o mesmo estilo, nível de dificuldade, competências e habilidades cobradas pelo exame.

Toda questão deve ser baseada em três pilares:

1. PADRÃO OFICIAL DO ENEM
Reproduza estrutura dos enunciados, contextualização, interdisciplinaridade, nível de dificuldade, competências e habilidades avaliadas, tempo médio de resolução e linguagem do ENEM. Questões devem ser inéditas, sem copiar oficiais.

2. MATRIZ DE REFERÊNCIA
Cada questão deve estar vinculada a: área do conhecimento, disciplina, competência, habilidade, conteúdo, grau de dificuldade.

3. PERFIL INDIVIDUAL DO ALUNO
Antes de gerar, analise as informações de perfil fornecidas: questões respondidas, taxa de acertos/erros, tempo médio, assuntos dominados, assuntos com dificuldade, histórico de revisões, evolução do desempenho, frequência de estudo.

REGRAS:
- Aumente questões dos assuntos fracos do aluno; reduza dos dominados (faça apenas revisão periódica).
- Jamais gerar questão repetida; varie sempre o contexto.
- Saída APENAS JSON válido conforme schema solicitado, sem texto adicional.

SCHEMA DE SAÍDA OBRIGATÓRIO (JSON válido, sem comentários, sem texto fora do JSON):
{
  "area": "LINGUAGENS" | "HUMANAS" | "NATUREZA" | "MATEMATICA",
  "disciplina": string,
  "competencia": string,
  "habilidade": string,
  "conteudo": string,
  "subconteudo": string,
  "enunciado": string,
  "alternativaA": string,
  "alternativaB": string,
  "alternativaC": string,
  "alternativaD": string,
  "alternativaE": string,
  "correta": "A" | "B" | "C" | "D" | "E",
  "comentario": string,
  "resolucaoPassoPasso": string,
  "explicacaoSimplificada": string,
  "explicacaoDetalhada": string,
  "conceitos": string[],
  "assuntosRelacionados": string[],
  "dicas": string[],
  "dificuldade": "FACIL" | "MEDIO" | "DIFICIL",
  "tempoMedioSegundos": number,
  "tags": string[]
}

Responda SOMENTE com o JSON. Não use markdown, não inclua \`\`\`. Apenas o objeto JSON cru.`;

export interface GerarQuestaoArgs {
  perfil?: PerfilAluno | null;
  area: Area;
  conteudo?: string;
  dificuldade?: Dificuldade;
  evitar?: string[];
}

function resumirPerfil(perfil?: PerfilAluno | null): string {
  if (!perfil) return "Aluno novo, sem histórico ainda.";
  const linhas: string[] = [];
  linhas.push(
    `- Total de questões respondidas: ${perfil.totalQuestoes} (acertos: ${perfil.totalAcertos}, erros: ${perfil.totalErros})`,
  );
  linhas.push(`- Tempo médio por questão: ${perfil.tempoMedioSegundos}s`);
  const areas = Object.entries(perfil.areaScores)
    .map(([a, v]) => `${a}: ${v}%`)
    .join(", ");
  if (areas) linhas.push(`- Desempenho por área: ${areas}`);
  if (perfil.dominados.length)
    linhas.push(`- Conteúdos dominados: ${perfil.dominados.join(", ")}`);
  if (perfil.fracos.length)
    linhas.push(`- Conteúdos fracos: ${perfil.fracos.join(", ")}`);
  if (perfil.ultimosErros && perfil.ultimosErros.length) {
    linhas.push("- Últimos erros:");
    perfil.ultimosErros.slice(0, 5).forEach((e, i) => {
      linhas.push(
        `  ${i + 1}. [${e.area}/${e.conteudo}] tipo de erro: ${e.tipoErro ?? "N/A"}`,
      );
    });
  }
  if (perfil.notaEstimadaEnem != null)
    linhas.push(`- Nota estimada ENEM: ${perfil.notaEstimadaEnem}`);
  return linhas.join("\n");
}

export async function gerarQuestaoIA(args: GerarQuestaoArgs): Promise<QuestaoIA | null> {
  if (!temIA()) return null;

  const perfilTxt = resumirPerfil(args.perfil);
  const userMessage = `PERFIL DO ALUNO:
${perfilTxt}

PEDIDO:
- Área: ${args.area}
- Conteúdo solicitado: ${args.conteudo ?? "livre, priorize um conteúdo fraco do aluno na área"}
- Dificuldade alvo: ${args.dificuldade ?? "MEDIO"}
${args.evitar?.length ? `- Evite os seguintes contextos já usados: ${args.evitar.join("; ")}` : ""}

Gere agora UMA questão inédita seguindo rigorosamente o schema JSON. Lembre: apenas o JSON cru, sem markdown.`;

  try {
    const texto = await chamarClaude({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
      maxTokens: 2000,
      temperature: 0.8,
    });
    const obj = extrairJSON<QuestaoIA>(texto);
    return normalizarQuestao(obj, args);
  } catch (err) {
    console.error("[gerarQuestaoIA] falhou:", err);
    return null;
  }
}

function normalizarQuestao(q: QuestaoIA, args: GerarQuestaoArgs): QuestaoIA {
  return {
    area: (q.area || args.area) as Area,
    disciplina: q.disciplina || "",
    competencia: q.competencia || "",
    habilidade: q.habilidade || "",
    conteudo: q.conteudo || args.conteudo || "",
    subconteudo: q.subconteudo ?? null,
    enunciado: q.enunciado,
    alternativaA: q.alternativaA,
    alternativaB: q.alternativaB,
    alternativaC: q.alternativaC,
    alternativaD: q.alternativaD,
    alternativaE: q.alternativaE,
    correta: (q.correta || "A").toUpperCase() as QuestaoIA["correta"],
    comentario: q.comentario || "",
    resolucaoPassoPasso: q.resolucaoPassoPasso || "",
    explicacaoSimplificada: q.explicacaoSimplificada || "",
    explicacaoDetalhada: q.explicacaoDetalhada || "",
    conceitos: Array.isArray(q.conceitos) ? q.conceitos : [],
    assuntosRelacionados: Array.isArray(q.assuntosRelacionados)
      ? q.assuntosRelacionados
      : [],
    dicas: Array.isArray(q.dicas) ? q.dicas : [],
    dificuldade: (q.dificuldade || args.dificuldade || "MEDIO") as Dificuldade,
    tempoMedioSegundos: q.tempoMedioSegundos || 180,
    tags: Array.isArray(q.tags) ? q.tags : [],
  };
}
