import { describe, expect, it } from "vitest";
import { applyObservation } from "@/core/estimator";
import { applyMisconceptionEvidence } from "@/core/misconceptions";
import { loadCurriculum } from "@/lib/curricula";
import { createLearner } from "@/core/learner";
import type { Observation } from "@/core/types";

describe("estimator and misconception tracker", () => {
  it("keeps mastery and confidence as separate numbers", () => {
    const prev = { competencyId: "c", mastery: 0.4, confidence: 0.2 };
    const obs: Observation = {
      id: "o",
      competencyId: "c",
      outcome: "incorrect",
      confidence: 0.7,
      observedAt: "t",
      evidence: {
        taskId: "t",
        learnerResponse: "x",
        classificationReason: "wrong",
        hintUsed: false,
      },
    };
    const next = applyObservation(prev, obs);
    expect(next.mastery).toBeLessThan(prev.mastery);
    expect(next.confidence).toBeGreaterThan(prev.confidence);
  });

  it("needs repeated evidence before a misconception is active", () => {
    const curriculum = loadCurriculum("high_school");
    let state = createLearner({
      learnerId: "l",
      domainId: "high_school",
      curriculum,
      nativeLocale: "en",
      goal: "g",
    });
    const make = (n: string): Observation => ({
      id: n,
      competencyId: "hs.algebra.equals_meaning",
      outcome: "misconception",
      misconceptionId: "equals_as_answer_slot",
      confidence: 0.9,
      observedAt: n,
      evidence: {
        taskId: "hs.algebra.equals.8plus4",
        learnerResponse: "12",
        classificationReason: "pattern",
        hintUsed: false,
      },
    });
    state = {
      ...state,
      misconceptions: applyMisconceptionEvidence(state, curriculum, make("1")),
    };
    expect(state.misconceptions[0]?.status).toBe("uncertain");
    state = {
      ...state,
      misconceptions: applyMisconceptionEvidence(state, curriculum, make("2")),
    };
    expect(state.misconceptions[0]?.status).toBe("active");
  });
});
