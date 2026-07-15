export interface ScoreDimensions {
  format: number;
  clarity: number;
  style: number;
  context: number;
  hygiene: number;
}

export interface CommitScore {
  score: number;
  status: "good" | "warning" | "bad";
  feedback: string[];
  conventionalType?: string;
  subject: string;
  suggestion?: string;
  checklist: {
    hasType: boolean;
    subjectLength: boolean;
    imperativeVerb: boolean;
    noVagueWords: boolean;
    noPeriod: boolean;
  };
  dimensions: ScoreDimensions;
}

const CONVENTIONAL_TYPES = new Set([
  "feat", "fix", "docs", "style", "refactor", "perf",
  "test", "build", "ci", "chore", "revert",
]);

const IMPERATIVE_VERBS = new Set([
  "add", "allow", "avoid", "build", "bump", "change", "clean", "configure",
  "correct", "create", "delete", "deploy", "document", "enable", "ensure",
  "fetch", "fix", "handle", "hide", "implement", "improve", "log", "make",
  "merge", "move", "optimize", "prevent", "refactor", "release", "remove",
  "rename", "render", "replace", "reset", "resolve", "restore", "return",
  "revert", "set", "show", "simplify", "support", "test", "track", "update",
  "upgrade", "use", "validate", "verify",
]);

const VAGUE_TERMS = new Set([
  "changes", "misc", "minor", "stuff", "temp", "things", "various", "wip",
]);

const PLACEHOLDER_PATTERN = /^(?:fix(?:es)?|update|changes?|wip|work|misc|temp|done|test|commit|checkpoint)(?:\s+(?:bug|code|stuff|things|changes?))?$/i;
const GENERATED_GIT_MESSAGE = /^(?:Merge (?:branch|pull request|remote-tracking branch)|Revert ".+")/;
const HEADER_PATTERN = /^([a-z]+)(?:\(([a-z0-9._/-]+)\))?(!)?:\s+(.+)$/;

const clamp10 = (value: number, maximum: number) =>
  Math.round((Math.max(0, Math.min(value, maximum)) / maximum) * 100) / 10;

const inferType = (subject: string) => {
  const lower = subject.toLowerCase();
  if (/\b(?:fix|prevent|resolve|correct|repair)\b/.test(lower)) return "fix";
  if (/\b(?:add|create|implement|enable|support)\b/.test(lower)) return "feat";
  if (/\b(?:doc|readme|guide)\b/.test(lower)) return "docs";
  if (/\b(?:test|spec|coverage)\b/.test(lower)) return "test";
  if (/\b(?:speed|performance|optimize)\b/.test(lower)) return "perf";
  if (/\b(?:refactor|simplify|restructure)\b/.test(lower)) return "refactor";
  if (/\b(?:build|dependency|dependencies)\b/.test(lower)) return "build";
  if (/\b(?:pipeline|workflow|ci)\b/.test(lower)) return "ci";
  return "chore";
};

export const scoreCommitMessage = (message: string): CommitScore => {
  const trimmed = message.trim();
  if (!trimmed) {
    return {
      score: 0,
      status: "bad",
      feedback: ["Write a subject line that explains the change."],
      subject: "",
      checklist: { hasType: false, subjectLength: false, imperativeVerb: false, noVagueWords: false, noPeriod: true },
      dimensions: { format: 0, clarity: 0, style: 0, context: 0, hygiene: 0 },
    };
  }

  const lines = trimmed.split(/\r?\n/);
  const header = lines[0] ?? "";
  const body = lines.slice(1).join("\n").trim();
  const generated = GENERATED_GIT_MESSAGE.test(header);
  if (generated) {
    return {
      score: 8.5,
      status: "good",
      feedback: [],
      subject: header,
      checklist: { hasType: true, subjectLength: header.length <= 72, imperativeVerb: true, noVagueWords: true, noPeriod: !header.endsWith(".") },
      dimensions: { format: 8.5, clarity: 8, style: 9, context: 8, hygiene: 9 },
    };
  }

  const match = header.match(HEADER_PATTERN);
  const parsedType = match?.[1];
  const validType = Boolean(parsedType && CONVENTIONAL_TYPES.has(parsedType));
  const subject = (match?.[4] ?? header).trim();
  const words = subject.match(/[a-z0-9]+(?:[-'][a-z0-9]+)*/gi) ?? [];
  const firstWord = (words[0] ?? "").toLowerCase();
  const imperative = IMPERATIVE_VERBS.has(firstWord);
  const vagueTerm = words.find((word) => VAGUE_TERMS.has(word.toLowerCase()));
  const placeholder = PLACEHOLDER_PATTERN.test(subject);
  const feedback: string[] = [];

  let formatPoints = 0;
  if (match) formatPoints += 10;
  else feedback.push("Use a Conventional Commit header such as feat(scope): add capability.");
  if (validType) formatPoints += 6;
  else if (parsedType) feedback.push(`Replace the unknown type "${parsedType}" with a standard type.`);
  if (match && (!match[2] || /^[a-z0-9._/-]+$/.test(match[2]))) formatPoints += 4;

  let clarityPoints = 0;
  if (subject.length >= 15 && subject.length <= 72) clarityPoints += 10;
  else if (subject.length >= 8 && subject.length <= 90) clarityPoints += 5;
  else feedback.push(subject.length < 8 ? "Make the subject specific enough to identify the change." : "Keep the subject line at 72 characters or fewer.");
  if (words.length >= 4) clarityPoints += 8;
  else if (words.length >= 2) clarityPoints += 4;
  if (!vagueTerm) clarityPoints += 8;
  else feedback.push(`Replace the vague word "${vagueTerm}" with the affected behavior or component.`);
  if (!placeholder) clarityPoints += 4;
  else feedback.push("Replace the placeholder subject with what changed and where.");

  let stylePoints = 0;
  if (imperative) stylePoints += 10;
  else feedback.push("Start the subject with an imperative verb, such as add, fix, remove, or prevent.");
  if (!subject.endsWith(".")) stylePoints += 4;
  else feedback.push("Remove the trailing period from the subject line.");
  if (subject !== subject.toUpperCase() || !/[A-Z]/.test(subject)) stylePoints += 3;
  else feedback.push("Avoid an all-caps subject line.");
  if (!match || /^[a-z0-9]/.test(subject)) stylePoints += 3;
  else feedback.push("Start a Conventional Commit subject with lowercase text.");

  let contextPoints = 0;
  if (words.length >= 3 && !placeholder) contextPoints += 10;
  if (body.length >= 20) contextPoints += 5;
  else if (words.length >= 6) contextPoints += 5;

  let hygienePoints = 0;
  if (message === message.trim()) hygienePoints += 3;
  if (!/ {2,}/.test(header)) hygienePoints += 3;
  if (header.length <= 72) hygienePoints += 5;
  if (!body || lines[1] === "") hygienePoints += 4;
  else feedback.push("Separate the subject and body with a blank line.");

  const dimensions = {
    format: clamp10(formatPoints, 20),
    clarity: clamp10(clarityPoints, 30),
    style: clamp10(stylePoints, 20),
    context: clamp10(contextPoints, 15),
    hygiene: clamp10(hygienePoints, 15),
  };
  const score = Math.round((formatPoints + clarityPoints + stylePoints + contextPoints + hygienePoints)) / 10;
  const status = score >= 8 ? "good" : score >= 6 ? "warning" : "bad";

  let cleanedSubject = subject.replace(/\.$/, "").replace(/\s{2,}/g, " ");
  if (match && cleanedSubject) cleanedSubject = cleanedSubject.charAt(0).toLowerCase() + cleanedSubject.slice(1);
  const suggestedType = validType ? parsedType : inferType(cleanedSubject);
  const scope = match?.[2] ? `(${match[2]})` : "";
  const breaking = match?.[3] ?? "";
  const suggestion = cleanedSubject ? `${suggestedType}${scope}${breaking}: ${cleanedSubject}` : undefined;

  return {
    score,
    status,
    feedback: [...new Set(feedback)],
    conventionalType: validType ? parsedType : undefined,
    subject,
    suggestion: suggestion !== header ? suggestion : undefined,
    checklist: {
      hasType: validType,
      subjectLength: subject.length >= 15 && header.length <= 72,
      imperativeVerb: imperative,
      noVagueWords: !vagueTerm && !placeholder,
      noPeriod: !subject.endsWith("."),
    },
    dimensions,
  };
};
