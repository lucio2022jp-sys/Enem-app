import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-sonnet-4-5-20250929";

let _client: Anthropic | null = null;

export function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (_client) return _client;
  _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export const anthropic = getAnthropic();

export function temIA(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Wrapper que monta o system block com prompt caching ephemeral.
 */
export async function chamarClaude({
  systemPrompt,
  userMessage,
  maxTokens = 2000,
  temperature = 0.7,
}: {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const client = getAnthropic();
  if (!client) throw new Error("ANTHROPIC_API_KEY não configurada");

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature,
    // cache_control habilita prompt caching (ephemeral). O SDK 0.32 ainda não
    // tipa este campo no TextBlockParam, então fazemos cast — em runtime a API
    // aceita normalmente e marca o bloco como cacheável.
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ] as any,
    messages: [{ role: "user", content: userMessage }],
  });

  const out = resp.content
    .map((c) => (c.type === "text" ? c.text : ""))
    .join("")
    .trim();

  return out;
}

/**
 * Tenta extrair JSON de uma resposta livre. Aceita ```json fences e objetos
 * soltos. Lança erro se não for possível.
 */
export function extrairJSON<T = unknown>(texto: string): T {
  if (!texto) throw new Error("Resposta vazia");

  // Tenta direto
  try {
    return JSON.parse(texto) as T;
  } catch {
    /* sigue */
  }

  // ```json ... ```
  const fenceMatch = texto.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim()) as T;
    } catch {
      /* sigue */
    }
  }

  // Primeiro objeto JSON detectado
  const start = texto.indexOf("{");
  const end = texto.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    const slice = texto.slice(start, end + 1);
    try {
      return JSON.parse(slice) as T;
    } catch {
      /* sigue */
    }
  }

  throw new Error("Não foi possível extrair JSON da resposta");
}
