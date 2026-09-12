# Pedagogy

Learning, not engagement, is the primary outcome.

## Principles

- Elicit before telling.
- Evidence before confidence.
- Every tutoring action should be explainable from learner state, objective and observed evidence.
- Do not treat hinted success as independent mastery.
- Do not advance past an active misconception with more of the same retrieval.

## Intervention vocabulary

`diagnostic_question`, `retrieval_practice`, `worked_example`, `guided_example`, `contrast_examples`, `analogy`, `hint`, `explanation`, `simplify_prerequisite`, `test_transfer`, `spaced_review`.

The policy in `src/core/policy.ts` is deliberately simple:

- repeated misconception evidence → `contrast_examples`, then `guided_example`
- low confidence → diagnostic
- repeated failure without a classified misconception → prerequisite repair
- high mastery + confidence → transfer test

Measure whether these moves work. Do not invent a richer policy until an eval shows this one is insufficient.

## Delayed assessment

Predicted mastery is a claim. A later unseen item is the check. Calibration error is a first-class result, not an afterthought.
