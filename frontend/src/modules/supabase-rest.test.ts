import assert from "node:assert/strict";
import test from "node:test";
import { fetchSupabaseRows, isUuid, optionalServerEnv, requireServerEnv } from "./supabase-rest.ts";

test("reads Supabase REST rows with the server key and never caches the response", async () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "server-key";

  try {
    const result = await fetchSupabaseRows<{ id: string }>("cv_ingestion_records?select=id", async (input, init) => {
      assert.equal(input, "https://example.supabase.co/rest/v1/cv_ingestion_records?select=id");
      assert.deepEqual(init, {
        cache: "no-store",
        headers: { apikey: "server-key", Authorization: "Bearer server-key" }
      });
      return new Response(JSON.stringify([{ id: "cv-01" }]), { status: 200 });
    });

    assert.deepEqual(result, [{ id: "cv-01" }]);
  } finally {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  }
});

test("requires an explicit server-side tenant ID", () => {
  const original = process.env.CAREEROS_CANDIDATE_ID;
  process.env.CAREEROS_CANDIDATE_ID = "candidate-1";

  try {
    assert.equal(requireServerEnv("CAREEROS_CANDIDATE_ID"), "candidate-1");
  } finally {
    process.env.CAREEROS_CANDIDATE_ID = original;
  }
});

test("treats an unconfigured tenant ID as an empty scope", () => {
  const original = process.env.CAREEROS_EMPLOYER_ID;
  delete process.env.CAREEROS_EMPLOYER_ID;

  try {
    assert.equal(optionalServerEnv("CAREEROS_EMPLOYER_ID"), undefined);
  } finally {
    process.env.CAREEROS_EMPLOYER_ID = original;
  }
});

test("rejects a malformed tenant UUID before issuing a database query", () => {
  assert.equal(isUuid("1"), false);
  assert.equal(isUuid("550e8400-e29b-41d4-a716-446655440000"), true);
});
