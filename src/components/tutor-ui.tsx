import type { DecisionTrace, LearnerState, Turn } from "@/core";

const INTERVENTION_LABEL: Record<string, string> = {
  diagnostic_question: "Diagnostic",
  retrieval_practice: "Retrieval",
  worked_example: "Worked example",
  guided_example: "Guided example",
  contrast_examples: "Contrast",
  analogy: "Analogy",
  hint: "Hint",
  explanation: "Explanation",
  simplify_prerequisite: "Prerequisite",
  test_transfer: "Transfer test",
  spaced_review: "Review",
};

export function ModelPanel({ state }: { state: LearnerState }) {
  const misconceptions = state.misconceptions.filter(
    (m) => m.status !== "resolved",
  );
  const rows = Object.values(state.competencies);

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-stone-300 bg-white p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
          Your model
        </p>
        <h2 className="mt-1 font-serif text-xl text-stone-900">
          What Primer currently believes
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Mastery is the estimate. Confidence is how sure Primer is of that
          estimate. They are not the same number.
        </p>
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li key={row.competencyId} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium text-stone-800">
                {row.competencyId.split(".").slice(-1)[0]?.replaceAll("_", " ")}
              </span>
              <span className="font-mono text-xs text-stone-500">
                {row.mastery.toFixed(2)} / {row.confidence.toFixed(2)}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-200">
              <div
                className="h-full bg-amber-700"
                style={{ width: `${Math.round(row.mastery * 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Misconceptions
        </p>
        {misconceptions.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">None active yet.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {misconceptions.map((m) => (
              <li
                key={m.id}
                className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
              >
                <span className="font-medium">{m.status}</span>
                <span className="text-amber-800"> · {m.hypothesis}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

export function DecisionBanner({ turn }: { turn: Turn }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-400 bg-stone-100 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-stone-900 px-2.5 py-0.5 text-xs font-medium text-stone-50">
          {INTERVENTION_LABEL[turn.decision.intervention] ??
            turn.decision.intervention}
        </span>
        <span className="font-mono text-xs text-stone-500">
          {turn.decision.objectiveId}
        </span>
      </div>
      <p className="mt-2 leading-6 text-stone-700">{turn.decision.reason}</p>
    </div>
  );
}

export function TraceLine({ trace }: { trace: DecisionTrace }) {
  return (
    <li className="font-mono text-[11px] leading-5 text-stone-500">
      v{trace.learnerStateVersion} {trace.intervention}
      {trace.observation ? ` → ${trace.observation}` : ""}
      {trace.stateChange
        ? `  mastery ${trace.stateChange.mastery[0].toFixed(2)}→${trace.stateChange.mastery[1].toFixed(2)}`
        : ""}
    </li>
  );
}
