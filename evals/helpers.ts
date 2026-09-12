import { beginDelayedAssessment, step, type StepResult } from "@/core/loop";
import { createLearner, createSession } from "@/core/learner";
import type { Curriculum, LearnerState, Session } from "@/core/types";

export function startRun(curriculum: Curriculum, nativeLocale: string): StepResult {
  const learner = createLearner({
    learnerId: `syn_${curriculum.id}`,
    domainId: curriculum.domain,
    curriculum,
    nativeLocale,
    goal: curriculum.goalPrompt[nativeLocale] ?? curriculum.goalPrompt[curriculum.locale] ?? "",
    displayName: "Synthetic learner",
  });
  const session = createSession({
    sessionId: `ses_${curriculum.id}`,
    learner,
    now: "2026-09-12T10:00:00.000Z",
  });
  return step({ state: learner, session, curriculum, now: "2026-09-12T10:00:00.000Z" });
}

export function answer(
  current: StepResult,
  curriculum: Curriculum,
  value: string,
  hintUsed = false,
  now = "2026-09-12T10:00:01.000Z",
): StepResult {
  return step({
    state: current.state,
    session: current.session,
    curriculum,
    now,
    response: { answer: value, hintUsed },
  });
}

export function goDelayed(
  current: StepResult,
  curriculum: Curriculum,
): StepResult {
  const session: Session = beginDelayedAssessment(current.session);
  const state: LearnerState = current.state;
  return step({ state, session, curriculum, now: "2026-09-19T10:00:00.000Z" });
}

export function predictedMastery(state: LearnerState, competencyId: string): number {
  return state.competencies[competencyId]?.mastery ?? 0;
}
