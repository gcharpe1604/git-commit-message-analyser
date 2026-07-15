const cleanRepoName = (value: string) => value.trim().replace(/^https?:\/\/(?:www\.)?github\.com\//i, "").replace(/^\/+|\/+$/g, "").replace(/\.git$/, "");

export const parseRepoName = (value: string): { owner: string; repo: string; fullName: string } | null => {
  const [owner, repo, ...rest] = cleanRepoName(value).split("/");
  if (!owner || !repo || rest.length) return null;
  return { owner, repo, fullName: `${owner}/${repo}` };
};

export const buildAnalysisPath = (repoValue: string, fromDeveloper?: string | null): string | null => {
  const parsed = parseRepoName(repoValue);
  if (!parsed) return null;
  const base = `/analysis/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`;
  return fromDeveloper?.trim() ? `${base}?fromDeveloper=${encodeURIComponent(fromDeveloper.trim())}` : base;
};

export const getAnalysisBackPath = (search: string): string => {
  const username = new URLSearchParams(search).get("fromDeveloper")?.trim();
  return username ? `/developers/${encodeURIComponent(username)}` : "/";
};

export const buildRepositoryWorkshopPath = (repoName: string, search = ""): string | null => {
  const parsed = parseRepoName(repoName);
  if (!parsed) return null;
  return `/analysis/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/workshop${search}`;
};

export const buildRepositoryAnalysisPath = (repoName: string, search = ""): string | null => {
  const parsed = parseRepoName(repoName);
  if (!parsed) return null;
  return `/analysis/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}${search}`;
};
