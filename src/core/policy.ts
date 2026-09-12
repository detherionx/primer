import { activeMisconceptions } from "./misconceptions";
import type {
  Curriculum,
  InterventionId,
  LearnerState,
  Session,
  TutorDecision,
} from "./types";

export const PROMPT_VERSION = "tutor-v0.1";

function lastIntervention(session: Session): InterventionId | undefined {
  return session.turns.at(-1)?.decision.intervention;
}

function lastObjective(session: Session): string | undefined {
  return session.turns.at(-1)?.decision.objectiveId;
}

function consecutiveFailures(session: Session, competencyId: string): number {
  let n = 0;
  for (let i = session.turns.length - 1; i >= 0; i -= 1) {
    const turn = session.turns[i];
    if (turn.decision.objectiveId !== competencyId) break;
    const outcome = turn.observation?.outcome;
    if (!outcome) break;
    if (outcome === "incorrect" || outcome === "misconception") n += 1;
    else break;
  }
  return n;
}

function prereqsMet(
  state: LearnerState,
  curriculum: Curriculum,
  competencyId: string,
): boolean {
  const node = curriculum.competencies.find((c) => c.id === competencyId);
  if (!node) return false;
  return node.prerequisites.every((pre) => {
    const s = state.competencies[pre];
    return Boolean(s && s.mastery >= 0.55 && s.confidence >= 0.45);
  });
}

export function selectObjective(
  state: LearnerState,
  curriculum: Curriculum,
  session: Session,
): string {
  if (session.phase === "diagnostic") {
    for (const id of curriculum.diagnosticOrder) {
      const s = state.competencies[id];
      if (!s?.lastObservedAt) return id;
    }
  }

  const ranked = curriculum.competencies
    .filter(
      (c) =>
        prereqsMet(state, curriculum, c.id) || c.prerequisites.length === 0,
    )
    .map((c) => state.competencies[c.id])
    .filter(Boolean)
    .sort((a, b) => a.mastery + a.confidence - (b.mastery + b.confidence));

  return ranked[0]?.competencyId ?? curriculum.diagnosticOrder[0];
}

/**
 * Deterministic pedagogical policy. Wording is not chosen here.
 */
export function decide(args: {
  state: LearnerState;
  session: Session;
  curriculum: Curriculum;
}): TutorDecision {
  const { state, session, curriculum } = args;
  const active = activeMisconceptions(state);

  if (session.phase === "delayed_assessment") {
    const delayedTask = curriculum.tasks.find((t) =>
      curriculum.delayedAssessmentTaskIds.includes(t.id),
    );
    return {
      objectiveId: delayedTask?.competencyId ?? curriculum.diagnosticOrder[0],
      intervention: "test_transfer",
      difficulty: 2,
      reason:
        "Delayed assessment: compare predicted mastery with independent performance on unseen items.",
      modalities: [{ type: "text", intent: "assess_retention" }],
      observe: ["independent_production"],
    };
  }

  if (active.length > 0) {
    const target = active[0];
    const prev = lastIntervention(session);
    const sameObjective = lastObjective(session) === target.competencyId;
    const intervention: InterventionId =
      prev === "contrast_examples" && sameObjective
        ? "guided_example"
        : prev === "guided_example" && sameObjective
          ? "explanation"
          : "contrast_examples";

    return {
      objectiveId: target.competencyId,
      intervention,
      difficulty: 1,
      reason: `Active misconception "${target.hypothesis}" (confidence ${target.confidence.toFixed(2)}, evidence ${target.evidenceCount}). Change teaching strategy rather than repeating the same retrieval.`,
      modalities: [{ type: "text", intent: "repair_misconception" }],
      observe: ["explanation", "follow_up_item"],
    };
  }

  const failedObjective = lastObjective(session);
  const stuckFailures = failedObjective
    ? consecutiveFailures(session, failedObjective)
    : 0;
  const objective =
    stuckFailures >= 1 && failedObjective
      ? failedObjective
      : selectObjective(state, curriculum, session);
  const competency = state.competencies[objective];
  const failures = consecutiveFailures(session, objective);

  if (!competency || competency.confidence < 0.4) {
    return {
      objectiveId: objective,
      intervention: "diagnostic_question",
      difficulty: 1,
      reason: `Low confidence (${competency?.confidence.toFixed(2) ?? "n/a"}) on ${objective}; gather evidence before advancing.`,
      modalities: [{ type: "text", intent: "elicit_evidence" }],
      observe: ["response"],
    };
  }

  if (failures >= 2) {
    return {
      objectiveId: objective,
      intervention: "simplify_prerequisite",
      difficulty: 1,
      reason: `Repeated failure on ${objective} without a classified misconception. Repair prerequisites rather than advancing.`,
      modalities: [{ type: "text", intent: "prerequisite_repair" }],
      observe: ["response"],
    };
  }

  if (competency.mastery >= 0.7 && competency.confidence >= 0.6) {
    return {
      objectiveId: objective,
      intervention: "test_transfer",
      difficulty: 3,
      reason: `Estimated mastery ${competency.mastery.toFixed(2)} with confidence ${competency.confidence.toFixed(2)}. Test transfer before treating the objective as done.`,
      modalities: [{ type: "text", intent: "assess_transfer" }],
      observe: ["independent_production"],
    };
  }

  return {
    objectiveId: objective,
    intervention: "retrieval_practice",
    difficulty: 2,
    reason: `Continue ${objective} with retrieval practice (mastery ${competency.mastery.toFixed(2)}, confidence ${competency.confidence.toFixed(2)}).`,
    modalities: [{ type: "text", intent: "practice" }],
    observe: ["response"],
  };
}
