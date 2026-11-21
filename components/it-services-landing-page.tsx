"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { ServiceDeskPreview } from "@/components/landing/service-desk-preview"
import { FieldExpertsSection } from "@/components/landing/field-experts"
import { PROCESS_STEPS, SERVICES } from "@/components/landing/it-services-content"
import { BOOK_DEMO_URL } from "@/lib/constants"

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Field experts", href: "#experts" },
  { label: "How it works", href: "#how-it-works" },
]

export function ItServicesLandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="landing-page min-h-screen overflow-x-hidden bg-white text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:h-[72px] sm:px-6 lg:px-8">
          <Link href="/" className="shrink-0" aria-label="Prozlab Consulting home">
            <ProzLabLogo size="md" />
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="text-[14px] font-medium text-slate-600 transition-colors hover:text-slate-900">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link href="/login" className="hidden px-3 py-2 text-[14px] font-medium text-slate-600 hover:text-slate-900 md:inline-block">
              Log in
            </Link>
            <Button asChild className="h-10 rounded-lg bg-brand px-4 text-[14px] font-semibold text-white hover:bg-brand-dark sm:px-5">
              <Link href="/request-service">Request support</Link>
            </Button>
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,320px)]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
                  {[...navLinks, { label: "Log in", href: "/login" }].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileNavOpen(false)}
                      className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="border-b border-slate-100">
          <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:py-24">
            <div className="min-w-0">
              <h1 className="text-[2.6rem] font-extrabold leading-[1.04] tracking-tight sm:text-[3.4rem] lg:text-[3.75rem]">
                Your IT department,
                <span className="block text-brand">minus the hiring.</span>
              </h1>
              <p className="mt-5 max-w-lg text-[18px] leading-relaxed text-slate-600">
                Help desk, networks, security, websites and AI for US businesses with 5 to 100 people. One monthly
                plan, and experts on site when needed.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-12 rounded-lg bg-brand px-6 text-[15px] font-semibold hover:bg-brand-dark">
                  <Link href="/request-service">
                    Request IT support <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-lg border-slate-300 bg-white px-6 text-[15px] font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer">
                    Book a 30-min call
                  </a>
                </Button>
              </div>
            </div>
            <ServiceDeskPreview />
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-[1.9rem] font-bold tracking-tight sm:text-[2.4rem]">What we handle</h2>
              <p className="max-w-md text-[15px] text-slate-500">
                Day-to-day IT on one monthly plan. Bigger work as fixed-price projects.
              </p>
            </div>
            <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4">
              {SERVICES.map(({ icon: Icon, title, note }) => (
                <li key={title} className="flex min-w-0 flex-col gap-4 bg-white p-5 sm:p-6">
                  <Icon className="h-6 w-6 text-brand" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-[16px] font-semibold text-slate-900">{title}</p>
                    <p className="mt-1 text-[14px] text-slate-500">{note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Field experts ── */}
        <FieldExpertsSection />

        {/* ── How it works ── */}
        <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <h2 className="text-[1.9rem] font-bold tracking-tight sm:text-[2.4rem]">How it works</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {PROCESS_STEPS.map((step, i) => (
                <li key={step.title} className="min-w-0 border-t-2 border-slate-900 pt-5">
                  <span className="font-mono text-[13px] text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-2 text-[18px] font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Call to action ── */}
        <section className="pb-16 sm:pb-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-brand px-6 py-10 text-white sm:flex-row sm:items-center sm:px-12">
              <h2 className="text-[1.6rem] font-bold leading-tight sm:text-[2rem]">Start with a 30-minute IT review.</h2>
              <Button asChild className="h-12 shrink-0 rounded-lg bg-white px-6 text-[15px] font-semibold text-brand-dark hover:bg-indigo-50">
                <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer">
                  Book your call
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-10 text-[14px] text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Link href="/" aria-label="Prozlab Consulting home">
            <ProzLabLogo size="sm" />
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Footer">
            <Link href="#services" className="hover:text-slate-900">Services</Link>
            <Link href="/proz" className="hover:text-slate-900">Expert directory</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
          </nav>
          <p>
            <span className="select-all">info@prozlab.com</span> · &copy; {new Date().getFullYear()} Prozlab Consulting
          </p>
        </div>
      </footer>
    </div>
  )
}
