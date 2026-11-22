import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { ProzLabLogo } from "@/components/prozlab-logo"

export type LegalSection = {
  id: string
  title: string
  intro?: string
  items?: string[]
  body?: string
}

/** Plain, readable layout for Terms, Privacy and other legal pages. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string
  updated: string
  intro: string
  sections: LegalSection[]
}) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Prozlab home">
            <ProzLabLogo size="md" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <div className="max-w-3xl">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">Legal</p>
          <h1 className="mt-3 text-[2.2rem] font-bold tracking-tight sm:text-[2.6rem]">{title}</h1>
          <p className="mt-2 text-[14px] text-slate-500">Last updated: {updated}</p>
          <p className="mt-6 text-[16px] leading-relaxed text-slate-600">{intro}</p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Contents" className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">Contents</p>
              <ol className="mt-3 space-y-2 text-[14px]">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-slate-600 hover:text-brand">
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="max-w-3xl space-y-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">
                  <span className="mr-2 text-slate-400">{i + 1}.</span>
                  {s.title}
                </h2>
                {s.intro && <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{s.intro}</p>}
                {s.items && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-slate-600 marker:text-slate-300">
                    {s.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {s.body && <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{s.body}</p>}
              </section>
            ))}

            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <h2 className="text-[17px] font-semibold text-slate-900">Questions?</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
                Send us a message through our{" "}
                <Link href="/request-service" className="font-medium text-brand hover:underline">
                  contact form
                </Link>{" "}
                and we&apos;ll get back to you.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-3 px-4 text-[13px] text-slate-500 sm:px-6">
          <span>© {new Date().getFullYear()} Prozlab Consulting</span>
          <span className="flex gap-5">
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
          </span>
        </div>
      </footer>
    </div>
  )
}
