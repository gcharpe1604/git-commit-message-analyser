import type { Commit, RepoStats } from "../../types";
import { CommitList } from "../CommitList";
import { Loader } from "../Loader";
import { SummarySection } from "../SummarySection";

interface AnalysisPageProps {
  stats: RepoStats | null;
  commits: Commit[];
  loading: boolean;
  fetchingMore: boolean;
  onBack: () => void;
  onWorkshop: () => void;
  onLoadMore: (page: number) => void;
}

export const AnalysisPage = ({ stats, commits, loading, fetchingMore, onBack, onWorkshop, onLoadMore }: AnalysisPageProps) => {
  if (loading || !stats) return <div className="route-loading"><Loader size={1.5} /><strong>Reading repository history</strong><span>Scoring messages and identifying patterns...</span></div>;
  return <div className="analysis-page animate-in">
    <div className="analysis-toolbar">
      <div className="analysis-actions"><button onClick={onBack} className="btn-ghost route-back">← Back</button></div>
      <div className="analysis-tabs"><span className="active">Analysis</span><button onClick={onWorkshop}>Commit workshop</button></div>
    </div>
    <SummarySection stats={stats} />
    <CommitList key={stats.repoName} commits={commits} totalCommitsCount={stats.totalCommits} isLoading={fetchingMore} onFetchCommits={onLoadMore} />
  </div>;
};
