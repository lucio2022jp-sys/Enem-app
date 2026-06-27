import { chamarClaude, extrairJSON, temIA } from "./client";

const TEMAS_FALLBACK = [
  "Os caminhos para combater o trabalho análogo à escravidão no Brasil contemporâneo",
  "Desafios para a valorização do trabalho docente na educação básica brasileira",
  "A democratização do acesso ao cinema nacional no Brasil",
  "Caminhos para mitigar a desigualdade no acesso à internet no Brasil",
  "Os impactos da solidão na sociedade brasileira contemporânea",
];

const SYSTEM_PROMPT = `Você é elaborador de temas de redação no padrão ENEM. Gere temas inéditos, polêmicos com brandura, conectados a problemas sociais/culturais/educacionais brasileiros contemporâneos. Os temas devem ser dissertativo-argumentativos e cabíveis em propostas de intervenção.

Devolva SOMENTE JSON válido (sem markdown), formato:
{ "temas": [string, string, string] }
Cada item é uma frase tema clara, sem dois-pontos no início, sem perguntas.`;

export async function gerarTema(): Promise<string> {
  const temas = await gerarTemas(1);
  return temas[0] ?? TEMAS_FALLBACK[0];
}

export async function gerarTemas(quantos = 3): Promise<string[]> {
  if (!temIA()) {
    return TEMAS_FALLBACK.slice(0, quantos);
  }
  try {
    const texto = await chamarClaude({
      systemPrompt: SYSTEM_PROMPT,
      userMessage: `Gere ${Math.max(1, Math.min(5, quantos))} temas inéditos no padrão ENEM agora. Apenas JSON.`,
      maxTokens: 500,
      temperature: 0.9,
    });
    const obj = extrairJSON<{ temas: string[] }>(texto);
    if (Array.isArray(obj.temas) && obj.temas.length) return obj.temas;
  } catch (err) {
    console.error("[gerarTemas] falhou:", err);
  }
  return TEMAS_FALLBACK.slice(0, quantos);
}
