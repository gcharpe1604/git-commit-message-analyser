import { useState, useEffect, useMemo } from "react";
import {
  MdCheckCircle,
  MdCancel,
  MdSave,
  MdArrowForward,
  MdHistory,
} from "react-icons/md";
import { analyzeCommit } from "../utils/simpleAnalyzer";
import { debounce } from "../utils/debounce";
import { CONSTANTS } from "../constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { AnalysisResult } from "../types";

interface SavedDraft {
  id: string;
  message: string;
  score: number;
  date: string;
}

export const Playground = () => {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedDrafts, setSavedDrafts] = useLocalStorage<SavedDraft[]>(
    "playground_drafts",
    []
  );

  // Debounce the analysis to avoid running on every keystroke
  const debouncedAnalyze = useMemo(
    () =>
      debounce((msg: string) => {
        if (msg.trim()) {
          setResult(analyzeCommit(msg));
        } else {
          setResult(null);
        }
      }, CONSTANTS.ANIMATION.DEBOUNCE_DELAY),
    []
  );

  useEffect(() => {
    debouncedAnalyze(message);
  }, [message, debouncedAnalyze]);

  const handleSave = () => {
    if (!message.trim() || !result) return;

    const newDraft: SavedDraft = {
      id: Date.now().toString(),
      message,
      score: result.score,
      date: new Date().toISOString(),
    };

    setSavedDrafts((prev) => [newDraft, ...prev].slice(0, 50));
  };

  const applySuggestion = () => {
    if (result?.suggestion) {
      setMessage(result.suggestion);
    }
  };

  return (
    <div className="animate-in" style={{ padding: "2rem", marginTop: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
            Playground 🧪
          </h2>
          <p style={{ color: "var(--text-secondary)", margin: 0 }}>
            Test your commit messages in real-time before pushing.
          </p>
        </div>

        {savedDrafts.length > 0 && (
          <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            <MdHistory
              style={{ verticalAlign: "middle", marginRight: "0.25rem" }}
            />
            {savedDrafts.length} saved drafts
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a commit message here..."
            className="input-field"
            style={{
              width: "100%",
              minHeight: "200px",
              padding: "1rem",
              borderRadius: "0.75rem",
              resize: "vertical",
              fontFamily: "monospace",
              fontSize: "1rem",
              lineHeight: 1.5,
            }}
          />

          {result && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleSave}
                className="btn-secondary"
                disabled={!message.trim()}
                style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}
              >
                <MdSave /> Save to History
              </button>
            </div>
          )}
        </div>

        <div>
          {result ? (
            <div
              className="panel"
              style={{ padding: "1.5rem", background: "var(--bg-page)" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                    Score
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Based on Conventional Commits
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <span
                    style={{
                      fontSize: "2rem",
                      fontWeight: "800",
                      lineHeight: 1,
                      color:
                        result.score >= 8
                          ? "var(--status-good)"
                          : result.score >= 5
                          ? "var(--status-warning)"
                          : "var(--status-bad)",
                    }}
                  >
                    {result.score}
                    <span
                      style={{
                        fontSize: "1rem",
                        color: "var(--text-secondary)",
                        fontWeight: 400,
                      }}
                    >
                      /10
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      marginTop: "0.25rem",
                      color:
                        result.score >= 8
                          ? "var(--status-good)"
                          : result.score >= 5
                          ? "var(--status-warning)"
                          : "var(--status-bad)",
                    }}
                  >
                    {result.score >= 8
                      ? "Excellent"
                      : result.score >= 5
                      ? "Needs Work"
                      : "Poor"}
                  </span>
                </div>
              </div>

              {/* Detailed Checklist */}
              {result.checklist && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <h4
                    style={{
                      margin: "0 0 0.75rem 0",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Breakdown
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <CheckItem
                      label="Has Type (feat, fix, etc.)"
                      valid={result.checklist.hasType}
                    />
                    <CheckItem
                      label="Subject Length (10+ chars)"
                      valid={result.checklist.subjectLength}
                    />
                    <CheckItem
                      label="Imperative Verb"
                      valid={result.checklist.imperativeVerb}
                    />
                    <CheckItem
                      label="No Vague Words"
                      valid={result.checklist.noVagueWords}
                    />
                    <CheckItem
                      label="No Trailing Period"
                      valid={result.checklist.noPeriod}
                    />
                  </div>
                </div>
              )}

              {/* Comparison / Suggestion */}
              {result.suggestion && (
                <div
                  style={{
                    marginBottom: "1.5rem",
                    padding: "1rem",
                    background: "rgba(59, 130, 246, 0.05)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#3b82f6",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      💡 Suggestion
                    </span>
                    <button
                      onClick={applySuggestion}
                      style={{
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      Use This
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.9rem",
                        color: "var(--status-bad)",
                        opacity: 0.7,
                        textDecoration: "line-through",
                      }}
                    >
                      <span>Original:</span>
                      <span style={{ fontFamily: "monospace" }}>
                        {message.split("\n")[0]}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSize: "0.95rem",
                      }}
                    >
                      <MdArrowForward style={{ color: "#3b82f6" }} />
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        {result.suggestion}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback List */}
              {result.feedback.length > 0 && (
                <div>
                  <h4
                    style={{
                      margin: "0 0 0.5rem 0",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Feedback
                  </h4>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: "0",
                      listStyle: "none",
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {result.feedback.map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          marginBottom: "0.5rem",
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "flex-start",
                        }}
                      >
                        <span
                          style={{
                            color: "var(--status-warning)",
                            marginTop: "3px",
                          }}
                        >
                          •
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.score === 10 && result.feedback.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    color: "var(--status-good)",
                    fontWeight: 600,
                  }}
                >
                  ✨ Perfect commit message!
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                height: "200px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                border: "2px dashed var(--border-subtle)",
                borderRadius: "0.75rem",
                background: "rgba(0,0,0,0.02)",
                gap: "1rem",
              }}
            >
              <div style={{ fontSize: "2rem", opacity: 0.3 }}>🧪</div>
              <span>Start typing to analyze...</span>
            </div>
          )}
        </div>
      </div>

      {/* Saved Drafts List (Mini History) */}
      {savedDrafts.length > 0 && (
        <div
          style={{
            marginTop: "3rem",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "2rem",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
            Recent Drafts
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {savedDrafts.slice(0, 4).map((draft) => (
              <div
                key={draft.id}
                className="panel"
                style={{ padding: "1rem", fontSize: "0.9rem" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        draft.score >= 8
                          ? "var(--status-good)"
                          : draft.score >= 5
                          ? "var(--status-warning)"
                          : "var(--status-bad)",
                    }}
                  >
                    Score: {draft.score}
                  </span>
                  <span
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {new Date(draft.date).toLocaleDateString()}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: "0.5rem",
                  }}
                >
                  {draft.message}
                </div>
                <button
                  onClick={() => {
                    setMessage(draft.message);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="btn-ghost"
                  style={{
                    width: "100%",
                    padding: "0.25rem",
                    fontSize: "0.8rem",
                  }}
                >
                  Load Draft
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CheckItem = ({ label, valid }: { label: string; valid: boolean }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      fontSize: "0.9rem",
    }}
  >
    {valid ? (
      <MdCheckCircle
        style={{ color: "var(--status-good)", fontSize: "1.1rem" }}
      />
    ) : (
      <MdCancel style={{ color: "var(--status-bad)", fontSize: "1.1rem" }} />
    )}
    <span
      style={{
        color: valid ? "var(--text-primary)" : "var(--text-secondary)",
        textDecoration: valid ? "none" : "none",
      }}
    >
      {label}
    </span>
  </div>
);
