import Link from "next/link";

// Public landing. Sample analysis section added in the landing task.
export default function Landing() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-5 py-20 sm:px-8">
      <h1 className="font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
        ANDROMEDA
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink-300">
        Score your Meta ads for retrieval, auction fit and learning before you
        spend.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/sign-up"
          className="rounded-xl bg-meta px-5 py-2.5 text-sm font-medium text-white hover:bg-meta-bright"
        >
          Start free
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl border border-ink-700 px-5 py-2.5 text-sm text-ink-200 hover:text-ink-50"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
