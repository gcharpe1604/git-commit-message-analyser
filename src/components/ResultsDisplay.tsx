import { useMemo } from 'react';
import type { CommitAnalysis } from '../types';
import CommitCard from './CommitCard';
import SummaryStats from './SummaryStats';
import ExportButton from './ExportButton';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  results: CommitAnalysis[];
  repoUrl: string;
  onBack?: () => void;
}

export default function ResultsDisplay({ results, repoUrl, onBack }: ResultsDisplayProps) {
  const stats = useMemo(() => {
    const avgScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length
    );
    const excellentCount = results.filter(r => r.score >= 90).length;
    const goodCount = results.filter(r => r.score >= 70 && r.score < 90).length;
    const needsWorkCount = results.filter(r => r.score < 70).length;

    return { avgScore, excellentCount, goodCount, needsWorkCount };
  }, [results]);

  return (
    <section className="results-section">
      <div className="results-header">
        {onBack && (
          <button onClick={onBack} className="btn-back">
            ← Back to Repositories
          </button>
        )}
        <h2>Analysis Results</h2>
        <p className="repo-info">{repoUrl}</p>
      </div>

      <SummaryStats
        totalCommits={results.length}
        avgScore={stats.avgScore}
        excellent={stats.excellentCount}
        good={stats.goodCount}
        needsWork={stats.needsWorkCount}
      />

      <div className="commits-list">
        {results.map((commit, index) => {
          const urlParts = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/);
          const owner = urlParts?.[1];
          const repo = urlParts?.[2];
          
          return (
            <CommitCard 
              key={commit.sha} 
              commit={commit} 
              index={index + 1}
              owner={owner}
              repo={repo}
            />
          );
        })}
      </div>

      <ExportButton results={results} repoUrl={repoUrl} />
    </section>
  );
}
