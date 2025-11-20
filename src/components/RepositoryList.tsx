import type { Repository } from '../types';
import './RepositoryList.css';

interface RepositoryListProps {
  repos: Repository[];
  username: string;
  onSelectRepo: (repo: Repository) => void;
  onBack: () => void;
}

export default function RepositoryList({
  repos,
  username,
  onSelectRepo,
  onBack,
}: RepositoryListProps) {
  return (
    <section className="repo-list-section">
      <div className="repo-list-header">
        <button onClick={onBack} className="btn-back">
          ← Back
        </button>
        <div>
          <h2>Public Repositories</h2>
          <p className="repo-username">@{username}</p>
        </div>
      </div>

      {repos.length === 0 ? (
        <div className="no-repos">
          <p>No public repositories found for this user.</p>
        </div>
      ) : (
        <div className="repos-grid">
          {repos.map((repo) => (
            <div
              key={repo.name}
              className="repo-card"
              onClick={() => onSelectRepo(repo)}
            >
              <div className="repo-card-header">
                <h3>{repo.name}</h3>
                {repo.language && (
                  <span className="language-badge">{repo.language}</span>
                )}
              </div>

              {repo.description && (
                <p className="repo-description">{repo.description}</p>
              )}

              <div className="repo-footer">
                <span className="stars">⭐ {repo.stars}</span>
                <span className="action">Analyze →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
