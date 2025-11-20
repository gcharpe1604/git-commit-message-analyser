import './SummaryStats.css';

interface SummaryStatsProps {
  totalCommits: number;
  avgScore: number;
  excellent: number;
  good: number;
  needsWork: number;
}

export default function SummaryStats({
  totalCommits,
  avgScore,
  excellent,
  good,
  needsWork,
}: SummaryStatsProps) {
  return (
    <div className="summary-stats">
      <div className="stat-card">
        <span className="stat-label">Total Commits</span>
        <span className="stat-value">{totalCommits}</span>
      </div>

      <div className="stat-card">
        <span className="stat-label">Average Score</span>
        <span className="stat-value">{avgScore}%</span>
      </div>

      <div className="stat-card excellent">
        <span className="stat-label">Excellent</span>
        <span className="stat-value">{excellent}</span>
      </div>

      <div className="stat-card good">
        <span className="stat-label">Good</span>
        <span className="stat-value">{good}</span>
      </div>

      <div className="stat-card needs-work">
        <span className="stat-label">Needs Work</span>
        <span className="stat-value">{needsWork}</span>
      </div>
    </div>
  );
}
