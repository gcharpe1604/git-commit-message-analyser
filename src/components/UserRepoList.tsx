import type { Repository } from "../types";
import { Skeleton, Empty } from "antd";

interface UserRepoListProps {
  repos: Repository[];
  onSelectRepo: (repoUrl: string) => void;
  username?: string | null;
  isLoading?: boolean;
}

export const UserRepoList = ({
  repos,
  onSelectRepo,
  username,
  isLoading,
}: UserRepoListProps) => {
  if (isLoading) {
    return (
      <div className="animate-in" style={{ padding: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="panel" style={{ padding: "1.5rem" }}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        ))}
      </div>
    );
  }

  if (repos.length === 0) {
    return (
      <div
        className="panel animate-in"
        style={{
          padding: "4rem 2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Empty description={<span style={{ color: "var(--text-secondary)" }}>No repositories found</span>} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        <div style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          Check the username or try another
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: "2rem" }}>
        {username && (
          <>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
                letterSpacing: "-0.02em",
              }}
            >
              {username}
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                margin: 0,
              }}
            >
              Repositories for this user
            </p>
          </>
        )}
        {!username && (
          <h2
            style={{
              marginBottom: "1.5rem",
              fontSize: "1.5rem",
              fontWeight: 600,
            }}
          >
            Select a Repository
          </h2>
        )}
      </div>
      <div
        className="repo-list-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1rem",
        }}
      >
        {repos.map((repo, index) => (
          <div
            key={repo.id}
            className="panel"
            style={{
              padding: "1.5rem",
              cursor: "pointer",
              transition: "all 0.2s",
              animationDelay: `${index * 0.05}s`,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
            onClick={() => onSelectRepo(repo.html_url)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "var(--accent-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "var(--border-subtle)";
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "var(--text-primary)",
              }}
            >
              {repo.name}
            </div>
            {repo.description && (
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {repo.description}
              </div>
            )}
            <div
              style={{
                marginTop: "auto",
                paddingTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "0.85rem",
                color: "var(--text-secondary)",
              }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                ⭐ {repo.stargazers_count}
              </span>
              {repo.language && (
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  🔵 {repo.language}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
