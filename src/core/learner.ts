import type { Curriculum, DomainId, LearnerState, Session } from "./types";

export function emptyCompetencies(curriculum: Curriculum): LearnerState["competencies"] {
  const competencies: LearnerState["competencies"] = {};
  for (const c of curriculum.competencies) {
    competencies[c.id] = {
      competencyId: c.id,
      mastery: 0.3,
      confidence: 0.12,
    };
  }
  return competencies;
}

export function createLearner(args: {
  learnerId: string;
  domainId: DomainId;
  curriculum: Curriculum;
  nativeLocale: string;
  goal: string;
  displayName?: string;
}): LearnerState {
  return {
    learnerId: args.learnerId,
    displayName: args.displayName,
    nativeLocale: args.nativeLocale,
    goal: args.goal,
    domainId: args.domainId,
    curriculumId: args.curriculum.id,
    competencies: emptyCompetencies(args.curriculum),
    misconceptions: [],
    reviewSchedule: [],
    version: 1,
  };
}

export function createSession(args: {
  sessionId: string;
  learner: LearnerState;
  now?: string;
}): Session {
  return {
    id: args.sessionId,
    learnerId: args.learner.learnerId,
    domainId: args.learner.domainId,
    curriculumId: args.learner.curriculumId,
    phase: "diagnostic",
    turns: [],
    startedAt: args.now ?? new Date().toISOString(),
  };
}
