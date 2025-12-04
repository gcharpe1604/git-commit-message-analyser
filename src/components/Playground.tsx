import { useState, useEffect, useMemo } from "react";
import { analyzeCommit } from "../utils/simpleAnalyzer";
import { debounce } from "../utils/debounce";
import { CONSTANTS } from "../constants";
import type { AnalysisResult } from "../types";

export const Playground = () => {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);

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

  return (
    <div
      className="panel animate-in"
      style={{ padding: "2rem", marginTop: "2rem" }}
    >
      <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Playground 🧪</h2>
      <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
        Test your commit messages in real-time before pushing.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a commit message here..."
          className="input-field"
          style={{
            width: "100%",
            minHeight: "150px",
            padding: "1rem",
            borderRadius: "0.75rem",
            resize: "vertical",
            fontFamily: "monospace",
            fontSize: "1rem",
          }}
        />

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
                  marginBottom: "1rem",
                }}
              >
                <span style={{ fontWeight: 600 }}>Score</span>
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color:
                      result.score >= 8
                        ? "var(--status-good)"
                        : result.score >= 5
                        ? "var(--status-warning)"
                        : "var(--status-bad)",
                  }}
                >
                  {result.score}/10
                </span>
              </div>

              {result.suggestion && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#3b82f6",
                      fontWeight: 600,
                      marginBottom: "0.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Suggestion</span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(result.suggestion!)
                      }
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "inherit",
                        fontSize: "0.7rem",
                        opacity: 0.8,
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      color: "var(--text-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {result.suggestion}
                  </div>
                </div>
              )}

              {result.feedback.length > 0 ? (
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.2rem",
                    color: "var(--text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  {result.feedback.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "0.5rem" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "var(--status-good)", margin: 0 }}>
                  Perfect! ✨
                </p>
              )}
            </div>
          ) : (
            <div
              style={{
                height: "150px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-secondary)",
                border: "2px dashed var(--border-subtle)",
                borderRadius: "0.75rem",
              }}
            >
              Start typing to see analysis...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
