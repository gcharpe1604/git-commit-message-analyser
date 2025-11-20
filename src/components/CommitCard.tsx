import type { CommitAnalysis } from '../types';
import CommitDiff from './CommitDiff';
import './CommitCard.css';

interface CommitCardProps {
  commit: CommitAnalysis;
  index: number;
  owner?: string;
  repo?: string;
}

export default function CommitCard({ commit, index, owner, repo }: CommitCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="commit-card">
      <div className="commit-header">
        <span className="commit-number">#{index}</span>
        <span className={`score-badge ${getScoreColor(commit.score)}`}>
          {commit.score}%
        </span>
      </div>

      <div className="commit-message">
        <p className="message-text">{commit.message.split('\n')[0]}</p>
      </div>

      <div className="commit-meta">
        <span className="author">{commit.author}</span>
        <span className="date">{formatDate(commit.date)}</span>
        <span className="sha">{commit.sha}</span>
      </div>

      {commit.feedback.length > 0 && (
        <div className="feedback-section">
          <div className="feedback-list">
            {commit.feedback.map((item, idx) => (
              <p key={idx} className="feedback-item">{item}</p>
            ))}
          </div>
        </div>
      )}

      {commit.issues.length > 0 && (
        <div className="issues-section">
          <p className="issues-title">Issues found:</p>
          <ul className="issues-list">
            {commit.issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}

      {owner && repo && (
        <CommitDiff commitSha={commit.sha} owner={owner} repo={repo} />
      )}
    </div>
  );
}
