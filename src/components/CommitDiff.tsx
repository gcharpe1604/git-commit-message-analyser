import { useState } from 'react';
import CodeViewer from './CodeViewer';
import './CommitDiff.css';

interface CommitDiffProps {
  commitSha: string;
  owner: string;
  repo: string;
}

interface FileChange {
  filename: string;
  status: 'added' | 'removed' | 'modified' | 'renamed';
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

interface CommitDetails {
  message: string;
  author: string;
  date: string;
  files: FileChange[];
  stats: {
    total: number;
    additions: number;
    deletions: number;
  };
}

export default function CommitDiff({ commitSha, owner, repo }: CommitDiffProps) {
  const [commitDetails, setCommitDetails] = useState<CommitDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const fetchCommitDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch commit details');
      }

      const data = await response.json();

      setCommitDetails({
        message: data.commit.message,
        author: data.commit.author.name,
        date: data.commit.author.date,
        files: data.files || [],
        stats: {
          total: data.files?.length || 0,
          additions: data.stats?.additions || 0,
          deletions: data.stats?.deletions || 0,
        },
      });
      setExpanded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commit details');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="commit-diff-container">
      <button
        onClick={fetchCommitDetails}
        className="btn-view-diff"
        disabled={loading}
      >
        {loading ? 'Loading...' : '📁 View Changes'}
      </button>

      {error && <p className="diff-error">{error}</p>}

      {expanded && commitDetails && (
        <div className="diff-details">
          <div className="diff-header">
            <h3>Commit Changes</h3>
            <button
              onClick={() => setExpanded(false)}
              className="btn-close"
            >
              ✕
            </button>
          </div>

          <div className="diff-stats">
            <div className="stat">
              <span className="stat-label">Files Changed</span>
              <span className="stat-value">{commitDetails.stats.total}</span>
            </div>
            <div className="stat additions">
              <span className="stat-label">Additions</span>
              <span className="stat-value">+{commitDetails.stats.additions}</span>
            </div>
            <div className="stat deletions">
              <span className="stat-label">Deletions</span>
              <span className="stat-value">-{commitDetails.stats.deletions}</span>
            </div>
          </div>

          <CodeViewer 
            files={commitDetails.files} 
            owner={owner} 
            repo={repo} 
            commitSha={commitSha}
          />

          <div className="suggestion-box">
            <p className="suggestion-title">💡 Suggestion for Commit Message:</p>
            <p className="suggestion-text">
              Based on the changes, consider a message like:
            </p>
            <div className="suggestion-examples">
              {generateSuggestions(commitDetails.files).map((suggestion, idx) => (
                <div key={idx} className="suggestion-item">
                  <code>{suggestion}</code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateSuggestions(files: FileChange[]): string[] {
  const suggestions: string[] = [];

  // Analyze file types and changes
  const hasTests = files.some(f => f.filename.includes('test') || f.filename.includes('spec'));
  const hasDocs = files.some(f => f.filename.includes('README') || f.filename.includes('.md'));
  const hasConfig = files.some(f => 
    f.filename.includes('config') || 
    f.filename.includes('package.json') ||
    f.filename.includes('.env')
  );

  // Generate suggestions based on changes
  if (files.length === 1) {
    const file = files[0];
    if (file.status === 'added') {
      suggestions.push(`feat: add ${file.filename.split('/').pop()}`);
    } else if (file.status === 'removed') {
      suggestions.push(`refactor: remove ${file.filename.split('/').pop()}`);
    } else {
      suggestions.push(`fix: update ${file.filename.split('/').pop()}`);
    }
  } else {
    if (hasTests) {
      suggestions.push('test: add comprehensive test coverage');
    }
    if (hasDocs) {
      suggestions.push('docs: update documentation');
    }
    if (hasConfig) {
      suggestions.push('chore: update configuration files');
    }
    if (files.some(f => f.status === 'added')) {
      suggestions.push(`feat: add new features (${files.filter(f => f.status === 'added').length} files)`);
    }
    if (files.some(f => f.status === 'modified')) {
      suggestions.push(`refactor: improve code structure (${files.filter(f => f.status === 'modified').length} files)`);
    }
  }

  return suggestions.length > 0 ? suggestions : ['refactor: update multiple files'];
}
