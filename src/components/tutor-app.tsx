"use client";

import { useMemo, useState } from "react";
import type { DomainId, LearnerRecord, Turn } from "@/core";
import { DecisionBanner, ModelPanel, TraceLine } from "@/components/tutor-ui";

type ApiResponse = {
  record: LearnerRecord;
  pending: Turn;
  observation?: LearnerRecord["sessions"][0]["turns"][0]["observation"];
  error?: string;
};

export function TutorApp({
  domainId,
  defaultLocale,
}: {
  domainId: DomainId;
  defaultLocale: string;
}) {
  const [locale, setLocale] = useState(defaultLocale);
  const [record, setRecord] = useState<LearnerRecord | null>(null);
  const [pending, setPending] = useState<Turn | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const lastObservation = useMemo(() => {
    const turns = record?.sessions.at(-1)?.turns ?? [];
    return [...turns].reverse().find((t) => t.observation)?.observation;
  }, [record]);

  async function call(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as ApiResponse;
      if (!res.ok) {
        setError(data.error ?? "Request failed");
        return;
      }
      setRecord(data.record);
      setPending(data.pending);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  const started = Boolean(record && pending);
  const learnerId = record?.learner.learnerId;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
      <section className="flex flex-col gap-4">
        {!started ? (
          <div className="rounded-2xl border border-stone-300 bg-white p-6">
            <h1 className="font-serif text-3xl text-stone-900">
              Start this slice
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
              Local mode needs no account. Primer will run a short diagnostic,
              keep an explicit learner model, and change teaching moves when a
              misconception repeats. This is a working loop, not a course
              catalog.
            </p>
            <label className="mt-5 block text-sm text-stone-700">
              Interface locale
              <select
                className="mt-1 block w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
              >
                <option value={defaultLocale}>{defaultLocale}</option>
                {defaultLocale !== "en" ? <option value="en">en</option> : null}
                {defaultLocale !== "de" ? <option value="de">de</option> : null}
              </select>
            </label>
            <button
              className="mt-5 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              disabled={busy}
              onClick={() =>
                call({ action: "start", domainId, nativeLocale: locale })
              }
            >
              Begin diagnostic
            </button>
          </div>
        ) : (
          <>
            {pending ? <DecisionBanner turn={pending} /> : null}
            <div className="rounded-2xl border border-stone-300 bg-white p-6">
              <p className="whitespace-pre-wrap text-lg leading-8 text-stone-900">
                {pending?.rendered.content}
              </p>
              {pending?.rendered.choices?.length ? (
                <div className="mt-5 flex flex-col gap-2">
                  {pending.rendered.choices.map((choice) => (
                    <button
                      key={choice}
                      disabled={busy}
                      className="rounded-xl border border-stone-300 px-4 py-3 text-left text-sm hover:border-amber-700 hover:bg-amber-50 disabled:opacity-50"
                      onClick={() =>
                        call({
                          action: "answer",
                          learnerId,
                          answer: choice,
                        })
                      }
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              ) : (
                <form
                  className="mt-5 flex flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    call({
                      action: "answer",
                      learnerId,
                      answer,
                    });
                  }}
                >
                  <input
                    className="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer"
                    aria-label="Your answer"
                  />
                  <button
                    className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                    disabled={busy || !answer.trim()}
                  >
                    Submit
                  </button>
                </form>
              )}
              {lastObservation ? (
                <p className="mt-4 text-sm text-stone-500">
                  Last observation:{" "}
                  <span className="font-medium text-stone-800">
                    {lastObservation.outcome}
                  </span>
                  {lastObservation.misconceptionId
                    ? ` (${lastObservation.misconceptionId})`
                    : ""}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="rounded-full border border-stone-400 px-4 py-2 text-sm disabled:opacity-50"
                disabled={busy}
                onClick={() =>
                  call({
                    action: "answer",
                    learnerId,
                    answer: answer || pending?.rendered.choices?.[0] || "",
                    hintUsed: true,
                  })
                }
              >
                Submit with hint used
              </button>
              <button
                className="rounded-full border border-stone-400 px-4 py-2 text-sm disabled:opacity-50"
                disabled={busy}
                onClick={() =>
                  call({ action: "delayed", learnerId })
                }
              >
                Simulate returning later
              </button>
            </div>
          </>
        )}
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}
        {record ? (
          <ol className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
            {record.traces.slice(-8).map((trace, i) => (
              <TraceLine key={`${trace.at}-${i}`} trace={trace} />
            ))}
          </ol>
        ) : null}
      </section>
      {record ? <ModelPanel state={record.learner} /> : (
        <aside className="rounded-2xl border border-stone-300 bg-white p-5 text-sm leading-6 text-stone-600">
          After the diagnostic, this panel shows mastery, confidence and any
          active misconception hypotheses. That is the product.
        </aside>
      )}
    </div>
  );
}
