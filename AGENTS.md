# Agent contract

Read this file, `ARCHITECTURE.md`, and `project/invariants.yaml` before changing code.

Notion explains why Primer exists. **Git is sufficient to implement and verify.** Do not require Notion, Slack, or prior chat to complete a bounded change.

## Canonical paths

| Concern | Path |
|---|---|
| Domain-neutral types | `src/core/types.ts` |
| Mastery estimator | `src/core/estimator.ts` |
| Misconception tracker | `src/core/misconceptions.ts` |
| Pedagogical policy | `src/core/policy.ts` |
| Tutor loop | `src/core/loop.ts` |
| Text renderer | `src/core/render.ts` |
| Model provider stub | `src/core/provider.ts` |
| Curricula | `curricula/{japanese,high-school,university}/` |
| Evals | `evals/` |
| Machine state | `project/` |

## Invariants

1. Pedagogical decision ≠ chat message. Produce a `TutorDecision` before any learner-facing wording.
2. Tutor Core ≠ modality renderer. Today the only renderer is text. Voice/visual/interactive must be addable without replacing Core.
3. Tutor intelligence ≠ tutor identity ≠ cosmetic presentation. Do not add avatar/shop types to learner state.
4. Mastery and confidence are separate numbers.
5. Hinted success is not independent mastery.
6. Domain-specific behavior lives in thin adapters and curriculum data, not in `if (domain === "japanese")` scattered through Core.
7. Curricula are multilingual data. German-first BWL copy is allowed; German as an engine assumption is not.
8. Everything written to tracked files may become public immediately. Synthesize fixtures. Never copy real learner data, secrets, or private Notion material into the repo.
9. The simplest algorithm that permits falsification wins.
10. A change is not done until verification has been run.

## Verification

```bash
pnpm typecheck
pnpm test
pnpm eval
# or
pnpm verify
```

`pnpm eval` must remain able to **fail**. The star eval is `evals/equals-as-answer-slot.eval.ts`.

## Autonomy classes

**GREEN** — may complete when checks pass: tests, eval fixtures, docs, lint/type repairs, internal refactors that preserve contracts, `project/` state updates, PRs.

**YELLOW** — implement, but do not merge/deploy without a human: migrations, learner-state semantics, estimator changes, pedagogical policy changes, public contract changes, provider changes, cross-domain architecture impact.

**RED** — do not decide or execute: privacy model, child-safety, auth trust boundaries, destructive data ops, secrets policy, legal/licensing, changing the public/private boundary, changing the product hypothesis.

First pilots are **adults only**, including for high-school subject matter.

## Work items

Stay inside the assigned issue. If you discover a blocking architectural contradiction, stop, record it, and do not silently expand scope.

On failure, leave resumable state under `runs/` (gitignored payloads) rather than half-applied contracts.

## Prompt / model

Do not call a live frontier model from Core. `StubModelProvider` exists so Phase 3 can plug a vendor in without rewriting the tutor. Template rendering is the learner-facing path until evals demand otherwise.
