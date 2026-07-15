import { createContext } from "react";

export interface AISuggestionUsage {
  used: number;
  limit: number;
  remaining: number;
  periodStart: string;
  resetsAt: string;
}

export interface AIContextValue {
  userGeminiKey: string;
  setUserGeminiKey: (value: string) => void;
  userOpenRouterKey: string;
  setUserOpenRouterKey: (value: string) => void;
  userGroqKey: string;
  setUserGroqKey: (value: string) => void;
  hasApiKey: boolean;
  hasUserApiKey: boolean;
  usage: AISuggestionUsage | null;
  usageLoading: boolean;
  usageError: string | null;
  refreshUsage: () => Promise<void>;
  generateMessage: (diff: string, context?: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export const AIContext = createContext<AIContextValue | null>(null);
