import { useEffect, useMemo, useState } from "react";
import { MdClose, MdCloudDone, MdErrorOutline, MdSearch } from "react-icons/md";
import { fetchUserAnalyses } from "../services/analysisService";
import { useAuth } from "../hooks/useAuth";
import type { RepoStats } from "../types";

type SortOption = "date-desc" | "date-asc" | "score-desc" | "score-asc";

export const HistorySidebar = ({ isOpen, onClose, onSelectRepo }: { isOpen: boolean; onClose: () => void; onSelectRepo: (url: string) => void }) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<RepoStats[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("date-desc");
  const [filter, setFilter] = useState<"all" | "good" | "warning" | "bad">("all");
  const [cloudState, setCloudState] = useState<"loading" | "connected" | "error">("loading");
  const [cloudError, setCloudError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setCloudState("loading");
      setCloudError(null);
    });
    fetchUserAnalyses().then((cloud) => {
      if (!active) return;
      setHistory(cloud.map((item) => ({
        repoName: item.repo_name,
        averageScore: item.avg_score,
        totalCommits: item.total_commits,
        goodCommits: 0,
        warningCommits: 0,
        badCommits: 0,
        lastAnalyzed: item.created_at || new Date().toISOString(),
      })));
      setCloudState("connected");
    }).catch((caught) => {
      if (!active) return;
      setCloudState("error");
      setCloudError(caught instanceof Error ? caught.message : "Could not connect to History.");
    });
    return () => { active = false; };
  }, [isOpen, user]);

  const visible = useMemo(() => history.filter((item) => {
    const matchesSearch = item.repoName.toLowerCase().includes(search.toLowerCase());
    const matchesScore = filter === "all" || (filter === "good" ? item.averageScore >= 8 : filter === "warning" ? item.averageScore >= 6 && item.averageScore < 8 : item.averageScore < 6);
    return matchesSearch && matchesScore;
  }).sort((a, b) => sort === "date-desc" ? +new Date(b.lastAnalyzed) - +new Date(a.lastAnalyzed) : sort === "date-asc" ? +new Date(a.lastAnalyzed) - +new Date(b.lastAnalyzed) : sort === "score-desc" ? b.averageScore - a.averageScore : a.averageScore - b.averageScore), [history, search, sort, filter]);

  if (!isOpen || !user) return null;
  return <div className="drawer-layer" role="presentation">
    <button className="drawer-backdrop" onClick={onClose} aria-label="Close history" />
    <aside className="history-drawer" role="dialog" aria-modal="true" aria-labelledby="history-title">
      <header className="drawer-header"><div><span>Saved analyses</span><h2 id="history-title">History</h2></div><button onClick={onClose} aria-label="Close history"><MdClose /></button></header>
      <div className="history-controls">
        <label><MdSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a repository" /></label>
        <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} aria-label="Sort history"><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="score-desc">Highest score</option><option value="score-asc">Lowest score</option></select>
        <div className="history-filters">{(["all", "good", "warning", "bad"] as const).map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
      </div>
      <div className="history-list">
        <div className={`sync-status ${cloudState === "error" ? "is-error" : ""}`}>{cloudState === "error" ? <MdErrorOutline /> : <MdCloudDone />} {cloudState === "connected" ? "Cloud history connected" : cloudState === "loading" ? "Connecting to cloud history" : cloudError}</div>
        {cloudState !== "error" && (visible.length ? visible.map((item, index) => {
          const tone = item.averageScore >= 8 ? "good" : item.averageScore >= 6 ? "warning" : "bad";
          return <button className={`history-item tone-${tone}`} key={item.repoName} onClick={() => { onSelectRepo(`https://github.com/${item.repoName}`); onClose(); }}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.repoName}</strong><small>{new Date(item.lastAnalyzed).toLocaleDateString()} · {item.totalCommits.toLocaleString()} commits</small></div><b>{item.averageScore.toFixed(1)}</b></button>;
        }) : <div className="history-empty"><span>00</span><h3>No synced analyses yet.</h3><p>Run a repository analysis while signed in and it will appear here.</p><button onClick={onClose}>Start an analysis</button></div>)}
      </div>
    </aside>
  </div>;
};
