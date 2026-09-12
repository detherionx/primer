import type { LearnerCompetencyState, MasteryEstimator, Observation } from "./types";

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export const simpleMasteryEstimator: MasteryEstimator = {
  update(previous, observation) {
    return applyObservation(previous, observation);
  },
};

export function applyObservation(
  previous: LearnerCompetencyState,
  observation: Observation,
): LearnerCompetencyState {
  let { mastery, confidence } = previous;

  switch (observation.outcome) {
    case "correct_independent":
      mastery = clamp01(mastery + 0.14 * observation.confidence);
      confidence = clamp01(confidence + 0.12);
      break;
    case "correct_with_hint":
      mastery = clamp01(mastery + 0.03);
      confidence = clamp01(confidence - 0.08);
      break;
    case "incorrect":
      mastery = clamp01(mastery - 0.1);
      confidence = clamp01(confidence + 0.08);
      break;
    case "misconception":
      mastery = clamp01(mastery - 0.16);
      confidence = clamp01(Math.max(confidence + 0.12, 0.55));
      break;
    default: {
      const _exhaustive: never = observation.outcome;
      return _exhaustive;
    }
  }

  return {
    competencyId: previous.competencyId,
    mastery,
    confidence,
    lastObservedAt: observation.observedAt,
  };
}
