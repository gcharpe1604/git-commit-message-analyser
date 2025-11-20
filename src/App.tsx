import { useState } from 'react';
import './App.css';
import UserInput from './components/UserInput';
import RepositoryList from './components/RepositoryList';
import ResultsDisplay from './components/ResultsDisplay';
import CommitReview from './components/CommitReview';
import { analyzeCommits } from './utils/analyzer';
import { fetchCommits, fetchUserRepos } from './utils/githubApi';
import type { CommitAnalysis, Repository } from './types';

type AppView = 'user' | 'repos' | 'analysis';

interface AppState {
  view: AppView;
  username: string;
  repos: Repository[];
  selectedRepo: Repository | null;
  results: CommitAnalysis[] | null;
  loading: boolean;
  error: string | null;
}

const initialState: AppState = {
  view: 'user',
  username: '',
  repos: [],
  selectedRepo: null,
  results: null,
  loading: false,
  error: null,
};

function App() {
  const [state, setState] = useState<AppState>(initialState);

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleUserSubmit = async (user: string) => {
    updateState({ loading: true, error: null });
    try {
      const userRepos = await fetchUserRepos(user);
      updateState({ username: user, repos: userRepos, view: 'repos', loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      updateState({ error: message, loading: false });
    }
  };

  const handleRepoSelect = async (repo: Repository) => {
    updateState({ loading: true, error: null });
    try {
      const commits = await fetchCommits(state.username, repo.name);
      const analyzed = analyzeCommits(commits);
      updateState({ selectedRepo: repo, results: analyzed, view: 'analysis', loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      updateState({ error: message, loading: false });
    }
  };

  const handleBackToRepos = () => {
    updateState({ view: 'repos', selectedRepo: null, results: null });
  };

  const handleBackToUser = () => {
    updateState(initialState);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Git Commit Message Analyzer</h1>
        <p>Analyze commit messages for clarity and structure</p>
      </header>

      <main className="app-main">
        {state.error && (
          <div className="error-container">
            <p className="error-message">{state.error}</p>
          </div>
        )}

        {state.loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading...</p>
          </div>
        )}

        {!state.loading && state.view === 'user' && (
          <UserInput onSubmit={handleUserSubmit} />
        )}

        {!state.loading && state.view === 'repos' && (
          <RepositoryList
            repos={state.repos}
            username={state.username}
            onSelectRepo={handleRepoSelect}
            onBack={handleBackToUser}
          />
        )}

        {!state.loading && state.view === 'analysis' && state.results && state.selectedRepo && (
          <>
            <ResultsDisplay
              results={state.results}
              repoUrl={`https://github.com/${state.username}/${state.selectedRepo.name}`}
              onBack={handleBackToRepos}
            />
            <CommitReview />
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Built for learning • GitHub API • Commit Analysis</p>
      </footer>
    </div>
  );
}

export default App;
