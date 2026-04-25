
import { useState, useCallback } from 'react';
import { LLMService } from '../services/llmService';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from './useAuth';

export const useLLM = () => {
  // User-provided keys — stored in localStorage, default to EMPTY.
  // These are keys the user personally adds via Settings.
  const [userGeminiKey, setUserGeminiKey] = useLocalStorage<string>('user_gemini_api_key', '');
  const [userOpenRouterKey, setUserOpenRouterKey] = useLocalStorage<string>('user_openrouter_api_key', '');
  const [userGroqKey, setUserGroqKey] = useLocalStorage<string>('user_groq_api_key', '');

  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effective keys: user key takes priority, then fall back to .env built-in keys
  const effectiveGeminiKey = userGeminiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
  const effectiveOpenRouterKey = userOpenRouterKey || import.meta.env.VITE_OPENROUTER_API_KEY || '';
  const effectiveGroqKey = userGroqKey || import.meta.env.VITE_GROQ_API_KEY || '';

  const generateMessage = useCallback(async (diff: string, context?: string) => {
    if (!user) {
      setError("Please login to use AI features.");
      return null;
    }

    if (!effectiveGeminiKey && !effectiveOpenRouterKey && !effectiveGroqKey) {
      setError("No API Keys found. Please add at least one AI provider key in settings.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const service = new LLMService({ 
        geminiKey: effectiveGeminiKey, 
        openRouterKey: effectiveOpenRouterKey, 
        groqKey: effectiveGroqKey 
      });
      const message = await service.generateCommitMessage(diff, context);
      return message;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate message");
      return null;
    } finally {
      setLoading(false);
    }
  }, [effectiveGeminiKey, effectiveOpenRouterKey, effectiveGroqKey, user]);

  const improveMessage = useCallback(async (currentMessage: string) => {
    if (!user) {
      setError("Please login to use AI features.");
      return null;
    }

    if (!effectiveGeminiKey && !effectiveOpenRouterKey && !effectiveGroqKey) {
      setError("No API Keys found. Please add at least one AI provider key in settings.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const service = new LLMService({ 
        geminiKey: effectiveGeminiKey, 
        openRouterKey: effectiveOpenRouterKey, 
        groqKey: effectiveGroqKey 
      });
      const message = await service.improveCommitMessage(currentMessage);
      return message;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to improve message");
      return null;
    } finally {
      setLoading(false);
    }
  }, [effectiveGeminiKey, effectiveOpenRouterKey, effectiveGroqKey, user]);

  const hasApiKey = Boolean(effectiveGeminiKey || effectiveOpenRouterKey || effectiveGroqKey);

  return {
    // User-provided keys (for Settings UI to check if user personally added a key)
    userGeminiKey, setUserGeminiKey: setUserGeminiKey,
    userOpenRouterKey, setUserOpenRouterKey: setUserOpenRouterKey,
    userGroqKey, setUserGroqKey: setUserGroqKey,
    // Effective keys (for API calls — includes .env fallback)
    geminiKey: effectiveGeminiKey,
    openRouterKey: effectiveOpenRouterKey,
    groqKey: effectiveGroqKey,
    hasApiKey,
    generateMessage,
    improveMessage,
    loading,
    error
  };
};
