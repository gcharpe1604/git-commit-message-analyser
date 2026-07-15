import type { AnalysisResult } from "../types";
import { scoreCommitMessage } from "./scoringEngine.ts";

export const getWorkshopAnalysis = (message: string): AnalysisResult | null =>
  message.trim() ? scoreCommitMessage(message) : null;
