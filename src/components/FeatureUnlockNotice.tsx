import { useState } from "react";
import { MdAutoAwesome, MdArrowForward } from "react-icons/md";
import { useAuth } from "../hooks/useAuth";
import { AuthModal } from "./AuthModal";

export const FeatureUnlockNotice = ({ context }: { context: "home" | "analysis" }) => {
  const { user } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  if (user) return null;
  const isAnalysis = context === "analysis";

  return <>
    <aside className={`feature-unlock-notice ${isAnalysis ? "is-analysis" : ""}`} aria-label="Account features">
      <span className="feature-unlock-icon"><MdAutoAwesome /></span>
      <div>
        <strong>{isAnalysis ? "Your rule-based analysis is ready." : "Analysis works without an account."}</strong>
        <p>{isAnalysis ? "Sign in to sync this report and unlock AI-improved commit messages generated only from the real git diff." : "Sign in when you want synced history, private provider keys, and AI suggestions grounded in your git diff."}</p>
      </div>
      <button type="button" onClick={() => setAuthOpen(true)}>Sign in to unlock <MdArrowForward /></button>
    </aside>
    <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} variant="featureAccess" />
  </>;
};
