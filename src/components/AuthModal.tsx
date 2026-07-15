import { createPortal } from "react-dom";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { useAuth } from "../hooks/useAuth";

type AuthVariant = "default" | "commitReview" | "featureAccess";

const modalCopy: Record<AuthVariant, { kicker: string; title: string; body: string }> = {
  default: { kicker: "Your account", title: "Sign in or create an account.", body: "Sign in to sync analysis history and manage your AI provider keys. Core rule-based analysis remains available without an account." },
  commitReview: { kicker: "Unlock the next step", title: "See a stronger version of this commit.", body: "Sign up to generate an AI-improved commit message after providing the actual git diff. You will also unlock synced analysis history." },
  featureAccess: { kicker: "History and AI", title: "Sign in to unlock account features.", body: "History and AI features require an account. Sign in or sign up to sync reports, manage provider keys, and generate improved messages from the actual git diff." },
};

export const AuthModal = ({ isOpen, onClose, variant = "default" }: { isOpen: boolean; onClose: () => void; variant?: AuthVariant }) => {
  const { signInWithGitHub, signInWithGoogle } = useAuth();
  if (!isOpen) return null;
  const copy = modalCopy[variant];
  return createPortal(<div className="modal-layer"><button className="modal-backdrop" onClick={onClose} aria-label="Close sign in" /><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <header><div><span>{copy.kicker}</span><h2 id="auth-title">{copy.title}</h2></div><button onClick={onClose} aria-label="Close sign in"><MdClose /></button></header>
    <p>{copy.body}</p>
    <div className="auth-actions"><button onClick={() => { onClose(); signInWithGitHub(); }}><FaGithub /> Continue with GitHub</button><button onClick={() => { onClose(); signInWithGoogle(); }}><FaGoogle /> Continue with Google</button></div>
    <small>Authentication is handled securely by Supabase.</small>
  </section></div>, document.body);
};
