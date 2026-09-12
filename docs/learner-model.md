# Learner model

The durable product is structured pedagogical state, not chat history.

## Competency

A teachable node with a stable id, prerequisites, outcomes and common misconceptions. Curricula in Git define the nodes. Runtime stores per-learner estimates.

## Mastery vs confidence

- **Mastery** — estimate of current ability on that competency (0–1).
- **Confidence** — how much evidence supports that estimate (0–1).

Low mastery + high confidence: we are fairly sure they cannot do it yet.
High mastery + low confidence: a lucky shot; gather more evidence.
Never collapse these into one “score.”

## Observation

Append-only evidence. Outcomes:

- `correct_independent`
- `correct_with_hint`
- `incorrect`
- `misconception` (with a `misconceptionId`)

Derived state must be reconstructable from observations, or at least have a traceable transition (`DecisionTrace.stateChange`).

## Misconception

A persistent hypothesis about a faulty model, with evidence count, confidence and status `uncertain | active | resolved`. One wrong answer is not enough to mark `active`.

## Memory layers

1. Session context — recent turns.
2. Structured pedagogical memory — competencies, misconceptions, observations, review schedule. This is the important layer.
3. Episodic / vector memory — not an MVP dependency.

## Privacy

First pilots are adults. Minimize personal data. Do not put real learner records in Git.
