# Experiment: linear equations and the meaning of `=`

**Slice:** one-variable linear equations, including what `=` means  
**Curriculum:** `curricula/high-school/linear-equations.yaml`  
**Eval:** `evals/equals-as-answer-slot.eval.ts`

This is the star eval. If it cannot fail, Primer is an LLM wrapper.

## Hypothesis

A learner who treats `=` as “the place where the answer goes” (classic: `8 + 4 = □ + 5` → `12`) can be detected from observations. Primer will change teaching strategy (contrast both sides as equal amounts) rather than emitting another similar retrieval item. Predicted mastery will not race ahead of independent performance. A delayed unseen item checks calibration.

## Protocol

1. Diagnostic: `8 + 4 = □ + 5`.
2. Repeat a structurally similar item.
3. On active misconception, contrast `8+4=12` with `8+4=7+5`, then ask `9+6=□+4`.
4. Later: `7+5=□+6`.

Subject matter is high-school. **First human pilots are adults.**

## Success

- `equals_as_answer_slot` becomes `active` after repeated evidence.
- Next intervention is `contrast_examples` (or guided/explanation), not another diagnostic/retrieval of the same form.
- Hinted success does not produce high-confidence mastery (`evals/hinted-success-not-mastery.eval.ts`).
- Delayed outcome is recorded next to predicted mastery.
