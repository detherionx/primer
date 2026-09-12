import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { DecisionTrace, LearnerRecord } from "@/core";
import { fileStore, memoryStore } from "@/core/store";

const dataDir = join(process.cwd(), ".data");

export function getStore() {
  const mode = process.env.PRIMER_STORE ?? "local";
  if (mode === "memory") return memoryStore();
  mkdirSync(dataDir, { recursive: true });
  return fileStore(join(dataDir, "store.json"));
}

export function appendTrace(record: LearnerRecord, trace: DecisionTrace): LearnerRecord {
  return { ...record, traces: [...record.traces, trace] };
}

export function writeRunRecord(name: string, payload: unknown) {
  const dir = join(process.cwd(), "runs");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${name}.json`), JSON.stringify(payload, null, 2));
}
