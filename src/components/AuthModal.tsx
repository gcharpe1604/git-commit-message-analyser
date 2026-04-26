import { useState } from "react";
import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import { FaGithub } from "react-icons/fa";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signInWithGitHub } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_name: username,
            },
          },
        });
        if (error) throw error;
        setMessage("Check your email for the confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "400px",
          padding: "2rem",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
            {isSignUp ? "Create an account" : "Welcome back"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none",
              color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.5rem",
            }}
          >
            <MdClose />
          </button>
        </div>

        {error && (
          <div style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#ef4444", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ padding: "0.75rem", borderRadius: "8px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#22c55e", fontSize: "0.85rem" }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {isSignUp && (
            <>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  style={{
                    width: "100%", padding: "0.75rem", borderRadius: "8px", boxSizing: "border-box",
                    border: "1px solid var(--border-subtle)", background: "var(--bg-page)",
                    color: "var(--text-primary)", outline: "none",
                  }}
                />
              </div>
            </>
          )}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "8px", boxSizing: "border-box",
                border: "1px solid var(--border-subtle)", background: "var(--bg-page)",
                color: "var(--text-primary)", outline: "none",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%", padding: "0.75rem", borderRadius: "8px", boxSizing: "border-box",
                border: "1px solid var(--border-subtle)", background: "var(--bg-page)",
                color: "var(--text-primary)", outline: "none",
              }}
            />
          </div>

          {isSignUp && (
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--text-secondary)" }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%", padding: "0.75rem", borderRadius: "8px", boxSizing: "border-box",
                  border: "1px solid var(--border-subtle)", background: "var(--bg-page)",
                  color: "var(--text-primary)", outline: "none",
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: "100%", boxSizing: "border-box", padding: "0.75rem", fontSize: "1rem", marginTop: "0.5rem" }}
          >
            {loading ? "..." : (isSignUp ? "Sign Up" : "Sign In")}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        <button
          onClick={() => {
            onClose();
            signInWithGitHub();
          }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
            width: "100%", boxSizing: "border-box", padding: "0.75rem", borderRadius: "8px",
            border: "1px solid var(--border-subtle)", background: "var(--bg-page)",
            color: "var(--text-primary)", cursor: "pointer", fontSize: "0.95rem",
            fontWeight: 500, transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          <FaGithub size={18} />
          Continue with GitHub
        </button>

        <div style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setMessage(null);
              setUsername("");
              setConfirmPassword("");
            }}
            style={{
              background: "none", border: "none", color: "var(--accent-primary)",
              cursor: "pointer", fontWeight: 500, padding: 0, textDecoration: "underline"
            }}
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
