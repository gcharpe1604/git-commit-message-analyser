import { useState } from 'react';
import './UserInput.css';

interface UserInputProps {
  onSubmit: (username: string) => void;
}

export default function UserInput({ onSubmit }: UserInputProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    if (username.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }

    onSubmit(username);
  };

  return (
    <section className="user-input-section">
      <div className="user-input-card">
        <h2>Enter GitHub Username</h2>
        <p className="subtitle">View all public repositories and analyze commit messages</p>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="username">GitHub Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., torvalds, gvanrossum"
              className="username-input"
              autoFocus
            />
            {error && <p className="input-error">{error}</p>}
          </div>
          <button type="submit" className="btn-primary">
            View Repositories
          </button>
        </form>

        <div className="examples">
          <p className="examples-title">Try these popular developers:</p>
          <div className="example-buttons">
            <button
              type="button"
              onClick={() => onSubmit('torvalds')}
              className="example-btn"
            >
              Linus Torvalds
            </button>
            <button
              type="button"
              onClick={() => onSubmit('gvanrossum')}
              className="example-btn"
            >
              Guido van Rossum
            </button>
            <button
              type="button"
              onClick={() => onSubmit('dhh')}
              className="example-btn"
            >
              David Heinemeier Hansson
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
