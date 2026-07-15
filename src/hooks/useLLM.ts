import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";
import { useLocalStorage } from "./useLocalStorage";
import { LLMService } from "../services/llmService";

export const useLLM = () => {
  const { user } = useAuth();
  const [accountKeys, setAccountKeys] = useLocalStorage<Record<string, { gemini: string; openRouter: string; groq: string }>>("account_ai_provider_keys", {});
  const userKeys = user ? accountKeys[user.id] : undefined;
  const userGeminiKey = userKeys?.gemini ?? "";
  const userOpenRouterKey = userKeys?.openRouter ?? "";
  const userGroqKey = userKeys?.groq ?? "";
  const updateKey = (provider: "gemini" | "openRouter" | "groq", value: string) => {
    if (!user) return;
    setAccountKeys((current) => {
      const existing = current[user.id] ?? { gemini: "", openRouter: "", groq: "" };
      return { ...current, [user.id]: { ...existing, [provider]: value } };
    });
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasApiKey = Boolean(user && (userGeminiKey || userOpenRouterKey || userGroqKey));

  const generateMessage = useCallback(async (diff: string, context?: string) => {
    if (!user) {
      setError("Sign in before using AI generation.");
      return null;
    }
    if (!diff.trim()) {
      setError("Paste a git diff before generating a commit message.");
      return null;
    }
    if (!hasApiKey) {
      setError("Add at least one AI provider key in Settings.");
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const service = new LLMService({
        geminiKey: userGeminiKey,
        openRouterKey: userOpenRouterKey,
        groqKey: userGroqKey,
      });
      return await service.generateCommitMessage(diff, context);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to generate a commit message");
      return null;
    } finally {
      setLoading(false);
    }
  }, [hasApiKey, user, userGeminiKey, userGroqKey, userOpenRouterKey]);

  return {
    userGeminiKey,
    setUserGeminiKey: (value: string) => updateKey("gemini", value),
    userOpenRouterKey,
    setUserOpenRouterKey: (value: string) => updateKey("openRouter", value),
    userGroqKey,
    setUserGroqKey: (value: string) => updateKey("groq", value),
    hasApiKey,
    generateMessage,
    loading,
    error,
  };
};
