/**
 * Application-wide constants
 */

export const CONSTANTS = {
  API: {
    COMMITS_PER_PAGE: 50,
    REPOS_PER_PAGE: 100,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    RETRY_ATTEMPTS: 3,
    RETRY_BASE_DELAY: 1000, // 1 second
  },
  STORAGE: {
    HISTORY_KEY: 'git_analyzer_history',
    RECENT_SEARCHES_KEY: 'recentSearches',
    THEME_KEY: 'theme',
    MAX_HISTORY_ITEMS: 20,
    MAX_RECENT_SEARCHES: 8,
  },
  ANIMATION: {
    STAGGER_DELAY: 0.05,
    TOAST_DURATION: 5000,
    DEBOUNCE_DELAY: 300,
  },
  SCORE: {
    GOOD_THRESHOLD: 8,
    WARNING_THRESHOLD: 5,
    PERFECT_SCORE: 10,
  },
  TIME_PERIODS: {
    MORNING_START: 6,
    AFTERNOON_START: 12,
    EVENING_START: 18,
    NIGHT_START: 0,
  },
} as const;

export const TYPE_COLORS: Record<string, string> = {
  feat: "#3b82f6",
  fix: "#ef4444",
  docs: "#eab308",
  style: "#ec4899",
  refactor: "#8b5cf6",
  test: "#22c55e",
  chore: "#64748b",
  perf: "#06b6d4",
  build: "#f97316",
  ci: "#84cc16",
  revert: "#ef4444",
} as const;

export const STATUS_COLORS = {
  good: "var(--status-good)",
  warning: "var(--status-warning)",
  bad: "var(--status-bad)",
} as const;

export const CONVENTIONAL_TYPES = [
  'feat', 'fix', 'docs', 'style', 'refactor', 
  'perf', 'test', 'build', 'ci', 'chore', 'revert'
] as const;

export const IMPERATIVE_VERBS = [
  'add', 'fix', 'update', 'remove', 'change', 
  'refactor', 'merge', 'create', 'delete', 'implement',
  'use', 'optimize', 'document', 'correct', 'handle', 
  'improve', 'clean', 'init', 'release', 'bump', 
  'revert', 'move', 'rename', 'allow', 'ensure',
  'prevent', 'avoid', 'simplify', 'upgrade', 'downgrade',
  'setup', 'configure', 'deploy', 'build', 'test',
  'verify', 'validate', 'check', 'log', 'start',
  'stop', 'finish', 'show', 'hide', 'render',
  'display', 'fetch', 'get', 'set', 'reset'
] as const;

export const VAGUE_WORDS = [
  'stuff', 'things', 'changes', 'minor', 'fixes',
  'misc', 'various', 'bug', 'code', 'temp', 'wip',
  'work', 'later', 'done', 'fixed', 'added'
] as const;
