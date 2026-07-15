import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate } from "react-router-dom";
import { MdErrorOutline } from "react-icons/md";
import "./App.css";
import { AppNavbar } from "./components/AppNavbar";
import { HistorySidebar } from "./components/HistorySidebar";
import { MobileSidebar } from "./components/MobileSidebar";
import { SettingsModal } from "./components/SettingsModal";
import { CONSTANTS } from "./constants";
import { useAuth } from "./hooks/useAuth";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { fetchUserAnalyses, saveAnalysisToCloud } from "./services/analysisService";
import { fetchCommits, fetchUserRepos } from "./services/githubService";
import type { Commit, RepoStats, Repository } from "./types";
import { calculateRepoStats } from "./utils/simpleAnalyzer";

const Playground = lazy(() => import("./components/Playground").then((module) => ({ default: module.Playground })));
const AnalysisPage = lazy(() => import("./components/pages/AnalysisPage").then((module) => ({ default: module.AnalysisPage })));
const DeveloperReposPage = lazy(() => import("./components/pages/DeveloperReposPage").then((module) => ({ default: module.DeveloperReposPage })));
const LandingPage = lazy(() => import("./components/pages/LandingPage").then((module) => ({ default: module.LandingPage })));

const repoPathFromInput = (input: string) => input.trim().replace(/^https?:\/\/(?:www\.)?github\.com\//i, "").replace(/^\/+|\/+$/g, "").replace(/\.git$/, "");

function App() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const analysisMatch = useMatch("/analysis/:owner/:repo");
  const developerMatch = useMatch("/developers/:username");
  const routedRepo = analysisMatch ? `${analysisMatch.params.owner}/${analysisMatch.params.repo}` : null;
  const routedUser = developerMatch?.params.username ?? null;
  const [commits, setCommits] = useState<Commit[]>([]);
  const [userRepos, setUserRepos] = useState<Repository[]>([]);
  const [loadedDeveloper, setLoadedDeveloper] = useState<string | null>(null);
  const [stats, setStats] = useState<RepoStats | null>(null);
  const [, setApiPage] = useState(1);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<RepoStats[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadingTarget = useRef<string | null>(null);
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(CONSTANTS.STORAGE.RECENT_SEARCHES_KEY, []);

  useEffect(() => {
    let active = true;
    if (!user) {
      queueMicrotask(() => { if (active) setHistoryItems([]); });
      return () => { active = false; };
    }
    fetchUserAnalyses().then((items) => {
      if (!active) return;
      setHistoryItems(items.map((item) => ({ repoName: item.repo_name, averageScore: item.avg_score, totalCommits: item.total_commits, goodCommits: 0, warningCommits: 0, badCommits: 0, lastAnalyzed: item.created_at || new Date().toISOString() })));
    });
    return () => { active = false; };
  }, [user]);

  const loadRepository = useCallback(async (repoName: string) => {
    if (loadingTarget.current === `repo:${repoName}`) return;
    loadingTarget.current = `repo:${repoName}`;
    setLoading(true);
    setError(null);
    setApiPage(1);
    setUserRepos([]);
    try {
      const { commits: fetchedCommits, totalCount } = await fetchCommits(`https://github.com/${repoName}`, 1);
      const newStats = calculateRepoStats(fetchedCommits, repoName, totalCount);
      setCommits(fetchedCommits);
      setStats(newStats);
      if (user && await saveAnalysisToCloud(repoName, newStats.averageScore, newStats.totalCommits)) {
        setHistoryItems((items) => [newStats, ...items.filter((item) => item.repoName !== repoName)]);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An unknown error occurred");
    } finally {
      setLoading(false);
      loadingTarget.current = null;
    }
  }, [user]);

  const loadDeveloper = useCallback(async (username: string) => {
    if (loadingTarget.current === `user:${username}`) return;
    loadingTarget.current = `user:${username}`;
    setLoading(true);
    setError(null);
    setStats(null);
    setCommits([]);
    try {
      setUserRepos(await fetchUserRepos(username));
      setLoadedDeveloper(username);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An unknown error occurred");
    } finally {
      setLoading(false);
      loadingTarget.current = null;
    }
  }, []);

  useEffect(() => {
    if (routedRepo && stats?.repoName !== routedRepo) queueMicrotask(() => void loadRepository(routedRepo));
  }, [loadRepository, routedRepo, stats?.repoName]);

  useEffect(() => {
    if (routedUser && loadedDeveloper !== routedUser) queueMicrotask(() => void loadDeveloper(routedUser));
  }, [loadDeveloper, loadedDeveloper, routedUser]);

  const addRecent = (input: string) => setRecentSearches((current) => [input, ...current.filter((item) => item !== input)].slice(0, CONSTANTS.STORAGE.MAX_RECENT_SEARCHES));
  const openRepository = (input: string) => {
    const repo = repoPathFromInput(input);
    const [owner, name] = repo.split("/");
    if (!owner || !name) { setError("Enter a repository as owner/name or paste its GitHub URL."); return; }
    navigate(`/analysis/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);
  };
  const handleInputSubmit = (input: string, mode: "user" | "repo") => {
    if (!input.trim()) { setError("Please enter a GitHub username or repository URL"); return; }
    const label = repoPathFromInput(input);
    addRecent(label);
    if (mode === "repo") openRepository(label);
    else navigate(`/developers/${encodeURIComponent(input.trim())}`);
  };
  const handleLoadMore = async (targetApiPage: number) => {
    if (!stats || fetchingMore) return;
    setFetchingMore(true);
    try {
      const { commits: nextCommits } = await fetchCommits(`https://github.com/${stats.repoName}`, targetApiPage);
      setCommits((current) => {
        const existing = new Set(current.map((commit) => commit.sha));
        return [...current, ...nextCommits.filter((commit) => !existing.has(commit.sha))];
      });
      setApiPage(targetApiPage);
    } finally { setFetchingMore(false); }
  };
  const goHome = () => { setError(null); navigate("/"); };
  const focusAnalyzer = () => {
    navigate("/");
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  };
  const viewMode = analysisMatch ? "analysis" : developerMatch ? "repoList" : location.pathname === "/workshop" ? "playground" : "input";

  return <div className="container" id="top">
    <AppNavbar viewMode={viewMode} historyCount={historyItems.length} isAuthenticated={Boolean(user)} isMobileMenuOpen={isMobileMenuOpen} onHome={goHome} onHistory={() => { if (user) setShowHistory(true); }} onSettings={() => { if (user) setShowSettings(true); }} onAnalyze={focusAnalyzer} onWorkshop={() => navigate("/workshop")} onToggleMobile={() => setIsMobileMenuOpen((open) => !open)} />
    <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    <main>
      {error ? <section className="error-page animate-in"><span><MdErrorOutline /></span><p className="eyebrow">Analysis interrupted</p><h1>We couldn't read that repository.</h1><p>{error.includes("rate limit") ? "GitHub's request limit has been reached. Try again later or add a token." : error}</p><button className="btn-primary" onClick={goHome}>Return to the analyzer</button></section> : <Suspense fallback={<div className="route-loading"><strong>Preparing GitAnalyzer</strong></div>}><Routes>
        <Route path="/" element={<LandingPage userSignedIn={Boolean(user)} historyItems={historyItems} loading={loading} recentSearches={recentSearches} inputRef={searchInputRef} onAnalyze={handleInputSubmit} onOpenHistory={() => { if (user) setShowHistory(true); }} onRemoveRecent={(input) => setRecentSearches((items) => items.filter((item) => item !== input))} onClearRecent={() => setRecentSearches([])} />} />
        <Route path="/developers/:username" element={<DeveloperReposPage username={routedUser ?? ""} repos={userRepos} loading={loading} onBack={goHome} onSelectRepo={openRepository} />} />
        <Route path="/analysis/:owner/:repo" element={<AnalysisPage stats={stats?.repoName === routedRepo ? stats : null} commits={commits} loading={loading} fetchingMore={fetchingMore} onBack={goHome} onWorkshop={() => navigate("/workshop?mode=diff")} onLoadMore={handleLoadMore} />} />
        <Route path="/workshop" element={<Playground />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes></Suspense>}
    </main>
    <HistorySidebar isOpen={showHistory} onClose={() => setShowHistory(false)} onSelectRepo={openRepository} />
    <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} onOpenHistory={() => { if (user) setShowHistory(true); }} onOpenSettings={() => { if (user) setShowSettings(true); }} />
  </div>;
}

export default App;
