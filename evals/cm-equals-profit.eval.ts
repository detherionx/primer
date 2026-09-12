import { describe, expect, it } from "vitest";
import { loadCurriculum } from "@/lib/curricula";
import { answer, startRun } from "./helpers";

describe("Deckungsbeitrag ≠ Gewinn", () => {
  const curriculum = loadCurriculum("university");

  it("detects CM=profit and remains domain-neutral in the core loop", () => {
    let run = startRun(curriculum, "de");
    expect(run.pendingTurn.decision.objectiveId).toBe("bwl.cm.definition");
    run = answer(run, curriculum, "Erlös minus variable Kosten");
    run = answer(run, curriculum, "Ja");
    run = answer(run, curriculum, "Ja, Gewinn von 4.000 €");

    const mis = run.state.misconceptions.find((m) => m.id === "cm_equals_profit");
    expect(mis?.status).toBe("active");
    expect(run.pendingTurn.decision.intervention).toBe("contrast_examples");
    expect(run.pendingTurn.rendered.content).toMatch(/Deckungsbeitrag/i);
  });
});
