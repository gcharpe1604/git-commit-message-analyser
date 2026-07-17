import assert from "node:assert/strict";
import { test } from "node:test";
import { LLMService } from "../src/services/llmService.ts";
import { generatePlatformCommitMessage } from "../src/services/platformAI.ts";
import {
  buildAnalysisPath,
  buildRepositoryAnalysisPath,
  buildRepositoryWorkshopPath,
  getAnalysisBackPath,
  parseRepoName,
} from "../src/utils/routes.ts";

test("repository routes preserve how the user reached an analysis", () => {
  assert.equal(buildAnalysisPath("https://github.com/octocat/hello-world"), "/analysis/octocat/hello-world");
  assert.equal(getAnalysisBackPath(""), "/");

  const developerAnalysis = buildAnalysisPath("octocat/hello-world", "octocat");
  assert.equal(developerAnalysis, "/analysis/octocat/hello-world?fromDeveloper=octocat");
  assert.equal(getAnalysisBackPath("?fromDeveloper=octocat"), "/developers/octocat");
  assert.equal(
    buildRepositoryWorkshopPath("octocat/hello-world", "?fromDeveloper=octocat"),
    "/analysis/octocat/hello-world/workshop?fromDeveloper=octocat",
  );
  assert.equal(
    buildRepositoryAnalysisPath("octocat/hello-world", "?fromDeveloper=octocat"),
    "/analysis/octocat/hello-world?fromDeveloper=octocat",
  );
});

test("repository parsing ignores query strings and fragments in GitHub URLs", () => {
  assert.deepEqual(parseRepoName("https://github.com/facebook/react?tab=readme-ov-file#readme"), {
    owner: "facebook",
    repo: "react",
    fullName: "facebook/react",
  });
  assert.equal(
    buildAnalysisPath("https://github.com/facebook/react.git?tab=readme-ov-file"),
    "/analysis/facebook/react",
  );
});

test("AI generation falls back from Groq to OpenRouter and includes the diff", async () => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{ url: string; body: string }> = [];

  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), body: String(init?.body ?? "") });
    if (String(input).includes("/groq/")) {
      return new Response("temporary provider error", { status: 503 });
    }
    return Response.json({ choices: [{ message: { content: "```text\nfix(auth): preserve user session\n```" } }] });
  };

  try {
    const service = new LLMService({ groqKey: "groq-test", openRouterKey: "openrouter-test" });
    const result = await service.generateCommitMessage("+ keep the signed-in session", "session regression");

    assert.equal(result, "fix(auth): preserve user session");
    assert.deepEqual(requests.map(({ url }) => url), [
      "/api/groq/openai/v1/chat/completions",
      "/api/openrouter/api/v1/chat/completions",
    ]);
    assert.match(requests[0].body, /keep the signed-in session/);
    assert.match(requests[1].body, /session regression/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("platform allowance generation preserves provider order through Gemini", async () => {
  const requests: Array<{ url: string; body: string }> = [];
  const fetcher = async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    requests.push({ url, body: String(init?.body ?? "") });
    if (url.includes("groq.com")) return new Response("provider unavailable", { status: 503 });
    if (url.includes("openrouter.ai")) return new Response("provider unavailable", { status: 429 });
    return Response.json({ candidates: [{ content: { parts: [{ text: "```commit\nfeat(quota): add monthly AI allowance\n```" }] } }] });
  };

  const result = await generatePlatformCommitMessage(
    "+ enforce fifteen suggestions per month",
    "signed-in account allowance",
    { groq: "groq-test", openRouter: "openrouter-test", gemini: "gemini-test" },
    fetcher as typeof fetch,
  );

  assert.equal(result.provider, "gemini");
  assert.equal(result.message, "feat(quota): add monthly AI allowance");
  assert.deepEqual(requests.map(({ url }) => new URL(url).hostname), [
    "api.groq.com",
    "openrouter.ai",
    "generativelanguage.googleapis.com",
  ]);
  for (const request of requests) assert.match(request.body, /fifteen suggestions per month/);
});
