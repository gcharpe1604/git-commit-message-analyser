import { MdAutoGraph, MdBolt, MdCheckCircle, MdInsights, MdTimeline } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useState, type RefObject } from "react";
import type { RepoStats } from "../../types";
import { AuthModal } from "../AuthModal";
import { FeatureUnlockNotice } from "../FeatureUnlockNotice";
import { InputSection } from "../InputSection";

interface LandingPageProps {
  userSignedIn: boolean;
  historyItems: RepoStats[];
  loading: boolean;
  recentSearches: string[];
  inputRef: RefObject<HTMLInputElement | null>;
  onAnalyze: (input: string, mode: "user" | "repo") => void;
  onOpenHistory: () => void;
  onRemoveRecent: (input: string) => void;
  onClearRecent: () => void;
}

export const LandingPage = ({ userSignedIn, historyItems, loading, recentSearches, inputRef, onAnalyze, onOpenHistory, onRemoveRecent, onClearRecent }: LandingPageProps) => {
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  return <div className="landing-page animate-in">
    <section className="landing-hero" id="overview">
      <div className="hero-copy">
        <p className="eyebrow"><MdAutoGraph /> A sharper view of engineering history</p>
        <h1>{historyItems.length > 0 ? "Your next commit can say more." : "Read the story behind the commits."}</h1>
        <p className="hero-lede">GitAnalyzer turns repository history into a practical writing standard: what is working, what is vague, and what to improve next.</p>
        {historyItems.length > 0 && <button className="last-analysis" onClick={onOpenHistory}><span>Continue where you left off</span><strong>{historyItems[0].repoName}</strong><b>{historyItems[0].averageScore.toFixed(1)} / 10</b></button>}
      </div>
      <div className="hero-preview" aria-label="Example analysis preview">
        <div className="preview-topline"><span>Repository health</span><span className="preview-live">Live analysis</span></div>
        <div className="preview-score"><strong>8.4</strong><span>/10</span><em>Clear and consistent</em></div>
        <div className="preview-metrics"><span><b>84%</b> structured</span><span><b>92%</b> imperative</span></div>
        <div className="preview-commit"><MdCheckCircle /><code>feat(auth): clarify session expiry</code></div>
      </div>
    </section>

    <div id="analyzer">
      <InputSection onAnalyze={onAnalyze} isLoading={loading} recentSearches={recentSearches} onRemoveRecent={onRemoveRecent} onClearHistory={onClearRecent} inputRef={inputRef} />
      {!userSignedIn && <FeatureUnlockNotice context="home" />}
    </div>

    <section className="landing-section" id="how-it-works">
      <div className="section-heading"><span>The process</span><h2>From raw history to a useful standard.</h2></div>
      <div className="steps-grid"><Step number="01" title="Choose a repository" description="Paste a public GitHub repository or start from a developer profile." /><Step number="02" title="Read the patterns" description="See clarity, structure, consistency, and commit behaviour in context." /><Step number="03" title="Make the next change count" description="Use concrete feedback to write commits your team can trust." /></div>
    </section>

    <section className="practice-callout">
      <div><p className="eyebrow">Commit workshop</p><h2>Build the habit before the next push.</h2><p>Score a draft instantly, understand every finding, or generate a message only after supplying the real git diff.</p></div>
      <button onClick={() => navigate("/workshop")}>Open the workshop <span>→</span></button>
    </section>

    <section className="landing-section" id="insights">
      <div className="section-heading"><span>Built for the work</span><h2>The signal, without the dashboard theatre.</h2></div>
      <div className="feature-grid">
        <FeatureCard icon={<MdBolt />} title="Fast repository analysis" desc="Review recent commits and see exactly where message quality is slipping." onClick={() => inputRef.current?.focus()} />
        <FeatureCard icon={<MdTimeline />} title="History that tells a story" desc={userSignedIn ? "Return to synced reports and keep improving the standard." : "Sign in to sync repository reports and revisit them across sessions."} onClick={userSignedIn ? onOpenHistory : () => setAuthOpen(true)} />
        <FeatureCard icon={<MdInsights />} title="Try a real example" desc="Open a familiar repository and explore the complete report experience." onClick={() => onAnalyze("facebook/react", "repo")} />
      </div>
    </section>
    <footer className="landing-footer"><span>GitAnalyzer</span><p>Built for clearer code histories.</p><button onClick={() => inputRef.current?.focus()}>Analyze a repository <span>↗</span></button></footer>
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} variant="featureAccess" />
  </div>;
};

const FeatureCard = ({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick?: () => void }) => {
  const content = <><div>{icon}</div><h3>{title}</h3><p>{desc}</p></>;
  return onClick ? <button type="button" className="feature-card panel" onClick={onClick}>{content}</button> : <article className="feature-card panel">{content}</article>;
};
const Step = ({ number, title, description }: { number: string; title: string; description: string }) => <article className="landing-step"><span>{number}</span><h3>{title}</h3><p>{description}</p></article>;
