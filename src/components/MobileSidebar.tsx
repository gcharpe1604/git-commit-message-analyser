import { MdClose, MdHistory, MdSettings, MdLogin, MdLogout, MdPerson } from "react-icons/md";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { AuthModal } from "./AuthModal";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export const MobileSidebar = ({ isOpen, onClose, onOpenHistory, onOpenSettings }: MobileSidebarProps) => {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const userName = user?.user_metadata?.user_name || user?.user_metadata?.full_name || user?.email || "Guest";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s",
          zIndex: 400,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "280px",
          background: "color-mix(in srgb, var(--bg-panel) 85%, transparent)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderLeft: "1px solid var(--border-subtle)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 401,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Menu</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", fontSize: "1.5rem", cursor: "pointer", display: "flex" }}>
            <MdClose />
          </button>
        </div>

        <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", padding: "0.5rem", borderBottom: "1px solid var(--border-subtle)" }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} style={{ width: "32px", height: "32px", borderRadius: "50%", border: "1px solid var(--accent-primary)" }} />
              ) : (
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--bg-page)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <MdPerson size={20} />
                </div>
              )}
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{userName}</div>
                {user.email && <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{user.email}</div>}
              </div>
            </div>
          )}

          <button
            onClick={() => { onClose(); onOpenHistory(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "0.95rem", cursor: "pointer", borderRadius: "8px", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-panel-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <MdHistory size={20} style={{ color: "var(--text-secondary)" }} /> History
          </button>
          
          <button
            onClick={() => { onClose(); onOpenSettings(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "transparent", border: "none", color: "var(--text-primary)", fontSize: "0.95rem", cursor: "pointer", borderRadius: "8px", textAlign: "left" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-panel-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <MdSettings size={20} style={{ color: "var(--text-secondary)" }} /> Add API Keys
          </button>

          <div style={{ padding: "0.1rem 0" }}>
            <ThemeToggle variant="menuItem" />
          </div>

          <div style={{ marginTop: "auto" }}>
            {!user ? (
              <button
                onClick={() => { onClose(); setIsAuthModalOpen(true); }}
                className="btn-primary"
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem", justifyContent: "center" }}
              >
                <MdLogin size={20} /> Sign In
              </button>
            ) : (
              <button
                onClick={() => { signOut(); onClose(); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "transparent", border: "none", color: "var(--status-bad)", fontSize: "0.95rem", cursor: "pointer", borderRadius: "8px", textAlign: "left" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <MdLogout size={20} /> Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
      
      {!user && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
    </>
  );
};
