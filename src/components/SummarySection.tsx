import type { RepoStats } from "../types";
import { AchievementsSection } from "./AchievementsSection";

interface SummarySectionProps {
  stats: RepoStats;
}

export const SummarySection = ({ stats }: SummarySectionProps) => {
  const {
    averageScore,
    totalCommits,
    goodCommits,
    warningCommits,
    badCommits,
    timeDistribution,
    achievements,
  } = stats;

  const analyzedCount = goodCommits + warningCommits + badCommits;

  const getWidth = (count: number) => {
    return analyzedCount > 0 ? `${(count / analyzedCount) * 100}%` : "0%";
  };

  return (
    <>
      <div
        className="panel animate-in"
        style={{ padding: "2rem", marginBottom: "2rem" }}
      >
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
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
                fontSize: "1.75rem",
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-block",
              }}
            >
              {stats.repoName} ↗
            </h2>
          </a>
          <div
            style={{
              color: "var(--text-tertiary)",
              fontSize: "0.9rem",
              marginTop: "0.5rem",
            }}
          >
            Analysis Report
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
            marginBottom: "2rem",
          }}
        >
          <div
            className="text-center"
            style={{
              padding: "1rem",
              background: "var(--bg-page)",
              borderRadius: "1rem",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "800",
                background: "var(--gradient-primary)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1,
              }}
            >
              {averageScore.toFixed(1)}
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                marginTop: "0.5rem",
                fontWeight: 500,
              }}
            >
              Average Score
            </div>
          </div>

          <div
            className="text-center"
            style={{
              padding: "1rem",
              background: "var(--bg-page)",
              borderRadius: "1rem",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                fontWeight: "800",
                color: "var(--text-primary)",
                lineHeight: 1,
              }}
            >
              {totalCommits}
            </div>
            <div
              style={{
                color: "var(--text-secondary)",
                marginTop: "0.5rem",
                fontWeight: 500,
              }}
            >
              Total Commits
            </div>
          </div>
        </div>

        {/* Score Distribution */}
        <div style={{ marginBottom: "2rem" }}>
          <h4
            style={{
              margin: "0 0 0.5rem 0",
              color: "var(--text-secondary)",
              fontSize: "0.9rem",
            }}
          >
            Score Distribution
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "normal",
                marginLeft: "0.5rem",
                opacity: 0.7,
              }}
            >
              (Based on latest 50 commits)
            </span>
          </h4>
          <div
            style={{
              height: "12px",
              display: "flex",
              borderRadius: "6px",
              overflow: "hidden",
              background: "var(--bg-page)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: getWidth(goodCommits),
                backgroundColor: "var(--status-good)",
                transition: "width 1s ease",
              }}
            />
            <div
              style={{
                width: getWidth(warningCommits),
                backgroundColor: "var(--status-warning)",
                transition: "width 1s ease",
              }}
            />
            <div
              style={{
                width: getWidth(badCommits),
                backgroundColor: "var(--status-bad)",
                transition: "width 1s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              marginTop: "0.5rem",
            }}
          >
            <span>Good: {goodCommits}</span>
            <span>Warning: {warningCommits}</span>
            <span>Bad: {badCommits}</span>
          </div>
        </div>

        {/* Type Distribution */}
        {stats.typeDistribution && (
          <div style={{ marginBottom: "2rem" }}>
            <h4
              style={{
                margin: "0 0 1rem 0",
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Commit Types
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "normal",
                  marginLeft: "0.5rem",
                  opacity: 0.7,
                }}
              >
                (Based on Conventional Commits)
              </span>
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {Object.entries(stats.typeDistribution).map(([type, count]) => {
                const total = Object.values(
                  stats.typeDistribution || {}
                ).reduce((a, b) => a + b, 0);
                const percent = (count / total) * 100;
                return (
                  <div
                    key={type}
                    style={{
                      flex: "1 1 auto",
                      minWidth: "80px",
                      background: "var(--bg-page)",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid var(--border-subtle)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        marginBottom: "0.25rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {type}
                    </div>
                    <div
                      style={{
                        fontSize: "1.1rem",
                        color: "var(--accent-primary)",
                      }}
                    >
                      {count}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "var(--text-tertiary)",
                        marginTop: "0.2rem",
                      }}
                    >
                      {Math.round(percent)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Distribution */}
        {timeDistribution && (
          <div>
            <h4
              style={{
                margin: "0 0 1rem 0",
                color: "var(--text-secondary)",
                fontSize: "0.9rem",
              }}
            >
              Commit Time Distribution
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "normal",
                  marginLeft: "0.5rem",
                  opacity: 0.7,
                }}
              >
                (Based on latest 50 commits)
              </span>
            </h4>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "1rem",
              }}
            >
              {Object.entries(timeDistribution).map(([period, count]) => {
                const max = Math.max(...Object.values(timeDistribution));
                const height = max > 0 ? (count / max) * 100 : 0;
                const icons: Record<string, string> = {
                  morning: "🌅",
                  afternoon: "☀️",
                  evening: "🌆",
                  night: "🌙",
                };

                return (
                  <div
                    key={period}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {/* Bar Track */}
                    <div
                      style={{
                        height: "100px",
                        width: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: `${Math.max(height, 5)}%`,
                          background: "var(--bg-panel)",
                          border: "1px solid var(--border-subtle)",
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
                            background: "var(--accent-primary)",
                            opacity: 0.8,
                            boxShadow: "0 0 10px var(--accent-glow)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Labels */}
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}
                      >
                        {icons[period]}
                      </div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          textTransform: "capitalize",
                          color: "var(--text-secondary)",
                          fontWeight: 500,
                        }}
                      >
                        {period}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-tertiary)",
                          marginTop: "0.1rem",
                        }}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {achievements && achievements.length > 0 && (
        <AchievementsSection achievements={achievements} />
      )}
    </>
  );
};
