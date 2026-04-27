import { FcFlashOn } from "react-icons/fc";
import { FaGamepad } from "react-icons/fa";
import { MdInsights } from "react-icons/md";
import { MdHistory, MdMenu, MdClose } from "react-icons/md";
import { useState, useEffect, useRef } from "react";
import "./App.css";
import { InputSection } from "./components/InputSection";
import { CommitList } from "./components/CommitList";
import { SummarySection } from "./components/SummarySection";
import { HistorySidebar } from "./components/HistorySidebar";
import { SettingsModal } from "./components/SettingsModal";
import { Playground } from "./components/Playground";
import { ExportButton } from "./components/ExportButton";
import { UserRepoList } from "./components/UserRepoList";
import { AuthButton } from "./components/AuthButton";
import { MobileSidebar } from "./components/MobileSidebar";
import { fetchCommits, fetchUserRepos } from "./services/githubService";
import { saveAnalysis, getHistory } from "./services/storageService";
import { saveAnalysisToCloud } from "./services/analysisService";
import { useAuth } from "./hooks/useAuth";
import { calculateRepoStats } from "./utils/simpleAnalyzer";
import type { Commit, RepoStats, Repository } from "./types";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { CONSTANTS } from "./constants";
import { Result, Spin, Badge } from "antd";

function App() {
  const { user } = useAuth();
  const [commits, setCommits] = useState<Commit[]>([]);
  const [userRepos, setUserRepos] = useState<Repository[]>([]);
  const [searchedUser, setSearchedUser] = useState<string | null>(null);
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [, setApiPage] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"analyze" | "playground">(
    "analyze",
  );
  const [viewMode, setViewMode] = useState<"input" | "repoList" | "analysis">(
    "input",
  );
  const [historyItems, setHistoryItems] = useState<RepoStats[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistoryItems(getHistory());
  }, []);

  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
    CONSTANTS.STORAGE.RECENT_SEARCHES_KEY,
    [],
  );

  const addToRecentSearches = (input: string) => {
    setRecentSearches((prev) => {
      const newSearches = [input, ...prev.filter((s) => s !== input)].slice(
        0,
        CONSTANTS.STORAGE.MAX_RECENT_SEARCHES,
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
    setApiPage(1);
    setViewMode("analysis");

    try {
      const { commits: fetchedCommits, totalCount } = await fetchCommits(
        url,
        1,
      );
      setCommits(fetchedCommits);

      const repoName = url.split("github.com/")[1] || url;
      const newStats = calculateRepoStats(fetchedCommits, repoName, totalCount);
      setStats(newStats);
      saveAnalysis(newStats);
      setHistoryItems(getHistory());

      // Also save to Supabase if logged in (lightweight summary only)
      if (user) {
        saveAnalysisToCloud(
          user.id,
          repoName,
          newStats.averageScore,
          newStats.totalCommits
        ).catch((err) => console.warn('Cloud save failed:', err));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputSubmit = async (input: string, mode: "user" | "repo") => {
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
      // Save a clean label to recent searches — strip full GitHub URL prefix
      // so "https://github.com/torvalds/linux" is stored as "torvalds/linux"
      const recentLabel = input.startsWith("https://github.com/")
        ? input.replace("https://github.com/", "")
        : input;
      addToRecentSearches(recentLabel);


      if (mode === "repo") {
        await analyzeRepo(input);
      } else {
        setSearchedUser(input);
        const repos = await fetchUserRepos(input);
        setUserRepos(repos);
        setViewMode("repoList");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMoreCommits = async (targetApiPage: number) => {
    if (!stats || fetchingMore) return;

    setFetchingMore(true);
    try {
      const url = `https://github.com/${stats.repoName}`;
      const { commits: newCommits } = await fetchCommits(url, targetApiPage);

      if (newCommits.length > 0) {
        setCommits((prev) => {
          const existingShas = new Set(prev.map(c => c.sha));
          const uniqueNew = newCommits.filter(c => !existingShas.has(c.sha));
          return [...prev, ...uniqueNew];
        });
        setApiPage(targetApiPage);
      }
    } catch (err) {
      console.error("Failed to fetch more commits:", err);
    } finally {
      setFetchingMore(false);
    }
  };


  const handleReset = () => {
    setViewMode("input");
    setCommits([]);
    setStats(null);
    setApiPage(1);
    setUserRepos([]);
    setError(null);
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
        className="app-header"
        style={{
          position: "sticky",
          top: "1.5rem",
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1.5rem",
          marginBottom: "4rem",
          background: "color-mix(in srgb, var(--bg-panel) 80%, transparent)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
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

        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <MdClose /> : <MdMenu />}
        </button>

        <div className="app-header-controls desktop-only" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => setShowHistory(true)}
            className="btn-secondary"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
            }}
            aria-label="View Analysis History"
          >
            <MdHistory size={18} /> History
            {historyItems.length > 0 && (
              <Badge 
                count={historyItems.length} 
                size="small" 
                color="var(--accent-primary)" 
                style={{ marginLeft: '4px', boxShadow: 'none' }} 
              />
            )}
          </button>
          <AuthButton onOpenSettings={() => setShowSettings(true)} />
        </div>
      </header>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <main>
        {error ? (
          <div className="animate-in" style={{ padding: "4rem 2rem", background: "var(--bg-panel)", borderRadius: "1rem", marginTop: "2rem" }}>
            <Result
              status="error"
              title={<span style={{ color: "var(--text-primary)" }}>Failed to fetch data</span>}
              subTitle={<span style={{ color: "var(--text-secondary)" }}>{error.includes("rate limit") ? "You may have hit GitHub rate limits. Please try again later or add an API token." : error}</span>}
              extra={[
                <button className="btn-primary" key="retry" onClick={handleReset}>
                  Try Again
                </button>,
              ]}
            />
          </div>
        ) : (
          <>
            {viewMode === "input" && (
          <div className="animate-in">
            {historyItems.length > 0 ? (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "4rem",
                  maxWidth: "600px",
                  margin: "0 auto 4rem auto",
                }}
              >
                <h1
                  className="welcome-title"
                  style={{
                    fontSize: "3rem",
                    fontWeight: 800,
                    marginBottom: "1rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Welcome back
                </h1>
                <div
                  className="panel"
                  style={{
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      color: "var(--text-secondary)",
                      fontSize: "0.9rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontWeight: 600,
                    }}
                  >
                    Last Analyzed
                  </div>
                  <div
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {historyItems[0].repoName}
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 700,
                      color: "var(--status-good)",
                    }}
                  >
                    {historyItems[0].averageScore.toFixed(1)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "center",
                  }}
                >
                  <button
                    className="btn-primary"
                    style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}
                    onClick={() => {
                      searchInputRef.current?.focus();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    Analyze new repo
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: "0.75rem 1.5rem", fontSize: "1rem" }}
                    onClick={() => setShowHistory(true)}
                  >
                    Open history
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "5rem",
                  maxWidth: "800px",
                  margin: "0 auto 5rem auto",
                }}
              >
                <h1
                  className="hero-title"
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
            )}

            <InputSection
              onAnalyze={handleInputSubmit}
              isLoading={loading}
              recentSearches={recentSearches}
              onRemoveRecent={removeFromRecentSearches}
              onClearHistory={clearHistory}
              inputRef={searchInputRef}
            />

            <div
              className="feature-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                marginTop: "8rem",
                padding: "0 1rem",
              }}
            >
              <FeatureCard
                icon={<FcFlashOn />}
                title="Instant Analysis"
                desc="Get immediate scoring and actionable feedback to improve your commit messages."
                onClick={() => searchInputRef.current?.focus()}
              />
              <FeatureCard
                icon={<FaGamepad />}
                title="Gamification"
                desc="Unlock badges and achievements as you adopt best practices and maintain consistency."
                onClick={() => setShowHistory(true)}
              />
              <FeatureCard
                icon={<MdInsights />}
                title="Deep Insights"
                desc="Visualize your coding habits, time distribution, and project velocity."
                onClick={() => handleInputSubmit("facebook/react", "repo")}
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
              isLoading={loading}
            />
          </div>
        )}
        {viewMode === "analysis" && (
          loading ? (
            <div style={{ padding: "8rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <Spin size="large" />
              <div style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Analyzing repository...</div>
            </div>
          ) : (
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
                <CommitList 
                  key={stats?.repoName ?? ''} 
                  commits={commits} 
                  totalCommitsCount={stats?.totalCommits}
                  isLoading={fetchingMore}
                  onFetchCommits={handleLoadMoreCommits}
                />
              </>
            ) : (
              <Playground />
            )}
          </div>
          )
        )}
          </>
        )}
      </main>

      <HistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectRepo={analyzeRepo}
      />

      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenHistory={() => setShowHistory(true)}
        onOpenSettings={() => setShowSettings(true)}
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
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick?: () => void;
}) => (
  <div
    className="panel"
    onClick={onClick}
    style={{
      padding: "1.5rem",
      cursor: onClick ? "pointer" : "default",
      transition: "transform 0.2s",
    }}
    onMouseEnter={(e) => {
      if (onClick) e.currentTarget.style.transform = "scale(1.02)";
    }}
    onMouseLeave={(e) => {
      if (onClick) e.currentTarget.style.transform = "none";
    }}
  >
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
