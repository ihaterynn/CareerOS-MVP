import "server-only";

/**
 * OpenRouter client. Server-only: the key is read from the server environment and never reaches
 * the browser bundle.
 *
 * The model is pinned per release rather than tracking a floating "latest" alias, so a provider-
 * side model change can't silently alter behaviour. Override with ONBOARDING_LLM_MODEL.
 */
const DEFAULT_MODEL = "anthropic/claude-sonnet-4.5";
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export function llmConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export function llmModel(): string {
  return process.env.ONBOARDING_LLM_MODEL || DEFAULT_MODEL;
}

export type LlmMessage = { role: "system" | "user" | "assistant"; content: string };

export type LlmToolSchema = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

/**
 * Calls the model and returns the arguments of a forced tool call, so the result is structured
 * JSON rather than prose we would have to parse out of a paragraph.
 */
export async function callTool<T>(options: {
  messages: LlmMessage[];
  tool: LlmToolSchema;
  signal?: AbortSignal;
  maxTokens?: number;
}): Promise<T> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not configured");

  const response = await fetch(ENDPOINT, {
    method: "POST",
    signal: options.signal,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "X-Title": "CareerOS Onboarding"
    },
    body: JSON.stringify({
      model: llmModel(),
      max_tokens: options.maxTokens ?? 2048,
      messages: options.messages,
      tools: [{ type: "function", function: options.tool }],
      tool_choice: { type: "function", function: { name: options.tool.name } }
    })
  });

  if (!response.ok) {
    // Never surface the provider's raw body to the client: it can echo request content.
    throw new Error(`Model request failed (${response.status})`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }> } }>;
  };

  const args = payload.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("Model returned no structured output");

  try {
    return JSON.parse(args) as T;
  } catch {
    throw new Error("Model returned malformed structured output");
  }
}
