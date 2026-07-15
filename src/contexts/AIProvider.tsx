import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AIContext, type AISuggestionUsage } from "./AIContext";
import { useAuth } from "../hooks/useAuth";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { LLMService } from "../services/llmService";

interface PlatformResponse {
  message?: string;
  error?: string;
  code?: string;
  usage?: AISuggestionUsage;
}

const readPlatformResponse = async (response: Response): Promise<PlatformResponse> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return { error: "The platform AI service is unavailable on this deployment." };
  return response.json() as Promise<PlatformResponse>;
};

export const AIProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [accountKeys, setAccountKeys] = useLocalStorage<Record<string, { gemini: string; openRouter: string; groq: string }>>("account_ai_provider_keys", {});
  const [usage, setUsage] = useState<AISuggestionUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userKeys = user ? accountKeys[user.id] : undefined;
  const userGeminiKey = userKeys?.gemini ?? "";
  const userOpenRouterKey = userKeys?.openRouter ?? "";
  const userGroqKey = userKeys?.groq ?? "";
  const hasUserApiKey = Boolean(userGeminiKey || userOpenRouterKey || userGroqKey);
  const platformAllowanceAvailable = usage ? usage.remaining > 0 : Boolean(user && session);
  const hasApiKey = Boolean(user && (platformAllowanceAvailable || hasUserApiKey));

  const updateKey = useCallback((provider: "gemini" | "openRouter" | "groq", value: string) => {
    if (!user) return;
    setAccountKeys((current) => {
      const existing = current[user.id] ?? { gemini: "", openRouter: "", groq: "" };
      return { ...current, [user.id]: { ...existing, [provider]: value } };
    });
  }, [setAccountKeys, user]);

  const refreshUsage = useCallback(async () => {
    if (!user || !session) {
      setUsage(null);
      setUsageError(null);
      return;
    }
    setUsageLoading(true);
    setUsageError(null);
    try {
      const response = await fetch("/api/ai/suggestions", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const body = await readPlatformResponse(response);
      if (!response.ok || !body.usage) throw new Error(body.error || "Could not load AI suggestion usage.");
      setUsage(body.usage);
    } catch (caught) {
      setUsageError(caught instanceof Error ? caught.message : "Could not load AI suggestion usage.");
    } finally {
      setUsageLoading(false);
    }
  }, [session, user]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) void refreshUsage(); });
    return () => { active = false; };
  }, [refreshUsage]);

  const generateWithPersonalKeys = useCallback(async (diff: string, context?: string) => {
    if (!hasUserApiKey) return null;
    const service = new LLMService({ geminiKey: userGeminiKey, openRouterKey: userOpenRouterKey, groqKey: userGroqKey });
    return service.generateCommitMessage(diff, context);
  }, [hasUserApiKey, userGeminiKey, userGroqKey, userOpenRouterKey]);

  const generateMessage = useCallback(async (diff: string, context?: string) => {
    if (!user || !session) { setError("Sign in before using AI generation."); return null; }
    if (!diff.trim()) { setError("Paste a git diff before generating a commit message."); return null; }

    setLoading(true);
    setError(null);
    try {
      if (!usage || usage.remaining > 0) {
        const response = await fetch("/api/ai/suggestions", {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ diff, context }),
        });
        const body = await readPlatformResponse(response);
        if (body.usage) setUsage(body.usage);
        if (response.ok && body.message) return body.message;

        if (!hasUserApiKey) {
          throw new Error(body.code === "quota_exhausted"
            ? "You have used all 15 free AI suggestions this month. Add a personal provider key to continue."
            : body.error || "Platform AI generation failed.");
        }
      }

      const personalMessage = await generateWithPersonalKeys(diff, context);
      if (personalMessage) return personalMessage;
      throw new Error("You have used all 15 free AI suggestions this month. Add a personal provider key to continue.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Failed to generate a commit message.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [generateWithPersonalKeys, hasUserApiKey, session, usage, user]);

  const value = useMemo(() => ({
    userGeminiKey,
    setUserGeminiKey: (next: string) => updateKey("gemini", next),
    userOpenRouterKey,
    setUserOpenRouterKey: (next: string) => updateKey("openRouter", next),
    userGroqKey,
    setUserGroqKey: (next: string) => updateKey("groq", next),
    hasApiKey,
    hasUserApiKey,
    usage,
    usageLoading,
    usageError,
    refreshUsage,
    generateMessage,
    loading,
    error,
  }), [error, generateMessage, hasApiKey, hasUserApiKey, loading, refreshUsage, updateKey, usage, usageError, usageLoading, userGeminiKey, userGroqKey, userOpenRouterKey]);

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};
