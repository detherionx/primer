import { describe, expect, it } from "vitest";
import { applyObservation } from "@/core/estimator";
import type { LearnerCompetencyState, Observation } from "@/core/types";

describe("hinted success is not independent mastery", () => {
  it("barely moves mastery and does not raise confidence", () => {
    const previous: LearnerCompetencyState = {
      competencyId: "hs.algebra.equals_meaning",
      mastery: 0.3,
      confidence: 0.4,
    };
    const observation: Observation = {
      id: "obs_hint",
      competencyId: previous.competencyId,
      outcome: "correct_with_hint",
      confidence: 0.85,
      observedAt: "2026-09-12T10:00:00.000Z",
      evidence: {
        taskId: "hs.algebra.equals.hinted",
        learnerResponse: "6",
        classificationReason: "hint",
        hintUsed: true,
      },
    };
    const next = applyObservation(previous, observation);
    expect(next.mastery).toBeLessThan(0.4);
    expect(next.mastery).toBeGreaterThanOrEqual(previous.mastery);
    expect(next.confidence).toBeLessThan(previous.confidence);
  });

  it("independent success moves mastery more than hinted success", () => {
    const previous: LearnerCompetencyState = {
      competencyId: "hs.algebra.equals_meaning",
      mastery: 0.3,
      confidence: 0.4,
    };
    const hinted = applyObservation(previous, {
      id: "a",
      competencyId: previous.competencyId,
      outcome: "correct_with_hint",
      confidence: 0.85,
      observedAt: "t",
      evidence: {
        taskId: "t",
        learnerResponse: "6",
        classificationReason: "h",
        hintUsed: true,
      },
    });
    const independent = applyObservation(previous, {
      id: "b",
      competencyId: previous.competencyId,
      outcome: "correct_independent",
      confidence: 0.85,
      observedAt: "t",
      evidence: {
        taskId: "t",
        learnerResponse: "6",
        classificationReason: "i",
        hintUsed: false,
      },
    });
    expect(independent.mastery).toBeGreaterThan(hinted.mastery);
  });
});
