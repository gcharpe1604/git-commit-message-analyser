import assert from "node:assert/strict";
import { test } from "node:test";
import { LLMService } from "../src/services/llmService.ts";
import {
  buildAnalysisPath,
  buildRepositoryAnalysisPath,
  buildRepositoryWorkshopPath,
  getAnalysisBackPath,
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
