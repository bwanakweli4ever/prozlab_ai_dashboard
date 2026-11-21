import Link from "next/link"

import { Button } from "@/components/ui/button"

/** Field experts: one cinematic band. Photo: Unsplash (@freedom_515), Unsplash License, with Prozlab livery added. */
export function FieldExpertsSection() {
  return (
    <section id="experts" className="scroll-mt-20 bg-[#05060A] text-white">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:px-8">
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#FDBA74]">Field experts</p>
          <h2 className="mt-3 text-[2.2rem] font-extrabold leading-[1.05] tracking-tight sm:text-[3rem]">
            Verified pros,
            <span className="block text-[#FDBA74]">on the way.</span>
          </h2>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-slate-300">
            When a job needs hands, a vetted technician from the Prozlab network goes on site. We schedule it and stay
            on it until it&apos;s done.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 rounded-lg bg-white px-6 text-[15px] font-semibold text-slate-900 hover:bg-slate-100">
              <Link href="/request-service">Request an expert</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-lg border-white/30 bg-transparent px-6 text-[15px] font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/register">Join as an expert</Link>
            </Button>
          </div>
        </div>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero/prozlab-van-night.jpg"
            alt="A Prozlab Consulting van on its way to a client at night"
            className="h-full w-full object-cover object-[52%_72%]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  )
}
