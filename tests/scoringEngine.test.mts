import assert from "node:assert/strict";
import { scoreCommitMessage } from "../src/utils/scoringEngine.ts";

const strong = scoreCommitMessage("feat(auth): prevent duplicate token refresh");
assert.equal(strong.status, "good");
assert.ok(strong.score >= 9, `expected a strong score, received ${strong.score}`);
assert.equal(strong.conventionalType, "feat");
assert.equal(strong.feedback.length, 0);

const complete = scoreCommitMessage("fix(auth)!: prevent expired sessions from refreshing\n\nExplain why refresh is blocked after expiry.");
assert.equal(complete.score, 10);
assert.equal(complete.checklist.hasType, true);

const vague = scoreCommitMessage("fix bug");
assert.equal(vague.status, "bad");
assert.ok(vague.score < 6);
assert.equal(vague.checklist.noVagueWords, false);

const readableUnstructured = scoreCommitMessage("Add retry handling for uploads");
assert.equal(readableUnstructured.status, "warning");
assert.ok(readableUnstructured.score >= 6 && readableUnstructured.score < 8);
assert.equal(readableUnstructured.checklist.hasType, false);

const placeholder = scoreCommitMessage("WIP");
assert.equal(placeholder.status, "bad");
assert.ok(placeholder.score < vague.score);

const invalidType = scoreCommitMessage("feature(auth): add session timeout handling");
assert.equal(invalidType.conventionalType, undefined);
assert.ok(invalidType.feedback.some((item) => item.includes("unknown type")));

const merge = scoreCommitMessage("Merge pull request #42 from team/session-fix");
assert.equal(merge.status, "good");
assert.equal(merge.feedback.length, 0);

const long = scoreCommitMessage(`fix(api): ${"prevent duplicate request retries ".repeat(4)}`);
assert.ok(long.feedback.some((item) => item.includes("72 characters")));
assert.ok(long.score < strong.score);

console.log("Scoring verification passed for 8 representative commit-message cases.");
