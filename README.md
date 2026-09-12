# Primer

We are exploring whether an AI tutor can maintain an explicit model of what an individual knows and misunderstands, then use that model to choose better teaching interventions over time.

This is not a course generator, a Duolingo clone, or a chatbot with an education system prompt. Conversation is a renderer. The product is structured pedagogical state.

## Run locally

```bash
pnpm install
pnpm verify    # typecheck + unit tests + evals
pnpm dev       # http://127.0.0.1:43147
```

See the rest of the repository for Primer Core, three micro-curricula, and evals that can fail — especially `evals/equals-as-answer-slot.eval.ts`.
