import type {
  Curriculum,
  Observation,
  ObservationOutcome,
  Task,
} from "./types";

export function evaluateResponse(args: {
  task: Task;
  answer: string;
  hintUsed: boolean;
  normalized: string;
}): Pick<Observation, "outcome" | "misconceptionId" | "confidence" | "evidence"> {
  const { task, answer, hintUsed, normalized } = args;

  for (const pattern of task.misconceptionPatterns) {
    const re = new RegExp(pattern.match, "i");
    if (re.test(normalized) || re.test(normalized.toLowerCase())) {
      return {
        outcome: "misconception",
        misconceptionId: pattern.misconceptionId,
        confidence: 0.9,
        evidence: {
          taskId: task.id,
          learnerResponse: answer,
          classificationReason: `Response matched misconception pattern /${pattern.match}/ (${pattern.misconceptionId}).`,
          hintUsed,
        },
      };
    }
  }

  const normalizedAnswer = normalized.toLowerCase();
  const correct = task.expected.some(
    (expected) => normalizeComparable(expected).toLowerCase() === normalizedAnswer,
  );

  let outcome: ObservationOutcome;
  if (correct && hintUsed) outcome = "correct_with_hint";
  else if (correct) outcome = "correct_independent";
  else outcome = "incorrect";

  return {
    outcome,
    confidence: correct ? 0.85 : 0.7,
    evidence: {
      taskId: task.id,
      learnerResponse: answer,
      classificationReason: correct
        ? hintUsed
          ? "Matched expected answer after a hint."
          : "Matched expected answer independently."
        : "Did not match expected answer or a known misconception pattern.",
      hintUsed,
    },
  };
}

export function normalizeComparable(value: string): string {
  return value.trim().replace(/\s+/g, " ").replace(",", ".");
}

export function findTask(
  curriculum: Curriculum,
  taskId: string,
): Task | undefined {
  return curriculum.tasks.find((t) => t.id === taskId);
}
