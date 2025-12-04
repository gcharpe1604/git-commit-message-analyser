import { useState } from "react";
import { sanitizeInput } from "../utils/sanitize";

interface InputSectionProps {
  onAnalyze: (input: string) => void;
  isLoading: boolean;
  recentSearches?: string[];
  onRemoveRecent?: (input: string) => void;
  onClearHistory?: () => void;
}

export const InputSection = ({
  onAnalyze,
  isLoading,
  recentSearches = [],
  onRemoveRecent,
  onClearHistory,
}: InputSectionProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(sanitizeInput(input));
  };

  const isUrl = input.includes("/") || input.includes("github.com");
  const buttonText = isLoading
    ? "Analyzing..."
    : isUrl
    ? "Analyze Repository"
    : "Search User";

  return (
    <div className="animate-in" style={{ marginBottom: "3rem" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "0.75rem",
          maxWidth: "600px",
          margin: "0 auto",
        }}
      >
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
            type="text"
            placeholder="github_username or owner/repo"
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
          {buttonText}
        </button>
      </form>

      {recentSearches.length > 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "1rem",
            display: "flex",
            justifyContent: "center",
            gap: "0.2rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.85rem",
                color: "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              Recent:
            </span>
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-tertiary)",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  padding: "0.1rem 0.3rem",
                  textDecoration: "underline",
                  opacity: 0.7,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--status-bad)";
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-tertiary)";
                  e.currentTarget.style.opacity = "0.7";
                }}
              >
                Clear All
              </button>
            )}
          </div>
          {recentSearches.map((search, idx) => (
            <div key={idx} className="recent-search-item">
              <button
                onClick={() => onAnalyze(search)}
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
          ))}
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
