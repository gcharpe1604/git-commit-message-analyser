import type { RepoStats } from '../types';

const STORAGE_KEY = 'git_analyzer_history';

export const saveAnalysis = (stats: RepoStats) => {
  try {
    const history = getHistory();
    // Remove existing entry for same repo if exists to update it
    const filteredHistory = history.filter(item => item.repoName !== stats.repoName);
    // Add new stats to top
    const newHistory = [stats, ...filteredHistory].slice(0, 10); // Keep last 10
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

export const getHistory = (): RepoStats[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const clearHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear history", e);
  }
};
