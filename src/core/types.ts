/**
 * Primer Core contracts.
 *
 * These types are domain-neutral. Japanese, high-school algebra and BWL
 * must all be representable without forking this file.
 *
 * Invariant: a pedagogical decision is not a chat message. TutorDecision
 * is chosen first; a modality renderer (today: text) realizes it.
 */

export type DomainId = "language" | "high_school" | "university";

export type ObservationOutcome =
  | "correct_independent"
  | "correct_with_hint"
  | "incorrect"
  | "misconception";

export type InterventionId =
  | "diagnostic_question"
  | "retrieval_practice"
  | "worked_example"
  | "guided_example"
  | "contrast_examples"
  | "analogy"
  | "hint"
  | "explanation"
  | "simplify_prerequisite"
  | "test_transfer"
  | "spaced_review";

export type MisconceptionStatus = "active" | "resolved" | "uncertain";

export type SessionPhase =
  | "onboarding"
  | "diagnostic"
  | "tutoring"
  | "delayed_assessment"
  | "complete";

export type Locale = string;

export interface LocalizedText {
  /** IETF locale, e.g. "de", "en", "ja". German-first content is allowed; German is not a core assumption. */
  [locale: string]: string;
}

export interface LearnerCompetencyState {
  competencyId: string;
  /** 0–1 estimated current mastery. Not the same as confidence. */
  mastery: number;
  /** 0–1 confidence in the mastery estimate. */
  confidence: number;
  lastObservedAt?: string;
}

export interface ObservationEvidence {
  taskId: string;
  learnerResponse: string;
  classificationReason: string;
  hintUsed: boolean;
}

export interface Observation {
  id: string;
  competencyId: string;
  outcome: ObservationOutcome;
  misconceptionId?: string;
  evidence: ObservationEvidence;
  confidence: number;
  observedAt: string;
}

export type ModalityType = "text" | "voice" | "visual" | "interactive";

export interface ModalityIntent {
  type: ModalityType;
  intent: string;
}

/**
 * Pedagogical action. Must remain valid if we later add voice, diagrams
 * or manipulatives. Do not encode learner-facing prose here.
 */
export interface TutorDecision {
  objectiveId: string;
  intervention: InterventionId;
  difficulty: number;
  reason: string;
  modalities: ModalityIntent[];
  observe: string[];
}

export interface MisconceptionHypothesis {
  id: string;
  competencyId: string;
  hypothesis: string;
  confidence: number;
  status: MisconceptionStatus;
  evidenceCount: number;
  lastEvidenceAt?: string;
}

export interface ReviewItem {
  competencyId: string;
  nextReviewAt: string;
}

export interface LearnerState {
  learnerId: string;
  /** Display name is optional and must never be required for tutoring. */
  displayName?: string;
  nativeLocale: Locale;
  goal: string;
  domainId: DomainId;
  curriculumId: string;
  competencies: Record<string, LearnerCompetencyState>;
  misconceptions: MisconceptionHypothesis[];
  reviewSchedule: ReviewItem[];
  version: number;
}

export interface MasteryEstimator {
  update(
    previous: LearnerCompetencyState,
    observation: Observation,
  ): LearnerCompetencyState;
}

export interface Task {
  id: string;
  competencyId: string;
  type: "fill_blank" | "multiple_choice" | "short_answer" | "production";
  interventions: InterventionId[];
  prompt: LocalizedText;
  choices?: LocalizedText[];
  expected: string[];
  misconceptionPatterns: Array<{
    match: string;
    misconceptionId: string;
  }>;
  transfer?: boolean;
}

export interface Contrast {
  misconceptionId: string;
  copy: LocalizedText;
  followUpTaskId: string;
}

export interface WorkedExample {
  competencyId: string;
  copy: LocalizedText;
  followUpTaskId: string;
}

export interface CurriculumMisconception {
  id: string;
  competencyId: string;
  hypothesis: LocalizedText;
}

export interface Competency {
  id: string;
  title: LocalizedText;
  prerequisites: string[];
  learnerShouldBeAbleTo: LocalizedText[];
  commonMisconceptionIds: string[];
}

export interface Curriculum {
  id: string;
  domain: DomainId;
  /** Primary authored locale. Not a core-engine assumption. */
  locale: Locale;
  fallbackLocales: Locale[];
  title: LocalizedText;
  goalPrompt: LocalizedText;
  diagnosticOrder: string[];
  delayedAssessmentTaskIds: string[];
  competencies: Competency[];
  misconceptions: CurriculumMisconception[];
  tasks: Task[];
  contrasts: Contrast[];
  workedExamples: WorkedExample[];
}

export interface RenderedTurn {
  modality: "text";
  content: string;
  taskId?: string;
  choices?: string[];
}

export interface Turn {
  index: number;
  decision: TutorDecision;
  rendered: RenderedTurn;
  learnerResponse?: string;
  hintUsed?: boolean;
  observation?: Observation;
}

export interface Session {
  id: string;
  learnerId: string;
  domainId: DomainId;
  curriculumId: string;
  phase: SessionPhase;
  turns: Turn[];
  startedAt: string;
  completedAt?: string;
}

export interface DecisionTrace {
  sessionId: string;
  turnIndex: number;
  learnerStateVersion: number;
  objective: string;
  intervention: InterventionId;
  reason: string;
  promptVersion: string;
  model: string;
  observation?: ObservationOutcome;
  misconceptionId?: string;
  stateChange?: {
    competencyId: string;
    mastery: [number, number];
    confidence: [number, number];
  };
  at: string;
}

export interface DomainAdapter {
  domainId: DomainId;
  normalizeResponse(task: Task, raw: string): string;
}

/**
 * Future identity/cosmetic layers must stay out of Tutor Core.
 * These types exist so the boundary is named, not implemented.
 */
export interface TutorIdentity {
  id: string;
  displayName: string;
}

export interface CosmeticPresentation {
  themeId: string;
}

export interface ModelProvider {
  readonly id: string;
  complete(input: {
    system: string;
    user: string;
  }): Promise<string>;
}
