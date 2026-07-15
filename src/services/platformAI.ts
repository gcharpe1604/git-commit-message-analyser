const SYSTEM_PROMPT = `You are an expert Git commit message writer.
Write one evidence-based Conventional Commit message for the supplied git diff.

Rules:
1. Use <type>(<scope>): <imperative subject>.
2. Keep the first line at or below 72 characters.
3. Use only facts supported by the diff.
4. Add a short body only when the change needs important context.
5. Return only the commit message without markdown fences.`;

export interface PlatformAIKeys {
  groq?: string;
  openRouter?: string;
  gemini?: string;
}

type Fetcher = typeof fetch;

const cleanMessage = (value: string) => value
  .replace(/^```(?:git|commit|text)?\s*/i, "")
  .replace(/\s*```$/, "")
  .trim();

const buildPrompt = (diff: string, context?: string) => `${SYSTEM_PROMPT}

${context?.trim() ? `Context: ${context.trim().slice(0, 2000)}\n\n` : ""}Git diff:
\`\`\`diff
${diff.trim().slice(0, 15000)}
\`\`\`

Generate one commit message.`;

const readChatCompletion = async (response: Response, provider: string) => {
  if (!response.ok) throw new Error(`${provider} returned ${response.status}`);
  const body = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const message = cleanMessage(body.choices?.[0]?.message?.content ?? "");
  if (!message) throw new Error(`${provider} returned an empty response`);
  return message;
};

const generateWithGroq = async (prompt: string, key: string, fetcher: Fetcher) => readChatCompletion(await fetcher("https://api.groq.com/openai/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
    temperature: 0.25,
    max_tokens: 512,
  }),
}), "Groq");

const generateWithOpenRouter = async (prompt: string, key: string, fetcher: Fetcher) => readChatCompletion(await fetcher("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-Title": "GitAnalyzer" },
  body: JSON.stringify({
    model: "~google/gemini-flash-latest",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: prompt }],
    temperature: 0.25,
    max_tokens: 512,
  }),
}), "OpenRouter");

const generateWithGemini = async (prompt: string, key: string, fetcher: Fetcher) => {
  const response = await fetcher("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.25, maxOutputTokens: 512 },
    }),
  });
  if (!response.ok) throw new Error(`Gemini returned ${response.status}`);
  const body = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const message = cleanMessage(body.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "");
  if (!message) throw new Error("Gemini returned an empty response");
  return message;
};

export const generatePlatformCommitMessage = async (
  diff: string,
  context: string | undefined,
  keys: PlatformAIKeys,
  fetcher: Fetcher = fetch,
): Promise<{ message: string; provider: "groq" | "openrouter" | "gemini" }> => {
  const prompt = buildPrompt(diff, context);
  const failures: string[] = [];

  if (keys.groq) {
    try { return { message: await generateWithGroq(prompt, keys.groq, fetcher), provider: "groq" }; }
    catch (error) { failures.push(error instanceof Error ? error.message : "Groq failed"); }
  }
  if (keys.openRouter) {
    try { return { message: await generateWithOpenRouter(prompt, keys.openRouter, fetcher), provider: "openrouter" }; }
    catch (error) { failures.push(error instanceof Error ? error.message : "OpenRouter failed"); }
  }
  if (keys.gemini) {
    try { return { message: await generateWithGemini(prompt, keys.gemini, fetcher), provider: "gemini" }; }
    catch (error) { failures.push(error instanceof Error ? error.message : "Gemini failed"); }
  }

  throw new Error(failures.length ? failures.join(" | ") : "No platform AI providers are configured");
};
