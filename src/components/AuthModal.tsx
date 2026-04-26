import { createPortal } from "react-dom";
import { MdClose } from "react-icons/md";
import { FaGithub, FaGoogle } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { signInWithGitHub, signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  const buttonStyle = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
    width: "100%", boxSizing: "border-box" as const, padding: "0.75rem", borderRadius: "8px",
    border: "1px solid var(--border-subtle)", background: "var(--bg-page)",
    color: "var(--text-primary)", cursor: "pointer", fontSize: "0.95rem",
    fontWeight: 500, transition: "all 0.2s ease",
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
            Sign In
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

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
          <button
            onClick={() => {
              onClose();
              signInWithGitHub();
            }}
            style={buttonStyle}
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
          
          <button
            onClick={() => {
              onClose();
              signInWithGoogle();
            }}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            <FaGoogle size={18} />
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
