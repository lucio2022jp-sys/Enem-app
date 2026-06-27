import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function ProfessorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/entrar");
  if (session.user.role !== "PROFESSOR" && session.user.role !== "ADMIN") {
    redirect("/inicio");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
              <Link href="/professor/redacoes">Redações</Link>
              <Link href="/professor/questoes">Questões</Link>
            </nav>
          </div>
          <div className="text-sm text-slate-600">
            {session.user.name} ·{" "}
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
              {session.user.role}
            </span>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
