import type { Achievement, AnalysisResult, Commit, RepoStats } from "../types";
import { scoreCommitMessage } from "./scoringEngine";

const getDeveloperType = (
  timeDistribution: { morning: number; afternoon: number; evening: number; night: number },
  commits: Commit[],
) => {
  const total = Object.values(timeDistribution).reduce((sum, value) => sum + value, 0);
  if (!total) return "Consistent Builder";
  const weekendCommits = commits.filter((commit) => [0, 6].includes(new Date(commit.author.date).getDay())).length;
  if (weekendCommits / commits.length > 0.5) return "Weekend Hacker";
  if ((timeDistribution.night + timeDistribution.evening) / total > 0.55) return "Night Owl Coder";

  const byDay = commits.reduce<Record<string, number>>((days, commit) => {
    const day = new Date(commit.author.date).toISOString().split("T")[0];
    days[day] = (days[day] ?? 0) + 1;
    return days;
  }, {});
  const counts = Object.values(byDay);
  const average = counts.reduce((sum, count) => sum + count, 0) / (counts.length || 1);
  return counts.length > 1 && Math.max(...counts) > average * 3 ? "Burst Committer" : "Consistent Builder";
};

export const analyzeCommit = (message: string): AnalysisResult => {
  const result = scoreCommitMessage(message);
  const achievements: Achievement[] = [];
  if (result.conventionalType) achievements.push({ id: "conventional", name: "Convention Follower", description: "Uses a valid Conventional Commit type", icon: "CC" });
  if (result.score >= 9.5) achievements.push({ id: "precision", name: "Precision Writer", description: "Writes a clear, well-structured commit message", icon: "A+" });
  return { ...result, achievements };
};

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round1 = (value: number) => Math.round(value * 10) / 10;

export const calculateRepoStats = (commits: Commit[], repoName: string, totalCount: number): RepoStats => {
  const analyzedCommits = commits.slice(0, 50);
  const scores = analyzedCommits.map((commit) => commit.analysis?.score ?? 0);
  const averageScore = average(scores);
  const variance = average(scores.map((score) => (score - averageScore) ** 2));
  const consistencySubScore = Math.max(0, 10 - Math.sqrt(variance) * 1.75);
  const goodCommits = analyzedCommits.filter((commit) => commit.analysis?.status === "good").length;
  const warningCommits = analyzedCommits.filter((commit) => commit.analysis?.status === "warning").length;
  const badCommits = analyzedCommits.filter((commit) => commit.analysis?.status === "bad").length;
  const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const typeDistribution: Record<string, number> = {};

  analyzedCommits.forEach((commit) => {
    const hour = new Date(commit.author.date).getHours();
    if (hour >= 6 && hour < 12) timeDistribution.morning++;
    else if (hour >= 12 && hour < 18) timeDistribution.afternoon++;
    else if (hour >= 18) timeDistribution.evening++;
    else timeDistribution.night++;
    const type = commit.analysis?.conventionalType ?? "unstructured";
    typeDistribution[type] = (typeDistribution[type] ?? 0) + 1;
  });

  const formatScores = analyzedCommits.map((commit) => commit.analysis?.dimensions?.format ?? 0);
  const clarityScores = analyzedCommits.map((commit) => commit.analysis?.dimensions?.clarity ?? 0);
  const vagueCount = analyzedCommits.filter((commit) => !commit.analysis?.checklist?.noVagueWords).length;
  const unstructuredCount = analyzedCommits.filter((commit) => !commit.analysis?.checklist?.hasType).length;
  const nonImperativeCount = analyzedCommits.filter((commit) => !commit.analysis?.checklist?.imperativeVerb).length;
  const count = analyzedCommits.length || 1;
  const topIssues: string[] = [];
  const suggestions: string[] = [];

  if (unstructuredCount / count >= 0.25) {
    topIssues.push(`${Math.round(unstructuredCount / count * 100)}% of messages lack a valid Conventional Commit type`);
    suggestions.push("Adopt a small shared set of types and optional scopes for repository changes");
  }
  if (vagueCount / count >= 0.2) {
    topIssues.push(`${Math.round(vagueCount / count * 100)}% of subjects are vague or read like placeholders`);
    suggestions.push("Name the affected behavior or component instead of using generic subjects");
  }
  if (nonImperativeCount / count >= 0.25) {
    topIssues.push(`${Math.round(nonImperativeCount / count * 100)}% of subjects do not use imperative wording`);
    suggestions.push("Start subjects with an action such as add, fix, prevent, remove, or refactor");
  }
  if (consistencySubScore < 6) {
    topIssues.push("Commit-message quality varies substantially across the sampled history");
    suggestions.push("Document the expected commit format and enforce it before merge");
  }

  return {
    repoName,
    averageScore: round1(averageScore),
    totalCommits: totalCount,
    goodCommits,
    warningCommits,
    badCommits,
    lastAnalyzed: new Date().toISOString(),
    timeDistribution,
    typeDistribution,
    consistencyScore: round1(consistencySubScore * 10),
    developerType: getDeveloperType(timeDistribution, analyzedCommits),
    subScores: {
      clarity: round1(average(clarityScores)),
      consistency: round1(consistencySubScore),
      structure: round1(average(formatScores)),
    },
    topIssues,
    suggestions,
    confidenceLabel: analyzedCommits.length < 20 ? `Low confidence - based on ${analyzedCommits.length} commits` : `Based on ${analyzedCommits.length} recent commits`,
    achievements: analyzedCommits.flatMap((commit) => commit.analysis?.achievements ?? []),
  };
};
