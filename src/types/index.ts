export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface AnalysisResult {
  score: number;
  feedback: string[];
  status: 'good' | 'warning' | 'bad';
  conventionalType?: string;
  achievements?: Achievement[];
  suggestion?: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: {
    name: string;
    date: string;
    avatar_url?: string;
  };
  url: string;
  analysis?: AnalysisResult;
}

export interface RepoStats {
  repoName: string;
  averageScore: number;
  totalCommits: number;
  goodCommits: number;
  warningCommits: number;
  badCommits: number;
  lastAnalyzed: string;
  timeDistribution?: {
    morning: number; // 6-12
    afternoon: number; // 12-18
    evening: number; // 18-24
    night: number; // 0-6
  };
  achievements?: Achievement[];
}

export interface GithubCommitResponse {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author?: {
    avatar_url: string;
  };
  html_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  html_url: string;
}
