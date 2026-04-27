import { useState, memo } from "react";
import { message } from "antd";
import type { Commit } from "../types";
import { TYPE_COLORS, STATUS_COLORS, CONSTANTS } from "../constants";
import { getRelativeTime } from "../utils/time";
import { CopyButton } from "./CopyButton";
import { DeepAnalysisSection } from "./DeepAnalysisSection";
import { useLLM } from "../hooks/useLLM";
import { MdAutoAwesome, MdContentCopy } from "react-icons/md";

interface CommitCardProps {
  commit: Commit;
  index: number;
}

const AIImprovementSection = ({ message: commitMessage }: { message: string }) => {
  const { improveMessage, loading, error, hasApiKey } = useLLM();
  const [improved, setImproved] = useState<string | null>(null);

  const handleImprove = async () => {
    if (!hasApiKey) {
      message.warning("Please add your API Key in Settings first.");
      return;
    }
    const result = await improveMessage(commitMessage);
    if (result) setImproved(result);
  };

  const copyToClipboard = () => {
    if (improved) {
      navigator.clipboard.writeText(improved);
    }
  };

  return (
    <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
      {error && (
        <div
          style={{
            color: "var(--status-bad)",
            fontSize: "0.85rem",
            marginBottom: "0.5rem",
            background: "rgba(239, 68, 68, 0.1)",
            padding: "0.5rem",
            borderRadius: "6px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {!improved ? (
        <button
          onClick={handleImprove}
          disabled={loading}
          className="btn-ghost"
          style={{
            fontSize: "0.85rem",
            color: "var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.25rem 0.5rem",
            border: "1px solid var(--accent-primary)",
            background: "rgba(109, 40, 217, 0.05)",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <MdAutoAwesome className="spin" /> : <MdAutoAwesome />}
          {loading ? "Analyzing..." : "Improve with AI"}
        </button>
      ) : (
        <div
          style={{
            background: "rgba(109, 40, 217, 0.05)",
            border: "1px solid rgba(109, 40, 217, 0.2)",
            borderRadius: "6px",
            padding: "0.75rem",
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
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--accent-primary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <MdAutoAwesome /> AI Suggestion
            </span>
            <button
              onClick={copyToClipboard}
              title="Copy to clipboard"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              <MdContentCopy />
            </button>
          </div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.9rem",
              whiteSpace: "pre-wrap",
              color: "var(--text-primary)",
            }}
          >
            {improved}
          </div>
        </div>
      )}
    </div>
  );
};

export const CommitCard = memo(
  ({ commit, index }: CommitCardProps) => {
    const [expanded, setExpanded] = useState(false);
    const { message, author, analysis, url } = commit;
    const score = analysis?.score || 0;
    const status = analysis?.status || "good";

    const statusColor = STATUS_COLORS[status];
    const typeColor = analysis?.conventionalType
      ? TYPE_COLORS[analysis.conventionalType] || "#64748b"
      : "#64748b";

    const firstLine = message.split("\n")[0];
    const relativeTime = getRelativeTime(author.date);
    const absoluteTime = new Date(author.date).toLocaleString();

    return (
      <div
        className="panel animate-in"
        style={{
          marginBottom: "1rem",
          padding: "1.25rem",
          borderLeft: `3px solid ${statusColor}`,
          animationDelay: `${index * CONSTANTS.ANIMATION.STAGGER_DELAY}s`,
        }}
      >
        <div
          className="commit-card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              {analysis?.conventionalType && (
                <span
                  style={{
                    backgroundColor: typeColor,
                    color: "white",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "4px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {analysis.conventionalType}
                </span>
              )}
              <h3
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "var(--text-primary)",
                    textDecoration: "none",
                  }}
                >
                  {firstLine}
                </a>
              </h3>
            </div>

            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {commit.author.avatar_url && (
                <img
                  src={commit.author.avatar_url}
                  alt={`${author.name}'s GitHub avatar`}
                  style={{ width: 18, height: 18, borderRadius: "50%" }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <span>{author.name}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <span title={absoluteTime}>{relativeTime}</span>
              <span style={{ opacity: 0.5 }}>•</span>
              <CopyButton
                text={commit.sha.substring(0, 7)}
                label="Copy commit SHA"
              />
            </div>
          </div>

          <div className="commit-card-score" style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: statusColor,
              }}
              title={`Score: ${score}/${CONSTANTS.SCORE.PERFECT_SCORE} - ${status}`}
            >
              {score}
            </div>
          </div>
        </div>

        {/* Achievements Row */}
        {analysis?.achievements && analysis.achievements.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginTop: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            {analysis.achievements.map((a) => (
              <div
                key={a.id}
                title={a.description}
                style={{
                  fontSize: "0.75rem",
                  background: "var(--bg-page)",
                  border: "1px solid var(--border-subtle)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  cursor: "help",
                  color: "var(--text-secondary)",
                }}
              >
                {a.icon} {a.name}
              </div>
            ))}
          </div>
        )}

        {analysis && analysis.feedback.length > 0 && (
          <div style={{ marginTop: "0.75rem" }}>
            <button
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-controls={`feedback-${commit.sha}`}
              aria-label={`${
                expanded ? "Hide" : "View"
              } feedback for commit ${firstLine}`}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-tertiary)",
                cursor: "pointer",
                padding: 0,
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              {expanded ? "Hide Feedback" : "View Feedback"}
              <span
                style={{
                  transform: expanded ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              >
                ▼
              </span>
            </button>

            {expanded && (
              <div
                id={`feedback-${commit.sha}`}
                role="region"
                aria-label="Commit feedback"
                style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem",
                  background: "var(--bg-page)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.9rem",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <DeepAnalysisSection commit={commit} />

                <AIImprovementSection message={message} />

                <ul
                  style={{
                    margin: "1rem 0 0 0",
                    paddingLeft: "1.2rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {analysis.feedback.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "0.25rem" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if commit SHA changes
    return prevProps.commit.sha === nextProps.commit.sha;
  },
);
