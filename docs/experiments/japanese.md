# Experiment: Japanese particles

**Slice:** は / が / を / に / で  
**Curriculum:** `curricula/japanese/particles.yaml`  
**Eval:** `evals/ni-de-confusion.eval.ts`

## Hypothesis

The same Primer Core can represent grammatical misconceptions (especially に vs で as interchangeable location markers) without a language-specific tutor engine.

## Protocol

1. Short diagnostic across は, に, で.
2. If に is produced for location-of-action, record `ni_de_interchangeable`.
3. After repeated evidence, switch to contrast (destination vs location-of-action).
4. Delayed item: a new location-of-action sentence.

## Success

- Misconception detected across turns.
- Intervention changes.
- Transfer item is scored against predicted mastery.
- No Core fork required vs algebra/BWL.

## Learners

Adult language learners willing to return. Not a phrasebook completeness test.
