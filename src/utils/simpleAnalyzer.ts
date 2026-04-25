import type { AnalysisResult, Achievement } from '../types';
import { CONVENTIONAL_TYPES } from '../constants';

// ----------------------------------------------------------------------
// CONSTANTS (Defined locally for simplicity)
// ----------------------------------------------------------------------

const IMPERATIVE_VERBS = [
  'add', 'fix', 'update', 'remove', 'change', 
  'refactor', 'merge', 'create', 'delete', 'revert', 
  'move', 'rename', 'optimize', 'document', 'test', 
  'build', 'ci', 'release', 'bump'
];

const VAGUE_WORDS = [
  'stuff', 'things', 'changes', 'minor', 'fixes',
  'misc', 'various', 'bug', 'code', 'temp', 'wip',
  'work', 'later', 'done', 'fixed', 'added'
];

// ----------------------------------------------------------------------
// DEVELOPER TYPE LOGIC
// ----------------------------------------------------------------------

/**
 * Determines a "Developer Type" from commit metadata.
 * Simple, explainable heuristics — no ML needed.
 */
const getDeveloperType = (
  timeDistribution: { morning: number; afternoon: number; evening: number; night: number },
  commits: import('../types').Commit[]
): string => {
  const total = timeDistribution.morning + timeDistribution.afternoon + timeDistribution.evening + timeDistribution.night;
  if (total === 0) return 'Consistent Builder';

  // Rule 1: Weekend Hacker — majority of commits on Sat/Sun
  const weekendCommits = commits.filter(c => {
    const day = new Date(c.author.date).getDay();
    return day === 0 || day === 6;
  }).length;
  if (commits.length > 0 && weekendCommits / commits.length > 0.5) return 'Weekend Hacker';

  // Rule 2: Night Owl Coder — majority of commits in evening/night
  const nightRatio = (timeDistribution.night + timeDistribution.evening) / total;
  if (nightRatio > 0.55) return 'Night Owl Coder';

  // Rule 3: Burst Committer — daily commit counts have high variance (spikes)
  const commitsByDay: Record<string, number> = {};
  commits.forEach(c => {
    const day = new Date(c.author.date).toISOString().split('T')[0];
    commitsByDay[day] = (commitsByDay[day] || 0) + 1;
  });
  const dayCounts = Object.values(commitsByDay);
  if (dayCounts.length > 1) {
    const avgPerDay = dayCounts.reduce((a, b) => a + b, 0) / dayCounts.length;
    const maxPerDay = Math.max(...dayCounts);
    // If the peak day has 3x or more commits than average, it's a burst pattern
    if (maxPerDay > avgPerDay * 3) return 'Burst Committer';
  }

  // Default: Consistent Builder
  return 'Consistent Builder';
};

// ----------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------

/**
 * Infers the conventional commit type from the message content.
 * Used when the user hasn't explicitly provided a type.
 */
const inferType = (message: string): string => {
  const lower = message.toLowerCase();
  
  if (lower.includes('fix') || lower.includes('bug')) return 'fix';
  if (lower.includes('add') || lower.includes('feat') || lower.includes('new')) return 'feat';
  if (lower.includes('doc') || lower.includes('readme')) return 'docs';
  if (lower.includes('style') || lower.includes('format')) return 'style';
  if (lower.includes('refactor') || lower.includes('clean')) return 'refactor';
  if (lower.includes('test')) return 'test';
  if (lower.includes('perf')) return 'perf';
  if (lower.includes('build')) return 'build';
  if (lower.includes('ci')) return 'ci';
  
  return 'chore';
};

// ----------------------------------------------------------------------
// MAIN ANALYZER
// ----------------------------------------------------------------------

export const analyzeCommit = (message: string): AnalysisResult => {
  let score = 10;
  const feedback: string[] = [];
  const achievements: Achievement[] = [];
  let conventionalType: string | undefined;

  const trimmedMessage = message.trim();
  const firstLine = trimmedMessage.split('\n')[0];
  
  if (!firstLine) {
    return {
      score: 0,
      feedback: ["Message is empty."],
      status: 'bad',
    };
  }

  const conventionalMatch = firstLine.match(/^([a-z]+)(\(.*\))?:/);
  
  if (conventionalMatch) {
    const type = conventionalMatch[1];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (CONVENTIONAL_TYPES.includes(type as any)) {
      conventionalType = type;
      achievements.push({
        id: 'conventional',
        name: 'Convention Follower',
        description: 'Follows Conventional Commits',
        icon: '📋'
      });
    } else {
      score -= 2;
      feedback.push(`Unknown type "${type}". Use standard types like feat, fix, docs.`);
    }
  } else {
    score -= 2;
    feedback.push("Missing conventional type (e.g., 'feat:', 'fix:').");
  }

  if (firstLine.length < 10) {
    score -= 2;
    feedback.push("Message is too short.");
  }

  const lowerFirstLine = firstLine.toLowerCase();
  const foundVagueWord = VAGUE_WORDS.find(w => lowerFirstLine.includes(w));
  
  if (foundVagueWord) {
    score -= 2;
    feedback.push(`Avoid vague words like "${foundVagueWord}". Be specific.`);
  }

  const subject = conventionalType ? firstLine.split(':')[1]?.trim() || '' : firstLine;
  const firstWord = subject.split(' ')[0].toLowerCase();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (subject && !IMPERATIVE_VERBS.includes(firstWord as any)) {
    score -= 1;
    feedback.push("Start subject with an imperative verb (e.g., 'add', 'fix', 'update').");
  }

  if (firstLine.endsWith('.')) {
    score -= 1;
    feedback.push("Remove trailing period.");
  }

  let status: 'good' | 'warning' | 'bad' = 'good';
  if (score < 6) status = 'bad';
  else if (score < 8) status = 'warning';

  if (score === 10) {
    achievements.push({
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Perfect commit message',
      icon: '🌟'
    });
  }

  let suggestion = "";
  if (score < 10) {
    const type = conventionalType || inferType(firstLine);
    let newSubject = subject || firstLine;
    if (newSubject.endsWith('.')) newSubject = newSubject.slice(0, -1);
    suggestion = `${type}: ${newSubject}`;
    if (suggestion === firstLine) suggestion = "";
  }

  return {
    score: Math.max(0, score),
    feedback,
    status,
    conventionalType,
    achievements,
    suggestion: suggestion || undefined,
    checklist: {
      hasType: !!conventionalType,
      subjectLength: firstLine.length >= 10,
      imperativeVerb: !!(subject && IMPERATIVE_VERBS.includes(firstWord)),
      noVagueWords: !foundVagueWord,
      noPeriod: !firstLine.endsWith('.')
    }
  };
};

/**
 * Calculates aggregated statistics for a repository
 */
export const calculateRepoStats = (
  commits: import('../types').Commit[],
  repoName: string,
  totalCount: number
): import('../types').RepoStats => {
  const analyzedCommits = commits.slice(0, 50);

  const goodCommits = analyzedCommits.filter(c => c.analysis?.status === 'good').length;
  const warningCommits = analyzedCommits.filter(c => c.analysis?.status === 'warning').length;
  const badCommits = analyzedCommits.filter(c => c.analysis?.status === 'bad').length;

  const averageScore = analyzedCommits.length > 0 
    ? analyzedCommits.reduce((acc, curr) => acc + (curr.analysis?.score || 0), 0) / analyzedCommits.length
    : 0;

  const allAchievements = analyzedCommits.flatMap(c => c.analysis?.achievements || []);

  const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const typeDistribution: Record<string, number> = {};
  
  const scores = analyzedCommits.map(c => c.analysis?.score || 0);
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / (scores.length || 1);
  const consistencyScore = Math.max(0, 100 - (Math.sqrt(variance) * 20));

  analyzedCommits.forEach(c => {
    const hour = new Date(c.author.date).getHours();
    if (hour >= 6 && hour < 12) timeDistribution.morning++;
    else if (hour >= 12 && hour < 18) timeDistribution.afternoon++;
    else if (hour >= 18 && hour < 24) timeDistribution.evening++;
    else timeDistribution.night++;

    if (c.analysis?.conventionalType) {
      typeDistribution[c.analysis.conventionalType] = (typeDistribution[c.analysis.conventionalType] || 0) + 1;
    } else {
      typeDistribution['unknown'] = (typeDistribution['unknown'] || 0) + 1;
    }
  });

  const developerType = getDeveloperType(timeDistribution, analyzedCommits);

  return {
    repoName,
    averageScore,
    totalCommits: totalCount,
    goodCommits,
    warningCommits,
    badCommits,
    lastAnalyzed: new Date().toISOString(),
    timeDistribution,
    typeDistribution,
    consistencyScore,
    developerType,
    achievements: allAchievements,
  };
};
