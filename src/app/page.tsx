import Link from "next/link";
import {
  Brain,
  Target,
  Sparkles,
  PenLine,
  ListChecks,
  BookOpenCheck,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="flex items-center gap-3">
            <Link href="/entrar">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastrar">
              <Button size="sm">Cadastrar</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-50 to-white">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-medium text-indigo-700">
              <Sparkles className="h-3.5 w-3.5" /> Prática deliberada com IA
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Pare de assistir. Comece a treinar.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Sem videoaula. Você resolve questões inéditas no padrão ENEM,
              recebe comentários no texto e melhora onde mais erra. Redação
              corrigida por IA e revisada por professor parceiro.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/cadastrar">
                <Button size="lg">Quero começar agora</Button>
              </Link>
              <Link href="/entrar">
                <Button size="lg" variant="outline">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section className="border-t border-slate-100 bg-white py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-bold text-slate-900">
              Como funciona
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-slate-600">
              Quatro passos pra sair da passividade do vídeo e entrar na prática
              que realmente sobe nota.
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  n: "1",
                  t: "Diagnóstico inicial",
                  d: "12 questões pra mapear suas áreas fortes e fracas.",
                },
                {
                  n: "2",
                  t: "Trilha personalizada",
                  d: "Sua rota de estudo se ajusta ao seu perfil em tempo real.",
                },
                {
                  n: "3",
                  t: "Treino com correção",
                  d: "Questões inéditas, comentário detalhado e classificação do erro.",
                },
                {
                  n: "4",
                  t: "Redação + simulados",
                  d: "IA corrige nas 5 competências e professor revisa.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-slate-900">
                    {s.t}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Por que funciona */}
        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-2xl font-bold text-slate-900">
              Por que funciona
            </h2>
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <Target className="h-6 w-6 text-indigo-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  Prática deliberada
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Nada de assistir aula sem fim. Você treina o que está fraco e
                  evita o que já domina.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <Brain className="h-6 w-6 text-indigo-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  IA que aprende com você
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Cada erro classificado vira insumo. As próximas questões já
                  vêm calibradas pro seu nível.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <BookOpenCheck className="h-6 w-6 text-indigo-600" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  Comentário sempre detalhado
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Passo a passo, explicação simples, explicação aprofundada,
                  conceitos relacionados e dicas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Preços */}
        <section className="bg-white py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-center text-2xl font-bold text-slate-900">
              Planos
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900">Free</h3>
                <p className="mt-1 text-3xl font-bold text-slate-900">R$ 0</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <ListChecks className="mt-0.5 h-4 w-4 text-indigo-600" />
                    20 questões por mês
                  </li>
                  <li className="flex items-start gap-2">
                    <PenLine className="mt-0.5 h-4 w-4 text-indigo-600" />1
                    redação corrigida por IA por mês
                  </li>
                </ul>
                <div className="mt-6">
                  <Link href="/cadastrar">
                    <Button variant="outline" className="w-full">
                      Começar grátis
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border-2 border-indigo-600 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    Recomendado
                  </span>
                </div>
                <p className="mt-1 text-3xl font-bold text-slate-900">
                  R$ 29,90
                  <span className="text-sm font-medium text-slate-500">
                    /mês
                  </span>
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li>Questões ilimitadas geradas pra você</li>
                  <li>Redações corrigidas por IA + revisão por professor</li>
                  <li>Simulados personalizados com nota estimada</li>
                  <li>Revisão espaçada inteligente</li>
                </ul>
                <div className="mt-6">
                  <Link href="/cadastrar">
                    <Button className="w-full">Quero o Pro</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-500 sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} ENEM Treino. Feito pra treinar.</p>
        </div>
      </footer>
    </div>
  );
}
