import type { DomainAdapter } from "./types";
import { normalizeComparable } from "./evaluate";

export const languageAdapter: DomainAdapter = {
  domainId: "language",
  normalizeResponse(_task, raw) {
    return normalizeComparable(raw).replace(/[。．.!?]/g, "");
  },
};

export const highSchoolAdapter: DomainAdapter = {
  domainId: "high_school",
  normalizeResponse(_task, raw) {
    return normalizeComparable(raw).replace(/^=/, "");
  },
};

export const universityAdapter: DomainAdapter = {
  domainId: "university",
  normalizeResponse(_task, raw) {
    return normalizeComparable(raw).toLowerCase();
  },
};

export const adapters = {
  language: languageAdapter,
  high_school: highSchoolAdapter,
  university: universityAdapter,
} as const;
