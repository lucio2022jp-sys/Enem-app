import { prisma } from "@/lib/prisma";
import { gerarQuestaoIA } from "./geradorQuestao";
import type { PerfilAluno, Area } from "@/types";

export interface MontarSimuladoArgs {
  userId: string;
  perfil?: PerfilAluno | null;
  totalQuestoes: number;
  tipo: "PERSONALIZADO" | "COMPLETO";
}

/**
 * Estratégia:
 * - 60% áreas/conteúdos fracos
 * - 25% revisão (Revisao com proximaRevisao <= hoje)
 * - 15% novos desafios
 *
 * Busca primeiro no banco questões nunca respondidas pelo aluno; se faltar,
 * gera com IA (quando disponível).
 */
export async function montarSimulado(args: MontarSimuladoArgs): Promise<string[]> {
  const { userId, perfil, totalQuestoes } = args;
  const total = Math.max(5, totalQuestoes);

  const qtdFracos = Math.round(total * 0.6);
  const qtdRevisao = Math.round(total * 0.25);

  const jaRespondidas = await prisma.attempt.findMany({
    where: { userId },
    select: { questionId: true },
    distinct: ["questionId"],
  });
  const idsRespondidos = jaRespondidas.map((a) => a.questionId);

  const areasFracas = ordenarAreasFracas(perfil);
  const selecionadas = new Set<string>();

  // 1. Fracos
  for (const area of areasFracas) {
    if (selecionadas.size >= qtdFracos) break;
    const candidatos = await prisma.question.findMany({
      where: {
        area,
        id: { notIn: Array.from(selecionadas).concat(idsRespondidos) },
      },
      orderBy: [{ indiceDificuldade: "asc" }, { createdAt: "asc" }],
      take: 10,
    });
    for (const c of candidatos) {
      if (selecionadas.size >= qtdFracos) break;
      selecionadas.add(c.id);
    }
  }

  // 2. Revisão
  const revisoesPendentes = await prisma.revisao.findMany({
    where: {
      userId,
      proximaRevisao: { lte: new Date() },
      questionId: { notIn: Array.from(selecionadas) },
    },
    orderBy: { proximaRevisao: "asc" },
    take: qtdRevisao,
  });
  for (const r of revisoesPendentes) {
    selecionadas.add(r.questionId);
  }

  // 3. Novos desafios
  if (selecionadas.size < total) {
    const restante = total - selecionadas.size;
    const novas = await prisma.question.findMany({
      where: {
        id: { notIn: Array.from(selecionadas).concat(idsRespondidos) },
      },
      take: restante,
      orderBy: { createdAt: "desc" },
    });
    for (const n of novas) selecionadas.add(n.id);
  }

  // 4. Se ainda faltar, gerar com IA
  let faltam = total - selecionadas.size;
  let tentativas = 0;
  while (faltam > 0 && tentativas < Math.min(faltam, 5)) {
    tentativas++;
    const areaAlvo: Area = areasFracas[tentativas % areasFracas.length] ?? "LINGUAGENS";
    const gerada = await gerarQuestaoIA({ perfil, area: areaAlvo });
    if (gerada) {
      const salva = await prisma.question.create({
        data: {
          year: new Date().getFullYear(),
          area: gerada.area,
          disciplina: gerada.disciplina,
          competencia: gerada.competencia,
          habilidade: gerada.habilidade,
          conteudo: gerada.conteudo,
          subconteudo: gerada.subconteudo ?? null,
          enunciado: gerada.enunciado,
          alternativaA: gerada.alternativaA,
          alternativaB: gerada.alternativaB,
          alternativaC: gerada.alternativaC,
          alternativaD: gerada.alternativaD,
          alternativaE: gerada.alternativaE,
          correta: gerada.correta,
          comentario: gerada.comentario,
          resolucaoPassoPasso: gerada.resolucaoPassoPasso,
          explicacaoSimplificada: gerada.explicacaoSimplificada,
          explicacaoDetalhada: gerada.explicacaoDetalhada,
          conceitosJson: JSON.stringify(gerada.conceitos),
          assuntosRelacionadosJson: JSON.stringify(gerada.assuntosRelacionados),
          dicasJson: JSON.stringify(gerada.dicas),
          dificuldade: gerada.dificuldade,
          tempoMedioSegundos: gerada.tempoMedioSegundos,
          geradaPorIA: true,
          tagsJson: JSON.stringify(gerada.tags),
        },
      });
      selecionadas.add(salva.id);
    } else {
      break;
    }
    faltam = total - selecionadas.size;
  }

  return Array.from(selecionadas).sort(() => Math.random() - 0.5).slice(0, total);
}

function ordenarAreasFracas(perfil?: PerfilAluno | null): Area[] {
  const todas: Area[] = ["LINGUAGENS", "HUMANAS", "NATUREZA", "MATEMATICA"];
  if (!perfil || !perfil.areaScores) return todas;
  return todas.slice().sort((a, b) => {
    const sa = perfil.areaScores[a] ?? 0;
    const sb = perfil.areaScores[b] ?? 0;
    return sa - sb;
  });
}
