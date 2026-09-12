import type {
  Curriculum,
  LearnerState,
  MisconceptionHypothesis,
  Observation,
} from "./types";

function pickHypothesis(
  curriculum: Curriculum,
  misconceptionId: string,
  locale: string,
): string {
  const row = curriculum.misconceptions.find((m) => m.id === misconceptionId);
  if (!row) return misconceptionId;
  return (
    row.hypothesis[locale] ??
    row.hypothesis[curriculum.locale] ??
    Object.values(row.hypothesis)[0] ??
    misconceptionId
  );
}

export function applyMisconceptionEvidence(
  state: LearnerState,
  curriculum: Curriculum,
  observation: Observation,
): MisconceptionHypothesis[] {
  const next = state.misconceptions.map((m) => ({ ...m }));

  if (observation.outcome === "misconception" && observation.misconceptionId) {
    const existing = next.find((m) => m.id === observation.misconceptionId);
    if (existing) {
      existing.evidenceCount += 1;
      existing.confidence = clamp01(1 - 0.5 ** existing.evidenceCount);
      existing.status = existing.evidenceCount >= 2 ? "active" : "uncertain";
      existing.lastEvidenceAt = observation.observedAt;
      existing.competencyId = observation.competencyId;
    } else {
      next.push({
        id: observation.misconceptionId,
        competencyId: observation.competencyId,
        hypothesis: pickHypothesis(
          curriculum,
          observation.misconceptionId,
          state.nativeLocale,
        ),
        evidenceCount: 1,
        confidence: 0.5,
        status: "uncertain",
        lastEvidenceAt: observation.observedAt,
      });
    }
  }

  if (
    observation.outcome === "correct_independent" &&
    observation.confidence >= 0.8
  ) {
    for (const m of next) {
      if (
        m.competencyId === observation.competencyId &&
        m.status !== "resolved"
      ) {
        m.confidence = clamp01(m.confidence - 0.25);
        if (m.confidence < 0.3) {
          m.status = "resolved";
        } else {
          m.status = "uncertain";
        }
      }
    }
  }

  return next;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

export function activeMisconceptions(
  state: LearnerState,
): MisconceptionHypothesis[] {
  return state.misconceptions.filter(
    (m) => m.status === "active" && m.confidence >= 0.5,
  );
}
