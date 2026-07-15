
import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `You are an expert Git commit message writer.
You follow the Conventional Commits specification.
Your goal is to generate clear, concise, and descriptive commit messages.

Rules:
1. Use the format: <type>(<scope>): <subject>
2. Limit the first line to 72 characters.
3. Use imperative mood in the subject line (e.g., "add" not "added").
4. If the changes are complex, add a body description.
5. Identify the correct type: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert.
`;



export interface LLMKeys {
  geminiKey?: string;
  openRouterKey?: string;
  groqKey?: string;
}

export class LLMService {
  private keys: LLMKeys;
  private genAI: GoogleGenerativeAI | null = null;

  constructor(keys: LLMKeys) {
    this.keys = keys;
    if (keys.geminiKey) {
      this.genAI = new GoogleGenerativeAI(keys.geminiKey);
    }
  }

  private cleanResponse(text: string): string {
    return text.replace(/^```(?:git|commit|text)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  private async readChatCompletion(response: Response, provider: string): Promise<string> {
    if (!response.ok) {
      const body = await response.text();
      const detail = body.slice(0, 180).replace(/\s+/g, " ");
      throw new Error(`${provider} returned ${response.status}${detail ? `: ${detail}` : ""}`);
    }
    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content?.trim()) throw new Error(`${provider} returned an empty response`);
    return this.cleanResponse(content);
  }

  private async generateWithGroq(prompt: string): Promise<string> {
    if (!this.keys.groqKey) throw new Error("No Groq Key");
    
    const response = await fetch("/api/groq/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.keys.groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 512,
      })
    });

    return this.readChatCompletion(response, "Groq");
  }

  private async generateWithOpenRouter(prompt: string): Promise<string> {
    if (!this.keys.openRouterKey) throw new Error("No OpenRouter Key");
    
    const response = await fetch("/api/openrouter/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.keys.openRouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "~google/gemini-flash-latest",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 512,
      })
    });

    return this.readChatCompletion(response, "OpenRouter");
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    if (!this.genAI) throw new Error("No Gemini Key");
    
    const models = ["gemini-2.5-flash"];
    
    for (const modelName of models) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return this.cleanResponse(response.text());
      } catch (error) {
        console.warn(`Gemini Failed with model ${modelName}:`, error);
        if (modelName === models[models.length - 1]) throw error;
      }
    }
    throw new Error("All Gemini models failed");
  }

  private async generateWithFallback(prompt: string): Promise<string> {
    const errors: string[] = [];

    // 1. Try Groq (Fastest)
    if (this.keys.groqKey) {
      try {
        console.log("Attempting generation with Groq...");
        return await this.generateWithGroq(prompt);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn("Groq failed:", msg);
        errors.push(`Groq: ${msg}`);
      }
    }

    // 2. Try OpenRouter (Recommended Fallback)
    if (this.keys.openRouterKey) {
      try {
        console.log("Attempting generation with OpenRouter...");
        return await this.generateWithOpenRouter(prompt);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn("OpenRouter failed:", msg);
        errors.push(`OpenRouter: ${msg}`);
      }
    }

    // 3. Try Gemini (Final Fallback)
    if (this.genAI) {
      try {
        console.log("Attempting generation with Gemini SDK...");
        return await this.generateWithGemini(prompt);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.warn("Gemini failed:", msg);
        errors.push(`Gemini: ${msg}`);
      }
    }

    throw new Error("All AI providers failed. Errors: " + errors.join(" | "));
  }

  async generateCommitMessage(diff: string, context?: string): Promise<string> {
    const prompt = `
${SYSTEM_PROMPT}

Context (optional): ${context || "None"}

Here is the git diff:
\`\`\`diff
${diff.slice(0, 15000)} // Truncate to avoid token limits if necessary
\`\`\`

Generate a single commit message.
`;

    try {
      return await this.generateWithFallback(prompt);
    } catch (error) {
      console.error("LLM Generation Error:", error);
      if (error instanceof Error) throw error;
      throw new Error("Failed to generate a commit message.");
    }
  }

}
