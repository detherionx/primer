import { z } from "zod";
import type { Curriculum } from "./types";

const localized = z.record(z.string(), z.string());

export const curriculumSchema = z.object({
  id: z.string(),
  domain: z.enum(["language", "high_school", "university"]),
  locale: z.string(),
  fallbackLocales: z.array(z.string()),
  title: localized,
  goalPrompt: localized,
  diagnosticOrder: z.array(z.string()),
  delayedAssessmentTaskIds: z.array(z.string()),
  competencies: z.array(
    z.object({
      id: z.string(),
      title: localized,
      prerequisites: z.array(z.string()),
      learnerShouldBeAbleTo: z.array(localized),
      commonMisconceptionIds: z.array(z.string()),
    }),
  ),
  misconceptions: z.array(
    z.object({
      id: z.string(),
      competencyId: z.string(),
      hypothesis: localized,
    }),
  ),
  tasks: z.array(
    z.object({
      id: z.string(),
      competencyId: z.string(),
      type: z.enum([
        "fill_blank",
        "multiple_choice",
        "short_answer",
        "production",
      ]),
      interventions: z.array(z.string()),
      prompt: localized,
      choices: z.array(localized).optional(),
      expected: z.array(z.string()),
      misconceptionPatterns: z.array(
        z.object({
          match: z.string(),
          misconceptionId: z.string(),
        }),
      ),
      transfer: z.boolean().optional(),
    }),
  ),
  contrasts: z.array(
    z.object({
      misconceptionId: z.string(),
      copy: localized,
      followUpTaskId: z.string(),
    }),
  ),
  workedExamples: z.array(
    z.object({
      competencyId: z.string(),
      copy: localized,
      followUpTaskId: z.string(),
    }),
  ),
});

export function parseCurriculum(data: unknown): Curriculum {
  return curriculumSchema.parse(data) as Curriculum;
}
