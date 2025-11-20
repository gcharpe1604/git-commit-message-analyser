export interface Commit {
  message: string;
  author: string;
  date: string;
  sha: string;
}

export interface CommitAnalysis {
  message: string;
  author: string;
  date: string;
  sha: string;
  score: number;
  feedback: string[];
  issues: string[];
}

export interface Repository {
  name: string;
  description: string | null;
  url: string;
  stars: number;
  language: string | null;
}
