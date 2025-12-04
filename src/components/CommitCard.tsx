import { useState, memo } from "react";
import type { Commit } from "../types";
import { TYPE_COLORS, STATUS_COLORS, CONSTANTS } from "../constants";
import { getRelativeTime } from "../utils/time";
import { CopyButton } from "./CopyButton";
import { DeepAnalysisSection } from "./DeepAnalysisSection";

interface CommitCardProps {
  commit: Commit;
  index: number;
}

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

          <div style={{ textAlign: "right" }}>
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

                <ul
                  style={{
                    margin: 0,
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
  }
);
