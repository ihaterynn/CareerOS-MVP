import "server-only";

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "./supabase/server";

/** Streamed and token-gated responses must never be cached at any layer (spec §6.3). */
export const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate",
  "Content-Type": "application/x-ndjson; charset=utf-8"
} as const;

export type Guarded = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/**
 * Authenticates the caller and consumes one unit of their rate-limit budget for this route.
 *
 * The limiter lives in Postgres, not memory: serverless instances don't share process state, so
 * an in-process counter resets on every cold start and enforces nothing.
 */
export async function guardRoute(options: {
  route: string;
  limit: number;
  windowSeconds: number;
}): Promise<{ ok: true; db: Guarded } | { ok: false; response: NextResponse }> {
  const db = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError
  } = await db.auth.getUser();

  if (authError || !user) {
    return { ok: false, response: guardError("Not signed in", 401) };
  }

  const { data: allowed, error } = await db.rpc("consume_rate_limit", {
    p_route: options.route,
    p_limit: options.limit,
    p_window_seconds: options.windowSeconds
  });

  if (error) {
    return { ok: false, response: guardError("Rate limit check failed", 500) };
  }

  if (!allowed) {
    return {
      ok: false,
      response: guardError("You're going a bit fast — try again in a minute.", 429, {
        "Retry-After": String(options.windowSeconds)
      })
    };
  }

  return { ok: true, db };
}

/** Auth/rate-limit refusals are per-caller decisions — never let a cache replay them. */
function guardError(message: string, status: number, extra?: Record<string, string>) {
  return NextResponse.json(
    { error: message },
    { status, headers: { "Cache-Control": "no-store, no-cache, must-revalidate", ...extra } }
  );
}

/** Builds an NDJSON stream; each frame is one JSON object on its own line. */
export function ndjsonStream(
  produce: (emit: (event: unknown) => void) => Promise<void>
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try {
        await produce(emit);
      } catch (error) {
        // Surface a generic message: provider errors can echo request content.
        emit({ type: "error", message: error instanceof Error ? error.message : "Request failed" });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, { headers: NO_STORE_HEADERS });
}
