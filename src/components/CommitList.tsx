import { useMemo, useState, useTransition } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import type { Commit } from "../types";
import { CommitCard } from "./CommitCard";
import { Loader } from "./Loader";

const PAGE_SIZE = 10;

interface CommitListProps {
  commits: Commit[];
  totalCommitsCount?: number;
  isLoading?: boolean;
  onFetchCommits?: (apiPage: number) => void;
}

export const CommitList = ({ commits, totalCommitsCount, isLoading, onFetchCommits }: CommitListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const total = totalCommitsCount ?? commits.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = useMemo(() => commits.slice(start, start + PAGE_SIZE), [commits, start]);

  const goTo = (page: number) => {
    const next = Math.max(1, Math.min(page, totalPages));
    if (next * PAGE_SIZE > commits.length && onFetchCommits) onFetchCommits(Math.ceil(next * PAGE_SIZE / 100));
    startTransition(() => setCurrentPage(next));
    document.querySelector(".commit-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="commit-list" aria-labelledby="commits-heading">
      <header className="commit-list-header">
        <div><p className="eyebrow">Commit log</p><h2 id="commits-heading">Recent work</h2></div>
        <span>{total.toLocaleString()} commits in repository</span>
      </header>

      {(isLoading && visible.length === 0) || isPending ? (
        <div className="loading-state"><Loader size={1.1} /><p>Loading commit history…</p></div>
      ) : visible.length ? (
        <div className="commit-stack">{visible.map((commit, index) => <CommitCard key={commit.sha} commit={commit} index={start + index} />)}</div>
      ) : (
        <div className="empty-state compact"><h3>No commits loaded for this page.</h3><p>Try the previous page or run the analysis again.</p></div>
      )}

      {totalPages > 1 && (
        <nav className="pagination" aria-label="Commit pages">
          <button onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous page"><MdChevronLeft /></button>
          <span>Page <strong>{currentPage}</strong> of {totalPages.toLocaleString()}</span>
          <button onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next page"><MdChevronRight /></button>
        </nav>
      )}
    </section>
  );
};
