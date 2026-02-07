import type { RepoStats } from '../types';

const STORAGE_KEY = 'git_analyzer_history';

export const saveAnalysis = (stats: RepoStats) => {
  try {
    const history = getHistory();
    const existingIndex = history.findIndex(item => item.repoName === stats.repoName);
    
    let newStats = { ...stats };
    
    if (existingIndex >= 0) {
      const existing = history[existingIndex];
      // Preserve tags
      newStats.tags = existing.tags || [];
      
      // Update score history
      const prevHistory = existing.scoreHistory || [];
      newStats.scoreHistory = [
        ...prevHistory, 
        { date: new Date().toISOString(), score: stats.averageScore }
      ].slice(-20); // Keep last 20 data points
      
      // Remove old entry
      history.splice(existingIndex, 1);
    } else {
      // Initialize history for new repo
      newStats.scoreHistory = [{ date: new Date().toISOString(), score: stats.averageScore }];
      newStats.tags = [];
    }

    // Add new stats to top
    const newHistory = [newStats, ...history];
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
