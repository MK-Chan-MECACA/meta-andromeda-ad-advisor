import { test } from "node:test";
import assert from "node:assert/strict";
import { analysisResultSchema } from "./analysis-schema.ts";
import { sampleAnalysis } from "./sample-analysis.ts";

test("landing sample analysis satisfies the result schema", () => {
  const parsed = analysisResultSchema.safeParse(sampleAnalysis);
  assert.ok(parsed.success, parsed.error?.message);
});
