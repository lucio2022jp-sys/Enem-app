import { NextResponse } from "next/server";
import { gerarTemas } from "@/lib/ai/temaRedacao";

export const dynamic = "force-dynamic";

export async function GET() {
  const temas = await gerarTemas(3);
  return NextResponse.json({ temas });
}
