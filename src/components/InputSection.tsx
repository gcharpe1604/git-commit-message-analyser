import { useState } from "react";
import { sanitizeInput } from "../utils/sanitize";

interface InputSectionProps {
  onAnalyze: (input: string, mode: "user" | "repo") => void;
  isLoading: boolean;
  recentSearches?: string[];
  onRemoveRecent?: (input: string) => void;
  onClearHistory?: () => void;
  inputRef?: React.Ref<HTMLInputElement>;
}

export const InputSection = ({
  onAnalyze,
  isLoading,
  recentSearches = [],
  onRemoveRecent,
  onClearHistory,
  inputRef,
}: InputSectionProps) => {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"user" | "repo">("user");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = sanitizeInput(input);

    if (mode === "repo") {
      // In repo mode: accept owner/repo shorthand or full URL
      const repoUrl = sanitized.startsWith("http")
        ? sanitized
        : `https://github.com/${sanitized}`;
      onAnalyze(repoUrl, "repo");
    } else {
      // In user mode: pass username directly
      onAnalyze(sanitized, "user");
    }
  };

  const placeholder = mode === "user"
    ? "Enter GitHub username (e.g. torvalds)"
    : "Enter owner/repo or URL (e.g. torvalds/linux)";

  return (
    <div className="animate-in" style={{ marginBottom: "3rem" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
        <div style={{ alignSelf: "center", display: "flex", background: "var(--bg-panel)", borderRadius: "8px", padding: "0.25rem", border: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={() => setMode("user")}
            style={{
              background: mode === "user" ? "var(--bg-page)" : "transparent",
              color: mode === "user" ? "var(--text-primary)" : "var(--text-secondary)",
              border: "none",
              borderRadius: "6px",
              padding: "0.25rem 1rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              boxShadow: mode === "user" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s"
            }}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => setMode("repo")}
            style={{
              background: mode === "repo" ? "var(--bg-page)" : "transparent",
              color: mode === "repo" ? "var(--text-primary)" : "var(--text-secondary)",
              border: "none",
              borderRadius: "6px",
              padding: "0.25rem 1rem",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              boxShadow: mode === "repo" ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.2s"
            }}
          >
            Repository
          </button>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
        <div className="input-group" style={{ flex: 1 }}>
          <div
            style={{
              color: "var(--text-tertiary)",
              paddingLeft: "0.5rem",
              display: "flex",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="input-field"
          />
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={isLoading}
          style={{ whiteSpace: "nowrap" }}
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
        </div>
      </form>

      {recentSearches.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}
            >
              Recent Searches:
            </span>
            {recentSearches.map((search, idx) => {
              const searchMode = search.includes("/") ? "repo" : "user";
              return (
                <div key={idx} className="recent-search-item">
                  <button
                    onClick={() => onAnalyze(search, searchMode)}
                    className="recent-search-btn"
                  >
                    {search}
                  </button>
                  {onRemoveRecent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveRecent(search);
                      }}
                      className="recent-search-remove"
                      aria-label={`Remove ${search} from recent searches`}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
            {onClearHistory && recentSearches.length > 0 && (
              <button
                onClick={onClearHistory}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--status-bad)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  marginLeft: "auto",
                  opacity: 0.8,
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {recentSearches.length === 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "0.85rem",
            color: "var(--text-tertiary)",
          }}
        >
          Try{" "}
          <span
            style={{
              color: "var(--text-secondary)",
              borderBottom: "1px dotted var(--text-secondary)",
            }}
          >
            facebook/react
          </span>{" "}
          or{" "}
          <span
            style={{
              color: "var(--text-secondary)",
              borderBottom: "1px dotted var(--text-secondary)",
            }}
          >
            torvalds
          </span>
        </div>
      )}
    </div>
  );
};
