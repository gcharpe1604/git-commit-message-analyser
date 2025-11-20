import type { CommitAnalysis } from '../types';
import './ExportButton.css';

interface ExportButtonProps {
  results: CommitAnalysis[];
  repoUrl: string;
}

export default function ExportButton({ results, repoUrl }: ExportButtonProps) {
  const handleExport = () => {
    const avgScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / results.length
    );

    const csvContent = [
      ['Git Commit Message Analysis Report'],
      ['Repository', repoUrl],
      ['Date', new Date().toISOString()],
      ['Total Commits', results.length],
      ['Average Score', `${avgScore}%`],
      [],
      ['Commit #', 'Message', 'Score', 'Author', 'Date', 'Issues'],
      ...results.map((commit, idx) => [
        idx + 1,
        commit.message.split('\n')[0],
        `${commit.score}%`,
        commit.author,
        new Date(commit.date).toLocaleDateString(),
        commit.issues.join('; '),
      ]),
    ]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commit-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="export-section">
      <button onClick={handleExport} className="btn-secondary">
        📥 Export Results as CSV
      </button>
    </div>
  );
}
