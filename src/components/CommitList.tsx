import type { Commit } from "../types";
import { CommitCard } from "./CommitCard";

interface CommitListProps {
  commits: Commit[];
}

export const CommitList = ({ commits }: CommitListProps) => {
  if (commits.length === 0) {
    return null;
  }

  return (
    <div className="commit-list">
      <h2
        style={{ marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: 600 }}
      >
        Recent Commits
      </h2>
      {commits.map((commit, index) => (
        <CommitCard key={commit.sha} commit={commit} index={index} />
      ))}
    </div>
  );
};
