# Experiment: Deckungsbeitrag

**Slice:** contribution margin vs profit  
**Curriculum:** `curricula/university/deckungsbeitrag.yaml`  
**Eval:** `evals/cm-equals-profit.eval.ts`

## Hypothesis

University conceptual application (dense terms + a decision) can share Primer Core with language and high-school slices. German-first copy is a curriculum property, not an engine property.

## Protocol

1. Diagnostic: definition of Deckungsbeitrag.
2. Probe whether the learner equates DB with Gewinn.
3. Repeated evidence → contrast (DB = revenue − variable costs; profit = DB − fixed costs).
4. Delayed transfer: keep a product with positive DB when allocated fixed costs make it look like a loss, given that fixed costs remain anyway.

## Success

- `cm_equals_profit` detected and repaired with a strategy change.
- English fallback copy exists; Core does not branch on `"de"`.
- No false-positive misconception bleed into the algebra slice.
