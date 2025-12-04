import { useEffect, useState } from "react";
import { getHistory, clearHistory } from "../services/storageService";
import type { RepoStats } from "../types";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (url: string) => void;
}

export const HistorySidebar = ({
  isOpen,
  onClose,
  onSelectRepo,
}: HistorySidebarProps) => {
  const [history, setHistory] = useState<RepoStats[]>([]);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s",
          zIndex: 90,
        }}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "320px",
          background: "var(--bg-panel)",
          borderLeft: "1px solid var(--border-subtle)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 100,
          padding: "2rem",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>History</h2>
            {history.length > 0 && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to clear your analysis history?"
                    )
                  ) {
                    clearHistory();
                    setHistory([]);
                  }
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--status-bad)",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  textDecoration: "underline",
                  opacity: 0.8,
                }}
              >
                Clear All
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "1.5rem",
            }}
          >
            ×
          </button>
        </div>

        {history.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>No history yet.</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {history.map((item, idx) => (
              <div
                key={idx}
                className="panel"
                style={{
                  padding: "1rem",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  background: "var(--bg-page)",
                }}
                onClick={() => {
                  onSelectRepo(`https://github.com/${item.repoName}`);
                  onClose();
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateX(-5px)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                  {item.repoName}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>
                    Score:{" "}
                    <span style={{ color: "var(--status-good)" }}>
                      {item.averageScore.toFixed(1)}
                    </span>
                  </span>
                  <span>
                    {new Date(item.lastAnalyzed).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
