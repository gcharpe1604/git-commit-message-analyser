import { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { MdLogout, MdPerson, MdLogin, MdSettings } from "react-icons/md";
import { AuthModal } from "./AuthModal";
import { ThemeToggle } from "./ThemeToggle";

export const AuthButton = ({ onOpenSettings }: { onOpenSettings: () => void }) => {
  const { user, loading, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) {
    return (
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        background: "var(--bg-page)", animation: "pulse 1.5s infinite",
      }} />
    );
  }

  const avatarUrl = user?.user_metadata?.avatar_url;
  const userName = user?.user_metadata?.user_name || user?.user_metadata?.full_name || user?.email || "Guest";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="btn-secondary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: user ? "0.5rem 1rem" : "0.5rem 0.75rem",
            justifyContent: "center",
          }}
          aria-label={user ? "Profile" : "Settings"}
        >
          {user ? (
            <>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={userName}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "1px solid var(--accent-primary)",
                  }}
                />
              ) : (
                <MdPerson size={20} />
              )}
              <span style={{ fontSize: "0.9rem", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userName}
              </span>
            </>
          ) : (
            <MdSettings size={20} />
          )}
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              right: 0,
              background: "color-mix(in srgb, var(--bg-panel) 90%, transparent)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              minWidth: "220px",
              zIndex: 300,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* User Info */}
            {user && (
              <div style={{
                padding: "1rem",
                borderBottom: "1px solid var(--border-subtle)",
              }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {userName}
                </div>
                {user.email && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                    {user.email}
                  </div>
                )}
              </div>
            )}

            <div style={{ padding: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {/* Settings / API Keys */}
              <button
                onClick={() => {
                  onOpenSettings();
                  setShowDropdown(false);
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.65rem 0.5rem",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  borderRadius: "6px",
                  transition: "background 0.15s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-panel-hover)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <MdSettings size={18} style={{ color: "var(--text-secondary)" }} />
                Add API Keys
              </button>

              {/* Theme Toggle */}
              <ThemeToggle variant="menuItem" />
            </div>

            {user && (
              <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "0.5rem" }}>
                <button
                  onClick={() => {
                    signOut();
                    setShowDropdown(false);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.65rem 0.5rem",
                    border: "none",
                    background: "transparent",
                    color: "var(--status-bad)",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    borderRadius: "6px",
                    transition: "background 0.15s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <MdLogout size={18} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!user && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
          }}
        >
          <MdLogin size={18} />
          Sign In
        </button>
      )}

      {/* Auth Modal for Guests */}
      {!user && <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};
