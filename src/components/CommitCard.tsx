import { memo, useState } from "react";
import { MdArrowOutward, MdAutoAwesome, MdCheck, MdContentCopy, MdExpandMore, MdPerson } from "react-icons/md";
import type { Commit } from "../types";
import { getRelativeTime } from "../utils/time";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { useLLM } from "../hooks/useLLM";
import { fetchCommitDiff } from "../services/githubService";

export const CommitCard = memo(({ repoName, commit, index }: { repoName: string; commit: Commit; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [improvedMessage, setImprovedMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const { user } = useAuth();
  const { generateMessage, loading: aiLoading, hasApiKey, error: generationError } = useLLM();
  const analysis = commit.analysis;
  const score = analysis?.score ?? 0;
  const tone = score >= 8 ? "good" : score >= 6 ? "warning" : "bad";
  const firstLine = commit.message.split("\n")[0];

  const copySha = async () => {
    await navigator.clipboard.writeText(commit.sha.substring(0, 7));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  const toggleReview = () => {
    const opening = !expanded;
    setExpanded(opening);
    if (opening && !user && !sessionStorage.getItem("commit-review-signup-shown")) {
      sessionStorage.setItem("commit-review-signup-shown", "true");
      setAuthOpen(true);
    }
  };
  const improveWithAi = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!hasApiKey) { setAiError("Add a Groq, OpenRouter, or Gemini key from your account menu first."); return; }
    setAiError(null);
    try {
      const diff = await fetchCommitDiff(repoName, commit.sha);
      const improved = await generateMessage(diff, `Improve this existing commit message using only the supplied diff as evidence: ${firstLine}`);
      if (improved) setImprovedMessage(improved);
    } catch (caught) {
      setAiError(caught instanceof Error ? caught.message : "Unable to generate an improved message.");
    }
  };

  return (
    <article className={`commit-row tone-${tone}`}>
      <div className="commit-number">{String(index + 1).padStart(2, "0")}</div>
      <div className="commit-main">
        <div className="commit-title-row">
          <div>
            {analysis?.conventionalType && <span className="commit-type">{analysis.conventionalType}</span>}
            <a href={commit.url} target="_blank" rel="noreferrer">{firstLine}<MdArrowOutward /></a>
          </div>
          <div className="commit-score"><strong>{score}</strong><span>/10</span></div>
        </div>
        <div className="commit-meta">
          {commit.author.avatar_url ? <img src={commit.author.avatar_url} alt="" /> : <MdPerson />}
          <span>{commit.author.name}</span><i />
          <time title={new Date(commit.author.date).toLocaleString()}>{getRelativeTime(commit.author.date)}</time><i />
          <button onClick={copySha} aria-label="Copy commit SHA">{copied ? <MdCheck /> : <MdContentCopy />}{copied ? "Copied" : commit.sha.substring(0, 7)}</button>
        </div>
        {analysis?.feedback?.length ? (
          <>
            <button className="feedback-toggle" onClick={toggleReview} aria-expanded={expanded} aria-controls={`feedback-${commit.sha}`}>
              {expanded ? "Close review" : `Review ${analysis.feedback.length} ${analysis.feedback.length === 1 ? "finding" : "findings"}`}<MdExpandMore />
            </button>
            {expanded && (
              <div className="commit-feedback" id={`feedback-${commit.sha}`}>
                <div className="feedback-grid">
                  <div><span>What to fix</span><ul>{analysis.feedback.map((item) => <li key={item}>{item}</li>)}</ul></div>
                  {analysis.suggestion && <div><span>Rule-based format suggestion</span><code>{analysis.suggestion}</code></div>}
                </div>
                {!user && <button className="review-signup-card" onClick={() => setAuthOpen(true)}><span>AI-assisted next step</span><strong>Sign up to see an improved commit message</strong><small>Generation stays grounded in the actual git diff.</small></button>}
              </div>
            )}
          </>
        ) : <div className="commit-clean"><MdCheck /> No issues found in this message</div>}
        <div className="commit-ai-action">
          <button type="button" onClick={improveWithAi} disabled={aiLoading}><MdAutoAwesome /> {aiLoading ? "Reading commit changes..." : "Improve with AI"}</button>
          <span>Uses the commit's GitHub diff · Groq → OpenRouter → Gemini</span>
          {(aiError || generationError) && <p role="alert">{aiError || generationError}</p>}
          {improvedMessage && <div className="commit-ai-result"><span>AI-improved message</span><code>{improvedMessage}</code><button type="button" onClick={() => navigator.clipboard.writeText(improvedMessage)}><MdContentCopy /> Copy</button></div>}
        </div>
      </div>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} variant="commitReview" />
    </article>
  );
});
