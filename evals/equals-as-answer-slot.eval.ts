import { describe, expect, it } from "vitest";
import { loadCurriculum } from "@/lib/curricula";
import { answer, goDelayed, predictedMastery, startRun } from "./helpers";

describe("equals-as-answer-slot", () => {
  const curriculum = loadCurriculum("high_school");

  it("detects the misconception and switches intervention", () => {
    let run = startRun(curriculum, "en");
    expect(run.pendingTurn.decision.intervention).toBe("diagnostic_question");
    run = answer(run, curriculum, "12");
    run = answer(run, curriculum, "8");
    expect(run.pendingTurn.decision.intervention).toBe("contrast_examples");
  });
});
