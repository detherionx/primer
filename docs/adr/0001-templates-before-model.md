# ADR 0001: Deterministic templates before a live model

- Status: accepted
- Date: 2026-09-12

## Context

The thesis allows a frontier model behind a thin provider. The first falsifiable moment is pedagogical: detect a misconception, change intervention, compare predicted vs delayed mastery.

## Decision

Phase 0–2 render learner-facing turns from curriculum templates. `ModelProvider` exists and is stubbed. Evals do not call the network.

## Consequences

We can run `pnpm eval` with no keys. When templates are insufficient for a human session, add a provider without rewriting Core. Do not couple state to one vendor's conversation object.
