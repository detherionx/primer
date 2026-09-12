import type {
  Contrast,
  Curriculum,
  Locale,
  LocalizedText,
  RenderedTurn,
  Task,
  TutorDecision,
  WorkedExample,
} from "./types";

export function pickText(
  text: LocalizedText,
  locale: Locale,
  fallbacks: Locale[],
): string {
  if (text[locale]) return text[locale];
  for (const fb of fallbacks) {
    if (text[fb]) return text[fb];
  }
  return Object.values(text)[0] ?? "";
}

function taskForDecision(
  curriculum: Curriculum,
  decision: TutorDecision,
  usedTaskIds: string[],
): Task | undefined {
  const pool = curriculum.tasks.filter((t) => {
    if (t.competencyId !== decision.objectiveId) return false;
    if (usedTaskIds.includes(t.id)) return false;
    if (decision.intervention === "test_transfer") return Boolean(t.transfer);
    if (t.interventions.length === 0) return true;
    return t.interventions.includes(decision.intervention);
  });
  if (pool.length > 0) return pool[0];

  const unusedSame = curriculum.tasks.find(
    (t) =>
      t.competencyId === decision.objectiveId && !usedTaskIds.includes(t.id),
  );
  if (unusedSame) return unusedSame;

  return curriculum.tasks.find((t) => t.competencyId === decision.objectiveId);
}

/**
 * Text renderer. Separate from Primer Core so voice/visual/interactive
 * adapters can be added later without replacing the tutor engine.
 */
export function renderText(args: {
  curriculum: Curriculum;
  decision: TutorDecision;
  locale: Locale;
  usedTaskIds: string[];
}): { rendered: RenderedTurn; task?: Task; contrast?: Contrast; example?: WorkedExample } {
  const { curriculum, decision, locale, usedTaskIds } = args;
  const fallbacks = [curriculum.locale, ...curriculum.fallbackLocales];

  if (decision.intervention === "contrast_examples") {
    const contrast = curriculum.contrasts.find((c) => {
      const follow = curriculum.tasks.find((t) => t.id === c.followUpTaskId);
      return follow?.competencyId === decision.objectiveId;
    });
    const followUp = contrast
      ? curriculum.tasks.find((t) => t.id === contrast.followUpTaskId)
      : taskForDecision(curriculum, { ...decision, intervention: "retrieval_practice" }, usedTaskIds);
    const body = contrast ? pickText(contrast.copy, locale, fallbacks) : "";
    const prompt = followUp ? pickText(followUp.prompt, locale, fallbacks) : "";
    return {
      contrast,
      task: followUp,
      rendered: {
        modality: "text",
        content: [body, prompt].filter(Boolean).join("\n\n"),
        taskId: followUp?.id,
        choices: followUp?.choices?.map((c) => pickText(c, locale, fallbacks)),
      },
    };
  }

  if (
    decision.intervention === "guided_example" ||
    decision.intervention === "worked_example" ||
    decision.intervention === "explanation"
  ) {
    const example = curriculum.workedExamples.find(
      (e) => e.competencyId === decision.objectiveId,
    );
    const followUp = example
      ? curriculum.tasks.find((t) => t.id === example.followUpTaskId)
      : taskForDecision(curriculum, { ...decision, intervention: "retrieval_practice" }, usedTaskIds);
    const body = example ? pickText(example.copy, locale, fallbacks) : "";
    const prompt = followUp ? pickText(followUp.prompt, locale, fallbacks) : "";
    return {
      example,
      task: followUp,
      rendered: {
        modality: "text",
        content: [body, prompt].filter(Boolean).join("\n\n"),
        taskId: followUp?.id,
        choices: followUp?.choices?.map((c) => pickText(c, locale, fallbacks)),
      },
    };
  }

  const task = taskForDecision(curriculum, decision, usedTaskIds);
  if (!task) {
    return {
      rendered: {
        modality: "text",
        content:
          "No remaining task for this objective. End the session or run delayed assessment.",
      },
    };
  }

  return {
    task,
    rendered: {
      modality: "text",
      content: pickText(task.prompt, locale, fallbacks),
      taskId: task.id,
      choices: task.choices?.map((c) => pickText(c, locale, fallbacks)),
    },
  };
}
