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

export interface PerfilAluno {
  totalQuestoes: number;
  totalAcertos: number;
  totalErros: number;
  tempoMedioSegundos: number;
  areaScores: Record<string, number>;
  competenciaScores: Record<string, number>;
  habilidadeScores: Record<string, number>;
  dominados: string[];
  fracos: string[];
  notaEstimadaEnem: number | null;
  frequenciaDias: string[];
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
