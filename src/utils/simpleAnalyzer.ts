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
// HELPER FUNCTIONS
// ----------------------------------------------------------------------

/**
 * Infers the conventional commit type from the message content.
 * Used when the user hasn't explicitly provided a type.
 */
const inferType = (message: string): string => {
  const lower = message.toLowerCase();
  
  // Check for keywords to guess the type
  if (lower.includes('fix') || lower.includes('bug')) return 'fix';
  if (lower.includes('add') || lower.includes('feat') || lower.includes('new')) return 'feat';
  if (lower.includes('doc') || lower.includes('readme')) return 'docs';
  if (lower.includes('style') || lower.includes('format')) return 'style';
  if (lower.includes('refactor') || lower.includes('clean')) return 'refactor';
  if (lower.includes('test')) return 'test';
  if (lower.includes('perf')) return 'perf';
  if (lower.includes('build')) return 'build';
  if (lower.includes('ci')) return 'ci';
  
  // Default to 'chore' if no specific keywords found
  return 'chore';
};

// ----------------------------------------------------------------------
// MAIN ANALYZER
// ----------------------------------------------------------------------

/**
 * Analyzes a commit message using simple rules:
 * 1. Must follow Conventional Commits (type: subject)
 * 2. Must not be too short
 * 3. Must not use vague words
 * 4. Should start with an imperative verb
 * 5. Should not end with a period
 */
export const analyzeCommit = (message: string): AnalysisResult => {
  // Initialize result
  let score = 10;
  const feedback: string[] = [];
  const achievements: Achievement[] = [];
  let conventionalType: string | undefined;

  // Basic cleanup
  const trimmedMessage = message.trim();
  const firstLine = trimmedMessage.split('\n')[0];
  
  // 0. Empty Check
  if (!firstLine) {
    return {
      score: 0,
      feedback: ["Message is empty."],
      status: 'bad',
    };
  }

  // 1. Check for Conventional Commit Type (e.g., "feat:", "fix:")
  const conventionalMatch = firstLine.match(/^([a-z]+)(\(.*\))?:/);
  
  if (conventionalMatch) {
    const type = conventionalMatch[1];
    
    // Validate if the type is a standard one
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

  // 2. Length Check (Too short?)
  if (firstLine.length < 10) {
    score -= 2;
    feedback.push("Message is too short.");
  }

  // 3. Vague Words Check (e.g., "stuff", "things")
  const lowerFirstLine = firstLine.toLowerCase();
  const foundVagueWord = VAGUE_WORDS.find(w => lowerFirstLine.includes(w));
  
  if (foundVagueWord) {
    score -= 2;
    feedback.push(`Avoid vague words like "${foundVagueWord}". Be specific.`);
  }

  // 4. Imperative Mood Check (e.g., "Add" instead of "Added")
  // Extract the subject part (after the type)
  let subject = conventionalType ? firstLine.split(':')[1]?.trim() || '' : firstLine;
  const firstWord = subject.split(' ')[0].toLowerCase();
  
  // Only check if we have a subject
  if (subject && !IMPERATIVE_VERBS.includes(firstWord as any)) {
    score -= 1;
    feedback.push("Start subject with an imperative verb (e.g., 'add', 'fix', 'update').");
  }

  // 5. Trailing Period Check
  if (firstLine.endsWith('.')) {
    score -= 1;
    feedback.push("Remove trailing period.");
  }

  // Calculate Final Status
  let status: 'good' | 'warning' | 'bad' = 'good';
  if (score < 6) status = 'bad';
  else if (score < 8) status = 'warning';

  // Check for Perfection
  if (score === 10) {
    achievements.push({
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Perfect commit message',
      icon: '🌟'
    });
  }

  // Generate a Better Suggestion (if score is low)
  let suggestion = "";
  if (score < 10) {
    const type = conventionalType || inferType(firstLine);
    let newSubject = subject || firstLine;

    // Fix: Remove trailing period
    if (newSubject.endsWith('.')) {
      newSubject = newSubject.slice(0, -1);
    }

    // Construct the suggestion
    suggestion = `${type}: ${newSubject}`;
    
    // Avoid suggesting the exact same thing
    if (suggestion === firstLine) {
      suggestion = "";
    }
  }

  return {
    score: Math.max(0, score),
    feedback,
    status,
    conventionalType,
    achievements,
    suggestion: suggestion || undefined
  };
};
