import { createClient } from "@supabase/supabase-js";
import { generatePlatformCommitMessage } from "../../src/services/platformAI.ts";

interface Usage {
  used: number;
  limit: number;
  remaining: number;
  periodStart: string;
  resetsAt: string;
}

interface Reservation extends Usage {
  allowed: boolean;
}

let developmentUsed = 0;
const UNLIMITED_AI_EMAIL = "govind.charpe16@gmail.com";

const developmentUsage = (): Usage => {
  const periodStart = new Date().toISOString().slice(0, 7);
  const resetDate = new Date(`${periodStart}-01T00:00:00.000Z`);
  resetDate.setUTCMonth(resetDate.getUTCMonth() + 1);
  return {
    used: developmentUsed,
    limit: 15,
    remaining: Math.max(15 - developmentUsed, 0),
    periodStart: `${periodStart}-01`,
    resetsAt: resetDate.toISOString(),
  };
};

const unlimitedUsage = (): Usage => ({ ...developmentUsage(), used: 0, limit: 15, remaining: 15 });

const json = (body: unknown, status = 200) => Response.json(body, {
  status,
  headers: { "Cache-Control": "no-store" },
});

const isUsage = (value: unknown): value is Usage => {
  if (!value || typeof value !== "object") return false;
  const usage = value as Record<string, unknown>;
  return typeof usage.used === "number"
    && typeof usage.limit === "number"
    && typeof usage.remaining === "number"
    && typeof usage.periodStart === "string"
    && typeof usage.resetsAt === "string";
};

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get("authorization") ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
};

export default async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (request.method !== "GET" && request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const token = getBearerToken(request);
  const isDevelopmentBypass = process.env.NETLIFY_DEV === "true"
    && Boolean(process.env.AI_DEV_BYPASS_TOKEN)
    && token === process.env.AI_DEV_BYPASS_TOKEN;
  const localUsageHeader = Number(request.headers.get("x-local-ai-usage"));
  const localUsage = Number.isInteger(localUsageHeader) && localUsageHeader >= 0 && localUsageHeader <= 15
    ? localUsageHeader
    : 0;
  if (isDevelopmentBypass && request.method === "GET") return json({ usage: { ...developmentUsage(), used: localUsage, remaining: 15 - localUsage } });

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseSecret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if ((!supabaseUrl || !supabaseSecret) && !isDevelopmentBypass) return json({ error: "AI allowance service is not configured" }, 503);

  if (!token) return json({ error: "Sign in to use AI suggestions" }, 401);

  const admin = isDevelopmentBypass ? null : createClient(supabaseUrl!, supabaseSecret!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let userId = "";
  let hasUnlimitedAllowance = false;
  if (!isDevelopmentBypass) {
    const { data: authData, error: authError } = await admin.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "Your session has expired. Sign in again." }, 401);
    userId = authData.user.id;
    hasUnlimitedAllowance = authData.user.email?.toLowerCase() === UNLIMITED_AI_EMAIL;
  }

  if (request.method === "GET") {
    if (hasUnlimitedAllowance) return json({ usage: unlimitedUsage() });
    const { data, error } = await admin.rpc("get_ai_suggestion_usage", { p_user_id: userId });
    if (error || !isUsage(data)) return json({ error: "Could not load AI suggestion usage" }, 500);
    return json({ usage: data });
  }

  const platformKeys = {
    groq: process.env.GROQ_API_KEY,
    openRouter: process.env.OPENROUTER_API_KEY,
    gemini: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY,
  };
  if (!platformKeys.groq && !platformKeys.openRouter && !platformKeys.gemini) {
    return json({ error: "Platform AI providers are not configured" }, 503);
  }

  let payload: { diff?: unknown; context?: unknown };
  try { payload = await request.json() as { diff?: unknown; context?: unknown }; }
  catch { return json({ error: "Request body must be valid JSON" }, 400); }

  const diff = typeof payload.diff === "string" ? payload.diff.trim() : "";
  const context = typeof payload.context === "string" ? payload.context.trim() : undefined;
  if (!diff) return json({ error: "A git diff is required" }, 400);
  if (diff.length > 100_000) return json({ error: "The git diff is too large" }, 413);
  if (context && context.length > 4_000) return json({ error: "The generation context is too large" }, 413);

  let reservation: Reservation;
  if (isDevelopmentBypass) {
    developmentUsed = Math.max(developmentUsed, localUsage);
    const usage = developmentUsage();
    reservation = { ...usage, allowed: usage.remaining > 0 };
    if (reservation.allowed) {
      developmentUsed += 1;
      reservation = { ...reservation, ...developmentUsage(), allowed: true };
    }
  } else if (hasUnlimitedAllowance) {
    reservation = { ...unlimitedUsage(), allowed: true };
  } else {
    const { data: reserved, error: reserveError } = await admin.rpc("reserve_ai_suggestion", { p_user_id: userId });
    if (reserveError || !isUsage(reserved) || typeof (reserved as Reservation).allowed !== "boolean") {
      return json({ error: "Could not reserve an AI suggestion" }, 500);
    }
    reservation = reserved as Reservation;
  }
  if (!reservation.allowed) return json({ error: "Monthly AI suggestion allowance used", code: "quota_exhausted", usage: reservation }, 429);

  try {
    const result = await generatePlatformCommitMessage(diff, context, platformKeys);
    return json({ ...result, usage: reservation });
  } catch (error) {
    console.error("Platform AI generation failed:", error instanceof Error ? error.message : error);
    if (isDevelopmentBypass) {
      developmentUsed = Math.max(0, developmentUsed - 1);
    } else if (!hasUnlimitedAllowance) {
      const { error: releaseError } = await admin.rpc("release_ai_suggestion", {
        p_user_id: userId,
        p_period_start: reservation.periodStart,
      });
      if (releaseError) console.error("Could not release AI reservation:", releaseError.message);
    }
    return json({ error: "Platform AI providers are temporarily unavailable. This attempt was not counted." }, 502);
  }
};

export const config = { path: "/api/ai/suggestions" };
