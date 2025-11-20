import type { Commit, Repository } from '../types';

export async function fetchUserRepos(username: string): Promise<Repository[]> {
  const url = `https://api.github.com/users/${username}/repos?per_page=100&sort=stars&direction=desc`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found. Check the username and try again.');
      }
      if (response.status === 403) {
        throw new Error('API rate limit exceeded. Try again later.');
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response from GitHub API');
    }

    return data
      .filter((repo: any) => !repo.fork)
      .map((repo: any) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
      }));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch repositories from GitHub');
  }
}

export async function fetchCommits(owner: string, repo: string): Promise<Commit[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found. Check the URL and try again.');
      }
      if (response.status === 403) {
        throw new Error('API rate limit exceeded. Try again later.');
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid response from GitHub API');
    }

    return data.map((commit: any) => ({
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      sha: commit.sha.substring(0, 7),
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch commits from GitHub');
  }
}
