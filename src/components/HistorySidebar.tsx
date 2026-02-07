import { useEffect, useState, useMemo } from "react";
import {
  MdSearch,
  MdDelete,
  MdFileDownload,
  MdCheckBox,
  MdCheckBoxOutlineBlank,
  MdLabel,
  MdClose,
} from "react-icons/md";
import { getHistory, saveAnalysis } from "../services/storageService";
import {
  exportHistoryToCSV,
  exportHistoryToJSON,
  downloadFile,
} from "../utils/export";
import type { RepoStats } from "../types";
import { TagModal } from "./TagModal";

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
  const [history, setHistory] = useState<RepoStats[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("date-desc");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterScore, setFilterScore] = useState<
    "all" | "good" | "warning" | "bad"
  >("all");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tagModalRepo, setTagModalRepo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHistory(getHistory());
      setSelectedIds([]);
    }
  }, [isOpen, refreshTrigger]);

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

  // Derive all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    history.forEach((item) => {
      item.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [history]);

  const toggleSelect = (repoName: string) => {
    setSelectedIds((prev) =>
      prev.includes(repoName)
        ? prev.filter((id) => id !== repoName)
        : [...prev, repoName]
    );
  };

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
              History & Analytics
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.5rem",
                color: "var(--text-secondary)",
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <div
              className="input-field"
              style={{
                display: "flex",
                alignItems: "center",
                flex: 1,
                padding: "0.5rem",
              }}
            >
              <MdSearch
                style={{
                  marginRight: "0.5rem",
                  color: "var(--text-secondary)",
                }}
              />
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
                }}
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="input-field"
              style={{ padding: "0.5rem", minWidth: "120px" }}
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
                textAlign: "center",
                padding: "2rem",
                color: "var(--text-secondary)",
              }}
            >
              No items found.
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
                    <button
                      onClick={() => toggleSelect(item.repoName)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        color: selectedIds.includes(item.repoName)
                          ? "var(--accent-primary)"
                          : "var(--text-secondary)",
                      }}
                    >
                      {selectedIds.includes(item.repoName) ? (
                        <MdCheckBox size={20} />
                      ) : (
                        <MdCheckBoxOutlineBlank size={20} />
                      )}
                    </button>

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

                      {/* Sparkline (Score History) */}
                      {item.scoreHistory && item.scoreHistory.length > 1 && (
                        <div
                          style={{
                            height: "20px",
                            display: "flex",
                            alignItems: "flex-end",
                            gap: "2px",
                            marginBottom: "0.5rem",
                            opacity: 0.7,
                          }}
                        >
                          {item.scoreHistory.map((h, i) => (
                            <div
                              key={i}
                              style={{
                                width: "4px",
                                height: `${(h.score / 10) * 100}%`,
                                background:
                                  h.score >= 8
                                    ? "var(--status-good)"
                                    : "var(--text-secondary)",
                                borderRadius: "1px",
                              }}
                              title={`${new Date(
                                h.date
                              ).toLocaleDateString()}: ${h.score}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Tags */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.25rem",
                        }}
                      >
                        {item.tags?.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontSize: "0.7rem",
                              background: "var(--bg-page)",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "10px",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTagModalRepo(item.repoName);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--accent-primary)",
                            fontSize: "0.7rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.2rem",
                            opacity: 0.8,
                          }}
                        >
                          <MdLabel size={12} />+ Tag
                        </button>
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
