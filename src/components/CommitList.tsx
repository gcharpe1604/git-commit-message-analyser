import { useState, useMemo, useTransition } from "react";
import { Spin } from "antd";
import type { Commit } from "../types";
import { CommitCard } from "./CommitCard";

// ─── Config ────────────────────────────────────────────────────────────────
const COMMITS_PER_PAGE = 10;
const PAGES_PER_GROUP  = 10;

interface CommitListProps {
  commits: Commit[];
  totalCommitsCount?: number;
  isLoading?: boolean;
  onFetchCommits?: (apiPage: number) => void;
}

export const CommitList = ({ commits, totalCommitsCount, isLoading, onFetchCommits }: CommitListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  // ─── Derived values ──────────────────────────────────────────────────────
  const totalCommits = totalCommitsCount ?? commits.length;
  const totalPages   = Math.ceil(totalCommits / COMMITS_PER_PAGE);
  const showPagination = totalCommits > COMMITS_PER_PAGE;

  // Current page's commit slice
  const startIndex = (currentPage - 1) * COMMITS_PER_PAGE;
  const endIndex   = Math.min(startIndex + COMMITS_PER_PAGE, totalCommits);
  
  const visibleCommits = useMemo(() => {
    return commits.slice(startIndex, endIndex);
  }, [commits, startIndex, endIndex]);

  // Group logic
  const currentGroup = Math.ceil(currentPage / PAGES_PER_GROUP);
  const groupStart   = (currentGroup - 1) * PAGES_PER_GROUP + 1;
  const groupEnd     = Math.min(groupStart + PAGES_PER_GROUP - 1, totalPages);
  const pageNumbers  = Array.from(
    { length: groupEnd - groupStart + 1 },
    (_, i) => groupStart + i,
  );

  const hasPrevGroup = groupStart > 1;
  const hasNextGroup = groupEnd < totalPages;

  // ─── Navigation helpers ───────────────────────────────────────────────────
  const handlePageChange = (page: number) => {
    const clamped = Math.max(1, Math.min(page, totalPages));
    
    // Check if we need to fetch more commits from the API
    const requiredCommits = clamped * COMMITS_PER_PAGE;
    if (requiredCommits > commits.length && onFetchCommits) {
      const targetApiPage = Math.ceil(requiredCommits / 100);
      onFetchCommits(targetApiPage);
    }

    startTransition(() => {
      setCurrentPage(clamped);
    });

    document
      .querySelector(".commit-list")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ─── Shared button style helpers ──────────────────────────────────────────
  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    background: "var(--bg-panel)",
    color: disabled ? "var(--text-tertiary)" : "var(--text-secondary)",
    border: "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-sm)",
    padding: "0.35rem 0.65rem",
    fontSize: "0.82rem",
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "all 0.15s ease",
    lineHeight: 1,
  });

  const pageBtnStyle = (isActive: boolean): React.CSSProperties => ({
    minWidth: "2rem",
    height: "2rem",
    padding: "0 0.5rem",
    border: isActive
      ? "1px solid var(--accent-primary)"
      : "1px solid var(--border-subtle)",
    borderRadius: "var(--radius-sm)",
    background: isActive ? "var(--accent-primary)" : "var(--bg-panel)",
    color: isActive ? "#fff" : "var(--text-secondary)",
    fontSize: "0.85rem",
    fontWeight: isActive ? 700 : 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
    boxShadow: isActive ? "0 0 10px var(--accent-glow)" : "none",
    lineHeight: 1,
  });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="commit-list">
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}>
        Recent Commits
      </h2>

      {(isLoading && visibleCommits.length === 0) || isPending ? (
        <div style={{ padding: "8rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Spin size="large" />
          <div style={{ color: "var(--text-secondary)", fontSize: "1.1rem" }}>Loading commits...</div>
        </div>
      ) : (
        visibleCommits.map((commit, index) => (
          <CommitCard
            key={commit.sha}
            commit={commit}
            index={index}
          />
        ))
      )}

      {showPagination && (
        <div
          style={{
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {/* Info text */}
          <div
            style={{
              textAlign: "center",
              fontSize: "0.8rem",
              color: "var(--text-tertiary)",
              marginBottom: "0.875rem",
              letterSpacing: "0.01em",
            }}
          >
            Showing {startIndex + 1}–{endIndex} of {totalCommits} commits
          </div>

          {/* Controls row */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "0.375rem",
              flexWrap: "wrap",
            }}
          >
            {/* ← Prev group */}
            <button
              style={navBtnStyle(!hasPrevGroup)}
              disabled={!hasPrevGroup}
              onClick={() => handlePageChange(groupStart - 1)}
              title="Previous group"
              aria-label="Previous page group"
            >
              «
            </button>

            {/* ← Prev page */}
            <button
              style={navBtnStyle(currentPage === 1)}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              title="Previous page"
              aria-label="Previous page"
            >
              ‹
            </button>

            {/* Page number buttons */}
            {pageNumbers.map((page) => (
              <button
                key={page}
                style={pageBtnStyle(page === currentPage)}
                onClick={() => handlePageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            ))}

            {/* → Next page */}
            <button
              style={navBtnStyle(currentPage === totalPages)}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              title="Next page"
              aria-label="Next page"
            >
              ›
            </button>

            {/* → Next group */}
            <button
              style={navBtnStyle(!hasNextGroup)}
              disabled={!hasNextGroup}
              onClick={() => handlePageChange(groupEnd + 1)}
              title="Next group"
              aria-label="Next page group"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
