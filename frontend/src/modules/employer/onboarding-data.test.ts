import assert from "node:assert/strict";
import test from "node:test";
import { buildOnboardingWorkflow } from "./employer-data.ts";

test("creates explicit assignment tasks when a role has no manager or buddy mapping", () => {
  const workflow = buildOnboardingWorkflow({
    hire: "Test Hire",
    role: "Unmapped role",
    successProbability: 70,
    timeToImpact: "45 days",
    turnoverRisk: 20,
    nextMilestone: "Complete first milestone",
    drivers: []
  });

  assert.equal(workflow.manager, "Assignment needed");
  assert.equal(workflow.buddy, "Assignment needed");
  assert.deepEqual(
    workflow.phases[0]?.tasks.slice(0, 2).map((task) => task.title),
    ["Assign hiring manager", "Assign onboarding buddy"]
  );
});
