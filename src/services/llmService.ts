
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
    return text.replace(/^```(git|commit)?\n/, "").replace(/\n```$/, "").trim();
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

    if (!response.ok) throw new Error(`Groq API Error: ${response.statusText}`);
    
    const data = await response.json();
    return this.cleanResponse(data.choices[0].message.content);
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
        model: "google/gemini-2.0-flash-001",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 512,
      })
    });

    if (!response.ok) throw new Error(`OpenRouter API Error: ${response.statusText}`);
    
    const data = await response.json();
    return this.cleanResponse(data.choices[0].message.content);
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    if (!this.genAI) throw new Error("No Gemini Key");
    
    const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
    
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
      throw new Error("Failed to generate commit message. Please check your API keys.");
    }
  }

  async improveCommitMessage(currentMessage: string): Promise<string> {
    const prompt = `
${SYSTEM_PROMPT}

The user wrote this commit message:
"${currentMessage}"

Analyze it and rewrite it to strictly follow Conventional Commits and be more professional.
If it is already perfect, return it as is.
Return ONLY the rewritten message.
`;

    try {
      return await this.generateWithFallback(prompt);
    } catch (error) {
      console.error("LLM Improvement Error:", error);
      throw new Error("Failed to improve commit message. Please check your API keys.");
    }
  }
}
