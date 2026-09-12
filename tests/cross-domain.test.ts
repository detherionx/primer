import { describe, expect, it } from "vitest";
import { loadAllCurricula } from "@/lib/curricula";
import { parseCurriculum } from "@/core/curriculum";
import { createLearner } from "@/core/learner";
import { decide } from "@/core/policy";
import { createSession } from "@/core/learner";

describe("three curricula share Primer Core", () => {
  it("parse as the same Curriculum contract", () => {
    const all = loadAllCurricula();
    expect(all).toHaveLength(3);
    for (const c of all) {
      expect(() => parseCurriculum(c)).not.toThrow();
      expect(c.competencies.length).toBeGreaterThan(0);
      expect(c.tasks.length).toBeGreaterThan(0);
    }
    expect(new Set(all.map((c) => c.domain)).size).toBe(3);
  });

  it("can create learner state and a first decision in every domain", () => {
    for (const curriculum of loadAllCurricula()) {
      const learner = createLearner({
        learnerId: "x",
        domainId: curriculum.domain,
        curriculum,
        nativeLocale: curriculum.locale,
        goal: "test",
      });
      const session = createSession({ sessionId: "s", learner });
      const decision = decide({ state: learner, session, curriculum });
      expect(decision.objectiveId).toBeTruthy();
      expect(decision.modalities[0]?.type).toBe("text");
      expect(decision.intervention).toBeTruthy();
    }
  });
});
