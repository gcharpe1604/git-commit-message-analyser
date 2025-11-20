import type { Commit, CommitAnalysis } from '../types';

const VAGUE_WORDS = ['fix', 'update', 'changes', 'modify', 'edit', 'work', 'stuff', 'thing', 'misc'];
const GOOD_VERBS = ['add', 'remove', 'refactor', 'improve', 'fix', 'implement', 'update', 'delete', 'create', 'merge', 'revert', 'docs', 'style', 'test', 'chore', 'perf'];

export function analyzeCommits(commits: Commit[]): CommitAnalysis[] {
  return commits.map(commit => analyzeCommit(commit));
}

export function analyzeCommit(commit: Commit): CommitAnalysis {
  const firstLine = commit.message.split('\n')[0];
  const issues: string[] = [];
  let score = 100;

  // Check length
  if (firstLine.length < 10) {
    issues.push('Message is too short (less than 10 characters)');
    score -= 20;
  }
  if (firstLine.length > 72) {
    issues.push('Message exceeds 72 characters (conventional commit standard)');
    score -= 10;
  }

  // Check for vague words
  const lowerMessage = firstLine.toLowerCase();
  const hasVagueWord = VAGUE_WORDS.some(word => 
    lowerMessage.includes(word) && !hasContext(firstLine, word)
  );
  if (hasVagueWord) {
    issues.push('Message uses vague language without context');
    score -= 15;
  }

  // Check for proper verb at start
  const startsWithVerb = GOOD_VERBS.some(verb => 
    lowerMessage.startsWith(verb)
  );
  if (!startsWithVerb && !lowerMessage.match(/^[A-Z]/)) {
    issues.push('Message should start with a capital letter and imperative verb');
    score -= 15;
  }

  // Check for period at end
  if (firstLine.endsWith('.')) {
    issues.push('First line should not end with a period');
    score -= 5;
  }

  // Check for proper structure (if multi-line)
  const lines = commit.message.split('\n');
  if (lines.length > 1 && lines[1].trim() !== '') {
    issues.push('Second line should be blank (conventional commit format)');
    score -= 10;
  }

  const feedback = generateFeedback(firstLine, issues);

  return {
    ...commit,
    score: Math.max(0, score),
    feedback,
    issues,
  };
}

function hasContext(message: string, word: string): boolean {
  const index = message.toLowerCase().indexOf(word);
  if (index === -1) return false;
  
  // Check if word has more context around it
  const before = message.substring(0, index);
  const after = message.substring(index + word.length);
  
  return before.length > 5 || after.length > 5;
}

function generateFeedback(message: string, issues: string[]): string[] {
  const feedback: string[] = [];

  if (issues.length === 0) {
    feedback.push('✓ Excellent commit message!');
    return feedback;
  }

  if (issues.length <= 2) {
    feedback.push('✓ Good message with minor improvements needed');
  } else {
    feedback.push('⚠ Message needs improvement');
  }

  // Add specific suggestions
  if (message.length < 10) {
    feedback.push('💡 Add more detail to explain what changed');
  }

  if (!message.match(/^[A-Z]/)) {
    feedback.push('💡 Start with a capital letter');
  }

  if (message.match(/^(fix|update|changes)/i)) {
    feedback.push('💡 Be more specific about what was fixed or updated');
  }

  return feedback;
}
