import { prisma } from "@/lib/prisma";

/**
 * SM-2 simplificado:
 * - erro: zera nível, intervalo = 1 dia, próxima = amanhã
 * - acerto: intervalo *= 2.5 (cap 60), nível++
 */
export async function agendarRevisao({
  userId,
  questionId,
  acerto,
}: {
  userId: string;
  questionId: string;
  acerto: boolean;
}): Promise<void> {
  const existente = await prisma.revisao.findUnique({
    where: { userId_questionId: { userId, questionId } },
  });

  if (!acerto) {
    const proxima = new Date();
    proxima.setDate(proxima.getDate() + 1);
    if (existente) {
      await prisma.revisao.update({
        where: { id: existente.id },
        data: { intervaloDias: 1, nivelDominio: 0, proximaRevisao: proxima },
      });
    } else {
      await prisma.revisao.create({
        data: {
          userId,
          questionId,
          intervaloDias: 1,
          nivelDominio: 0,
          proximaRevisao: proxima,
        },
      });
    }
    return;
  }

  // Acerto
  if (!existente) {
    // Não havia revisão: cria leve, para reaparecer em 3 dias
    const p = new Date();
    p.setDate(p.getDate() + 3);
    await prisma.revisao.create({
      data: {
        userId,
        questionId,
        intervaloDias: 3,
        nivelDominio: 1,
        proximaRevisao: p,
      },
    });
    return;
  }

  const novoIntervalo = Math.min(60, Math.round(existente.intervaloDias * 2.5));
  const proxima = new Date();
  proxima.setDate(proxima.getDate() + novoIntervalo);
  await prisma.revisao.update({
    where: { id: existente.id },
    data: {
      intervaloDias: novoIntervalo,
      nivelDominio: existente.nivelDominio + 1,
      proximaRevisao: proxima,
    },
  });
}

/**
 * Wrapper com assinatura posicional usada pelos endpoints de simulado/questão.
 * Encaminha para agendarRevisao.
 */
export async function registrarRevisao(
  userId: string,
  questionId: string,
  acerto: boolean,
): Promise<void> {
  return agendarRevisao({ userId, questionId, acerto });
}
