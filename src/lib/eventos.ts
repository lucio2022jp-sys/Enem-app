import { upsertDaily } from "@/lib/daily";
import { adicionarXP, XP_POR_EVENTO } from "@/lib/gamificacao";
import { registrarEstudoHoje } from "@/lib/streak";
import { incrementarProgresso, tipoParaArea, getOuCriarMissaoHoje } from "@/lib/missao";
import { progressoMissao, XP_MISSAO_DIARIA } from "@/lib/missao";
import type { Area } from "@/types";

interface AggregatedResult {
  xp: number;
  nivel: string;
  subiu: boolean;
  novoNivelEmoji?: string;
  novoNivelLabel?: string;
  streakDias: number;
  missaoCompleta: boolean;
}

/**
 * Gancho pós-resposta de questão (qualquer fonte: questões, simulado, diagnóstico).
 * Atualiza XP, streak, daily e progresso da missão.
 */
export async function aoResponderQuestao(input: {
  userId: string;
  area: Area;
  correta: boolean;
  tempoSegundos: number;
}): Promise<AggregatedResult> {
  const xpDelta = input.correta ? XP_POR_EVENTO.acerto : XP_POR_EVENTO.erro;
  await upsertDaily(input.userId, {
    questoes: 1,
    acertos: input.correta ? 1 : 0,
    tempo: input.tempoSegundos,
    xp: xpDelta,
  });
  const streak = await registrarEstudoHoje(input.userId);
  const xpRes = await adicionarXP(input.userId, xpDelta);
  const prog = await incrementarProgresso(input.userId, tipoParaArea(input.area));
  let missaoCompleta = prog.premiada;
  if (prog.premiada) {
    const xp2 = await adicionarXP(input.userId, XP_MISSAO_DIARIA);
    await upsertDaily(input.userId, { xp: XP_MISSAO_DIARIA });
    return {
      xp: xp2.xp,
      nivel: xp2.nivel,
      subiu: xpRes.subiu || xp2.subiu,
      novoNivelEmoji: (xp2.novoNivel ?? xpRes.novoNivel)?.emoji,
      novoNivelLabel: (xp2.novoNivel ?? xpRes.novoNivel)?.label,
      streakDias: streak.streakDias,
      missaoCompleta,
    };
  }
  return {
    xp: xpRes.xp,
    nivel: xpRes.nivel,
    subiu: xpRes.subiu,
    novoNivelEmoji: xpRes.novoNivel?.emoji,
    novoNivelLabel: xpRes.novoNivel?.label,
    streakDias: streak.streakDias,
    missaoCompleta,
  };
}

/** Gancho pós-envio de redação. */
export async function aoEnviarRedacao(userId: string): Promise<AggregatedResult> {
  const xpDelta = XP_POR_EVENTO.redacaoEnviada;
  await upsertDaily(userId, { redacoes: 1, xp: xpDelta });
  const streak = await registrarEstudoHoje(userId);
  const xpRes = await adicionarXP(userId, xpDelta);
  const prog = await incrementarProgresso(userId, "REDACAO");
  if (prog.premiada) {
    const xp2 = await adicionarXP(userId, XP_MISSAO_DIARIA);
    await upsertDaily(userId, { xp: XP_MISSAO_DIARIA });
    return {
      xp: xp2.xp,
      nivel: xp2.nivel,
      subiu: xpRes.subiu || xp2.subiu,
      novoNivelEmoji: (xp2.novoNivel ?? xpRes.novoNivel)?.emoji,
      novoNivelLabel: (xp2.novoNivel ?? xpRes.novoNivel)?.label,
      streakDias: streak.streakDias,
      missaoCompleta: true,
    };
  }
  return {
    xp: xpRes.xp,
    nivel: xpRes.nivel,
    subiu: xpRes.subiu,
    novoNivelEmoji: xpRes.novoNivel?.emoji,
    novoNivelLabel: xpRes.novoNivel?.label,
    streakDias: streak.streakDias,
    missaoCompleta: false,
  };
}

/** Gancho pós-revisão concluída. */
export async function aoConcluirRevisao(userId: string): Promise<void> {
  await upsertDaily(userId, { revisoes: 1, xp: 2 });
  await registrarEstudoHoje(userId);
  await adicionarXP(userId, 2);
  await incrementarProgresso(userId, "REVISAO");
}

/** Gancho pós-finalização de simulado. */
export async function aoFinalizarSimulado(input: {
  userId: string;
  acertos: number;
  totalQuestoes: number;
}): Promise<AggregatedResult> {
  const xp = XP_POR_EVENTO.simuladoFinalizado + input.acertos * 2;
  await upsertDaily(input.userId, { xp });
  const streak = await registrarEstudoHoje(input.userId);
  const xpRes = await adicionarXP(input.userId, xp);
  return {
    xp: xpRes.xp,
    nivel: xpRes.nivel,
    subiu: xpRes.subiu,
    novoNivelEmoji: xpRes.novoNivel?.emoji,
    novoNivelLabel: xpRes.novoNivel?.label,
    streakDias: streak.streakDias,
    missaoCompleta: false,
  };
}

/** Gancho pós-finalização de diagnóstico (NÃO mexe em missão). */
export async function aoFinalizarDiagnostico(userId: string): Promise<void> {
  await upsertDaily(userId, { xp: XP_POR_EVENTO.diagnostico });
  await registrarEstudoHoje(userId);
  await adicionarXP(userId, XP_POR_EVENTO.diagnostico);
}

/** Garante existência da missão de hoje e retorna progresso. */
export async function progressoMissaoHoje(userId: string) {
  const m = await getOuCriarMissaoHoje(userId);
  return { missao: m, progresso: progressoMissao(m) };
}
