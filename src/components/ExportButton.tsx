import { useState } from "react";
import type { Commit, RepoStats } from "../types";
import { exportToCSV, exportToMarkdown, downloadFile } from "../utils/export";

interface ExportButtonProps {
  commits: Commit[];
  stats: RepoStats;
}

export const ExportButton = ({ commits, stats }: ExportButtonProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleExportJSON = () => {
    const data = {
      stats,
      commits: commits.map((c) => ({
        sha: c.sha,
        message: c.message,
        author: c.author.name,
        date: c.author.date,
        score: c.analysis?.score,
        feedback: c.analysis?.feedback,
      })),
    };

    const content = JSON.stringify(data, null, 2);
    const filename = `${stats.repoName.replace("/", "-")}-analysis.json`;
    downloadFile(content, filename, "application/json");
    setShowMenu(false);
  };

  const handleExportCSV = () => {
    const content = exportToCSV(commits);
    const filename = `${stats.repoName.replace("/", "-")}-analysis.csv`;
    downloadFile(content, filename, "text/csv");
    setShowMenu(false);
  };

  const handleExportMarkdown = () => {
    const content = exportToMarkdown(commits, stats);
    const filename = `${stats.repoName.replace("/", "-")}-analysis.md`;
    downloadFile(content, filename, "text/markdown");
    setShowMenu(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn-secondary"
        aria-label="Export options"
        aria-expanded={showMenu}
      >
        <span>⬇️</span> Export
      </button>

      {showMenu && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 10,
            }}
            onClick={() => setShowMenu(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              right: 0,
              marginTop: "0.5rem",
              background: "var(--bg-panel)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 20,
              minWidth: "150px",
            }}
          >
            <button
              onClick={handleExportJSON}
              className="btn-ghost"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                borderRadius: 0,
                justifyContent: "flex-start",
              }}
            >
              📄 JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="btn-ghost"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                borderRadius: 0,
                justifyContent: "flex-start",
              }}
            >
              📊 CSV
            </button>
            <button
              onClick={handleExportMarkdown}
              className="btn-ghost"
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                borderRadius: 0,
                justifyContent: "flex-start",
              }}
            >
              📝 Markdown
            </button>
          </div>
        </>
      )}
    </div>
  );
};
