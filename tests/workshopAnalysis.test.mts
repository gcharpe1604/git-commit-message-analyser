import assert from "node:assert/strict";
import { getWorkshopAnalysis } from "../src/utils/workshopAnalysis.ts";

assert.equal(getWorkshopAnalysis(""), null);

const valid = getWorkshopAnalysis("fix(auth): prevent duplicate token refresh");
assert.equal(valid?.status, "good");
assert.ok((valid?.score ?? 0) >= 8);
assert.deepEqual(valid?.feedback, []);

const invalid = getWorkshopAnalysis("fix bug");
assert.equal(invalid?.status, "bad");
assert.ok((invalid?.feedback.length ?? 0) > 0);
assert.ok(invalid?.feedback.some((finding) => finding.includes("Conventional Commit")));

console.log("Workshop analysis updates immediately for valid and invalid drafts.");
