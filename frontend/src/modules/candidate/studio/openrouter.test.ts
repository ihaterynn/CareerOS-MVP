import assert from "node:assert/strict";
import test from "node:test";

import { OPENROUTER_TIMEOUT_MS, openRouterErrorMessage, requestOpenRouter } from "./openrouter";

test("requestOpenRouter sends authenticated JSON with a bounded timeout", async () => {
  let request: Request | undefined;
  await requestOpenRouter("demo-key", { model: "openai/gpt-5.4-nano" }, async (input, init) => {
    request = new Request(input, init);
    return new Response("{}", { status: 200 });
  });

  assert.equal(OPENROUTER_TIMEOUT_MS, 30_000);
  assert.equal(request?.headers.get("authorization"), "Bearer demo-key");
  assert.equal(request?.headers.get("content-type"), "application/json");
  assert.ok(request?.signal);
});

test("openRouterErrorMessage makes a timeout retryable for the demo", () => {
  assert.equal(openRouterErrorMessage(new DOMException("", "TimeoutError")), "AI took too long. Please try again.");
});
