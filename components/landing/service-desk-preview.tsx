"use client"

import { useEffect, useReducer, useState, type ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, Pause, Play } from "lucide-react"

import {
  ENGINEERS_ONLINE,
  INITIAL_DESK_STATE,
  TICK_MS,
  deskCounts,
  formatClock,
  formatMinutes,
  simNow,
  tickDesk,
  type DeskState,
  type DeskTicket,
} from "@/components/landing/service-desk-sim"

const easeOut = [0.22, 1, 0.36, 1] as const

function PulseDot() {
  return <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current motion-reduce:animate-none" aria-hidden />
}

function StatusPill({ ticket, now, reduceMotion }: { ticket: DeskTicket; now: number; reduceMotion: boolean }) {
  let className = ""
  let content: ReactNode = null

  switch (ticket.status) {
    case "waiting":
      className = "bg-amber-50 text-amber-800"
      content = <>Waiting · {formatMinutes(now - ticket.openedAt)}</>
      break
    case "helping":
      className = "bg-indigo-50 text-indigo-700"
      content = (
        <>
          <PulseDot />
          Helping now · {formatMinutes(now - (ticket.startedAt ?? now))}
        </>
      )
      break
    case "onsite":
      className = "bg-prozlab-red-10 text-[#B8410F]"
      content = (
        <>
          <PulseDot />
          Expert on site · {formatMinutes(now - (ticket.startedAt ?? now))}
        </>
      )
      break
    case "scheduled":
      className = "bg-slate-100 text-slate-700"
      content = <>Visit booked</>
      break
    case "resolved":
      className = "bg-emerald-50 text-emerald-700"
      content = (
        <>
          <Check className="h-3.5 w-3.5" aria-hidden />
          Resolved in {(ticket.resolvedAt ?? now) - ticket.openedAt} min
        </>
      )
      break
  }

  return (
    <motion.span
      key={ticket.status}
      initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: easeOut }}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 font-mono text-[12px] tabular-nums ${className}`}
    >
      {content}
    </motion.span>
  )
}

/** Live replay of a sample help-desk day: tickets arrive, get picked up, go on site and resolve. */
export function ServiceDeskPreview() {
  const reduceMotion = useReducedMotion() ?? false
  const [state, advance] = useReducer((s: DeskState) => tickDesk(s), INITIAL_DESK_STATE)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (reduceMotion) setPlaying(false)
  }, [reduceMotion])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") advance()
    }, TICK_MS)
    return () => window.clearInterval(timer)
  }, [playing])

  const now = simNow(state)
  const counts = deskCounts(state)

  return (
    <aside
      aria-label="Sample service desk, live replay"
      className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_-12px_rgba(15,23,42,0.18)]"
    >
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="relative flex h-2.5 w-2.5" aria-hidden>
          {playing && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
          )}
          <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${playing ? "bg-emerald-500" : "bg-slate-400"}`} />
        </span>
        <span className="text-[14px] font-semibold text-slate-900">Service desk</span>
        <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[11px] text-slate-600">Live demo</span>
        <span className="font-mono text-[12px] tabular-nums text-slate-500" aria-label="Replay clock">
          {formatClock(now)} ET
        </span>
        <div className="ml-auto flex items-center gap-2.5">
          <span className="hidden items-center gap-1.5 font-mono text-[12px] text-slate-500 sm:inline-flex">
            <span className="flex -space-x-1" aria-hidden>
              <span className="h-4 w-4 rounded-full border-2 border-slate-50 bg-indigo-400" />
              <span className="h-4 w-4 rounded-full border-2 border-slate-50 bg-sky-400" />
            </span>
            {ENGINEERS_ONLINE} engineers online
          </span>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause the live replay" : "Play the live replay"}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          >
            {playing ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-1 border-b border-slate-200 px-4 py-3 text-[13px] text-slate-500">
        <span>
          <b className="mr-1 font-mono font-medium tabular-nums text-amber-700">{counts.waiting}</b>waiting
        </span>
        <span>
          <b className="mr-1 font-mono font-medium tabular-nums text-indigo-700">{counts.helping}</b>helping now
        </span>
        <span>
          <b className="mr-1 font-mono font-medium tabular-nums text-emerald-700">{counts.resolvedToday}</b>resolved today
        </span>
      </div>

      <ol className="relative divide-y divide-slate-100" aria-live="off">
        <AnimatePresence initial={false} mode="popLayout">
          {state.tickets.map((t) => (
            <motion.li
              key={t.num}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, y: -14, backgroundColor: "rgba(99, 102, 241, 0.14)" }}
              animate={{ opacity: 1, y: 0, backgroundColor: "rgba(99, 102, 241, 0)" }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 24 }}
              transition={{ duration: 0.5, ease: easeOut, backgroundColor: { duration: 1.6 } }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 bg-white px-4 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            >
              <span className="col-span-2 font-mono text-[12px] text-slate-400 sm:col-span-1">PZ-{t.num}</span>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span
                    className={`text-[14.5px] font-medium leading-snug transition-colors ${
                      t.status === "resolved" ? "text-slate-500" : "text-slate-800"
                    }`}
                  >
                    {t.subject}
                  </span>
                  <span
                    className={`whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[11px] ${
                      t.onSite ? "bg-prozlab-red-10 text-[#B8410F]" : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    {t.area}
                  </span>
                </div>
                <span className="text-[12.5px] text-slate-500">{t.client}</span>
              </div>
              <StatusPill ticket={t} now={now} reduceMotion={reduceMotion} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

    </aside>
  )
}
