/**
 * Página pública: exemplo de redação corrigida pela IA.
 * Mostra ao aluno (e ao visitante) o nível de detalhe da correção
 * sem precisar enviar nada.
 */
import Link from "next/link";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Exemplo de redação corrigida — ENEM App",
  description:
    "Veja como nossa IA corrige uma redação no padrão ENEM, com nota por competência, comentário e versão reescrita.",
};

const TEMA =
  "Os desafios do combate à desinformação digital no Brasil";

const TEXTO_ALUNO = `A obra "1984", de George Orwell, expõe um cenário em que a manipulação da informação é usada como ferramenta de controle social. Embora ficcional, esse retrato dialoga com a realidade brasileira contemporânea, em que o fenômeno da desinformação digital se espalha em ritmo acelerado pelas redes sociais e aplicativos de mensagem. Combater essa prática tornou-se um dos maiores desafios do país.

Em primeiro lugar, é preciso reconhecer que a desinformação se aproveita do baixo nível de letramento midiático da população. Segundo pesquisa do Datafolha, mais de 60% dos brasileiros já compartilharam notícias falsas sem checar a procedência. Essa dificuldade em distinguir conteúdo confiável de boato é potencializada pelos algoritmos das plataformas, que entregam ao usuário aquilo que confirma seus próprios vieses, formando bolhas ideológicas.

Além disso, a regulamentação do ambiente digital ainda é tímida. As grandes plataformas, que lucram com o engajamento, têm pouco incentivo econômico para coibir conteúdo enganoso. Iniciativas como o PL das Fake News tramitam há anos no Congresso sem aprovação, deixando o Brasil sem um marco claro de responsabilização. Esse vácuo legal permite que campanhas de desinformação afetem eleições, ações de saúde pública e até o convívio familiar.

Portanto, urge enfrentar o problema em duas frentes. O Ministério da Educação, em parceria com escolas públicas e privadas, deve incluir letramento midiático e checagem de fatos no currículo do ensino básico, por meio de oficinas práticas com agências de checagem. Paralelamente, o Congresso Nacional precisa aprovar legislação que obrigue as plataformas a sinalizar conteúdo desmentido e a publicar relatórios periódicos sobre moderação. Só assim a sociedade conseguirá responder, de forma coletiva, ao desafio orwelliano que se renova a cada compartilhamento.`;

const NOTAS = { c1: 180, c2: 200, c3: 160, c4: 180, c5: 200, total: 920 };

const COMPS = [
  {
    label: "C1 — Domínio da norma culta",
    nota: NOTAS.c1,
    comentario:
      "Texto bem articulado, com vocabulário variado e uso correto da norma padrão. Pontuais oscilações de pontuação em períodos longos não comprometem a leitura.",
  },
  {
    label: "C2 — Compreensão do tema",
    nota: NOTAS.c2,
    comentario:
      "Tese clara desde a introdução. O recorte sobre letramento midiático e regulação demonstra repertório sociocultural produtivo, inclusive com referência literária pertinente (Orwell) e dado estatístico atualizado.",
  },
  {
    label: "C3 — Argumentação",
    nota: NOTAS.c3,
    comentario:
      "Dois eixos de causa bem desenvolvidos (educacional e regulatório). Faltou aprofundar consequências concretas (ex.: efeitos na pandemia ou em eleições) com mais dado/exemplo para sustentar a tese.",
  },
  {
    label: "C4 — Mecanismos linguísticos",
    nota: NOTAS.c4,
    comentario:
      "Conectivos bem empregados entre parágrafos (Em primeiro lugar, Além disso, Portanto). Cuidado com repetição de “desinformação” — alternar com sinônimos como “conteúdo enganoso” ou “notícias falsas” fortalece a coesão.",
  },
  {
    label: "C5 — Proposta de intervenção",
    nota: NOTAS.c5,
    comentario:
      "Proposta completa: agente (MEC, Congresso), ação (currículo + lei), meio (oficinas, marco legal), finalidade (combater desinformação) e detalhamento (relatórios de moderação, parceria com agências de checagem).",
  },
];

const COMENTARIO_GERAL = `Boa redação dissertativo-argumentativa. A linha que liga literatura (1984) → diagnóstico (letramento + plataformas) → proposta (MEC + Congresso) cria uma estrutura argumentativa coesa. Para chegar à nota máxima, invista em dado específico ainda mais recente e em mais conectivos que marquem oposição e adversidade ao longo do desenvolvimento.`;

const SUGESTOES = [
  "Evite repetir o termo-chave (“desinformação”) em parágrafos seguidos.",
  "Inclua um dado quantitativo no parágrafo de regulação (ex.: número de denúncias ao MPF, casos de moderação).",
  "Use mais conectivos de oposição (“em contrapartida”, “entretanto”) para mostrar diferentes ângulos.",
  "Reforce a proposta com prazo (“nos próximos 12 meses”) para deixar a intervenção mais concreta.",
];

const REESCRITA = `A obra "1984", de George Orwell, retrata uma sociedade em que a informação é manipulada como ferramenta de poder. Esse paralelo ficcional dialoga com o Brasil atual, em que o fenômeno das notícias falsas se propaga em ritmo acelerado pelas redes sociais e aplicativos de mensagem. Combater essa prática tornou-se um dos maiores desafios democráticos do país.

Em primeiro lugar, é preciso considerar o baixo nível de letramento midiático da população. Segundo o Datafolha (2023), mais de 60% dos brasileiros já compartilharam conteúdos enganosos sem checar a procedência. Essa dificuldade é potencializada pelos algoritmos das plataformas, que entregam aos usuários aquilo que confirma seus próprios vieses, criando bolhas ideológicas e diminuindo o contato com pontos de vista divergentes.

Em contrapartida, a regulamentação do ambiente digital permanece tímida. As grandes plataformas, que lucram com o engajamento, têm pouco incentivo econômico para coibir esse tipo de conteúdo. Iniciativas como o PL das Fake News tramitam há mais de quatro anos no Congresso sem aprovação, deixando o Brasil sem marco claro de responsabilização. Esse vácuo legal já afetou eleições, campanhas de vacinação e até o convívio familiar, segundo levantamento da UFRJ.

Portanto, urge enfrentar o problema em duas frentes. O Ministério da Educação, em parceria com escolas públicas e privadas, deve incluir letramento midiático no currículo do ensino básico, por meio de oficinas práticas com agências de checagem — meta a ser cumprida nos próximos 12 meses. Paralelamente, o Congresso Nacional precisa aprovar legislação que obrigue plataformas a sinalizar conteúdo desmentido e publicar relatórios trimestrais de moderação. Apenas com educação e regulação a sociedade brasileira responderá, de forma coletiva, ao desafio orwelliano que se renova a cada compartilhamento.`;

function CompetenciaCard({
  label,
  nota,
  comentario,
}: {
  label: string;
  nota: number;
  comentario: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
        <span className="text-sm font-bold text-indigo-600">{nota} / 200</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-indigo-500"
          style={{ width: `${(nota / 200) * 100}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        {comentario}
      </p>
    </div>
  );
}

export default function RedacaoExemploPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge tone="amber">Exemplo</Badge>
          <Badge tone="green">Corrigida pela IA</Badge>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">
          Como a correção da IA funciona
        </h1>
        <p className="text-slate-600">
          Esta é uma redação real no padrão ENEM e a correção completa que a IA
          gera. Quando você enviar a sua, recebe esse mesmo nível de detalhe.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Tema proposto
              </p>
              <h2 className="text-base font-semibold text-slate-900">
                {TEMA}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Nota final
              </p>
              <p className="text-3xl font-bold text-indigo-600">
                {NOTAS.total}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <article className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
            {TEXTO_ALUNO}
          </article>
        </CardBody>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          Nota por competência
        </h2>
        <p className="text-sm text-slate-600">
          A IA pontua cada uma das 5 competências do ENEM (0 a 200) e explica o
          porquê.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {COMPS.map((c) => (
            <CompetenciaCard key={c.label} {...c} />
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">
            Comentário geral
          </h2>
        </CardHeader>
        <CardBody>
          <p className="text-sm leading-relaxed text-slate-700">
            {COMENTARIO_GERAL}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">
            Sugestões pra próxima
          </h2>
        </CardHeader>
        <CardBody>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
            {SUGESTOES.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">
              Versão reescrita pela IA
            </h2>
            <Badge tone="indigo">incluso no Pro</Badge>
          </div>
        </CardHeader>
        <CardBody>
          <p className="mb-3 text-xs text-slate-500">
            A IA mantém as ideias do aluno, mas aplica as melhorias apontadas
            para mostrar como ficaria uma versão mais próxima de 1000.
          </p>
          <article className="whitespace-pre-wrap rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 text-sm leading-relaxed text-slate-800">
            {REESCRITA}
          </article>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Pronto pra enviar a sua?
            </p>
            <p className="text-xs text-slate-500">
              Correção em segundos pela IA, com opção de revisão humana no Pro.
            </p>
          </div>
          <Link href="/redacao/nova">
            <Button>Escrever minha redação</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
