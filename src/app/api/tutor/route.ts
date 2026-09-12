import { NextResponse } from "next/server";
import { beginDelayedAssessment, step } from "@/core/loop";
import { createLearner, createSession } from "@/core/learner";
import { pickText } from "@/core/render";
import type { DomainId, LearnerRecord } from "@/core";
import { loadCurriculum } from "@/lib/curricula";
import { appendTrace, getStore } from "@/lib/store";

export const runtime = "nodejs";

function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function GET(request: Request) {
  const learnerId = new URL(request.url).searchParams.get("learnerId");
  if (!learnerId) {
    return NextResponse.json({ error: "learnerId required" }, { status: 400 });
  }
  const record = getStore().get(learnerId);
  if (!record) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(record);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    action: "start" | "answer" | "delayed";
    domainId?: DomainId;
    learnerId?: string;
    nativeLocale?: string;
    answer?: string;
    hintUsed?: boolean;
  };

  const store = getStore();

  if (body.action === "start") {
    if (!body.domainId) {
      return NextResponse.json({ error: "domainId required" }, { status: 400 });
    }
    const curriculum = loadCurriculum(body.domainId);
    const nativeLocale = body.nativeLocale ?? curriculum.locale;
    const learner = createLearner({
      learnerId: body.learnerId ?? newId("learner"),
      domainId: body.domainId,
      curriculum,
      nativeLocale,
      goal: pickText(curriculum.goalPrompt, nativeLocale, [
        curriculum.locale,
        ...curriculum.fallbackLocales,
      ]),
    });
    const session = createSession({
      sessionId: newId("session"),
      learner,
    });
    const result = step({ state: learner, session, curriculum });
    const record: LearnerRecord = {
      learner: result.state,
      sessions: [result.session],
      traces: [result.trace],
    };
    store.save(record);
    return NextResponse.json({ record, pending: result.pendingTurn });
  }

  if (!body.learnerId) {
    return NextResponse.json({ error: "learnerId required" }, { status: 400 });
  }
  const existing = store.get(body.learnerId);
  if (!existing) {
    return NextResponse.json({ error: "learner not found" }, { status: 404 });
  }

  const session = existing.sessions.at(-1);
  if (!session) {
    return NextResponse.json({ error: "no session" }, { status: 400 });
  }
  const curriculum = loadCurriculum(session.domainId);

  if (body.action === "delayed") {
    const delayedSession = beginDelayedAssessment(session);
    const result = step({
      state: existing.learner,
      session: delayedSession,
      curriculum,
    });
    const record: LearnerRecord = {
      learner: result.state,
      sessions: [...existing.sessions.slice(0, -1), result.session],
      traces: appendTrace(existing, result.trace).traces,
    };
    store.save(record);
    return NextResponse.json({ record, pending: result.pendingTurn });
  }

  if (body.action === "answer") {
    const result = step({
      state: existing.learner,
      session,
      curriculum,
      response: {
        answer: String(body.answer ?? ""),
        hintUsed: Boolean(body.hintUsed),
      },
    });
    const record: LearnerRecord = {
      learner: result.state,
      sessions: [...existing.sessions.slice(0, -1), result.session],
      traces: appendTrace(existing, result.trace).traces,
    };
    store.save(record);
    return NextResponse.json({
      record,
      pending: result.pendingTurn,
      observation: result.observation,
    });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
