import type { Commit, GithubCommitResponse } from '../types';
import { analyzeCommit } from '../utils/simpleAnalyzer';
import { retryWithBackoff } from '../utils/retry';
import { CONSTANTS } from '../constants';

// Simple cache for API responses
const cache = new Map<string, { data: Commit[]; totalCount: number; timestamp: number }>();

// GitHub API configuration
const GITHUB_API_URL = import.meta.env.VITE_GITHUB_API_URL || 'https://api.github.com';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// Create headers with optional token
const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/vnd.github.v3+json',
  };
  
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  return headers;
};

export const parseRepoUrl = (url: string): { owner: string; repo: string } | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1] };
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchCommits = async (repoUrl: string, page: number = 1): Promise<{ commits: Commit[]; totalCount: number }> => {
  // Check cache first (include page in key)
  const cacheKey = `${repoUrl}?page=${page}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CONSTANTS.API.CACHE_DURATION) {
    console.log('Using cached data for', cacheKey);
    return { commits: cached.data, totalCount: cached.totalCount }; 
  }

  const repoInfo = parseRepoUrl(repoUrl);
  if (!repoInfo) {
    throw new Error("Invalid GitHub Repository URL");
  }

  const { owner, repo } = repoInfo;
  const apiUrl = `${GITHUB_API_URL}/repos/${owner}/${repo}/commits?per_page=${CONSTANTS.API.COMMITS_PER_PAGE}&page=${page}`;

  const response = await retryWithBackoff(
    () => fetch(apiUrl, { headers: getHeaders() }),
    CONSTANTS.API.RETRY_ATTEMPTS,
    CONSTANTS.API.RETRY_BASE_DELAY
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `Repository not found. Please check:\n` +
        `• The repository exists\n` +
        `• The URL is correct\n` +
        `• The repository is public`
      );
    } else if (response.status === 403) {
      const resetTime = response.headers.get('X-RateLimit-Reset');
      const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
      throw new Error(
        `GitHub API rate limit exceeded.\n` +
        `Resets at: ${resetDate?.toLocaleTimeString() || 'unknown'}\n` +
        `Consider adding a GitHub token for higher limits.`
      );
    }
    throw new Error(`Failed to fetch commits (${response.status})`);
  }

  // Parse Link header for total count estimation
  const linkHeader = response.headers.get('Link');
  let totalCount = 0;
  
  if (linkHeader) {
    const lastMatch = linkHeader.match(/<([^>]+)>; rel="last"/);
    if (lastMatch) {
      const lastPageUrl = lastMatch[1];
      const pageMatch = lastPageUrl.match(/[?&]page=(\d+)/);
      
      if (pageMatch) {
        const lastPage = parseInt(pageMatch[1]);
        
        // Fetch the last page to get the exact count
        try {
          const lastPageResponse = await fetch(lastPageUrl, { headers: getHeaders() });
          if (lastPageResponse.ok) {
            const lastPageData = await lastPageResponse.json();
            // Exact count: (lastPage - 1) * per_page + items_on_last_page
            totalCount = (lastPage - 1) * CONSTANTS.API.COMMITS_PER_PAGE + lastPageData.length;
          } else {
             // Fallback to estimation if last page fetch fails
             totalCount = lastPage * CONSTANTS.API.COMMITS_PER_PAGE;
          }
        } catch (e) {
           // Fallback to estimation
           totalCount = lastPage * CONSTANTS.API.COMMITS_PER_PAGE;
        }
      }
    }
  }

  const data: GithubCommitResponse[] = await response.json();

  const commits = data.map((item) => {
    const message = item.commit.message;
    const analysis = analyzeCommit(message);
    
    return {
      sha: item.sha,
      message: message,
      author: {
        name: item.commit.author.name,
        date: item.commit.author.date,
        avatar_url: item.author?.avatar_url,
      },
      url: item.html_url,
      analysis,
    };
  });

  // If no link header or single page, use actual length
  if (totalCount === 0) {
    totalCount = commits.length;
  }

  // Cache the result
  cache.set(cacheKey, { data: commits, totalCount, timestamp: Date.now() });

  return { commits, totalCount };
};


export const fetchUserRepos = async (username: string): Promise<import('../types').Repository[]> => {
  const apiUrl = `${GITHUB_API_URL}/users/${username}/repos?sort=updated&per_page=${CONSTANTS.API.REPOS_PER_PAGE}&type=public`;

  const response = await fetch(apiUrl, { headers: getHeaders() });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("User not found.");
    } else if (response.status === 403) {
      throw new Error("API rate limit exceeded. Try again later.");
    }
    throw new Error("Failed to fetch repositories.");
  }

  return await response.json();
};

export const fetchCommitDetails = async (url: string): Promise<any> => {
  const response = await fetch(url, { headers: getHeaders() });
  
  if (!response.ok) {
    throw new Error("Failed to fetch commit details");
  }

  return await response.json();
};
