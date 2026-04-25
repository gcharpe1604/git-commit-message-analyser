import { useEffect, useState, useMemo } from "react";
import { Empty } from "antd";
import {
  MdSearch,
  MdDelete,
  MdFileDownload,
  MdClose,
  MdCloud,
  MdLabel,
} from "react-icons/md";
import { getHistory, saveAnalysis } from "../services/storageService";
import {
  exportHistoryToCSV,
  exportHistoryToJSON,
  downloadFile,
} from "../utils/export";
import type { RepoStats } from "../types";
import { TagModal } from "./TagModal";
import { useAuth } from "../hooks/useAuth";
import { fetchUserAnalyses } from "../services/analysisService";

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (url: string) => void;
}

type SortOption =
  | "date-desc"
  | "date-asc"
  | "score-desc"
  | "score-asc"
  | "name-asc";

export const HistorySidebar = ({
  isOpen,
  onClose,
  onSelectRepo,
}: HistorySidebarProps) => {
  const { user } = useAuth();
  const [history, setHistory] = useState<RepoStats[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("date-desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterScore, setFilterScore] = useState<
    "all" | "good" | "warning" | "bad"
  >("all");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [tagModalRepo, setTagModalRepo] = useState<string | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Reset selected IDs when the sidebar closes (derived state pattern)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen && selectedIds.length > 0) {
      setSelectedIds([]);
    }
  }

  useEffect(() => {
    const localHistory = getHistory();

    if (user) {
      // Logged in: merge cloud data with local
      fetchUserAnalyses(user.id).then((cloudData) => {
        setIsCloudSynced(true);
        if (cloudData.length === 0) {
          setHistory(localHistory);
          return;
        }
        // Build a map from cloud data, then overlay local data on top
        const cloudMap = new Map<string, RepoStats>();
        cloudData.forEach((r) => {
          cloudMap.set(r.repo_name, {
            repoName: r.repo_name,
            averageScore: r.avg_score,
            totalCommits: r.total_commits,
            goodCommits: 0,
            warningCommits: 0,
            badCommits: 0,
            lastAnalyzed: r.created_at || new Date().toISOString(),
          });
        });
        // Local data is richer (has breakdowns) — prefer it when available
        localHistory.forEach((local) => {
          cloudMap.set(local.repoName, local);
        });
        setHistory(Array.from(cloudMap.values()));
      }).catch(() => {
        setHistory(localHistory);
      });
    } else {
      // Guest: use localStorage only
      setTimeout(() => {
        setIsCloudSynced(false);
        setHistory(localHistory);
      }, 0);
    }
  }, [isOpen, refreshTrigger, user]);

  const filteredHistory = useMemo(() => {
    return history
      .filter((item) => {
        const matchesSearch = item.repoName
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesScore =
          filterScore === "all"
            ? true
            : filterScore === "good"
            ? item.averageScore >= 8
            : filterScore === "warning"
            ? item.averageScore >= 5 && item.averageScore < 8
            : item.averageScore < 5;
        const matchesTag = filterTag ? item.tags?.includes(filterTag) : true;
        return matchesSearch && matchesScore && matchesTag;
      })
      .sort((a, b) => {
        switch (sort) {
          case "date-desc":
            return (
              new Date(b.lastAnalyzed).getTime() -
              new Date(a.lastAnalyzed).getTime()
            );
          case "date-asc":
            return (
              new Date(a.lastAnalyzed).getTime() -
              new Date(b.lastAnalyzed).getTime()
            );
          case "score-desc":
            return b.averageScore - a.averageScore;
          case "score-asc":
            return a.averageScore - b.averageScore;
          case "name-asc":
            return a.repoName.localeCompare(b.repoName);
          default:
            return 0;
        }
      });
  }, [history, search, sort, filterScore, filterTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    history.forEach((item) => {
      item.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [history]);

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.length} items?`)) {
      const newHistory = history.filter(
        (item) => !selectedIds.includes(item.repoName)
      );
      // In a real app we'd adhere to the single source of truth better, but here we just overwrite
      localStorage.setItem("git_analyzer_history", JSON.stringify(newHistory));
      setHistory(newHistory);
      setSelectedIds([]);
    }
  };

  const handleBulkExport = (format: "csv" | "json") => {
    const itemsToExport = history.filter((item) =>
      selectedIds.includes(item.repoName)
    );
    const filename = `git-analysis-export-${
      new Date().toISOString().split("T")[0]
    }`;

    if (format === "csv") {
      const content = exportHistoryToCSV(itemsToExport);
      downloadFile(content, `${filename}.csv`, "text/csv");
    } else {
      const content = exportHistoryToJSON(itemsToExport);
      downloadFile(content, `${filename}.json`, "application/json");
    }
  };

  const handleAddTag = (tag: string) => {
    if (!tagModalRepo) return;

    const item = history.find((h) => h.repoName === tagModalRepo);
    if (item) {
      // Prevent duplicates
      if (item.tags?.includes(tag)) return;

      const updatedItem = { ...item, tags: [...(item.tags || []), tag] };
      saveAnalysis(updatedItem);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (!tagModalRepo) return;

    const item = history.find((h) => h.repoName === tagModalRepo);
    if (item) {
      const updatedItem = {
        ...item,
        tags: (item.tags || []).filter((t) => t !== tag),
      };
      saveAnalysis(updatedItem);
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s",
          zIndex: 90,
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "400px",
          background: "var(--bg-panel)",
          borderLeft: "1px solid var(--border-subtle)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>History</h2>
              {isCloudSynced && (
                <span style={{
                  display: "flex", alignItems: "center", gap: "0.25rem",
                  fontSize: "0.7rem", color: "#22c55e", fontWeight: 500,
                  padding: "0.1rem 0.4rem", borderRadius: "10px",
                  border: "1px solid rgba(34,197,94,0.3)",
                  background: "rgba(34,197,94,0.06)",
                }}>
                  <MdCloud size={11} /> Synced
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: "1.5rem", color: "var(--text-secondary)",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
            <div
              className="input-field"
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                padding: "0.4rem 0.6rem",
                gap: "0.4rem",
              }}
            >
              <MdSearch style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search repos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  outline: "none",
                  color: "var(--text-primary)",
                  fontSize: "0.875rem",
                }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              style={{
                padding: "0.4rem 0.5rem",
                border: "1.5px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-page)",
                color: "var(--text-primary)",
                fontSize: "0.8rem",
                outline: "none",
                cursor: "pointer",
                width: "100px",
                flexShrink: 0,
              }}
            >
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="score-desc">High Score</option>
              <option value="score-asc">Low Score</option>
            </select>
          </div>


          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              overflowX: "auto",
              paddingBottom: "0.25rem",
            }}
          >
            {(["all", "good", "warning", "bad"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterScore(f)}
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "20px",
                  border: "1px solid",
                  borderColor:
                    filterScore === f
                      ? "var(--accent-primary)"
                      : "var(--border-subtle)",
                  background:
                    filterScore === f ? "var(--accent-primary)" : "transparent",
                  color: filterScore === f ? "white" : "var(--text-secondary)",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                overflowX: "auto",
                paddingBottom: "0.25rem",
                marginTop: "0.5rem",
                borderTop: "1px dashed var(--border-subtle)",
                paddingTop: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "0.8rem",
                  color: "var(--text-tertiary)",
                  whiteSpace: "nowrap",
                }}
              >
                <MdLabel style={{ marginRight: "0.25rem" }} /> Filter:
              </div>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                  style={{
                    padding: "0.1rem 0.6rem",
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor:
                      filterTag === tag
                        ? "var(--accent-primary)"
                        : "var(--border-subtle)",
                    background:
                      filterTag === tag
                        ? "var(--accent-primary)"
                        : "transparent",
                    color:
                      filterTag === tag ? "white" : "var(--text-secondary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  {tag}
                  {filterTag === tag && <MdClose size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
          {filteredHistory.length === 0 ? (
            <div
              style={{
                padding: "4rem 2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Empty
                description={<span style={{ color: "var(--text-secondary)" }}>No analysis history yet</span>}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <button
                className="btn-primary"
                style={{ marginTop: "1rem" }}
                onClick={onClose}
              >
                Analyze a repository to get started
              </button>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {filteredHistory.map((item) => (
                <div
                  key={item.repoName}
                  className="panel"
                  style={{
                    padding: "1rem",
                    border: selectedIds.includes(item.repoName)
                      ? "1px solid var(--accent-primary)"
                      : "1px solid var(--border-subtle)",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                    }}
                  >

                    <div
                      style={{ flex: 1 }}
                      onClick={() => {
                        onSelectRepo(`https://github.com/${item.repoName}`);
                        onClose();
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                          {item.repoName}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              item.averageScore >= 8
                                ? "var(--status-good)"
                                : item.averageScore >= 5
                                ? "var(--status-warning)"
                                : "var(--status-bad)",
                          }}
                        >
                          {item.averageScore.toFixed(1)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <span>
                          {new Date(item.lastAnalyzed).toLocaleDateString()}
                        </span>
                        <span>{item.totalCommits} commits</span>
                      </div>




                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {selectedIds.length > 0 && (
          <div
            style={{
              padding: "1rem",
              borderTop: "1px solid var(--border-subtle)",
              background: "var(--bg-panel)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              {selectedIds.length} selected
            </span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={() => handleBulkDelete()}
                className="btn-ghost"
                style={{ color: "var(--status-bad)", padding: "0.5rem" }}
                title="Delete"
              >
                <MdDelete size={20} />
              </button>
              <button
                onClick={() => handleBulkExport("csv")}
                className="btn-ghost"
                style={{ padding: "0.5rem" }}
                title="Export CSV"
              >
                <MdFileDownload size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tag Modal */}
      {tagModalRepo && (
        <TagModal
          isOpen={!!tagModalRepo}
          onClose={() => setTagModalRepo(null)}
          repoName={tagModalRepo}
          currentTags={
            history.find((h) => h.repoName === tagModalRepo)?.tags || []
          }
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
        />
      )}
    </>
  );
};
