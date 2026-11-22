"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Check, Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { ServiceDeskPreview } from "@/components/landing/service-desk-preview"
import { FieldExpertsSection } from "@/components/landing/field-experts"
import { CASE_STUDIES, CLIENT_LOGOS, PROCESS_STEPS, SERVICES } from "@/components/landing/it-services-content"
import { BOOK_DEMO_URL } from "@/lib/constants"
import { useAuth } from "@/contexts/auth-context"

const navLinks = [
  { label: "Services", href: "#services" },
  { label: "Our work", href: "#work" },
  { label: "Field experts", href: "#experts" },
  { label: "How it works", href: "#how-it-works" },
]

export function ItServicesLandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const account = isAuthenticated
    ? { label: "Dashboard", href: user?.is_superuser ? "/admin" : "/dashboard" }
    : { label: "Log in", href: "/login" }

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
            <Link
              href={account.href}
              className={
                isAuthenticated
                  ? "hidden items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[14px] font-semibold text-slate-800 hover:bg-slate-50 md:inline-flex"
                  : "hidden px-3 py-2 text-[14px] font-medium text-slate-600 hover:text-slate-900 md:inline-block"
              }
            >
              {account.label}
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
                  {[...navLinks, account].map((link) => (
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
        <section className="relative isolate overflow-hidden border-b border-slate-100">
          {/* Soft light and a faint dot grid, kept behind the content */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,rgba(99,102,241,0.18),transparent)]" />
            <div className="absolute -left-48 bottom-[-220px] h-[480px] w-[480px] rounded-full bg-[radial-gradient(closest-side,rgba(241,90,41,0.10),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] opacity-60 [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_25%,transparent_75%)]" />
          </div>

          <div className="mx-auto grid max-w-[1200px] items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:px-8 lg:py-24">
            <div className="min-w-0">
              <h1 className="text-[2.6rem] font-extrabold leading-[1.04] tracking-tight text-slate-900 sm:text-[3.4rem] lg:text-[3.9rem]">
                Your IT department,
                <span className="relative block w-fit">
                  <span className="bg-gradient-to-r from-brand via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    minus the hiring.
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 300 14"
                    preserveAspectRatio="none"
                    className="absolute -bottom-2 left-0 h-3 w-full text-prozlab-red/70"
                  >
                    <path d="M2 10 C 70 3, 160 2, 298 7" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
              <p className="mt-7 max-w-lg text-[18px] leading-relaxed text-slate-600">
                IT support, networks, security, websites and custom software for businesses across the US. One team
                for all of it, with experts on site when needed.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-12 rounded-xl bg-brand px-6 text-[15px] font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
                >
                  <Link href="/request-service">
                    Request IT support <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-xl border-slate-300 bg-white px-6 text-[15px] font-semibold text-slate-800 hover:bg-slate-50"
                >
                  <a href={BOOK_DEMO_URL} target="_blank" rel="noopener noreferrer">
                    Book a 30-min call
                  </a>
                </Button>
              </div>
              <div className="mt-8">
                <p className="text-[13px] font-medium text-slate-500">Recent work for</p>
                <ul className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-3">
                  {CLIENT_LOGOS.map((client) => (
                    <li key={client.name}>
                      <a
                        href={client.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 opacity-90 grayscale-[30%] transition hover:opacity-100 hover:grayscale-0"
                        title={client.name}
                      >
                        <Image src={client.logo} alt={`${client.name} logo`} width={client.width} height={client.height} className="h-[30px] w-auto" />
                        {client.showName && <span className="text-[15px] font-bold text-slate-800">{client.name}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative min-w-0">
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-indigo-200/60 via-white/0 to-orange-100/60 blur-2xl"
              />
              <ServiceDeskPreview />
              {/* The on-site visit from the demo queue (ticket PZ-1044), shown as the field expert's card */}
              <div className="absolute -bottom-7 -left-6 hidden w-[290px] items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 p-2.5 pr-4 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)] backdrop-blur lg:flex">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src="/images/hero/prozlab-van-night.jpg"
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-slate-900">Field expert booked</p>
                  <p className="truncate text-[12px] text-slate-500">Real estate office · Tampa, FL</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="scroll-mt-20 py-16 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-[1.9rem] font-bold tracking-tight sm:text-[2.4rem]">What we handle</h2>
              <p className="max-w-md text-[15px] text-slate-500">
                Day-to-day IT on one monthly plan. Websites, software and bigger work as fixed-price projects.
              </p>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
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

        {/* ── Our work ── */}
        <section id="work" className="scroll-mt-20 border-t border-slate-100 bg-slate-50 py-16 sm:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-[1.9rem] font-bold tracking-tight sm:text-[2.4rem]">Work we&apos;ve done</h2>
              <p className="max-w-md text-[15px] text-slate-500">Websites, software and apps we&apos;ve built for our clients.</p>
            </div>
            <ul className="mt-10 grid gap-6 md:grid-cols-2">
              {CASE_STUDIES.map((study) => (
                <li key={study.client} className="flex min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <h3 className="flex items-center gap-3 text-[22px] font-bold text-slate-900">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5">
                        <Image src={study.logo} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
                      </span>
                      {study.client}
                    </h3>
                    <a
                      href={study.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[14px] font-medium text-brand hover:underline"
                    >
                      {study.domain} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </div>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{study.about}</p>
                  <p className="mt-6 text-[12px] font-bold uppercase tracking-[0.14em] text-slate-400">What we built</p>
                  <ul className="mt-3 space-y-2">
                    {study.built.map((item) => (
                      <li key={item} className="flex gap-2 text-[15px] text-slate-800">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                    {study.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[12.5px] font-medium text-slate-600">
                        {tag}
                      </span>
                    ))}
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
          <p>&copy; {new Date().getFullYear()} Prozlab Consulting</p>
        </div>
      </footer>
    </div>
  )
}
