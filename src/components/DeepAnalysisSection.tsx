import { useState } from "react";
import type { Commit } from "../types";
import { fetchCommitDetails } from "../services/githubService";
import { generateMessageFromFiles } from "../utils/diffAnalyzer";

export const DeepAnalysisSection = ({ commit }: { commit: Commit }) => {
  const [loading, setLoading] = useState(false);
  const [deepSuggestion, setDeepSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the commit URL to fetch details (it contains the API url)
      // We need to construct the API URL from the html_url or use the one we have
      // Actually commit.url IS the API url in our type definition?
      // Let's check types.ts. GithubCommitResponse.html_url is the browser URL.
      // We need to reconstruct the API URL or pass it down.
      // The commit object has 'url' which is html_url.
      // We can reconstruct: https://github.com/owner/repo/commit/sha -> https://api.github.com/repos/owner/repo/commits/sha

      const apiUrl = commit.url
        .replace("github.com", "api.github.com/repos")
        .replace("/commit/", "/commits/");

      const details = await fetchCommitDetails(apiUrl);
      // details.files contains the array of file objects with filename, status, patch, etc.
      const suggestion = generateMessageFromFiles(details.files);
      setDeepSuggestion(
        suggestion || "Could not generate a better message from changes."
      );
    } catch (err) {
      setError("Failed to fetch commit details. Rate limit might be exceeded.");
    } finally {
      setLoading(false);
    }
  };

  if (deepSuggestion) {
    return (
      <div
        style={{
          marginBottom: "1rem",
          padding: "0.75rem",
          background: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.2)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        <div
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "#3b82f6",
            fontWeight: 600,
            marginBottom: "0.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Professional Suggestion (Based on Files)</span>
          <button
            onClick={() => navigator.clipboard.writeText(deepSuggestion)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              fontSize: "0.7rem",
              opacity: 0.8,
            }}
          >
            Copy
          </button>
        </div>
        <div
          style={{
            fontFamily: "monospace",
            color: "var(--text-primary)",
            fontWeight: 600,
          }}
        >
          {deepSuggestion}
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "1rem" }}>
      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{
          background: "var(--bg-panel)",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.85rem",
          cursor: loading ? "wait" : "pointer",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          transition: "all 0.2s",
        }}
      >
        {loading ? (
          <>Analyzing Changes...</>
        ) : (
          <>✨ Generate Professional Message based on Changes</>
        )}
      </button>
      {error && (
        <div
          style={{
            fontSize: "0.8rem",
            color: "var(--status-bad)",
            marginTop: "0.5rem",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
