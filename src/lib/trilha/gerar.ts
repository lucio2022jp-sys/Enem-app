import { prisma } from "@/lib/prisma";
import type { Area } from "@/types";

interface DiagnosticoArea {
  areaScores: Record<string, number>;
}

const TEMPLATE: Record<
  Area,
  Array<{ titulo: string; descricao: string; tipo: "QUESTOES" | "REVISAO" }>
> = {
  LINGUAGENS: [
    {
      titulo: "Leitura e interpretação",
      descricao: "Treine textos curtos, identifique tese e argumentos.",
      tipo: "QUESTOES",
    },
    {
      titulo: "Variação linguística e gêneros",
      descricao: "Reconheça registros e estruturas textuais do ENEM.",
      tipo: "QUESTOES",
    },
    {
      titulo: "Revisão de Linguagens",
      descricao: "Refaça questões erradas no diagnóstico.",
      tipo: "REVISAO",
    },
  ],
  HUMANAS: [
    {
      titulo: "Brasil República",
      descricao: "Da Velha República à redemocratização.",
      tipo: "QUESTOES",
    },
    {
      titulo: "Geografia humana",
      descricao: "Urbanização, migrações e desigualdades.",
      tipo: "QUESTOES",
    },
    {
      titulo: "Revisão de Humanas",
      descricao: "Refaça questões erradas e leia o resumo dos temas.",
      tipo: "REVISAO",
    },
  ],
  NATUREZA: [
    {
      titulo: "Ecologia e meio ambiente",
      descricao: "Cadeias, ciclos e impactos antrópicos.",
      tipo: "QUESTOES",
    },
    {
      titulo: "Química do cotidiano",
      descricao: "Mol, reações e funções orgânicas.",
      tipo: "QUESTOES",
    },
    {
      titulo: "Física aplicada",
      descricao: "Cinemática, energia e eletricidade.",
      tipo: "QUESTOES",
    },
  ],
  MATEMATICA: [
    {
      titulo: "Funções e gráficos",
      descricao: "Função afim, quadrática e exponencial no ENEM.",
      tipo: "QUESTOES",
    },
    {
      titulo: "Estatística e probabilidade",
      descricao: "Médias, mediana, gráficos e probabilidade básica.",
      tipo: "QUESTOES",
    },
    {
      titulo: "Geometria e razão proporcional",
      descricao: "Áreas, volumes e regra de três.",
      tipo: "QUESTOES",
    },
  ],
};

/**
 * Gera 12 itens de trilha priorizando 60% nas áreas de menor desempenho.
 * Inclui ao menos 1 REDACAO e 1 SIMULADO.
 */
export async function gerarTrilhaInicial(
  userId: string,
  diagnostico: DiagnosticoArea,
): Promise<void> {
  // Limpa trilha existente
  await prisma.trackItem.deleteMany({ where: { userId } });

  const areas: Area[] = ["LINGUAGENS", "HUMANAS", "NATUREZA", "MATEMATICA"];
  const ordenadas = areas.slice().sort((a, b) => {
    return (diagnostico.areaScores[a] ?? 0) - (diagnostico.areaScores[b] ?? 0);
  });

  // 12 itens total: 8 de áreas fracas, 1 redação, 1 simulado, 2 de áreas dominadas
  const itens: Array<{
    titulo: string;
    descricao: string;
    tipo: "QUESTOES" | "REVISAO" | "REDACAO" | "SIMULADO";
    area: string;
    alvo: number;
  }> = [];

  const fracas = ordenadas.slice(0, 2);
  const fortes = ordenadas.slice(2);

  for (const area of fracas) {
    for (const tpl of TEMPLATE[area]) {
      itens.push({
        titulo: tpl.titulo,
        descricao: tpl.descricao,
        tipo: tpl.tipo,
        area,
        alvo: 5,
      });
    }
  }
  // 6 itens das fracas, completa com fortes
  for (const area of fortes) {
    if (itens.length >= 8) break;
    const tpl = TEMPLATE[area][0]!;
    itens.push({
      titulo: tpl.titulo,
      descricao: tpl.descricao,
      tipo: "QUESTOES",
      area,
      alvo: 5,
    });
  }

  itens.push({
    titulo: "Primeira redação",
    descricao:
      "Escreva sua primeira redação no padrão ENEM. A IA dá nota e um professor parceiro pode revisar.",
    tipo: "REDACAO",
    area: "GERAL",
    alvo: 1,
  });

  itens.push({
    titulo: "Simulado relâmpago",
    descricao:
      "Simulado personalizado de 20 questões com base no seu perfil. Cronometrado.",
    tipo: "SIMULADO",
    area: "GERAL",
    alvo: 20,
  });

  // Mais 2 de áreas mais fortes para fechar 12
  while (itens.length < 12) {
    const area = fortes[itens.length % fortes.length] ?? "LINGUAGENS";
    itens.push({
      titulo: `Reforço em ${area.toLowerCase()}`,
      descricao: "Mantenha o ritmo: questões variadas para consolidar.",
      tipo: "QUESTOES",
      area,
      alvo: 5,
    });
  }

  await prisma.trackItem.createMany({
    data: itens.slice(0, 12).map((it, idx) => ({
      userId,
      ordem: idx + 1,
      titulo: it.titulo,
      descricao: it.descricao,
      tipo: it.tipo,
      area: it.area,
      alvoQuestoes: it.alvo,
    })),
  });
}
