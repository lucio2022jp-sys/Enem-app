export type Area = "LINGUAGENS" | "HUMANAS" | "NATUREZA" | "MATEMATICA";
export type AreaOuGeral = Area | "GERAL";
export type Dificuldade = "FACIL" | "MEDIO" | "DIFICIL";
export type Alternativa = "A" | "B" | "C" | "D" | "E";
export type Role = "ALUNO" | "PROFESSOR" | "ADMIN";
export type Plan = "FREE" | "PRO";

export type TipoErro =
  | "CONHECIMENTO"
  | "INTERPRETACAO"
  | "CALCULO"
  | "DISTRACAO"
  | "TEMPO"
  | "GRAFICO"
  | "TABELA"
  | "RACIOCINIO"
  | "CONCEITUAL"
  | "ESTRATEGIA"
  | "NENHUM";

export type StatusEssay =
  | "ENVIADA"
  | "EM_CORRECAO_IA"
  | "CORRIGIDA_IA"
  | "EM_REVISAO_HUMANA"
  | "CORRIGIDA_HUMANA";

export type TipoTrack = "QUESTOES" | "REDACAO" | "REVISAO" | "SIMULADO";

export type Nivel =
  | "INICIANTE"
  | "APRENDIZ"
  | "PERSISTENTE"
  | "ESTRATEGISTA"
  | "ELITE"
  | "ESPECIALISTA"
  | "MESTRE"
  | "LENDA_ENEM";

export type HorarioPreferido = "MANHA" | "TARDE" | "NOITE";

export type TipoSimulado =
  | "TREINO"
  | "OFICIAL"
  | "PERSONALIZADO"
  | "DESAFIO"
  | "REVISAO"
  | "COMPLETO";

export interface ConteudoScore {
  area: string;
  total: number;
  acertos: number;
  pct: number;
}

export interface PerfilAluno {
  totalQuestoes: number;
  totalAcertos: number;
  totalErros: number;
  tempoMedioSegundos: number;
  areaScores: Record<string, number>;
  competenciaScores: Record<string, number>;
  habilidadeScores: Record<string, number>;
  conteudoScores: Record<string, ConteudoScore>;
  dominados: string[];
  fracos: string[];
  notaEstimadaEnem: number | null;
  frequenciaDias: string[];
  xp: number;
  nivel: Nivel;
  streakDias: number;
  melhorStreak: number;
  ultimosErros?: Array<{
    enunciado: string;
    conteudo: string;
    tipoErro: string | null;
    area: string;
  }>;
}

export interface QuestaoIA {
  area: Area;
  disciplina: string;
  competencia: string;
  habilidade: string;
  conteudo: string;
  subconteudo?: string | null;
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  alternativaD: string;
  alternativaE: string;
  correta: Alternativa;
  comentario: string;
  resolucaoPassoPasso: string;
  explicacaoSimplificada: string;
  explicacaoDetalhada: string;
  conceitos: string[];
  assuntosRelacionados: string[];
  dicas: string[];
  dificuldade: Dificuldade;
  tempoMedioSegundos: number;
  tags: string[];
}
