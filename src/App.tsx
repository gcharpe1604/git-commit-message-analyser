import { useState } from "react";
import "./App.css";
import { InputSection } from "./components/InputSection";
import { CommitList } from "./components/CommitList";
import { SummarySection } from "./components/SummarySection";
import { ThemeToggle } from "./components/ThemeToggle";
import { HistorySidebar } from "./components/HistorySidebar";
import { Playground } from "./components/Playground";
import { ExportButton } from "./components/ExportButton";
import { UserRepoList } from "./components/UserRepoList";
import { fetchCommits, fetchUserRepos } from "./services/githubService";
import { saveAnalysis } from "./services/storageService";
import type { Commit, RepoStats, Repository } from "./types";
import { Toast } from "./components/Toast";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { CONSTANTS } from "./constants";
import { getTimePeriod } from "./utils/time";

function App() {
  const [commits, setCommits] = useState<Commit[]>([]);
  const [userRepos, setUserRepos] = useState<Repository[]>([]);
  const [searchedUser, setSearchedUser] = useState<string | null>(null);
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<"analyze" | "playground">(
    "analyze"
  );
  const [viewMode, setViewMode] = useState<"input" | "repoList" | "analysis">(
    "input"
  );

  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    CONSTANTS.STORAGE.RECENT_SEARCHES_KEY,
    []
  );

  const calculateStats = (
    commits: Commit[],
    repoName: string,
    totalCount: number
  ): RepoStats => {
    // Cap analysis to first 50 commits
    const analyzedCommits = commits.slice(0, 50);

    const goodCommits = analyzedCommits.filter(
      (c) => c.analysis?.status === "good"
    ).length;
    const warningCommits = analyzedCommits.filter(
      (c) => c.analysis?.status === "warning"
    ).length;
    const badCommits = analyzedCommits.filter(
      (c) => c.analysis?.status === "bad"
    ).length;

    // Calculate score based on the analyzed commits (sample)
    const averageScore =
      analyzedCommits.reduce(
        (acc, curr) => acc + (curr.analysis?.score || 0),
        0
      ) / analyzedCommits.length;

    // Aggregate Achievements
    const allAchievements = analyzedCommits.flatMap(
      (c) => c.analysis?.achievements || []
    );

    // Time Distribution
    const timeDistribution = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    analyzedCommits.forEach((c) => {
      const hour = new Date(c.author.date).getHours();
      const period = getTimePeriod(hour);
      timeDistribution[period]++;
    });

    return {
      repoName,
      averageScore,
      totalCommits: totalCount, // Use the real total count
      goodCommits,
      warningCommits,
      badCommits,
      lastAnalyzed: new Date().toISOString(),
      timeDistribution,
      achievements: allAchievements,
    };
  };

  const addToRecentSearches = (input: string) => {
    setRecentSearches((prev) => {
      const newSearches = [input, ...prev.filter((s) => s !== input)].slice(
        0,
        CONSTANTS.STORAGE.MAX_RECENT_SEARCHES
      );
      return newSearches;
    });
  };

  const removeFromRecentSearches = (input: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== input));
  };

  const clearHistory = () => {
    setRecentSearches([]);
  };

  const analyzeRepo = async (url: string) => {
    setLoading(true);
    setError(null);
    setPage(1);
    setVisibleCount(20);

    try {
      const { commits: fetchedCommits, totalCount } = await fetchCommits(
        url,
        1
      );
      setCommits(fetchedCommits);
      setHasMore(fetchedCommits.length < totalCount);

      const repoName = url.split("github.com/")[1] || url;
      const newStats = calculateStats(fetchedCommits, repoName, totalCount);
      setStats(newStats);
      saveAnalysis(newStats);
      setViewMode("analysis");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputSubmit = async (input: string) => {
    if (!input.trim()) {
      setError("Please enter a GitHub username or repository URL");
      return;
    }

    setLoading(true);
    setError(null);
    setCommits([]);
    setStats(null);
    setUserRepos([]);
    setSearchedUser(null);

    try {
      addToRecentSearches(input);

      // Check if input is a URL or owner/repo format
      const isRepo = input.includes("/") || input.includes("github.com");

      if (isRepo) {
        await analyzeRepo(input);
      } else {
        // Assume it's a username
        setSearchedUser(input);
        const repos = await fetchUserRepos(input);
        setUserRepos(repos);
        setViewMode("repoList");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!stats || loading) return;

    // If we have more commits locally than currently visible, just show them
    if (visibleCount < commits.length) {
      setVisibleCount((prev) => Math.min(prev + 20, commits.length));
      return;
    }

    // Otherwise fetch next page
    setLoading(true);
    const nextPage = page + 1;

    try {
      // Construct URL from repoName (assuming it's owner/repo)
      const url = `https://github.com/${stats.repoName}`;

      const { commits: newCommits, totalCount } = await fetchCommits(
        url,
        nextPage
      );

      if (newCommits.length === 0) {
        setHasMore(false);
        return;
      }

      const updatedCommits = [...commits, ...newCommits];
      setCommits(updatedCommits);
      setPage(nextPage);
      setVisibleCount((prev) => prev + 20);
      setHasMore(updatedCommits.length < totalCount);

      // Recalculate stats with ALL commits
      const newStats = calculateStats(
        updatedCommits,
        stats.repoName,
        totalCount
      );
      setStats(newStats);
    } catch (err) {
      setError("Failed to load more commits");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setViewMode("input");
    setCommits([]);
    setStats(null);
    setUserRepos([]);
    setError(null);
    setPage(1);
    setHasMore(false);
  };

  const handleBack = () => {
    if (userRepos.length > 0) {
      setViewMode("repoList");
      setCommits([]);
      setStats(null);
    } else {
      handleReset();
    }
  };

  return (
    <div className="container">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6rem",
          paddingTop: "1rem",
        }}
      >
        <div
          onClick={handleReset}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: "var(--text-primary)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--bg-page)",
              fontWeight: "bold",
              fontSize: "1.2rem",
            }}
          >
            G
          </div>
          <span
            style={{
              fontWeight: 600,
              fontSize: "1.1rem",
              letterSpacing: "-0.02em",
            }}
          >
            GitAnalyzer
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => setShowHistory(true)}
            className="btn-secondary"
            aria-label="View Analysis History"
          >
            <span>📜</span> History
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main>
        {error && (
          <Toast
            message={error}
            onClose={() => setError(null)}
            duration={CONSTANTS.ANIMATION.TOAST_DURATION}
          />
        )}
        {viewMode === "input" && (
          <div className="animate-in">
            <div
              style={{
                textAlign: "center",
                marginBottom: "5rem",
                maxWidth: "800px",
                margin: "0 auto 5rem auto",
              }}
            >
              {/* <div
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  borderRadius: "2rem",
                  background: "rgba(109, 40, 217, 0.1)",
                  border: "1px solid rgba(109, 40, 217, 0.2)",
                  color: "var(--accent-text)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "1.5rem",
                  letterSpacing: "0.02em",
                }}
              >
                ✨ AI-Powered Git Analysis
              </div> */}
              <h1
                style={{
                  fontSize: "4.5rem",
                  fontWeight: 800,
                  marginBottom: "1.5rem",
                  lineHeight: 1.1,
                  letterSpacing: "-0.04em",
                  background:
                    "linear-gradient(to bottom, #fff 0%, #94a3b8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Commit with <br />
                <span
                  style={{
                    color: "var(--accent-primary)",
                    WebkitTextFillColor: "initial",
                  }}
                >
                  Confidence
                </span>
                .
              </h1>
              <p
                style={{
                  fontSize: "1.25rem",
                  color: "var(--text-secondary)",
                  maxWidth: "540px",
                  margin: "0 auto",
                  lineHeight: 1.6,
                }}
              >
                Elevate your code quality with instant analysis, gamified
                insights, and professional feedback for your git commit
                messages.
              </p>
            </div>

            <InputSection
              onAnalyze={handleInputSubmit}
              isLoading={loading}
              recentSearches={recentSearches}
              onRemoveRecent={removeFromRecentSearches}
              onClearHistory={clearHistory}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                marginTop: "8rem",
                padding: "0 1rem",
              }}
            >
              <FeatureCard
                icon="⚡️"
                title="Instant Analysis"
                desc="Get immediate scoring and actionable feedback to improve your commit messages."
              />
              <FeatureCard
                icon="🏆"
                title="Gamification"
                desc="Unlock badges and achievements as you adopt best practices and maintain consistency."
              />
              <FeatureCard
                icon="📊"
                title="Deep Insights"
                desc="Visualize your coding habits, time distribution, and project velocity."
              />
            </div>
          </div>
        )}
        {viewMode === "repoList" && (
          <div className="animate-in">
            <button
              onClick={handleReset}
              className="btn-ghost"
              style={{ marginBottom: "1.5rem", paddingLeft: 0 }}
            >
              ← Back to Search
            </button>
            <UserRepoList
              repos={userRepos}
              onSelectRepo={analyzeRepo}
              username={searchedUser}
            />
          </div>
        )}
        {viewMode === "analysis" && (
          <div className="animate-in">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
                borderBottom: "1px solid var(--border-subtle)",
                paddingBottom: "1rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div
                style={{ display: "flex", gap: "1rem", alignItems: "center" }}
              >
                <button
                  onClick={handleBack}
                  className="btn-ghost"
                  style={{ paddingLeft: 0 }}
                >
                  ← Back
                </button>
                {stats && <ExportButton stats={stats} commits={commits} />}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  background: "var(--bg-panel)",
                  padding: "0.25rem",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <TabButton
                  active={activeTab === "analyze"}
                  onClick={() => setActiveTab("analyze")}
                >
                  Analysis
                </TabButton>
                <TabButton
                  active={activeTab === "playground"}
                  onClick={() => setActiveTab("playground")}
                >
                  Playground
                </TabButton>
              </div>
            </div>

            {activeTab === "analyze" ? (
              <>
                {stats && (
                  <div style={{ position: "relative" }}>
                    <SummarySection stats={stats} />
                  </div>
                )}
                <CommitList commits={commits.slice(0, visibleCount)} />

                {(hasMore || visibleCount < commits.length) && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "2rem",
                      marginBottom: "4rem",
                    }}
                  >
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="btn-secondary"
                      style={{
                        minWidth: "200px",
                        display: "inline-flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {loading ? <>Loading...</> : <>👇 Load More Commits</>}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Playground />
            )}
          </div>
        )}
      </main>

      <HistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectRepo={analyzeRepo}
      />
    </div>
  );
}

const TabButton = ({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      background: active ? "var(--bg-page)" : "transparent",
      color: active ? "var(--text-primary)" : "var(--text-secondary)",
      border: "1px solid",
      borderColor: active ? "var(--border-subtle)" : "transparent",
      padding: "0.5rem 1.5rem",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: 500,
      fontSize: "0.9rem",
      boxShadow: active ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
      transition: "all 0.2s ease",
    }}
  >
    {children}
  </button>
);

const FeatureCard = ({
  icon,
  title,
  desc,
}: {
  icon: string;
  title: string;
  desc: string;
}) => (
  <div className="panel" style={{ padding: "1.5rem" }}>
    <div style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>{icon}</div>
    <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem", fontWeight: 600 }}>
      {title}
    </h3>
    <p
      style={{
        margin: 0,
        color: "var(--text-secondary)",
        fontSize: "0.9rem",
        lineHeight: 1.5,
      }}
    >
      {desc}
    </p>
  </div>
);

export default App;
