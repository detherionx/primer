import { adapters } from "./adapters";
import { applyObservation } from "./estimator";
import { evaluateResponse } from "./evaluate";
import { applyMisconceptionEvidence } from "./misconceptions";
import { decide, PROMPT_VERSION } from "./policy";
import { renderText } from "./render";
import { StubModelProvider } from "./provider";
import type {
  Curriculum,
  DecisionTrace,
  LearnerState,
  Observation,
  Session,
  Turn,
} from "./types";

export interface StepInput {
  state: LearnerState;
  session: Session;
  curriculum: Curriculum;
  now?: string;
  response?: {
    answer: string;
    hintUsed?: boolean;
  };
}

export interface StepResult {
  state: LearnerState;
  session: Session;
  observation?: Observation;
  trace: DecisionTrace;
  pendingTurn: Turn;
}

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function usedTaskIds(session: Session): string[] {
  return session.turns
    .map((t) => t.rendered.taskId)
    .filter((id): id is string => Boolean(id));
}

function applyResponse(
  state: LearnerState,
  session: Session,
  curriculum: Curriculum,
  answer: string,
  hintUsed: boolean,
  now: string,
): { state: LearnerState; session: Session; observation: Observation; tracePatch: Partial<DecisionTrace> } {
  const last = session.turns.at(-1);
  if (!last?.rendered.taskId) {
    throw new Error("Cannot apply a response without a pending task.");
  }
  const task = curriculum.tasks.find((t) => t.id === last.rendered.taskId);
  if (!task) throw new Error(`Unknown task ${last.rendered.taskId}`);

  const adapter = adapters[curriculum.domain];
  const normalized = adapter.normalizeResponse(task, answer);
  const classified = evaluateResponse({
    task,
    answer,
    hintUsed,
    normalized,
  });

  const observation: Observation = {
    id: newId("obs"),
    competencyId: task.competencyId,
    observedAt: now,
    ...classified,
  };

  const previous =
    state.competencies[task.competencyId] ?? {
      competencyId: task.competencyId,
      mastery: 0.3,
      confidence: 0.15,
    };
  const updatedCompetency = applyObservation(previous, observation);
  const nextState: LearnerState = {
    ...state,
    version: state.version + 1,
    competencies: {
      ...state.competencies,
      [task.competencyId]: updatedCompetency,
    },
    misconceptions: applyMisconceptionEvidence(state, curriculum, observation),
  };

  const completed: Turn = {
    ...last,
    learnerResponse: answer,
    hintUsed,
    observation,
  };
  const nextSession: Session = {
    ...session,
    turns: [...session.turns.slice(0, -1), completed],
  };

  return {
    state: nextState,
    session: nextSession,
    observation,
    tracePatch: {
      observation: observation.outcome,
      misconceptionId: observation.misconceptionId,
      stateChange: {
        competencyId: task.competencyId,
        mastery: [previous.mastery, updatedCompetency.mastery],
        confidence: [previous.confidence, updatedCompetency.confidence],
      },
    },
  };
}

export function step(input: StepInput): StepResult {
  const now = input.now ?? new Date().toISOString();
  let { state, session } = input;
  let observation: Observation | undefined;
  let tracePatch: Partial<DecisionTrace> = {};

  if (input.response) {
    const applied = applyResponse(
      state,
      session,
      input.curriculum,
      input.response.answer,
      Boolean(input.response.hintUsed),
      now,
    );
    state = applied.state;
    session = applied.session;
    observation = applied.observation;
    tracePatch = applied.tracePatch;

    if (
      session.phase === "diagnostic" &&
      input.curriculum.diagnosticOrder.every(
        (id) => Boolean(state.competencies[id]?.lastObservedAt),
      )
    ) {
      session = { ...session, phase: "tutoring" };
    }
  }

  const decision = decide({ state, session, curriculum: input.curriculum });
  const { rendered, task } = renderText({
    curriculum: input.curriculum,
    decision,
    locale: state.nativeLocale,
    usedTaskIds: usedTaskIds(session),
  });

  const pendingTurn: Turn = {
    index: session.turns.length,
    decision,
    rendered,
  };

  const nextSession: Session = {
    ...session,
    turns: [...session.turns, pendingTurn],
  };

  const trace: DecisionTrace = {
    sessionId: session.id,
    turnIndex: pendingTurn.index,
    learnerStateVersion: state.version,
    objective: decision.objectiveId,
    intervention: decision.intervention,
    reason: decision.reason,
    promptVersion: PROMPT_VERSION,
    model: new StubModelProvider().id,
    at: now,
    ...tracePatch,
  };

  void task;

  return {
    state,
    session: nextSession,
    observation,
    trace,
    pendingTurn,
  };
}

export function beginDelayedAssessment(session: Session): Session {
  const last = session.turns.at(-1);
  const turns = last && !last.observation ? session.turns.slice(0, -1) : session.turns;
  return { ...session, phase: "delayed_assessment", turns };
}
