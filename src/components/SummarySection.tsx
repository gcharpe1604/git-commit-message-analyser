import { useState } from "react";
import type { RepoStats } from "../types";
import { AchievementsSection } from "./AchievementsSection";

interface SummarySectionProps {
  stats: RepoStats;
}

const DEVELOPER_TYPE_CONFIG: Record<string, { emoji: string; varName: string; description: string }> = {
  'Night Owl Coder':    { emoji: '🦉', varName: '--accent-primary',  description: 'Most commits happen late at night' },
  'Consistent Builder': { emoji: '🏗️', varName: '--status-good',     description: 'Steady, regular commit patterns' },
  'Burst Committer':    { emoji: '⚡', varName: '--status-warning',  description: 'Commits in high-intensity bursts' },
  'Weekend Hacker':     { emoji: '🛠️', varName: '--accent-text',     description: 'Prefers hacking on weekends' },
};

const getQualityLabel = (score: number) => {
  if (score >= 8) return 'High Quality';
  if (score >= 6) return 'Moderate Quality';
  return 'Needs Improvement';
};

const getScoreColor = (score: number) => {
  if (score >= 8) return 'var(--status-good)';
  if (score >= 6) return 'var(--status-warning)';
  return 'var(--status-bad)';
};

export const SummarySection = ({ stats }: SummarySectionProps) => {
  const [copied, setCopied] = useState(false);

  const {
    averageScore,
    totalCommits,
    goodCommits,
    warningCommits,
    badCommits,
    timeDistribution,
    achievements,
    developerType,
  } = stats;

  const analyzedCount = goodCommits + warningCommits + badCommits;

  const getWidth = (count: number) => {
    return analyzedCount > 0 ? `${(count / analyzedCount) * 100}%` : "0%";
  };

  const devTypeConfig = developerType ? DEVELOPER_TYPE_CONFIG[developerType] : null;
  const devColor = devTypeConfig ? `var(${devTypeConfig.varName})` : 'var(--accent-primary)';
  const devColorAlpha = devTypeConfig ? `color-mix(in srgb, var(${devTypeConfig.varName}) 12%, transparent)` : 'transparent';
  const devBorderAlpha = devTypeConfig ? `color-mix(in srgb, var(${devTypeConfig.varName}) 30%, transparent)` : 'var(--border-subtle)';

  const handleCopySummary = () => {
    const summary = `Repo: ${stats.repoName} | Avg Score: ${averageScore.toFixed(1)}/10 | ${developerType || 'Unknown'} | ${getQualityLabel(averageScore)}`;
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <div className="panel no-lift animate-in" style={{ padding: "2rem", marginBottom: "2rem" }}>

        {/* ── Header: Repo Name + Copy Button ── */}
        <div style={{ marginBottom: "2rem", textAlign: "center", position: "relative" }}>
          <a
            href={`https://github.com/${stats.repoName}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <h2
              className="repo-link"
              style={{
                margin: 0,
                fontSize: "2.25rem",
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-block",
                letterSpacing: "-0.02em",
              }}
            >
              {stats.repoName} ↗
            </h2>
          </a>
          <div style={{ color: "var(--text-tertiary)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
            Analysis Report
          </div>

          {/* Copy Summary Button */}
          <button
            onClick={handleCopySummary}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.4rem 0.85rem",
              fontSize: "0.8rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              background: copied ? "var(--status-good)" : "var(--bg-page)",
              color: copied ? "#fff" : "var(--text-secondary)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              fontWeight: 500,
            }}
          >
            {copied ? "✓ Copied!" : "📋 Copy Summary"}
          </button>
        </div>

        {/* ── Developer Type Badge ── */}
        {developerType && devTypeConfig ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              padding: "1rem 1.5rem",
              borderRadius: "var(--radius-md)",
              background: devColorAlpha,
              border: `1px solid ${devBorderAlpha}`,
              marginBottom: "2rem",
            }}
          >
            <span style={{ fontSize: "2rem" }}>{devTypeConfig.emoji}</span>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                Developer Type
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 700, color: devColor }}>
                {developerType}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                {devTypeConfig.description}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "var(--text-tertiary)", fontSize: "0.85rem", marginBottom: "2rem", padding: "1rem", border: "1px dashed var(--border-subtle)", borderRadius: "10px" }}>
            Not enough data to determine developer type
          </div>
        )}

        {/* ── Stat Cards ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2rem",
          }}
        >
          <div
            className="text-center"
            style={{
              padding: "1.25rem 1rem",
              background: "var(--bg-page)",
              borderRadius: "var(--radius-md)",
              border: `1px solid color-mix(in srgb, ${getScoreColor(averageScore)} 30%, transparent)`,
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "800",
                color: getScoreColor(averageScore),
                lineHeight: 1,
              }}
            >
              {averageScore.toFixed(1)}
            </div>
            <div style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>
              Average Score
            </div>
            <div style={{ fontSize: "0.75rem", color: getScoreColor(averageScore), marginTop: "0.25rem", fontWeight: 600 }}>
              {getQualityLabel(averageScore)}
            </div>
          </div>

          <div
            className="text-center"
            style={{
              padding: "1.25rem 1rem",
              background: "var(--bg-page)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ fontSize: "3rem", fontWeight: "800", color: "var(--text-primary)", lineHeight: 1 }}>
              {totalCommits}
            </div>
            <div style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontWeight: 500, fontSize: "0.9rem" }}>
              Total Commits
            </div>
          </div>
        </div>

        {/* ── Score Distribution ── */}
        {analyzedCount > 0 ? (
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ margin: "0 0 0.75rem 0", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Score Distribution
              <span style={{ fontSize: "0.75rem", fontWeight: "normal", marginLeft: "0.5rem", opacity: 0.7 }}>
                (Based on latest 50 commits)
              </span>
            </h4>
            <div
              style={{
                height: "10px",
                display: "flex",
                borderRadius: "6px",
                overflow: "hidden",
                background: "var(--bg-page)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ width: getWidth(goodCommits), backgroundColor: "var(--status-good)", transition: "width 1s ease" }} />
              <div style={{ width: getWidth(warningCommits), backgroundColor: "var(--status-warning)", transition: "width 1s ease" }} />
              <div style={{ width: getWidth(badCommits), backgroundColor: "var(--status-bad)", transition: "width 1s ease" }} />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.8rem",
                marginTop: "0.5rem",
              }}
            >
              <span style={{ color: "var(--status-good)", fontWeight: 600 }}>✓ Good: {goodCommits}</span>
              <span style={{ color: "var(--status-warning)", fontWeight: 600 }}>⚠ Warning: {warningCommits}</span>
              <span style={{ color: "var(--status-bad)", fontWeight: 600 }}>✕ Bad: {badCommits}</span>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)", marginBottom: "2rem", border: "1px dashed var(--border-subtle)", borderRadius: "10px" }}>
            No commits to display score distribution.
          </div>
        )}

        {/* ── Type Distribution ── */}
        {stats.typeDistribution && Object.keys(stats.typeDistribution).length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Commit Types
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Object.entries(stats.typeDistribution).map(([type, count]) => {
                const total = Object.values(stats.typeDistribution || {}).reduce((a, b) => a + b, 0);
                const percent = (count / total) * 100;
                return (
                  <div
                    key={type}
                    style={{
                      flex: "1 1 auto",
                      minWidth: "80px",
                      background: "var(--bg-page)",
                      padding: "0.75rem",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                      textAlign: "center",
                      transition: "transform 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.25rem", textTransform: "capitalize" }}>
                      {type}
                    </div>
                    <div style={{ fontSize: "1.1rem", color: "var(--accent-primary)", fontWeight: 700 }}>
                      {count}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "0.2rem" }}>
                      {Math.round(percent)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Time Distribution Chart ── */}
        {timeDistribution ? (
          <div>
            <h4 style={{ margin: "0 0 1rem 0", color: "var(--text-secondary)", fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Commit Time Distribution
            </h4>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              {Object.entries(timeDistribution).map(([period, count]) => {
                const max = Math.max(...Object.values(timeDistribution));
                const height = max > 0 ? (count / max) * 100 : 0;
                const icons: Record<string, string> = {
                  morning: "🌅",
                  afternoon: "☀️",
                  evening: "🌆",
                  night: "🌙",
                };
                const isHighest = count === max && max > 0;

                return (
                  <div key={period} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ height: "100px", width: "100%", display: "flex", alignItems: "flex-end", position: "relative" }}>
                      <div
                        style={{
                          width: "100%",
                          height: `${Math.max(height, 5)}%`,
                          background: "var(--bg-panel)",
                          border: `1px solid ${isHighest ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                          borderRadius: "4px",
                          transition: "height 0.5s ease",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: "100%",
                            background: isHighest ? "var(--accent-primary)" : "var(--accent-primary)",
                            opacity: isHighest ? 0.9 : 0.45,
                            boxShadow: isHighest ? "0 0 10px var(--accent-glow)" : "none",
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{icons[period]}</div>
                      <div style={{ fontSize: "0.8rem", textTransform: "capitalize", color: isHighest ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: isHighest ? 700 : 500 }}>
                        {period}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.1rem" }}>
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-secondary)", border: "1px dashed var(--border-subtle)", borderRadius: "10px" }}>
            Not enough data to generate insights
          </div>
        )}
      </div>

      {achievements && achievements.length > 0 && (
        <AchievementsSection achievements={achievements} />
      )}
    </>
  );
};
