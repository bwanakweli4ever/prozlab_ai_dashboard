"use client"

import Image from "next/image"
import Link from "next/link"

const HERO_HEADLINE = "Skills Proven by Real Work, Not Interviews."
const HERO_SUB =
  "We verify real projects, performance signals, and work history to predict who will succeed—so you can hire with confidence."

export function HiringHero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#EEF2FF]">
      <h1 className="sr-only">
        {HERO_HEADLINE} {HERO_SUB}
      </h1>

      <div className="relative w-full">
        <Image
          src="/images/hero/hero-mockup-full.png"
          alt=""
          width={1024}
          height={576}
          priority
          className="h-auto w-full"
          sizes="100vw"
          aria-hidden
        />

        {/* Invisible hit targets over mockup CTAs */}
        <div className="absolute inset-0">
          <Link
            href="/request-service"
            className="absolute bottom-[17%] left-[3.5%] h-[7.5%] w-[22%] min-h-[28px] rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:min-h-[32px] lg:min-h-[36px]"
            aria-label="Hire Proven Professionals"
          />
          <Link
            href="/register"
            className="absolute bottom-[17%] left-[26%] h-[7.5%] w-[17%] min-h-[28px] rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:min-h-[32px] lg:min-h-[36px]"
            aria-label="I'm a Professional"
          />
        </div>
      </div>
    </section>
  )
}
