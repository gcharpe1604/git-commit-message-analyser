import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { buildAnalysisPdf } from "../src/services/pdfReport.ts";
import type { Commit, RepoStats } from "../src/types/index.ts";

const commits: Commit[] = Array.from({ length: 18 }, (_, index) => ({
  sha: `${String(index).padStart(40, "a")}`,
  message: index % 3 === 0 ? "fix(auth): prevent duplicate token refresh" : index % 3 === 1 ? "Update things" : "docs(api): clarify retry behaviour for clients",
  author: { name: index % 2 ? "Jordan Lee" : "Avery Morgan", date: new Date(2026, 6, 15 - index).toISOString() },
  url: "https://github.com/example/product/commit/sample",
  analysis: {
    score: index % 3 === 0 ? 9.5 : index % 3 === 1 ? 4.8 : 8.7,
    status: index % 3 === 1 ? "bad" : "good",
    conventionalType: index % 3 === 1 ? undefined : index % 3 === 0 ? "fix" : "docs",
    feedback: index % 3 === 1 ? ["Use a Conventional Commit header.", "Replace vague wording with the affected behaviour."] : [],
  },
}));

const stats: RepoStats = {
  repoName: "example/product",
  averageScore: 7.7,
  totalCommits: 248,
  goodCommits: 12,
  warningCommits: 0,
  badCommits: 6,
  lastAnalyzed: new Date(2026, 6, 15).toISOString(),
  subScores: { clarity: 7.8, consistency: 6.9, structure: 8.1 },
  topIssues: ["33% of subjects are vague or read like placeholders", "Commit-message quality varies across the sampled history"],
  suggestions: ["Name the affected behavior or component instead of using generic subjects", "Document the expected commit format and enforce it before merge"],
  typeDistribution: { fix: 6, docs: 6, unstructured: 6 },
};

const report = await buildAnalysisPdf(stats, commits);
const bytes = Buffer.from(report.output("arraybuffer"));
assert.ok(bytes.length > 8_000, `expected a detailed PDF, received ${bytes.length} bytes`);
assert.equal(report.getNumberOfPages(), 3, `expected the sample report to fit in 3 pages, received ${report.getNumberOfPages()}`);
assert.equal(bytes.subarray(0, 4).toString(), "%PDF");

const output = process.argv[2];
if (output) { mkdirSync(dirname(output), { recursive: true }); writeFileSync(output, bytes); }
console.log(`PDF report verification passed: ${report.getNumberOfPages()} pages, ${bytes.length} bytes.`);
