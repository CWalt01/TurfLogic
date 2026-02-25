import test from "node:test";
import assert from "node:assert/strict";

import { applyRounding, estimateJob } from "../estimator.engine.js";
import { DEFAULT_CONFIG, DEFAULT_INPUTS } from "../estimator.constants.js";

const withInputs = (overrides = {}) => ({ ...DEFAULT_INPUTS, ...overrides });

test("applyRounding supports configured strategies", () => {
  assert.equal(applyRounding(12.4, "nearest-dollar"), 12);
  assert.equal(applyRounding(12.4, "ceil-dollar"), 13);
  assert.equal(applyRounding(12.4, "nearest-five"), 10);
  assert.equal(applyRounding(12.4, "nearest-ten"), 10);
  assert.equal(applyRounding(12.4, "none"), 12.4);
});

test("returns empty line items and warning when no service minutes are present", () => {
  const result = estimateJob(withInputs(), DEFAULT_CONFIG);
  assert.equal(result.lineItems.length, 0);
  assert.equal(result.finalPrice, null);
  assert.ok(result.warnings.some(w => w.includes("No services selected")));
});

test("adds travel charge when travel miles exceed free radius", () => {
  const result = estimateJob(withInputs({
    mow: true,
    turfSqft: 4000,
    crewSize: 2,
    frequency: "biweekly",
    travelMiles: 20,
  }), DEFAULT_CONFIG);
  const travelLine = result.lineItems.find(li => li.service === "Travel Charge");
  assert.ok(travelLine);
  assert.ok(travelLine.total >= DEFAULT_CONFIG.travelMinimum);
});

test("overgrown recovery minimum is enforced when final price is low", () => {
  const result = estimateJob(withInputs({
    mow: true,
    turfSqft: 1000,
    overgrown: true,
    crewSize: 2,
    frequency: "biweekly",
    travelMiles: 0,
  }), DEFAULT_CONFIG);
  assert.equal(result.finalPrice, DEFAULT_CONFIG.overgownRecoveryMinimum);
  assert.ok(result.warnings.some(w => w.includes("Overgrown recovery minimum applied")));
});

test("one-time cadence is more expensive than weekly for same job", () => {
  const baseJob = {
    mow: true,
    hardEdge: true,
    turfSqft: 8000,
    travelMiles: 8,
    crewSize: 2,
  };
  const oneTime = estimateJob(withInputs({ ...baseJob, frequency: "oneTime" }), DEFAULT_CONFIG);
  const weekly = estimateJob(withInputs({ ...baseJob, frequency: "weekly" }), DEFAULT_CONFIG);
  assert.ok(oneTime.finalPrice >= weekly.finalPrice);
});
