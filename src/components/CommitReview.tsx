import { useState } from 'react';
import { analyzeCommit } from '../utils/analyzer';
import type { CommitAnalysis } from '../types';
import './CommitReview.css';

export default function CommitReview() {
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState<CommitAnalysis | null>(null);

  const handleAnalyze = () => {
    if (!message.trim()) {
      return;
    }

    const mockCommit = {
      message,
      author: 'You',
      date: new Date().toISOString(),
      sha: 'preview',
    };

    const result = analyzeCommit(mockCommit);
    setAnalysis(result);
  };

  const handleClear = () => {
    setMessage('');
    setAnalysis(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  };

  return (
    <section className="commit-review-section">
      <div className="review-container">
        <h2>Commit Message Review</h2>
        <p className="review-subtitle">
          Test your commit message before pushing to the repository
        </p>

        <div className="review-content">
          <div className="input-area">
            <label htmlFor="commitMessage">Your Commit Message</label>
            <textarea
              id="commitMessage"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your commit message here..."
              className="commit-textarea"
              rows={5}
            />
            <div className="button-group">
              <button
                onClick={handleAnalyze}
                className="btn-analyze"
                disabled={!message.trim()}
              >
                Analyze Message
              </button>
              <button onClick={handleClear} className="btn-clear">
                Clear
              </button>
            </div>
          </div>

          {analysis && (
            <div className="preview-area">
              <div className="preview-header">
                <h3>Analysis Result</h3>
                <span className={`score-badge ${getScoreColor(analysis.score)}`}>
                  {analysis.score}%
                </span>
              </div>

              <div className="preview-message">
                <p className="message-preview">{analysis.message.split('\n')[0]}</p>
              </div>

              {analysis.feedback.length > 0 && (
                <div className="feedback-area">
                  <p className="feedback-title">Feedback:</p>
                  <div className="feedback-list">
                    {analysis.feedback.map((item, idx) => (
                      <p key={idx} className="feedback-item">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {analysis.issues.length > 0 && (
                <div className="issues-area">
                  <p className="issues-title">Issues Found:</p>
                  <ul className="issues-list">
                    {analysis.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.issues.length === 0 && (
                <div className="success-message">
                  ✓ Perfect commit message! Ready to commit.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
