/**
 * Seed do banco. Popula com:
 * - 1 usuário ALUNO de teste (aluno@teste.com / 123456)
 * - 1 usuário PROFESSOR de teste (professor@teste.com / 123456)
 * - Questões iniciais por área (LINGUAGENS, HUMANAS, NATUREZA, MATEMATICA)
 *
 * Rodar: npm run db:seed
 *
 * Idempotente: usa upsert por email/id estável.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedQuestao = {
  id: string;
  year: number;
  area: "LINGUAGENS" | "HUMANAS" | "NATUREZA" | "MATEMATICA";
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
  correta: "A" | "B" | "C" | "D" | "E";
  comentario: string;
  resolucaoPassoPasso: string;
  explicacaoSimplificada: string;
  explicacaoDetalhada: string;
  conceitos: string[];
  assuntosRelacionados: string[];
  dicas: string[];
  dificuldade: "FACIL" | "MEDIO" | "DIFICIL";
  tempoMedioSegundos: number;
  tags: string[];
};

const QUESTOES: SeedQuestao[] = [
  // ---------------- LINGUAGENS ----------------
  {
    id: "seed-ling-01",
    year: 2023,
    area: "LINGUAGENS",
    disciplina: "Língua Portuguesa",
    competencia: "Competência 6 - Compreender e usar os sistemas simbólicos das diferentes linguagens",
    habilidade: "H18 - Identificar os elementos que concorrem para a progressão temática",
    conteudo: "Coesão e coerência textual",
    subconteudo: "Mecanismos de coesão referencial",
    enunciado:
      "Leia o trecho: \"O ministro chegou cedo ao gabinete. Ele já tinha em mãos os documentos que seriam analisados na reunião. A pauta, longa e técnica, exigia atenção redobrada.\" No trecho, os termos destacados \"Ele\" e \"A pauta\" exercem, respectivamente, função de:",
    alternativaA: "anáfora pronominal e elipse.",
    alternativaB: "catáfora e repetição lexical.",
    alternativaC: "anáfora pronominal e anáfora lexical.",
    alternativaD: "elipse e catáfora.",
    alternativaE: "repetição lexical e anáfora pronominal.",
    correta: "C",
    comentario:
      "O pronome \"Ele\" retoma \"O ministro\" (anáfora pronominal). \"A pauta\" retoma \"a reunião\" através de um termo nominal relacionado ao contexto, configurando anáfora lexical (também chamada de coesão por hiperônimo/associação).",
    resolucaoPassoPasso:
      "1) Identifique os referentes anteriores no texto.\n2) \"Ele\" → pronome pessoal que retoma \"O ministro\" (anáfora pronominal).\n3) \"A pauta\" → expressão nominal que retoma elemento já citado (\"reunião\"), formando anáfora lexical.\n4) Como ambos retomam termos anteriores, são anáforas, descartando catáfora e elipse.",
    explicacaoSimplificada:
      "Anáfora é quando uma palavra puxa algo que já foi dito. \"Ele\" puxa \"ministro\". \"A pauta\" puxa a ideia da reunião. Ambos olham pra trás no texto, então são anáforas.",
    explicacaoDetalhada:
      "Coesão referencial é o mecanismo que liga partes do texto pela retomada (anáfora) ou antecipação (catáfora) de termos. A anáfora pode ser pronominal (uso de pronome para retomar), lexical (uso de nome/expressão equivalente) ou por elipse (omissão recuperável pelo contexto). Catáfora aponta para algo que virá. No trecho, não há elipse marcada nem antecipação, apenas duas retomadas: uma por pronome e outra por expressão nominal.",
    conceitos: ["anáfora", "catáfora", "coesão referencial", "elipse"],
    assuntosRelacionados: ["coerência textual", "progressão temática", "pronomes"],
    dicas: [
      "Olhe se o termo aponta para algo já dito (anáfora) ou que virá (catáfora).",
      "Pronome retomando = anáfora pronominal.",
      "Substantivo equivalente retomando = anáfora lexical.",
    ],
    dificuldade: "MEDIO",
    tempoMedioSegundos: 180,
    tags: ["coesão", "gramática", "leitura"],
  },
  {
    id: "seed-ling-02",
    year: 2022,
    area: "LINGUAGENS",
    disciplina: "Literatura",
    competencia: "Competência 5 - Analisar manifestações literárias",
    habilidade: "H15 - Estabelecer relações entre o texto literário e o contexto histórico",
    conteudo: "Modernismo brasileiro",
    subconteudo: "Primeira fase modernista",
    enunciado:
      "O poema \"Erro de Português\", de Oswald de Andrade, brinca com o episódio da chegada dos portugueses ao Brasil sugerindo que, \"num dia de chuva\", o índio é que vestiu o português. Esse procedimento estético é característico da primeira fase do Modernismo porque:",
    alternativaA: "valoriza a métrica clássica e o vocabulário rebuscado.",
    alternativaB: "rejeita a influência indígena na formação cultural brasileira.",
    alternativaC: "utiliza paródia e humor para revisar criticamente a história oficial.",
    alternativaD: "defende o retorno aos modelos parnasianos de poesia.",
    alternativaE: "exalta de forma idealizada a colonização europeia.",
    correta: "C",
    comentario:
      "A primeira fase modernista (1922-1930) tem como traços a ruptura com o passado, o experimentalismo, o humor e a paródia. Oswald de Andrade é referência desse procedimento.",
    resolucaoPassoPasso:
      "1) Identifique o autor e a fase: Oswald de Andrade → 1ª fase do Modernismo.\n2) Lembre os traços: paródia, antropofagia, humor, verso livre.\n3) O poema inverte o fato histórico → paródia crítica.\n4) Eliminação: A, D (clássico/parnasiano) e B, E (rejeição/exaltação ingênua) são opostos ao espírito modernista.",
    explicacaoSimplificada:
      "Os modernistas de 22 zoavam com a história oficial pra fazer pensar. Oswald inverte: o índio é que vestiu o português. É paródia com humor.",
    explicacaoDetalhada:
      "A Semana de 1922 inaugurou no Brasil uma vanguarda que questionava modelos europeus e revisitava a identidade nacional. Oswald de Andrade, no Manifesto Antropófago, propõe \"devorar\" o estrangeiro para criar algo brasileiro. Em \"Erro de Português\", a inversão do gesto colonial é paródia: um recurso de releitura crítica que sintetiza ironia, humor e crítica histórica.",
    conceitos: ["paródia", "antropofagia", "modernismo", "vanguarda"],
    assuntosRelacionados: ["Semana de 22", "Manifesto Antropófago", "Mário de Andrade"],
    dicas: [
      "Modernismo 1ª fase = ruptura, humor, verso livre.",
      "Paródia ≠ paráfrase: paródia critica/inverte, paráfrase parafraseia.",
    ],
    dificuldade: "MEDIO",
    tempoMedioSegundos: 200,
    tags: ["literatura", "modernismo", "Oswald"],
  },
  {
    id: "seed-ling-03",
    year: 2021,
    area: "LINGUAGENS",
    disciplina: "Interpretação de Texto",
    competencia: "Competência 5 - Análise crítica de textos",
    habilidade: "H17 - Reconhecer o uso de recursos persuasivos",
    conteudo: "Funções da linguagem",
    subconteudo: "Função conativa e referencial",
    enunciado:
      "\"Beba CocaXis, refresque seu verão!\" A frase publicitária acima tem como função predominante da linguagem a:",
    alternativaA: "função referencial, pois apresenta dados objetivos.",
    alternativaB: "função emotiva, pois revela sentimentos do emissor.",
    alternativaC: "função fática, pois testa o canal de comunicação.",
    alternativaD: "função conativa, pois busca convencer o receptor a agir.",
    alternativaE: "função metalinguística, pois fala da própria linguagem.",
    correta: "D",
    comentario:
      "O verbo no imperativo (\"Beba\", \"refresque\") direciona o discurso para o receptor, traço típico da função conativa (ou apelativa), comum em publicidade.",
    resolucaoPassoPasso:
      "1) Observe a forma verbal: imperativo → foco no receptor.\n2) Avalie o objetivo: convencer/levar à ação.\n3) Função conativa = apelo ao receptor.\n4) Demais funções não predominam.",
    explicacaoSimplificada:
      "Quando o texto manda você fazer algo (\"compre\", \"beba\"), é função conativa.",
    explicacaoDetalhada:
      "As seis funções da linguagem (Jakobson) estão ligadas aos elementos da comunicação. A conativa centra-se no receptor: usa imperativo, vocativos e 2ª pessoa para influenciar atitudes. Publicidade, discursos políticos e ordens são típicos.",
    conceitos: ["função conativa", "funções da linguagem", "imperativo", "publicidade"],
    assuntosRelacionados: ["Jakobson", "elementos da comunicação"],
    dicas: [
      "Imperativo + foco no \"você\" = conativa.",
      "Foco no \"eu\" = emotiva. Foco na mensagem = poética.",
    ],
    dificuldade: "FACIL",
    tempoMedioSegundos: 120,
    tags: ["linguagem", "publicidade"],
  },

  // ---------------- HUMANAS ----------------
  {
    id: "seed-hum-01",
    year: 2023,
    area: "HUMANAS",
    disciplina: "História",
    competencia: "Competência 3 - Compreender a produção e o papel histórico das instituições sociais",
    habilidade: "H14 - Comparar processos de formação socioeconômica",
    conteudo: "Brasil República",
    subconteudo: "Era Vargas",
    enunciado:
      "A criação da Consolidação das Leis do Trabalho (CLT), em 1943, durante o governo de Getúlio Vargas, é considerada um marco da legislação trabalhista brasileira porque:",
    alternativaA: "garantiu o direito de greve irrestrito a todas as categorias.",
    alternativaB: "extinguiu o vínculo entre sindicatos e o Estado.",
    alternativaC: "unificou e ampliou direitos trabalhistas previamente dispersos em legislações pontuais.",
    alternativaD: "transferiu integralmente a regulação das relações de trabalho para as empresas.",
    alternativaE: "implementou o sistema cooperativista como modelo único de produção.",
    correta: "C",
    comentario:
      "A CLT reuniu em um único corpo legal direitos trabalhistas que antes estavam fragmentados, criando jornada, salário mínimo, férias e proteção sindical centralizada.",
    resolucaoPassoPasso:
      "1) Lembre o contexto: Estado Novo, política trabalhista centralizada.\n2) Lembre o objetivo da CLT: consolidar (\"C\" do nome).\n3) Direito de greve era restrito → A errada.\n4) Sindicatos ficaram atrelados ao Estado → B errada.\n5) D e E contradizem o intervencionismo do período.",
    explicacaoSimplificada:
      "A CLT juntou em um livro só todas as leis sobre trabalho que existiam soltas. Era também forma do Vargas controlar trabalhadores e sindicatos.",
    explicacaoDetalhada:
      "A política trabalhista da Era Vargas combinava conquistas reais (jornada de 8h, férias, salário mínimo, carteira de trabalho) com o controle estatal sobre os sindicatos (estrutura corporativista, imposto sindical). A CLT consolidou essa engenharia jurídica em 1943, ainda no Estado Novo.",
    conceitos: ["CLT", "Era Vargas", "trabalhismo", "Estado Novo"],
    assuntosRelacionados: ["sindicalismo", "corporativismo", "populismo"],
    dicas: [
      "CLT = Consolidação. A palavra-chave é \"juntar\" o que estava espalhado.",
      "Vargas atrelou sindicatos ao Estado, não libertou.",
    ],
    dificuldade: "MEDIO",
    tempoMedioSegundos: 150,
    tags: ["história", "Brasil República", "Vargas"],
  },
  {
    id: "seed-hum-02",
    year: 2022,
    area: "HUMANAS",
    disciplina: "Geografia",
    competencia: "Competência 4 - Entender as transformações técnicas e produtivas e seus impactos",
    habilidade: "H20 - Selecionar argumentos sobre globalização",
    conteudo: "Globalização e mundo do trabalho",
    subconteudo: "Divisão internacional do trabalho",
    enunciado:
      "Empresas multinacionais frequentemente localizam suas linhas de montagem em países onde a mão de obra é mais barata, enquanto mantêm centros de pesquisa em países de origem. Esse arranjo expressa, sobretudo:",
    alternativaA: "o fim da divisão internacional do trabalho.",
    alternativaB: "a redução da desigualdade entre países centrais e periféricos.",
    alternativaC: "uma nova divisão internacional do trabalho baseada em níveis de qualificação.",
    alternativaD: "a substituição do capital financeiro pelo capital produtivo.",
    alternativaE: "o protecionismo estatal contra o livre comércio.",
    correta: "C",
    comentario:
      "A globalização produtiva fragmenta cadeias: tarefas de menor valor agregado vão para periferias, e atividades intensivas em conhecimento ficam nos centros. É a nova DIT.",
    resolucaoPassoPasso:
      "1) Identifique o fenômeno: fábricas no Sul global, P&D no Norte.\n2) Conceito: nova divisão internacional do trabalho.\n3) A divisão se acentua, não acaba (A errada).\n4) Não reduz desigualdade automaticamente (B errada).\n5) D, E não descrevem o fenômeno.",
    explicacaoSimplificada:
      "Países pobres montam o produto, países ricos pensam o produto. Isso é a nova divisão do trabalho no mundo.",
    explicacaoDetalhada:
      "A antiga DIT separava países exportadores de matéria-prima dos exportadores de manufaturas. A nova DIT, com a globalização, fragmenta a produção em redes globais de valor, onde cada elo é alocado segundo custos, qualificação e infraestrutura.",
    conceitos: ["DIT", "globalização", "cadeias produtivas", "Norte-Sul"],
    assuntosRelacionados: ["multinacionais", "tecnologia", "neoliberalismo"],
    dicas: [
      "Globalização não acaba com a desigualdade, redesenha ela.",
      "P&D e marca = centro. Montagem = periferia.",
    ],
    dificuldade: "MEDIO",
    tempoMedioSegundos: 150,
    tags: ["geografia", "globalização"],
  },
  {
    id: "seed-hum-03",
    year: 2021,
    area: "HUMANAS",
    disciplina: "Filosofia",
    competencia: "Competência 1 - Compreender elementos culturais que constituem identidades",
    habilidade: "H4 - Comparar pontos de vista sobre situações ou fatos",
    conteudo: "Ética e cidadania",
    subconteudo: "Imperativo categórico kantiano",
    enunciado:
      "Para Kant, o imperativo categórico afirma: \"Age apenas segundo a máxima pela qual possas ao mesmo tempo querer que ela se torne lei universal.\" Esse princípio implica que uma ação é moralmente correta quando:",
    alternativaA: "produz o maior prazer ao maior número de pessoas.",
    alternativaB: "atende aos interesses individuais do agente.",
    alternativaC: "pode ser universalizada sem contradição.",
    alternativaD: "é validada por uma autoridade religiosa.",
    alternativaE: "garante eficácia material independentemente da intenção.",
    correta: "C",
    comentario:
      "Para Kant, a moralidade não depende das consequências (utilitarismo) nem de autoridade externa, mas do critério racional da universalização.",
    resolucaoPassoPasso:
      "1) Releia: \"que ela se torne lei universal\".\n2) Critério = universalidade racional.\n3) A (utilitarismo) e E (consequencialismo) não são Kant.\n4) B (egoísmo) e D (heteronomia) também não.",
    explicacaoSimplificada:
      "Pra Kant, sua ação é certa se você quisesse que todo mundo no mundo fizesse igual.",
    explicacaoDetalhada:
      "Kant fundamenta a moral na autonomia da razão. O imperativo categórico difere dos hipotéticos (\"se você quer X, faça Y\") porque vale incondicionalmente. A universalização é um teste lógico: se a máxima, universalizada, se autodestrói, ela não pode ser moral.",
    conceitos: ["imperativo categórico", "Kant", "universalização", "dever"],
    assuntosRelacionados: ["autonomia", "utilitarismo", "deontologia"],
    dicas: [
      "Kant = dever, universal, intenção.",
      "Utilitarismo = consequência, prazer/utilidade.",
    ],
    dificuldade: "MEDIO",
    tempoMedioSegundos: 160,
    tags: ["filosofia", "ética"],
  },

  // ---------------- NATUREZA ----------------
  {
    id: "seed-nat-01",
    year: 2023,
    area: "NATUREZA",
    disciplina: "Biologia",
    competencia: "Competência 4 - Compreender interações entre organismos e ambiente",
    habilidade: "H13 - Reconhecer mecanismos de transmissão da vida",
    conteudo: "Genética",
    subconteudo: "Primeira Lei de Mendel",
    enunciado:
      "Em ervilhas, a cor amarela da semente (V) é dominante sobre a verde (v). Do cruzamento entre dois indivíduos heterozigotos (Vv x Vv), qual é a probabilidade de descendentes com semente verde?",
    alternativaA: "0%",
    alternativaB: "25%",
    alternativaC: "50%",
    alternativaD: "75%",
    alternativaE: "100%",
    correta: "B",
    comentario:
      "Cruzando Vv x Vv, o quadrado de Punnett dá 1 VV : 2 Vv : 1 vv. Apenas vv expressa o fenótipo recessivo (verde) = 1/4 = 25%.",
    resolucaoPassoPasso:
      "1) Monte o quadrado de Punnett para Vv x Vv.\n2) Gametas: V e v de cada pai.\n3) Resultados: VV, Vv, Vv, vv → 1:2:1.\n4) Recessivo (vv) = 1 em 4 = 25%.",
    explicacaoSimplificada:
      "Dois pais heterozigotos (Vv) têm 1 em 4 chances de gerar filho vv, que é o verde.",
    explicacaoDetalhada:
      "A 1ª Lei de Mendel (segregação) afirma que cada gameta carrega apenas um alelo de cada gene. No cruzamento Vv x Vv, a combinação aleatória dos gametas gera proporção 1:2:1 genotípica e 3:1 fenotípica.",
    conceitos: ["dominância", "heterozigoto", "Mendel", "quadrado de Punnett"],
    assuntosRelacionados: ["alelos", "fenótipo", "genótipo"],
    dicas: [
      "Sempre monte o quadrado de Punnett quando travar.",
      "Recessivo só aparece em homozigose.",
    ],
    dificuldade: "FACIL",
    tempoMedioSegundos: 120,
    tags: ["genética", "Mendel"],
  },
  {
    id: "seed-nat-02",
    year: 2022,
    area: "NATUREZA",
    disciplina: "Química",
    competencia: "Competência 5 - Entender métodos científicos e tecnológicos",
    habilidade: "H17 - Relacionar informações para resolver problemas",
    conteudo: "Estequiometria",
    subconteudo: "Cálculos com mol",
    enunciado:
      "Na reação completa de combustão do metano: CH4 + 2 O2 → CO2 + 2 H2O. Quantos mols de água são produzidos a partir de 5 mols de CH4, considerando excesso de O2?",
    alternativaA: "2,5 mols",
    alternativaB: "5 mols",
    alternativaC: "7,5 mols",
    alternativaD: "10 mols",
    alternativaE: "20 mols",
    correta: "D",
    comentario:
      "A proporção estequiométrica é 1 CH4 : 2 H2O. Logo, 5 mols de CH4 produzem 10 mols de água.",
    resolucaoPassoPasso:
      "1) Identifique a proporção: 1 mol CH4 → 2 mols H2O.\n2) Multiplique por 5: 5 × 2 = 10 mols.\n3) O excesso de O2 garante que CH4 é o limitante.",
    explicacaoSimplificada:
      "1 metano gera 2 águas. Então 5 metanos geram 10 águas.",
    explicacaoDetalhada:
      "Estequiometria usa os coeficientes da equação balanceada como razões molares. A combustão completa do metano consome 2 mols de O2 e libera 2 mols de H2O por mol de CH4. Sem reagente limitante diferente do esperado, a conta é direta.",
    conceitos: ["estequiometria", "mol", "combustão", "balanceamento"],
    assuntosRelacionados: ["reações químicas", "reagente limitante"],
    dicas: [
      "Sempre verifique se a equação está balanceada.",
      "Razão molar = relação direta dos coeficientes.",
    ],
    dificuldade: "FACIL",
    tempoMedioSegundos: 120,
    tags: ["química", "estequiometria"],
  },
  {
    id: "seed-nat-03",
    year: 2021,
    area: "NATUREZA",
    disciplina: "Física",
    competencia: "Competência 6 - Aplicar conhecimentos de mecânica",
    habilidade: "H21 - Resolver situações-problema envolvendo dinâmica",
    conteudo: "Cinemática",
    subconteudo: "Movimento uniformemente variado",
    enunciado:
      "Um carro parte do repouso e acelera uniformemente a 2 m/s². Qual é a velocidade do carro após 10 segundos?",
    alternativaA: "5 m/s",
    alternativaB: "10 m/s",
    alternativaC: "15 m/s",
    alternativaD: "20 m/s",
    alternativaE: "25 m/s",
    correta: "D",
    comentario:
      "Aplicando v = v0 + a·t, com v0 = 0, a = 2 m/s², t = 10 s: v = 0 + 2·10 = 20 m/s.",
    resolucaoPassoPasso:
      "1) Identifique: v0 = 0, a = 2 m/s², t = 10 s.\n2) Equação horária da velocidade no MUV: v = v0 + a·t.\n3) Substitua: v = 0 + 2 × 10 = 20 m/s.",
    explicacaoSimplificada:
      "Saindo do zero, ganha 2 m/s a cada segundo. Em 10 s, está em 20 m/s.",
    explicacaoDetalhada:
      "No MUV, a aceleração é constante. A relação linear entre velocidade e tempo é dada por v = v0 + a·t. A partir do repouso (v0 = 0), basta multiplicar a por t.",
    conceitos: ["MUV", "aceleração", "velocidade", "cinemática"],
    assuntosRelacionados: ["queda livre", "MRU"],
    dicas: [
      "Memorize as 3 equações do MUV.",
      "Parte do repouso = v0 = 0.",
    ],
    dificuldade: "FACIL",
    tempoMedioSegundos: 100,
    tags: ["física", "cinemática"],
  },

  // ---------------- MATEMATICA ----------------
  {
    id: "seed-mat-01",
    year: 2023,
    area: "MATEMATICA",
    disciplina: "Matemática",
    competencia: "Competência 1 - Construir significados para os números",
    habilidade: "H3 - Resolver situação-problema envolvendo conhecimentos numéricos",
    conteudo: "Porcentagem",
    subconteudo: "Aumento e desconto sucessivos",
    enunciado:
      "Um produto teve seu preço aumentado em 20% e, em seguida, sofreu um desconto de 20% sobre o novo valor. O preço final, em relação ao original, é:",
    alternativaA: "igual ao original.",
    alternativaB: "4% maior que o original.",
    alternativaC: "4% menor que o original.",
    alternativaD: "20% maior que o original.",
    alternativaE: "20% menor que o original.",
    correta: "C",
    comentario:
      "Aumentos e descontos sucessivos não se cancelam aritmeticamente. Multiplicando: 1,20 × 0,80 = 0,96 → 96% do original = 4% menor.",
    resolucaoPassoPasso:
      "1) Suponha preço original P.\n2) Após aumento: P × 1,20.\n3) Após desconto sobre o novo valor: (P × 1,20) × 0,80.\n4) Resultado: P × 0,96 → 4% menor.",
    explicacaoSimplificada:
      "Subir 20% e descer 20% não dá zero. Sobra 96% do preço, que é 4% a menos.",
    explicacaoDetalhada:
      "Quando aplicamos variações percentuais sucessivas, multiplicamos os fatores (1 ± i). Como o desconto é aplicado sobre um valor maior, ele \"vale mais em reais\" do que o aumento na origem, mas em fator absoluto o resultado fica abaixo de 1.",
    conceitos: ["porcentagem", "fator multiplicativo", "variação"],
    assuntosRelacionados: ["juros", "matemática financeira"],
    dicas: [
      "Use fator: aumento de x% = 1 + x/100; desconto = 1 − x/100.",
      "Multiplique os fatores, não some os percentuais.",
    ],
    dificuldade: "FACIL",
    tempoMedioSegundos: 120,
    tags: ["porcentagem", "aritmética"],
  },
  {
    id: "seed-mat-02",
    year: 2022,
    area: "MATEMATICA",
    disciplina: "Matemática",
    competencia: "Competência 2 - Utilizar conhecimentos geométricos",
    habilidade: "H8 - Resolver situações com figuras planas",
    conteudo: "Geometria plana",
    subconteudo: "Área de figuras",
    enunciado:
      "Um terreno retangular tem 30 m de comprimento e 20 m de largura. Qual é a área desse terreno, em metros quadrados?",
    alternativaA: "50",
    alternativaB: "100",
    alternativaC: "300",
    alternativaD: "600",
    alternativaE: "900",
    correta: "D",
    comentario: "Área do retângulo = base × altura = 30 × 20 = 600 m².",
    resolucaoPassoPasso:
      "1) Fórmula da área do retângulo: A = b × h.\n2) Substitua: A = 30 × 20 = 600.\n3) Unidade: m².",
    explicacaoSimplificada:
      "Multiplica os dois lados. 30 × 20 = 600.",
    explicacaoDetalhada:
      "A área de figuras retangulares é o produto das dimensões. Sempre mantenha a unidade consistente (m × m = m²).",
    conceitos: ["área", "retângulo", "geometria plana"],
    assuntosRelacionados: ["perímetro", "unidades de medida"],
    dicas: [
      "Confira sempre a unidade.",
      "Retângulo: A = base × altura. Triângulo: divida por 2.",
    ],
    dificuldade: "FACIL",
    tempoMedioSegundos: 60,
    tags: ["geometria", "área"],
  },
  {
    id: "seed-mat-03",
    year: 2021,
    area: "MATEMATICA",
    disciplina: "Matemática",
    competencia: "Competência 7 - Interpretar informações estatísticas",
    habilidade: "H27 - Calcular medidas de tendência central",
    conteudo: "Estatística básica",
    subconteudo: "Média aritmética",
    enunciado:
      "As notas de um aluno em 4 provas foram 7, 8, 6 e 9. Qual é a média aritmética dessas notas?",
    alternativaA: "6,5",
    alternativaB: "7,0",
    alternativaC: "7,5",
    alternativaD: "8,0",
    alternativaE: "8,5",
    correta: "C",
    comentario: "Média = (7 + 8 + 6 + 9)/4 = 30/4 = 7,5.",
    resolucaoPassoPasso:
      "1) Some as notas: 7 + 8 + 6 + 9 = 30.\n2) Divida pela quantidade: 30 / 4 = 7,5.",
    explicacaoSimplificada: "Soma todas as notas e divide por quantas notas tem.",
    explicacaoDetalhada:
      "A média aritmética simples é a soma dos valores dividida pela quantidade. É a medida de tendência central mais usada, mas sensível a valores extremos (outliers).",
    conceitos: ["média", "estatística", "tendência central"],
    assuntosRelacionados: ["mediana", "moda", "média ponderada"],
    dicas: [
      "Confira se a soma bate antes de dividir.",
      "Se tiver pesos diferentes, é média ponderada.",
    ],
    dificuldade: "FACIL",
    tempoMedioSegundos: 60,
    tags: ["estatística", "média"],
  },
];

async function main() {
  // Usuários de teste
  const alunoSenha = await bcrypt.hash("123456", 10);
  const professorSenha = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "aluno@teste.com" },
    create: {
      name: "Aluno Teste",
      email: "aluno@teste.com",
      password: alunoSenha,
      role: "ALUNO",
      plan: "FREE",
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "professor@teste.com" },
    create: {
      name: "Professor Teste",
      email: "professor@teste.com",
      password: professorSenha,
      role: "PROFESSOR",
      plan: "PRO",
    },
    update: {},
  });

  // Questões
  for (const q of QUESTOES) {
    await prisma.question.upsert({
      where: { id: q.id },
      create: {
        id: q.id,
        year: q.year,
        area: q.area,
        disciplina: q.disciplina,
        competencia: q.competencia,
        habilidade: q.habilidade,
        conteudo: q.conteudo,
        subconteudo: q.subconteudo ?? null,
        enunciado: q.enunciado,
        alternativaA: q.alternativaA,
        alternativaB: q.alternativaB,
        alternativaC: q.alternativaC,
        alternativaD: q.alternativaD,
        alternativaE: q.alternativaE,
        correta: q.correta,
        comentario: q.comentario,
        resolucaoPassoPasso: q.resolucaoPassoPasso,
        explicacaoSimplificada: q.explicacaoSimplificada,
        explicacaoDetalhada: q.explicacaoDetalhada,
        conceitosJson: JSON.stringify(q.conceitos),
        assuntosRelacionadosJson: JSON.stringify(q.assuntosRelacionados),
        dicasJson: JSON.stringify(q.dicas),
        dificuldade: q.dificuldade,
        tempoMedioSegundos: q.tempoMedioSegundos,
        geradaPorIA: false,
        tagsJson: JSON.stringify(q.tags),
      },
      update: {},
    });
  }

  console.log(`✅ Seed concluído.`);
  console.log(`   - ${QUESTOES.length} questões`);
  console.log(`   - 2 usuários (aluno@teste.com / professor@teste.com — senha: 123456)`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
