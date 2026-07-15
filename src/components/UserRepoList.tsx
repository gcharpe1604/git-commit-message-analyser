import { MdArrowForward, MdCode, MdStar } from "react-icons/md";
import type { Repository } from "../types";

interface UserRepoListProps {
  repos: Repository[];
  onSelectRepo: (repoUrl: string) => void;
  username?: string | null;
  isLoading?: boolean;
}

export const UserRepoList = ({ repos, onSelectRepo, username, isLoading }: UserRepoListProps) => {
  if (isLoading) {
    return <div className="repo-grid" aria-label="Loading repositories">{Array.from({ length: 6 }).map((_, index) => <div className="repo-card repo-card-skeleton" key={index} />)}</div>;
  }

  if (repos.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-index">00</span>
        <h2>No public repositories found.</h2>
        <p>Check the GitHub username or choose another developer.</p>
      </div>
    );
  }

  return (
    <section className="repo-picker">
      <div className="page-intro">
        <p className="eyebrow">Repository index</p>
        <h1>{username ? `${username}’s work` : "Choose a repository"}</h1>
        <p>Select the history you want to inspect. Repositories are ordered by GitHub activity.</p>
      </div>
      <div className="repo-grid">
        {repos.map((repo, index) => (
          <button className="repo-card" key={repo.id} onClick={() => onSelectRepo(repo.html_url)}>
            <span className="repo-index">{String(index + 1).padStart(2, "0")}</span>
            <div className="repo-card-title"><h2>{repo.name}</h2><MdArrowForward /></div>
            <p>{repo.description || "No repository description provided."}</p>
            <div className="repo-meta">
              <span><MdStar /> {repo.stargazers_count.toLocaleString()}</span>
              <span><MdCode /> {repo.language || "Mixed"}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
