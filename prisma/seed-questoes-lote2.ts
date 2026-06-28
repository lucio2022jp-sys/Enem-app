/**
 * Lote 2 de questões — versão compacta. Foca em volume para popular o banco
 * o suficiente pra simulados rodarem.
 *
 * Cada questão tem o mínimo necessário: enunciado, 5 alternativas, gabarito,
 * comentário curto e área/conteúdo.
 */

export type SeedQuestao = {
  id: string;
  year: number;
  area: "LINGUAGENS" | "HUMANAS" | "NATUREZA" | "MATEMATICA";
  disciplina: string;
  conteudo: string;
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  alternativaD: string;
  alternativaE: string;
  correta: "A" | "B" | "C" | "D" | "E";
  comentario: string;
  dificuldade: "FACIL" | "MEDIO" | "DIFICIL";
  tempoMedioSegundos?: number;
};

export const QUESTOES_LOTE2: SeedQuestao[] = [
  // ============ LINGUAGENS ============
  {
    id: "seed2-ling-01",
    year: 2022,
    area: "LINGUAGENS",
    disciplina: "Português",
    conteudo: "Funções da linguagem",
    enunciado:
      'Em "Não chore por mim, Argentina", a função da linguagem que predomina é aquela centrada no destinatário, característica de apelos, ordens e vocativos. Essa função é a:',
    alternativaA: "emotiva",
    alternativaB: "conativa",
    alternativaC: "fática",
    alternativaD: "poética",
    alternativaE: "metalinguística",
    correta: "B",
    comentario:
      "Função conativa (ou apelativa) está centrada no receptor, com uso de vocativo, imperativo e 2ª pessoa.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-ling-02",
    year: 2021,
    area: "LINGUAGENS",
    disciplina: "Português",
    conteudo: "Variação linguística",
    enunciado:
      "A variedade linguística marcada por um grupo social específico (gírias de jovens, jargão técnico) é chamada de variação:",
    alternativaA: "diatópica",
    alternativaB: "diacrônica",
    alternativaC: "diastrática",
    alternativaD: "diafásica",
    alternativaE: "diamésica",
    correta: "C",
    comentario:
      "Diastrática = grupo social. Diatópica = região, diacrônica = tempo, diafásica = situação, diamésica = meio (oral/escrito).",
    dificuldade: "MEDIO",
  },
  {
    id: "seed2-ling-03",
    year: 2020,
    area: "LINGUAGENS",
    disciplina: "Português",
    conteudo: "Figuras de linguagem",
    enunciado:
      'Em "A noite é uma criança que ainda não aprendeu a dormir", o recurso utilizado é:',
    alternativaA: "metonímia",
    alternativaB: "hipérbole",
    alternativaC: "eufemismo",
    alternativaD: "personificação",
    alternativaE: "antítese",
    correta: "D",
    comentario:
      "Personificação (prosopopeia) atribui ações humanas a seres inanimados. A noite ganha qualidade humana (aprender a dormir).",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-ling-04",
    year: 2023,
    area: "LINGUAGENS",
    disciplina: "Literatura",
    conteudo: "Romantismo",
    enunciado:
      "No Romantismo brasileiro, José de Alencar criou heróis indígenas idealizados como representação:",
    alternativaA: "do colonizador europeu civilizado.",
    alternativaB: "da identidade nacional em construção.",
    alternativaC: "da crítica direta ao governo imperial.",
    alternativaD: "do realismo social das senzalas.",
    alternativaE: "do positivismo científico francês.",
    correta: "B",
    comentario:
      "O índio idealizado de Alencar (Iracema, O Guarani) era símbolo de uma identidade brasileira distinta da europeia.",
    dificuldade: "MEDIO",
  },
  {
    id: "seed2-ling-05",
    year: 2019,
    area: "LINGUAGENS",
    disciplina: "Inglês",
    conteudo: "Interpretação de texto",
    enunciado:
      '"Climate change is no longer a future problem. It is happening now, faster than scientists predicted." Segundo o trecho, o autor sustenta que:',
    alternativaA: "as mudanças climáticas só ocorrerão no futuro distante.",
    alternativaB: "os cientistas estavam corretos em suas previsões.",
    alternativaC: "as mudanças climáticas estão acontecendo agora, em ritmo maior do que o previsto.",
    alternativaD: "a humanidade pode ignorar o problema com segurança.",
    alternativaE: "os efeitos do clima são exagerados pela imprensa.",
    correta: "C",
    comentario: '"It is happening now, faster than scientists predicted" — está acontecendo agora, mais rápido que previsto.',
    dificuldade: "FACIL",
  },
  {
    id: "seed2-ling-06",
    year: 2022,
    area: "LINGUAGENS",
    disciplina: "Português",
    conteudo: "Concordância verbal",
    enunciado:
      'Assinale a alternativa em que a concordância verbal está correta:',
    alternativaA: "Fazem dez anos que ela se mudou.",
    alternativaB: "Houveram muitas reclamações no setor.",
    alternativaC: "Tratam-se de questões delicadas.",
    alternativaD: "Faz dez anos que ela se mudou.",
    alternativaE: "Existe muitos problemas pendentes.",
    correta: "D",
    comentario:
      "\"Fazer\" indicando tempo decorrido é impessoal: fica no singular. \"Faz dez anos\".",
    dificuldade: "MEDIO",
  },

  // ============ HUMANAS ============
  {
    id: "seed2-hum-01",
    year: 2022,
    area: "HUMANAS",
    disciplina: "História",
    conteudo: "República Velha",
    enunciado:
      "A política do café com leite, característica da Primeira República (1894-1930), consistia em:",
    alternativaA: "subsídio direto a agricultores familiares.",
    alternativaB: "alternância de presidentes entre as oligarquias paulista e mineira.",
    alternativaC: "aliança militar entre o sul e o nordeste.",
    alternativaD: "monopólio estatal da produção de café e leite.",
    alternativaE: "tributação progressiva sobre exportações.",
    correta: "B",
    comentario:
      "A política do café com leite era o acordo informal entre as elites de SP (café) e MG (leite) que se revezavam na presidência.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-hum-02",
    year: 2021,
    area: "HUMANAS",
    disciplina: "História",
    conteudo: "Revolução Industrial",
    enunciado:
      "A Revolução Industrial iniciada na Inglaterra no século XVIII trouxe transformações sociais como:",
    alternativaA: "fortalecimento do trabalho artesanal nas cidades.",
    alternativaB: "êxodo rural e formação do proletariado urbano.",
    alternativaC: "abolição imediata do trabalho infantil.",
    alternativaD: "redução da desigualdade entre países.",
    alternativaE: "retorno ao modelo feudal de produção.",
    correta: "B",
    comentario:
      "A mecanização atraiu trabalhadores do campo para as cidades, formando a classe operária industrial.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-hum-03",
    year: 2023,
    area: "HUMANAS",
    disciplina: "Geografia",
    conteudo: "Urbanização",
    enunciado:
      "O processo de metropolização no Brasil resultou em:",
    alternativaA: "redução das desigualdades sociais nas grandes cidades.",
    alternativaB: "diminuição da população urbana absoluta.",
    alternativaC: "formação de áreas conurbadas com problemas estruturais.",
    alternativaD: "fortalecimento do setor primário nas capitais.",
    alternativaE: "fim da especulação imobiliária.",
    correta: "C",
    comentario:
      "Metropolização gerou conurbação (cidades coladas) e desafios de mobilidade, moradia e saneamento.",
    dificuldade: "MEDIO",
  },
  {
    id: "seed2-hum-04",
    year: 2020,
    area: "HUMANAS",
    disciplina: "Sociologia",
    conteudo: "Émile Durkheim",
    enunciado:
      'Para Durkheim, o "fato social" se caracteriza por ser:',
    alternativaA: "individual, voluntário e mutável.",
    alternativaB: "exterior ao indivíduo, coercitivo e geral.",
    alternativaC: "exclusivamente econômico, segundo a luta de classes.",
    alternativaD: "psicológico, subjetivo e singular.",
    alternativaE: "metafísico e religioso por essência.",
    correta: "B",
    comentario:
      "Os três critérios durkheimianos do fato social: exterioridade, coercitividade e generalidade.",
    dificuldade: "MEDIO",
  },
  {
    id: "seed2-hum-05",
    year: 2019,
    area: "HUMANAS",
    disciplina: "Filosofia",
    conteudo: "Iluminismo",
    enunciado:
      'Kant resumiu o Iluminismo na frase "Sapere aude" — ousai saber. O sentido central é:',
    alternativaA: "submeter-se à tradição religiosa.",
    alternativaB: "usar a razão de forma autônoma, sem tutela.",
    alternativaC: "negar a possibilidade de conhecimento.",
    alternativaD: "valorizar o sentimento sobre a razão.",
    alternativaE: "aceitar a autoridade política sem questionar.",
    correta: "B",
    comentario:
      "Iluminismo = sair da menoridade intelectual; pensar por si mesmo, sem tutela de autoridades.",
    dificuldade: "MEDIO",
  },
  {
    id: "seed2-hum-06",
    year: 2022,
    area: "HUMANAS",
    disciplina: "Geografia",
    conteudo: "Hidrografia",
    enunciado:
      "A bacia hidrográfica brasileira com maior potencial hidrelétrico instalado é a:",
    alternativaA: "Bacia Amazônica",
    alternativaB: "Bacia do Paraná",
    alternativaC: "Bacia do São Francisco",
    alternativaD: "Bacia do Tocantins-Araguaia",
    alternativaE: "Bacia do Atlântico Sul",
    correta: "B",
    comentario:
      "A Bacia do Paraná concentra Itaipu, Ilha Solteira, Jupiá e outras grandes usinas — maior potencial instalado do país.",
    dificuldade: "DIFICIL",
  },

  // ============ NATUREZA ============
  {
    id: "seed2-nat-01",
    year: 2022,
    area: "NATUREZA",
    disciplina: "Biologia",
    conteudo: "Genética",
    enunciado:
      "No cruzamento entre dois heterozigotos para um par de alelos com dominância simples (Aa x Aa), a proporção fenotípica esperada na descendência é:",
    alternativaA: "1 : 1",
    alternativaB: "3 : 1",
    alternativaC: "1 : 2 : 1",
    alternativaD: "9 : 3 : 3 : 1",
    alternativaE: "todos dominantes",
    correta: "B",
    comentario: "Mendel: heterozigotos × heterozigotos → 3 dominantes : 1 recessivo na geração F2.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-nat-02",
    year: 2021,
    area: "NATUREZA",
    disciplina: "Química",
    conteudo: "Ligações químicas",
    enunciado:
      "A ligação química entre átomos de cloro (Cl) e sódio (Na) no NaCl é classificada como:",
    alternativaA: "covalente apolar",
    alternativaB: "covalente polar",
    alternativaC: "iônica",
    alternativaD: "metálica",
    alternativaE: "de Van der Waals",
    correta: "C",
    comentario:
      "Diferença de eletronegatividade alta (Na metal × Cl não-metal) caracteriza ligação iônica, com transferência de elétron.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-nat-03",
    year: 2023,
    area: "NATUREZA",
    disciplina: "Física",
    conteudo: "Cinemática",
    enunciado:
      "Um carro percorre 120 km em 2 horas com velocidade constante. Sua velocidade média é:",
    alternativaA: "30 km/h",
    alternativaB: "40 km/h",
    alternativaC: "50 km/h",
    alternativaD: "60 km/h",
    alternativaE: "90 km/h",
    correta: "D",
    comentario: "v = Δs/Δt = 120/2 = 60 km/h.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-nat-04",
    year: 2020,
    area: "NATUREZA",
    disciplina: "Biologia",
    conteudo: "Ecologia",
    enunciado:
      "Em uma cadeia alimentar com 4 níveis tróficos, o organismo que possui MENOR biomassa total tende a ser:",
    alternativaA: "produtor primário (vegetal)",
    alternativaB: "consumidor primário (herbívoro)",
    alternativaC: "consumidor secundário",
    alternativaD: "consumidor terciário (topo)",
    alternativaE: "decompositor",
    correta: "D",
    comentario:
      "A cada nível trófico, ~90% da energia é perdida. O topo da pirâmide tem a menor biomassa acumulada.",
    dificuldade: "MEDIO",
  },
  {
    id: "seed2-nat-05",
    year: 2019,
    area: "NATUREZA",
    disciplina: "Química",
    conteudo: "Estequiometria",
    enunciado:
      "Na reação 2 H₂ + O₂ → 2 H₂O, quantos mols de água são formados a partir de 6 mols de H₂?",
    alternativaA: "1 mol",
    alternativaB: "3 mols",
    alternativaC: "6 mols",
    alternativaD: "9 mols",
    alternativaE: "12 mols",
    correta: "C",
    comentario:
      "Proporção 2 H₂ : 2 H₂O → 1:1 com H₂O. Logo 6 mols de H₂ produzem 6 mols de H₂O.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-nat-06",
    year: 2022,
    area: "NATUREZA",
    disciplina: "Física",
    conteudo: "Eletricidade",
    enunciado:
      "Um aparelho de 220 V puxa corrente de 5 A. Sua potência é:",
    alternativaA: "44 W",
    alternativaB: "225 W",
    alternativaC: "440 W",
    alternativaD: "1100 W",
    alternativaE: "11000 W",
    correta: "D",
    comentario: "P = U·I = 220 × 5 = 1100 W.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-nat-07",
    year: 2021,
    area: "NATUREZA",
    disciplina: "Biologia",
    conteudo: "Sistema imunológico",
    enunciado:
      "As vacinas funcionam principalmente porque:",
    alternativaA: "matam o vírus diretamente no sangue.",
    alternativaB: "induzem a produção de anticorpos e memória imunológica.",
    alternativaC: "neutralizam toxinas presentes na alimentação.",
    alternativaD: "substituem células imunes defeituosas.",
    alternativaE: "alteram permanentemente o DNA do hospedeiro.",
    correta: "B",
    comentario:
      "A vacina apresenta um antígeno enfraquecido/inativado; o sistema imune produz anticorpos e mantém memória.",
    dificuldade: "FACIL",
  },

  // ============ MATEMÁTICA ============
  {
    id: "seed2-mat-01",
    year: 2022,
    area: "MATEMATICA",
    disciplina: "Matemática",
    conteudo: "Porcentagem",
    enunciado:
      "Um produto de R$ 200 sofre dois descontos sucessivos de 10% e 20%. Qual o preço final?",
    alternativaA: "R$ 140,00",
    alternativaB: "R$ 144,00",
    alternativaC: "R$ 150,00",
    alternativaD: "R$ 160,00",
    alternativaE: "R$ 180,00",
    correta: "B",
    comentario: "200 × 0,90 × 0,80 = 200 × 0,72 = R$ 144,00.",
    dificuldade: "MEDIO",
  },
  {
    id: "seed2-mat-02",
    year: 2023,
    area: "MATEMATICA",
    disciplina: "Matemática",
    conteudo: "Função do 1º grau",
    enunciado:
      "A função f(x) = 3x – 6 corta o eixo x quando:",
    alternativaA: "x = -3",
    alternativaB: "x = -2",
    alternativaC: "x = 0",
    alternativaD: "x = 2",
    alternativaE: "x = 6",
    correta: "D",
    comentario:
      "Raiz: f(x) = 0 → 3x – 6 = 0 → x = 2.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-mat-03",
    year: 2021,
    area: "MATEMATICA",
    disciplina: "Matemática",
    conteudo: "Probabilidade",
    enunciado:
      "Em um dado comum (6 faces), qual a probabilidade de sair um número par?",
    alternativaA: "1/6",
    alternativaB: "1/4",
    alternativaC: "1/3",
    alternativaD: "1/2",
    alternativaE: "2/3",
    correta: "D",
    comentario:
      "Casos favoráveis: 2, 4, 6 → 3. Casos possíveis: 6. P = 3/6 = 1/2.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-mat-04",
    year: 2020,
    area: "MATEMATICA",
    disciplina: "Matemática",
    conteudo: "Razão e proporção",
    enunciado:
      "Se 4 operários fazem uma obra em 12 dias, quantos dias 6 operários levarão (mesmo ritmo)?",
    alternativaA: "6 dias",
    alternativaB: "8 dias",
    alternativaC: "9 dias",
    alternativaD: "10 dias",
    alternativaE: "18 dias",
    correta: "B",
    comentario:
      "Grandezas inversamente proporcionais: 4·12 = 6·x → x = 48/6 = 8 dias.",
    dificuldade: "MEDIO",
  },
  {
    id: "seed2-mat-05",
    year: 2019,
    area: "MATEMATICA",
    disciplina: "Matemática",
    conteudo: "Geometria plana",
    enunciado:
      "Um triângulo retângulo tem catetos 6 e 8. Quanto vale a hipotenusa?",
    alternativaA: "9",
    alternativaB: "10",
    alternativaC: "12",
    alternativaD: "14",
    alternativaE: "100",
    correta: "B",
    comentario: "h² = 6² + 8² = 36 + 64 = 100 → h = 10.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-mat-06",
    year: 2022,
    area: "MATEMATICA",
    disciplina: "Matemática",
    conteudo: "Logaritmo",
    enunciado:
      "Qual o valor de log₂ 32?",
    alternativaA: "2",
    alternativaB: "4",
    alternativaC: "5",
    alternativaD: "6",
    alternativaE: "8",
    correta: "C",
    comentario: "2⁵ = 32, logo log₂ 32 = 5.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-mat-07",
    year: 2023,
    area: "MATEMATICA",
    disciplina: "Matemática",
    conteudo: "Estatística",
    enunciado:
      "A mediana do conjunto {3, 7, 9, 12, 15, 18, 20} é:",
    alternativaA: "9",
    alternativaB: "11",
    alternativaC: "12",
    alternativaD: "13",
    alternativaE: "15",
    correta: "C",
    comentario:
      "Conjunto ordenado, 7 elementos → mediana é o do meio (4º): 12.",
    dificuldade: "FACIL",
  },
  {
    id: "seed2-mat-08",
    year: 2021,
    area: "MATEMATICA",
    disciplina: "Matemática",
    conteudo: "Equação do 2º grau",
    enunciado:
      "As raízes de x² – 5x + 6 = 0 são:",
    alternativaA: "1 e 6",
    alternativaB: "2 e 3",
    alternativaC: "-2 e -3",
    alternativaD: "0 e 5",
    alternativaE: "5 e 6",
    correta: "B",
    comentario:
      "Soma = 5, produto = 6. Pares: 2 e 3. Verificando: 2² – 10 + 6 = 0. ✓",
    dificuldade: "MEDIO",
  },
];
