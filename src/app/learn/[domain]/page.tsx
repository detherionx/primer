import Link from "next/link";
import { TutorApp } from "@/components/tutor-app";
import type { DomainId } from "@/core";

const TRACKS: Record<
  DomainId,
  { title: string; locale: string; blurb: string }
> = {
  language: {
    title: "Japanese particles",
    locale: "de",
    blurb: "は / が / を / に / で — production, not a phrasebook.",
  },
  high_school: {
    title: "Linear equations",
    locale: "en",
    blurb: "What “=” means, then one-variable equations.",
  },
  university: {
    title: "Deckungsbeitrag",
    locale: "de",
    blurb: "Contribution margin vs profit, German-first.",
  },
};

export default async function LearnPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  if (!(domain in TRACKS)) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16">
        <h1 className="font-serif text-3xl">Unknown track</h1>
        <Link href="/" className="mt-4 inline-block text-amber-800 underline">
          Back
        </Link>
      </main>
    );
  }
  const domainId = domain as DomainId;
  const track = TRACKS[domainId];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-amber-800">
            Primer
          </Link>
          <h1 className="mt-2 font-serif text-4xl text-stone-900">{track.title}</h1>
          <p className="mt-2 text-stone-600">{track.blurb}</p>
        </div>
      </header>
      <TutorApp domainId={domainId} defaultLocale={track.locale} />
    </main>
  );
}
