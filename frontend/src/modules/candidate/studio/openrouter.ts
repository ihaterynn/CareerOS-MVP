export const OPENROUTER_TIMEOUT_MS = 30_000;

export function openRouterErrorMessage(cause: unknown) {
  return cause instanceof DOMException && cause.name === "TimeoutError" ? "AI took too long. Please try again." : "AI service is unavailable. Please try again.";
}

export function requestOpenRouter(apiKey: string, body: Record<string, unknown>, request: typeof fetch = fetch) {
  return request("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
    body: JSON.stringify(body)
  });
}
