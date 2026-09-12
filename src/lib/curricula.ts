import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { parseCurriculum } from "@/core/curriculum";
import type { Curriculum, DomainId } from "@/core/types";

const ROOT = join(process.cwd(), "curricula");

const FILES: Record<DomainId, string> = {
  language: join(ROOT, "japanese/particles.yaml"),
  high_school: join(ROOT, "high-school/linear-equations.yaml"),
  university: join(ROOT, "university/deckungsbeitrag.yaml"),
};

export function loadCurriculum(domain: DomainId): Curriculum {
  const raw = readFileSync(FILES[domain], "utf8");
  return parseCurriculum(parse(raw));
}

export function loadAllCurricula(): Curriculum[] {
  return (Object.keys(FILES) as DomainId[]).map(loadCurriculum);
}
