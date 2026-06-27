import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { carregarPerfil } from "@/lib/perfil/calcular";
import { prisma } from "@/lib/prisma";
import { parseJson } from "@/lib/utils";
import type { ConteudoScore } from "@/types";

interface NoConteudo {
  conteudo: string;
  area: string;
  pct: number;
  total: number;
  acertos: number;
  cor: "verde" | "amarelo" | "vermelho" | "cinza";
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const perfil = await carregarPerfil(session.user.id);
  const conteudoScores: Record<string, ConteudoScore> = perfil?.conteudoScores ?? {};

  // Lista de todos conteúdos cadastrados no banco de questões (universo)
  const questoes = await prisma.question.findMany({
    select: { conteudo: true, area: true },
  });
  const universo = new Map<string, string>();
  for (const q of questoes) {
    if (q.conteudo) universo.set(q.conteudo, q.area);
  }

  const nos: NoConteudo[] = [];
  for (const [conteudo, area] of universo) {
    const s = conteudoScores[conteudo];
    if (!s) {
      nos.push({ conteudo, area, pct: 0, total: 0, acertos: 0, cor: "cinza" });
      continue;
    }
    let cor: NoConteudo["cor"] = "amarelo";
    if (s.total < 3) cor = "cinza";
    else if (s.pct >= 75) cor = "verde";
    else if (s.pct < 50) cor = "vermelho";
    nos.push({
      conteudo,
      area: s.area || area,
      pct: s.pct,
      total: s.total,
      acertos: s.acertos,
      cor,
    });
  }

  // Agrupado por área
  const porArea: Record<string, NoConteudo[]> = {};
  for (const n of nos) {
    porArea[n.area] = porArea[n.area] ?? [];
    porArea[n.area]!.push(n);
  }
  for (const a of Object.keys(porArea)) {
    porArea[a]!.sort((x, y) => x.pct - y.pct);
  }

  return NextResponse.json({ porArea, total: nos.length });
}
