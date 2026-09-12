import Link from "next/link";

const TRACKS = [
  {
    href: "/learn/high_school",
    kicker: "High school",
    title: "Linear equations",
    body: "The first eval that can fail: a learner who treats “=” as the place the answer goes. Primer has to notice, change strategy, and later compare predicted mastery with a delayed item.",
  },
  {
    href: "/learn/language",
    kicker: "Language",
    title: "Japanese particles",
    body: "A bounded は / が / を / に / で slice. Same learner-model machinery; thin language adapter. Tests whether に and で stay distinct.",
  },
  {
    href: "/learn/university",
    kicker: "University · BWL",
    title: "Deckungsbeitrag",
    body: "German-first contribution-margin slice. Terminology is not application. The core must not assume German; the curriculum may.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-12">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-800">
          Primer
        </p>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
          An AI tutor that knows what it believes about you — and can be wrong
          on the record.
        </h1>
        <p className="mt-5 text-lg leading-8 text-stone-600">
          We are testing whether a tutor can keep an explicit model of what a
          person knows, misunderstands and retains, then use that state to
          choose the next teaching move. Chat is a renderer. The product is the
          learner model.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {TRACKS.map((track) => (
          <Link
            key={track.href}
            href={track.href}
            className="flex flex-col rounded-2xl border border-stone-300 bg-white p-5 transition hover:border-amber-800 hover:shadow-sm"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-amber-800">
              {track.kicker}
            </p>
            <h2 className="mt-2 font-serif text-2xl">{track.title}</h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-stone-600">
              {track.body}
            </p>
            <span className="mt-5 text-sm font-medium text-stone-900">
              Open slice →
            </span>
          </Link>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-300 bg-white p-6">
        <h2 className="font-serif text-2xl">What this prototype is for</h2>
        <ul className="mt-4 grid gap-3 text-sm leading-6 text-stone-600 sm:grid-cols-2">
          <li>Run the observe → diagnose → intervene → update loop.</li>
          <li>See mastery, confidence and misconceptions on “Your model”.</li>
          <li>
            Prefer a failing eval over a pretty UI. Try answering 12 on{" "}
            <code className="rounded bg-stone-100 px-1">8 + 4 = □ + 5</code>.
          </li>
          <li>No account needed locally. Supabase is wired as an option, not a gate.</li>
        </ul>
        <p className="mt-5 text-sm text-stone-500">
          First human pilots are adults only, including for the high-school
          topic. Voice, avatars and course catalogs are intentionally absent.
        </p>
      </section>
    </main>
  );
}
