import { useEffect, useMemo, useRef, useState } from "react";
import { MdArrowForward, MdAutoAwesome, MdCheck, MdClose, MdContentCopy, MdDelete, MdKey, MdSave } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import type { AnalysisResult } from "../types";
import { analyzeCommit } from "../utils/simpleAnalyzer";
import { debounce } from "../utils/debounce";
import { CONSTANTS } from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useLLM } from "../hooks/useLLM";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";

interface SavedDraft { id: string; message: string; score: number; date: string }
interface PlaygroundProps { embedded?: boolean; repositoryName?: string }

export const Playground = ({ embedded = false, repositoryName }: PlaygroundProps) => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [diff, setDiff] = useState("");
  const [mode, setMode] = useState<"write" | "diff">(() => searchParams.get("mode") === "diff" ? "diff" : "write");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [drafts, setDrafts] = useLocalStorage<SavedDraft[]>("playground_drafts", []);
  const [authOpen, setAuthOpen] = useState(false);
  const [showWriteDiff, setShowWriteDiff] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const aiRequestInFlight = useRef(false);
  const { generateMessage, hasApiKey, usage } = useLLM();
  const analyze = useMemo(() => debounce((value: string) => setResult(value.trim() ? analyzeCommit(value) : null), CONSTANTS.ANIMATION.DEBOUNCE_DELAY), []);

  useEffect(() => analyze(message), [message, analyze]);

  const save = () => {
    if (!message.trim() || !result) return;
    setDrafts((current) => [{ id: crypto.randomUUID(), message, score: result.score, date: new Date().toISOString() }, ...current].slice(0, 50));
  };
  const runAi = async (action: "improve" | "generate") => {
    if (aiRequestInFlight.current) return;
    setActionError(null);
    setAiNotice(null);
    if (!user) { setAuthOpen(true); return; }
    if (!hasApiKey) { setActionError(`You have used ${usage?.used ?? 15}/${usage?.limit ?? 15} free suggestions. Add a personal provider key to continue.`); return; }
    if (action === "improve" && !message.trim()) { setActionError("Write a commit message before asking AI to improve it."); return; }
    if (!diff.trim()) {
      setShowWriteDiff(true);
      setActionError("Paste the real git diff so the AI can ground the message in the code changes.");
      return;
    }
    aiRequestInFlight.current = true;
    setAiLoading(true);
    const context = action === "improve"
      ? `Improve this draft commit message using only the supplied diff as evidence: ${message.trim()}`
      : repositoryName ? `Repository: ${repositoryName}` : undefined;
    try {
      const value = await generateMessage(diff, context);
      if (value) {
        setMessage(value);
        setMode("write");
        setShowWriteDiff(true);
        setAiNotice(action === "improve" ? "Message improved from the supplied diff." : "Message generated from the supplied diff.");
      }
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : "Unable to generate a commit message.");
    } finally {
      aiRequestInFlight.current = false;
      setAiLoading(false);
    }
  };
  const setEditorMode = (nextMode: "write" | "diff") => {
    setMode(nextMode);
    setActionError(null);
    setAiNotice(null);
  };
  const tone = result ? result.score >= 8 ? "good" : result.score >= 6 ? "warning" : "bad" : "neutral";

  return (
    <section className={`playground-page ${embedded ? "is-embedded" : ""}`}>
      <header className="page-intro playground-intro">
        <div><p className="eyebrow">Commit workshop</p><h1>Write it. Test it. Ship it.</h1><p>{repositoryName ? `Draft against ${repositoryName}, score the message, and use the actual patch for AI assistance.` : "Get immediate, rule-based feedback or generate a message from the actual patch."}</p></div>
        <div className="mode-switch"><button type="button" className={mode === "write" ? "active" : ""} onClick={() => setEditorMode("write")}>Write message</button><button type="button" className={mode === "diff" ? "active" : ""} onClick={() => setEditorMode("diff")}>Generate from diff</button></div>
      </header>

      <div className="workshop-grid">
        <div className="workshop-editor">
          <div className="editor-topbar"><span>{mode === "write" ? "COMMIT_EDITMSG" : "PATCH.diff"}</span><span>{mode === "write" ? `${message.length} chars` : `${diff.split("\n").length} lines`}</span></div>
          {mode === "write" ? <>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="feat(scope): describe the change and its intent" autoFocus />
            <details className="workshop-diff-context" open={showWriteDiff} onToggle={(event) => setShowWriteDiff(event.currentTarget.open)}>
              <summary><span><MdAutoAwesome /> Git diff for AI improvement</span><small>Required for grounded generation</small></summary>
              <textarea value={diff} onChange={(event) => setDiff(event.target.value)} placeholder={"diff --git a/src/file.ts b/src/file.ts\n+ describe your change here"} aria-label="Git diff for AI improvement" />
            </details>
          </> : <textarea value={diff} onChange={(event) => setDiff(event.target.value)} placeholder={"diff --git a/src/file.ts b/src/file.ts\n+ describe your change here"} autoFocus />}
          <div className="editor-actions">
            <span>{!user ? "Sign in to unlock AI features" : usage?.remaining ? `${usage.remaining} free AI suggestions remaining` : hasApiKey ? "Personal provider ready · Groq → OpenRouter → Gemini" : "Monthly allowance used · add a personal provider key"}</span>
            {mode === "write" ? <div>
              {result && <button type="button" onClick={save}><MdSave /> Save draft</button>}
              <button type="button" className="primary" onClick={() => runAi("improve")} disabled={aiLoading}><MdAutoAwesome /> {aiLoading ? "Improving..." : "Improve with AI"}</button>
            </div> : <button type="button" className="primary" onClick={() => runAi("generate")} disabled={aiLoading}><MdAutoAwesome /> {aiLoading ? "Generating..." : "Generate from diff"}<MdArrowForward /></button>}
          </div>
          {(actionError || aiNotice) && <div className={`workshop-ai-status ${actionError ? "is-error" : "is-success"}`} role={actionError ? "alert" : "status"}>{actionError || aiNotice}</div>}
          {user && !hasApiKey && <div className="workshop-provider-hint"><MdKey /><span><strong>Provider key required</strong>Open your account menu and choose AI providers. Keys remain stored per account in this browser.</span></div>}
        </div>

        <aside className={`workshop-result tone-${tone}`} aria-live="polite">
          {result ? <>
            <header><div><span>Quality score</span><strong>{result.score}<small>/10</small></strong></div><p>{result.score >= 8 ? "Ready to ship" : result.score >= 6 ? "A solid start" : "Needs another pass"}</p></header>
            {result.checklist && <div className="checklist">{[["Conventional type", result.checklist.hasType], ["Useful subject length", result.checklist.subjectLength], ["Imperative wording", result.checklist.imperativeVerb], ["Specific language", result.checklist.noVagueWords], ["Clean punctuation", result.checklist.noPeriod]].map(([label, valid]) => <div key={String(label)} className={valid ? "pass" : "fail"}>{valid ? <MdCheck /> : <MdClose />}<span>{String(label)}</span></div>)}</div>}
            {result.suggestion && <div className="workshop-suggestion"><span>Rule-based format suggestion</span><code>{result.suggestion}</code><div><button type="button" onClick={() => setMessage(result.suggestion || "")}>Use this</button><button type="button" aria-label="Copy suggestion" onClick={() => navigator.clipboard.writeText(result.suggestion || "")}><MdContentCopy /></button></div></div>}
            {result.feedback.length > 0 && <ul className="workshop-feedback">{result.feedback.map((item) => <li key={item}>{item}</li>)}</ul>}
          </> : <div className="workshop-empty"><span>00</span><h2>Your analysis will appear here.</h2><p>Start with a type, optional scope, and a clear imperative subject.</p><code>fix(auth): prevent duplicate token refresh</code></div>}
        </aside>
      </div>

      {drafts.length > 0 && <section className="draft-section"><header><div><p className="eyebrow">Saved locally</p><h2>Recent drafts</h2></div><span>{drafts.length} saved</span></header><div className="draft-grid">{drafts.slice(0, 6).map((draft) => <article key={draft.id}><div><strong>{draft.score}/10</strong><time>{new Date(draft.date).toLocaleDateString()}</time></div><code>{draft.message}</code><footer><button type="button" onClick={() => { setMessage(draft.message); setMode("write"); }}>Open</button><button type="button" aria-label="Delete draft" onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))}><MdDelete /></button></footer></article>)}</div></section>}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} variant="featureAccess" />
    </section>
  );
};
