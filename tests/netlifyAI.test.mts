import assert from "node:assert/strict";
import { after, before, test } from "node:test";

const originalFetch = globalThis.fetch;
process.env.SUPABASE_URL = "https://quota-test.supabase.co";
process.env.SUPABASE_SECRET_KEY = "service-role-test";
process.env.GROQ_API_KEY = "groq-test";
delete process.env.OPENROUTER_API_KEY;
delete process.env.GEMINI_API_KEY;

const { default: handleAISuggestions } = await import("../netlify/functions/ai-suggestions.mts");

before(() => {
  globalThis.fetch = originalFetch;
});

after(() => {
  globalThis.fetch = originalFetch;
});

const usage = {
  allowed: true,
  used: 1,
  limit: 15,
  remaining: 14,
  periodStart: "2026-07-01",
  resetsAt: "2026-08-01T00:00:00Z",
};

test("Netlify AI function authenticates, reserves usage, and returns a suggestion", async () => {
  const calls: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    if (url.endsWith("/auth/v1/user")) return Response.json({ id: "11111111-1111-1111-1111-111111111111" });
    if (url.includes("/rpc/reserve_ai_suggestion")) return Response.json(usage);
    if (url.includes("api.groq.com")) return Response.json({ choices: [{ message: { content: "feat(ai): add monthly suggestions" } }] });
    throw new Error(`Unexpected request: ${url}`);
  };

  const response = await handleAISuggestions(new Request("https://gitanalyzer.test/api/ai/suggestions", {
    method: "POST",
    headers: { Authorization: "Bearer user-token", "Content-Type": "application/json" },
    body: JSON.stringify({ diff: "+ add an allowance", context: "monthly usage" }),
  }));
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.message, "feat(ai): add monthly suggestions");
  assert.equal(body.usage.used, 1);
  assert.deepEqual(calls.map((url) => new URL(url).pathname), [
    "/auth/v1/user",
    "/rest/v1/rpc/reserve_ai_suggestion",
    "/openai/v1/chat/completions",
  ]);
});

test("Netlify AI function releases the reservation when every provider fails", async () => {
  const calls: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    calls.push(url);
    if (url.endsWith("/auth/v1/user")) return Response.json({ id: "11111111-1111-1111-1111-111111111111" });
    if (url.includes("/rpc/reserve_ai_suggestion")) return Response.json(usage);
    if (url.includes("/rpc/release_ai_suggestion")) return Response.json(null);
    if (url.includes("api.groq.com")) return new Response("unavailable", { status: 503 });
    throw new Error(`Unexpected request: ${url}`);
  };

  const response = await handleAISuggestions(new Request("https://gitanalyzer.test/api/ai/suggestions", {
    method: "POST",
    headers: { Authorization: "Bearer user-token", "Content-Type": "application/json" },
    body: JSON.stringify({ diff: "+ add an allowance" }),
  }));
  const body = await response.json();

  assert.equal(response.status, 502);
  assert.match(body.error, /not counted/i);
  assert.ok(calls.some((url) => url.includes("/rpc/release_ai_suggestion")));
});

test("local development bypass carries the allowance across function reloads", async () => {
  process.env.NETLIFY_DEV = "true";
  process.env.AI_DEV_BYPASS_TOKEN = "local-test-token";
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes("api.groq.com")) return Response.json({ choices: [{ message: { content: "fix(ai): persist local usage" } }] });
    throw new Error(`Unexpected request: ${url}`);
  };

  try {
    const response = await handleAISuggestions(new Request("https://gitanalyzer.test/api/ai/suggestions", {
      method: "POST",
      headers: {
        Authorization: "Bearer local-test-token",
        "Content-Type": "application/json",
        "X-Local-AI-Usage": "3",
      },
      body: JSON.stringify({ diff: "+ persist the local allowance" }),
    }));
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.usage.used, 4);
    assert.equal(body.usage.remaining, 11);
  } finally {
    delete process.env.NETLIFY_DEV;
    delete process.env.AI_DEV_BYPASS_TOKEN;
  }
});
