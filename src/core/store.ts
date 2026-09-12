import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { DecisionTrace, LearnerState, Session } from "./types";

export interface LearnerRecord {
  learner: LearnerState;
  sessions: Session[];
  traces: DecisionTrace[];
}

export interface PrimerStore {
  get(learnerId: string): LearnerRecord | undefined;
  save(record: LearnerRecord): void;
  list(): LearnerRecord[];
}

export function memoryStore(seed: LearnerRecord[] = []): PrimerStore {
  const map = new Map(seed.map((r) => [r.learner.learnerId, r]));
  return {
    get(id) {
      return map.get(id);
    },
    save(record) {
      map.set(record.learner.learnerId, structuredClone(record));
    },
    list() {
      return [...map.values()].map((r) => structuredClone(r));
    },
  };
}

export function fileStore(filePath: string): PrimerStore {
  const load = (): Map<string, LearnerRecord> => {
    try {
      const raw = readFileSync(filePath, "utf8");
      const rows = JSON.parse(raw) as LearnerRecord[];
      return new Map(rows.map((r) => [r.learner.learnerId, r]));
    } catch {
      return new Map();
    }
  };

  const persist = (map: Map<string, LearnerRecord>) => {
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, JSON.stringify([...map.values()], null, 2));
  };

  return {
    get(id) {
      return load().get(id);
    },
    save(record) {
      const map = load();
      map.set(record.learner.learnerId, record);
      persist(map);
    },
    list() {
      return [...load().values()];
    },
  };
}
