import { describe, expect, it } from "vitest";
import { loadCurriculum } from "@/lib/curricula";
import { answer, startRun } from "./helpers";

describe("ni/de confusion", () => {
  const curriculum = loadCurriculum("language");

  it("detects に/で interchange and switches strategy", () => {
    let run = startRun(curriculum, "de");
    run = answer(run, curriculum, "は");
    run = answer(run, curriculum, "に");
    expect(run.pendingTurn.rendered.taskId).toBe("ja.particles.de.action_place");

    run = answer(run, curriculum, "に");
    run = answer(run, curriculum, "に");

    const mis = run.state.misconceptions.find((m) => m.id === "ni_de_interchangeable");
    expect(mis?.status).toBe("active");
    expect(["contrast_examples", "guided_example", "explanation"]).toContain(
      run.pendingTurn.decision.intervention,
    );
  });
});
