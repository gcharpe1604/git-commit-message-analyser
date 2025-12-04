import type { Repository } from "../types";

interface UserRepoListProps {
  repos: Repository[];
  onSelectRepo: (repoUrl: string) => void;
  username?: string | null;
}

export const UserRepoList = ({
  repos,
  onSelectRepo,
  username,
}: UserRepoListProps) => {
  if (repos.length === 0) {
    return (
      <div
        className="panel animate-in"
        style={{
          padding: "2rem",
          textAlign: "center",
          color: "var(--text-secondary)",
        }}
      >
        No repositories found for this user.
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
