import { inicioDoDia, diasEntre } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

/**
 * Registra que o usuário estudou hoje. Atualiza streak.
 * Retorna { streakDias, melhorStreak, mudou }.
 */
export async function registrarEstudoHoje(userId: string): Promise<{
  streakDias: number;
  melhorStreak: number;
  mudou: boolean;
}> {
  const sp = await prisma.studentProfile.findUnique({ where: { userId } });
  const hoje = inicioDoDia();

  if (!sp) {
    const novo = await prisma.studentProfile.create({
      data: {
        userId,
        streakDias: 1,
        melhorStreak: 1,
        ultimoDiaEstudo: hoje,
      },
    });
    return { streakDias: novo.streakDias, melhorStreak: novo.melhorStreak, mudou: true };
  }

  const ultimo = sp.ultimoDiaEstudo ? inicioDoDia(sp.ultimoDiaEstudo) : null;
  if (ultimo && ultimo.getTime() === hoje.getTime()) {
    return { streakDias: sp.streakDias, melhorStreak: sp.melhorStreak, mudou: false };
  }

  let novoStreak = 1;
  if (ultimo) {
    const dif = diasEntre(ultimo, hoje);
    if (dif === 1) novoStreak = sp.streakDias + 1;
    else novoStreak = 1;
  }
  const novoMelhor = Math.max(sp.melhorStreak, novoStreak);
  await prisma.studentProfile.update({
    where: { userId },
    data: {
      streakDias: novoStreak,
      melhorStreak: novoMelhor,
      ultimoDiaEstudo: hoje,
    },
  });
  return { streakDias: novoStreak, melhorStreak: novoMelhor, mudou: true };
}
