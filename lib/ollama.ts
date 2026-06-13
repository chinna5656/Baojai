export type OllamaChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type OllamaChatResult = {
  content: string;
  model: string;
};

const DEFAULT_OLLAMA_BASE_URL = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "qwen2.5";
const DEFAULT_OLLAMA_TIMEOUT_MS = 120_000;

function getOllamaTimeoutMs() {
  const timeout = Number(process.env.OLLAMA_TIMEOUT_MS);

  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_OLLAMA_TIMEOUT_MS;
}

export function getOllamaConfig() {
  return {
    baseUrl: process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") || DEFAULT_OLLAMA_BASE_URL,
    model: process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL
  };
}

export async function checkOllamaStatus() {
  const { baseUrl, model } = getOllamaConfig();

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5_000)
    });

    if (!response.ok) {
      return { ok: false, baseUrl, model, models: [], error: `Ollama returned ${response.status}` };
    }

    const payload = (await response.json()) as { models?: Array<{ name: string }> };
    const models = payload.models?.map((item) => item.name) ?? [];

    return { ok: true, baseUrl, model, models, hasConfiguredModel: models.some((name) => name === model || name.startsWith(`${model}:`)) };
  } catch (error) {
    return {
      ok: false,
      baseUrl,
      model,
      models: [],
      error: error instanceof Error ? error.message : "Unable to connect to Ollama"
    };
  }
}

export async function askOllama(messages: OllamaChatMessage[]): Promise<OllamaChatResult> {
  const { baseUrl, model } = getOllamaConfig();
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: 0.3,
        top_p: 0.9
      }
    }),
    signal: AbortSignal.timeout(getOllamaTimeoutMs())
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Ollama returned ${response.status}${detail ? `: ${detail}` : ""}`);
  }

  const payload = (await response.json()) as { message?: { content?: string }; model?: string };
  const content = payload.message?.content?.trim();

  if (!content) {
    throw new Error("Ollama returned an empty response");
  }

  return {
    content,
    model: payload.model ?? model
  };
}
