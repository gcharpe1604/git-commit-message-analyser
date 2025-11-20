import { useState } from 'react';
import './RepositoryInput.css';

interface RepositoryInputProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
}

export default function RepositoryInput({ onAnalyze, loading }: RepositoryInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('Please enter a repository URL');
      return;
    }

    if (!url.includes('github.com')) {
      setError('Please enter a valid GitHub URL');
      return;
    }

    onAnalyze(url);
  };

  return (
    <section className="input-section">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-group">
          <label htmlFor="repoUrl">GitHub Repository URL</label>
          <input
            id="repoUrl"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., https://github.com/username/repo-name"
            className="repo-input"
            disabled={loading}
          />
          {error && <p className="input-error">{error}</p>}
        </div>
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Commits'}
        </button>
      </form>
    </section>
  );
}
