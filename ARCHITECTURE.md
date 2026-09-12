# Architecture

## Product intent

Primer tests this causal loop:

```
Observe → Diagnose → Choose objective → Choose intervention
→ Elicit learner production → Observe outcome → Update learner model
→ Retest later → Choose next intervention
```

If the system does not know something pedagogically useful about a learner that a generic frontier-model chat does not, the project is not interesting.

## Two architectures

1. **Product architecture** — learner state, tutoring loop, domain adapters, curriculum, assessment, evals.
2. **Development control plane** — bounded issues, verification, autonomy classes, machine-readable project state. Not a self-modifying tutor.

The tutoring product is a single orchestrator, not a multi-agent runtime.

## Decision ≠ rendering

`TutorDecision` is chosen first. A text renderer realizes it. Voice/visual/interactive and identity/cosmetics are reserved, not implemented.

## Eval stance

Evals are part of the product. A synthetic learner who treats `=` as the answer slot must make Primer detect a misconception, change intervention, and compare predicted vs delayed mastery.
