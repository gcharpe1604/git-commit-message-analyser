import type { AnalysisResult, Achievement } from '../types';
import { CONVENTIONAL_TYPES, IMPERATIVE_VERBS, VAGUE_WORDS, CONSTANTS } from '../constants';

const VERB_MAP: Record<string, string> = {
  'added': 'Add', 'adding': 'Add', 'adds': 'Add',
  'fixed': 'Fix', 'fixing': 'Fix', 'fixes': 'Fix',
  'updated': 'Update', 'updating': 'Update', 'updates': 'Update',
  'removed': 'Remove', 'removing': 'Remove', 'removes': 'Remove',
  'changed': 'Change', 'changing': 'Change', 'changes': 'Change',
  'created': 'Create', 'creating': 'Create', 'creates': 'Create',
  'deleted': 'Delete', 'deleting': 'Delete', 'deletes': 'Delete',
  'refactored': 'Refactor', 'refactoring': 'Refactor', 'refactors': 'Refactor',
  'merged': 'Merge', 'merging': 'Merge', 'merges': 'Merge',
  'improved': 'Improve', 'improving': 'Improve', 'improves': 'Improve',
  'corrected': 'Correct', 'correcting': 'Correct', 'corrects': 'Correct',
  'moved': 'Move', 'moving': 'Move', 'moves': 'Move',
  'renamed': 'Rename', 'renaming': 'Rename', 'renames': 'Rename',
  'used': 'Use', 'using': 'Use', 'uses': 'Use',
  'optimized': 'Optimize', 'optimizing': 'Optimize', 'optimizes': 'Optimize',
  'documented': 'Document', 'documenting': 'Document', 'documents': 'Document',
  'handled': 'Handle', 'handling': 'Handle', 'handles': 'Handle',
  'cleaned': 'Clean', 'cleaning': 'Clean', 'cleans': 'Clean',
  'initial': 'Init', 'initialized': 'Init', 'initializing': 'Init',
  'released': 'Release', 'releasing': 'Release', 'releases': 'Release',
  'bumped': 'Bump', 'bumping': 'Bump', 'bumps': 'Bump',
  'reverted': 'Revert', 'reverting': 'Revert', 'reverts': 'Revert',
  'allowed': 'Allow', 'allowing': 'Allow', 'allows': 'Allow',
  'ensured': 'Ensure', 'ensuring': 'Ensure', 'ensures': 'Ensure',
  'prevented': 'Prevent', 'preventing': 'Prevent', 'prevents': 'Prevent',
  'avoided': 'Avoid', 'avoiding': 'Avoid', 'avoids': 'Avoid',
  'simplified': 'Simplify', 'simplifying': 'Simplify', 'simplifies': 'Simplify',
  'upgraded': 'Upgrade', 'upgrading': 'Upgrade', 'upgrades': 'Upgrade',
  'downgraded': 'Downgrade', 'downgrading': 'Downgrade', 'downgrades': 'Downgrade',
  'setup': 'Setup', 'configuring': 'Configure', 'configures': 'Configure',
  'deployed': 'Deploy', 'deploying': 'Deploy', 'deploys': 'Deploy',
  'built': 'Build', 'building': 'Build', 'builds': 'Build',
  'tested': 'Test', 'testing': 'Test', 'tests': 'Test',
  'verified': 'Verify', 'verifying': 'Verify', 'verifies': 'Verify',
  'validated': 'Validate', 'validating': 'Validate', 'validates': 'Validate',
  'checked': 'Check', 'checking': 'Check', 'checks': 'Check',
  'logged': 'Log', 'logging': 'Log', 'logs': 'Log',
  'started': 'Start', 'starting': 'Start', 'starts': 'Start',
  'stopped': 'Stop', 'stopping': 'Stop', 'stops': 'Stop',
  'finished': 'Finish', 'finishing': 'Finish', 'finishes': 'Finish',
  'showed': 'Show', 'showing': 'Show', 'shows': 'Show',
  'hid': 'Hide', 'hiding': 'Hide', 'hides': 'Hide',
  'rendered': 'Render', 'rendering': 'Render', 'renders': 'Render',
  'displayed': 'Display', 'displaying': 'Display', 'displays': 'Display',
  'fetched': 'Fetch', 'fetching': 'Fetch', 'fetches': 'Fetch',
  'got': 'Get', 'getting': 'Get', 'gets': 'Get',
  'set': 'Set', 'setting': 'Set', 'sets': 'Set',
  'reset': 'Reset', 'resetting': 'Reset', 'resets': 'Reset',
};

const inferConventionalType = (message: string): string | null => {
  const lower = message.toLowerCase();
  if (lower.includes('fix') || lower.includes('bug') || lower.includes('issue') || lower.includes('resolve') || lower.includes('correct')) return 'fix';
  if (lower.includes('feat') || lower.includes('add') || lower.includes('new') || lower.includes('implement') || lower.includes('create')) return 'feat';
  if (lower.includes('doc') || lower.includes('readme') || lower.includes('comment')) return 'docs';
  if (lower.includes('style') || lower.includes('format') || lower.includes('lint') || lower.includes('prettier')) return 'style';
  if (lower.includes('refactor') || lower.includes('clean') || lower.includes('structure') || lower.includes('simplify')) return 'refactor';
  if (lower.includes('test') || lower.includes('spec') || lower.includes('coverage')) return 'test';
  if (lower.includes('perf') || lower.includes('optimize') || lower.includes('speed') || lower.includes('fast')) return 'perf';
  if (lower.includes('build') || lower.includes('dep') || lower.includes('npm') || lower.includes('yarn') || lower.includes('package')) return 'build';
  if (lower.includes('ci') || lower.includes('workflow') || lower.includes('action') || lower.includes('pipeline')) return 'ci';
  if (lower.includes('chore') || lower.includes('misc') || lower.includes('config') || lower.includes('setup')) return 'chore';
  if (lower.includes('revert') || lower.includes('undo')) return 'revert';
  return null;
};

export const analyzeCommit = (message: string): AnalysisResult => {
  let score = 10;
  const feedback: string[] = [];
  const achievements: Achievement[] = [];
  let conventionalType: string | undefined;

  const trimmedMessage = message.trim();
  const lines = trimmedMessage.split('\n');
  const firstLine = lines[0];
  const lowerFirstLine = firstLine.toLowerCase();
  const hasBody = lines.length > 1 && lines.slice(1).some(l => l.trim().length > 0);

  // ----------------------------------------------------------------------
  // 0. FATAL CHECKS (Immediate low score)
  // ----------------------------------------------------------------------
  
  // WIP Check
  if (lowerFirstLine.includes('wip') || lowerFirstLine.includes('work in progress')) {
    return {
      score: 3,
      feedback: ["'WIP' commits should not be pushed to shared branches. Finish the work or squash commits."],
      status: 'bad',
      achievements: []
    };
  }

  // Empty or extremely short check
  if (firstLine.length < 5) {
    return {
      score: 2,
      feedback: ["Message is too short to be meaningful."],
      status: 'bad',
      achievements: []
    };
  }

  // ----------------------------------------------------------------------
  // 1. PROFESSIONAL PATTERN RECOGNITION
  // ----------------------------------------------------------------------
  
  // Check for Conventional Commits
  const conventionalMatch = message.match(/^([a-z]+)(\(.*\))?:/);
  if (conventionalMatch) {
    const type = conventionalMatch[1];
    if (CONVENTIONAL_TYPES.includes(type as typeof CONVENTIONAL_TYPES[number])) {
      conventionalType = type;
      achievements.push({
        id: 'conventional',
        name: 'Convention Follower',
        description: 'Follows Conventional Commits standard',
        icon: '📋'
      });
    } else {
      score -= 1;
      feedback.push(`"${type}" is not a standard type. Consider: ${CONVENTIONAL_TYPES.slice(0, 5).join(', ')}...`);
    }
  } 

  // Check for "Professional Sentence" style (e.g., "Fix login bug", "Update README")
  // This is valid even without conventional type if it's clear.
  const isProfessionalSentence = /^[A-Z][a-z]+ .*/.test(firstLine);
  
  if (!conventionalType) {
    if (isProfessionalSentence) {
      // Small penalty for missing conventional type, but acceptable
      score -= 1;
      feedback.push("Tip: Adding a type (e.g., 'feat:', 'fix:') helps with automated changelogs.");
    } else {
      // Larger penalty if it's neither conventional nor a proper sentence
      score -= 2;
      feedback.push("Start with a capitalized verb or use a conventional type (e.g., 'Fix...', 'feat: ...').");
    }
  }

  // ----------------------------------------------------------------------
  // 2. CLARITY & SPECIFICITY (The "Professional" Check)
  // ----------------------------------------------------------------------

  // Vague Words Check (Context Aware)
  const vagueMatch = VAGUE_WORDS.find(w => lowerFirstLine.includes(w));
  if (vagueMatch) {
    // Exception: "Fixes" followed by issue number is NOT vague
    const isIssueFix = /fix(es|ed)?\s+(#\d+|[a-z]+-\d+)/i.test(firstLine);
    
    if (!isIssueFix) {
      score -= 2;
      feedback.push(`"${vagueMatch}" is too vague. Be specific about what changed.`);
    }
  }

  // Length Check
  if (firstLine.length < 10) {
    // Exception: "Fix typo", "Update deps" are short but valid
    const wordCount = firstLine.split(' ').length;
    if (wordCount < 3) {
      score -= 2;
      feedback.push("Too short. Add a bit more context.");
    }
  } else if (firstLine.length > 72) {
    score -= 2;
    feedback.push("Subject line exceeds 72 characters. Keep it concise.");
  }

  // ----------------------------------------------------------------------
  // 3. IMPERATIVE MOOD (Command Style)
  // ----------------------------------------------------------------------
  let subjectPart = conventionalType ? firstLine.split(':')[1]?.trim() || '' : firstLine;
  const firstWord = subjectPart.split(' ')[0];
  const lowerFirstWord = firstWord.toLowerCase();
  
  const isImperative = IMPERATIVE_VERBS.includes(lowerFirstWord as any);
  const mappedVerb = VERB_MAP[lowerFirstWord];

  if (!isImperative && !mappedVerb && subjectPart.length > 0) {
    // Only penalize if it really looks like a verb was intended but missed
    // e.g. "Login page" (noun) vs "Add login page" (verb)
    // We'll be lenient here to avoid false positives on nouns
    score -= 1;
    feedback.push(`Start with an imperative verb (e.g., "Add", "Fix", "Update").`);
  } else if (mappedVerb && mappedVerb.toLowerCase() !== lowerFirstWord) {
     score -= 1;
     feedback.push(`Use "${mappedVerb}" instead of "${firstWord}" (imperative mood).`);
  }

  // ----------------------------------------------------------------------
  // 4. BONUSES & ACHIEVEMENTS
  // ----------------------------------------------------------------------

  // Issue Reference Check
  const hasIssueRef = /#\d+|[A-Z]+-\d+/.test(firstLine) || (hasBody && /#\d+|[A-Z]+-\d+/.test(message));
  if (hasIssueRef) {
    score += 1; 
    achievements.push({
      id: 'linked',
      name: 'Issue Linker',
      description: 'References an issue or ticket',
      icon: '🔗'
    });
  }

  // Detailed Body Check
  if (hasBody) {
    score += 1;
    achievements.push({
      id: 'storyteller',
      name: 'Storyteller',
      description: 'Provides detailed context',
      icon: '📖'
    });
  }

  // Professional Style Achievement
  // Awarded if score is high and message is clean, even if not conventional
  if (score >= 8 && !conventionalType && isProfessionalSentence) {
    achievements.push({
      id: 'professional',
      name: 'Professional Style',
      description: 'Clean, imperative, and concise.',
      icon: '👔'
    });
  }

  // ----------------------------------------------------------------------
  // 5. FINAL CALCULATIONS
  // ----------------------------------------------------------------------

  // Formatting Checks (Minor)
  if (firstLine.endsWith('.')) {
    // No score penalty, just feedback
    feedback.push("Tip: No trailing period needed in subject.");
  }

  // Status Determination
  let status: 'good' | 'warning' | 'bad' = 'good';
  if (score < 6) status = 'bad';
  else if (score < 8) status = 'warning';

  // Perfect Score Achievement
  if (score >= CONSTANTS.SCORE.PERFECT_SCORE) {
    achievements.push({
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Flawless commit message',
      icon: '🌟'
    });
  }

  // ----------------------------------------
  // SMART SUGGESTION GENERATION
  // ----------------------------------------
  let suggestion = "";
  
  if (score < 10) {
    const typeToUse = conventionalType || inferConventionalType(firstLine) || 'chore';
    let subjectToUse = subjectPart || firstLine;
    
    if (subjectToUse.endsWith('.')) subjectToUse = subjectToUse.slice(0, -1);
    
    const subjectWords = subjectToUse.split(' ');
    if (subjectWords.length > 0) {
      const firstW = subjectWords[0].toLowerCase();
      if (VERB_MAP[firstW]) {
        subjectWords[0] = VERB_MAP[firstW].toLowerCase();
      } else {
        subjectWords[0] = firstW;
      }
      subjectToUse = subjectWords.join(' ');
    }

    suggestion = `${typeToUse}: ${subjectToUse}`;

    if (firstLine.length < 10 || (vagueMatch && !hasIssueRef)) {
       suggestion = `${typeToUse}: ${subjectToUse} <context>`;
    }
  }

  const result: AnalysisResult = {
    score: Math.min(10, Math.max(0, score)), // Cap at 10, min 0
    feedback,
    status,
    conventionalType,
    achievements,
    suggestion: suggestion !== firstLine ? suggestion : undefined
  };

  return result;
};
