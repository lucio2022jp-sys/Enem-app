import { prisma } from "@/lib/prisma";
import { gerarQuestaoIA } from "./geradorQuestao";
import type { PerfilAluno, Area } from "@/types";

export type ModoSimulado =
  | "OFICIAL"
  | "AREA"
  | "TEMPO"
  | "FRAQUEZAS"
  | "LIVRE"
  | "PERSONALIZADO"
  | "COMPLETO";

export interface MontarSimuladoArgs {
  userId: string;
  perfil?: PerfilAluno | null;
  totalQuestoes: number;
  tipo: ModoSimulado;
  areas?: Area[];
  conteudos?: string[];
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
  const { userId, perfil, totalQuestoes, tipo, areas, conteudos } = args;
  const total = Math.max(5, totalQuestoes);

  const jaRespondidas = await prisma.attempt.findMany({
    where: { userId },
    select: { questionId: true },
    distinct: ["questionId"],
  });
  const idsRespondidos = jaRespondidas.map((a) => a.questionId);
  const selecionadas = new Set<string>();

  // Filtros por modo
  const areasFiltro: Area[] | undefined =
    areas && areas.length > 0 ? areas : undefined;
  const conteudosFiltro =
    conteudos && conteudos.length > 0 ? conteudos : undefined;

  // Modo OFICIAL: distribuição 45/45/45/45 ENEM, ignora filtros
  if (tipo === "OFICIAL") {
    const distrib: Array<[Area, number]> = [
      ["LINGUAGENS", 45],
      ["HUMANAS", 45],
      ["NATUREZA", 45],
      ["MATEMATICA", 45],
    ];
    for (const [area, qtd] of distrib) {
      const candidatos = await prisma.question.findMany({
        where: { area, id: { notIn: Array.from(selecionadas) } },
        orderBy: { createdAt: "desc" },
        take: qtd,
      });
      for (const c of candidatos) selecionadas.add(c.id);
    }
    return Array.from(selecionadas).slice(0, 180);
  }

  // Modo FRAQUEZAS: 100% fracos
  if (tipo === "FRAQUEZAS") {
    const areasFracas = ordenarAreasFracas(perfil);
    for (const area of areasFracas) {
      if (selecionadas.size >= total) break;
      const candidatos = await prisma.question.findMany({
        where: {
          area,
          id: { notIn: Array.from(selecionadas).concat(idsRespondidos) },
        },
        orderBy: [{ indiceDificuldade: "asc" }, { createdAt: "asc" }],
        take: total,
      });
      for (const c of candidatos) {
        if (selecionadas.size >= total) break;
        selecionadas.add(c.id);
      }
    }
    // fallback: ignora idsRespondidos se faltar
    if (selecionadas.size < total) {
      for (const area of areasFracas) {
        if (selecionadas.size >= total) break;
        const extras = await prisma.question.findMany({
          where: { area, id: { notIn: Array.from(selecionadas) } },
          take: total,
        });
        for (const c of extras) {
          if (selecionadas.size >= total) break;
          selecionadas.add(c.id);
        }
      }
    }
    return Array.from(selecionadas).sort(() => Math.random() - 0.5).slice(0, total);
  }

  // Modos AREA, TEMPO, LIVRE: usa filtros + distribuição simples
  if (tipo === "AREA" || tipo === "TEMPO" || tipo === "LIVRE") {
    const where: {
      area?: { in: Area[] };
      conteudo?: { in: string[] };
      id?: { notIn: string[] };
    } = {};
    if (areasFiltro) where.area = { in: areasFiltro };
    if (conteudosFiltro) where.conteudo = { in: conteudosFiltro };

    const candidatos = await prisma.question.findMany({
      where: {
        ...where,
        id: { notIn: idsRespondidos },
      },
      orderBy: { createdAt: "desc" },
      take: total * 2,
    });
    for (const c of candidatos) {
      if (selecionadas.size >= total) break;
      selecionadas.add(c.id);
    }
    // fallback ignora respondidas
    if (selecionadas.size < total) {
      const extras = await prisma.question.findMany({
        where: { ...where, id: { notIn: Array.from(selecionadas) } },
        take: total,
      });
      for (const c of extras) {
        if (selecionadas.size >= total) break;
        selecionadas.add(c.id);
      }
    }
    return Array.from(selecionadas).sort(() => Math.random() - 0.5).slice(0, total);
  }

  // Modos PERSONALIZADO e COMPLETO (mantém a estratégia antiga 60/25/15)
  const qtdFracos = Math.round(total * 0.6);
  const qtdRevisao = Math.round(total * 0.25);
  const areasFracas = ordenarAreasFracas(perfil);

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

  // 4. IA
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
