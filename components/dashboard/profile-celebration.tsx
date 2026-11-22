"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, PartyPopper } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  /** Profile completion before and after the change, 0-100. */
  before: number
  after: number
  /** What was just added, e.g. ["Bio", "Skills", "Location"]. */
  added: string[]
  /** Where to go next; also used for the automatic redirect. */
  onContinue: () => void
  /** Milliseconds before continuing automatically. */
  autoContinueMs?: number
}

const BUBBLE_COLORS = ["#6366F1", "#818CF8", "#A78BFA", "#F15A29", "#FDBA74", "#34D399", "#38BDF8"]

/** Full-screen "profile updated" moment: rising bubbles, the progress jump, then on to the profile. */
export function ProfileCelebration({ before, after, added, onContinue, autoContinueMs = 5000 }: Props) {
  const reduceMotion = useReducedMotion()
  const [shown, setShown] = useState(reduceMotion ? after : before)
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(autoContinueMs / 1000))

  const bubbles = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 38,
        delay: Math.random() * 1.6,
        duration: 3.2 + Math.random() * 2.6,
        drift: (Math.random() - 0.5) * 120,
        color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
      })),
    [],
  )

  // Count the percentage up from the old value to the new one.
  useEffect(() => {
    if (reduceMotion || after <= before) {
      setShown(after)
      return
    }
    const start = performance.now()
    const duration = 1400
    let frame = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(Math.round(before + (after - before) * eased))
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [before, after, reduceMotion])

  useEffect(() => {
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    const go = setTimeout(onContinue, autoContinueMs)
    return () => {
      clearInterval(tick)
      clearTimeout(go)
    }
  }, [onContinue, autoContinueMs])

  const gained = Math.max(0, after - before)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-900/40 px-4 backdrop-blur-sm"
    >
      {!reduceMotion &&
        bubbles.map((b) => (
          <motion.span
            key={b.id}
            aria-hidden
            className="pointer-events-none absolute bottom-[-60px] rounded-full"
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), ${b.color} 55%)`,
              boxShadow: `0 0 18px ${b.color}55`,
            }}
            initial={{ y: 0, x: 0, opacity: 0, scale: 0.6 }}
            animate={{ y: "-115vh", x: b.drift, opacity: [0, 0.95, 0.95, 0], scale: [0.6, 1, 1, 1.1] }}
            transition={{ duration: b.duration, delay: b.delay, ease: "easeOut", repeat: Infinity, repeatDelay: 0.4 }}
          />
        ))}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white p-7 text-center shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)]"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-violet-500 text-white shadow-lg shadow-indigo-500/30">
          <PartyPopper className="h-8 w-8" />
        </div>
        <h2 id="celebration-title" className="mt-5 text-[22px] font-bold text-slate-900">
          Profile updated!
        </h2>
        <p className="mt-1.5 text-[14px] text-slate-600">
          {gained > 0
            ? `Nice work. Your profile jumped ${gained} points.`
            : "Nice work. Your profile is saved."}
        </p>

        <div className="mt-6">
          <div className="flex items-end justify-between text-[13px]">
            <span className="text-slate-500">Profile strength</span>
            <span className="text-[28px] font-extrabold leading-none tabular-nums text-brand">{shown}%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-indigo-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand via-indigo-500 to-violet-500 transition-[width] duration-150"
              style={{ width: `${shown}%` }}
            />
          </div>
          {gained > 0 && (
            <p className="mt-1.5 text-left text-[12px] text-slate-400">
              Was {before}%, now {after}%
            </p>
          )}
        </div>

        {added.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {added.map((item) => (
              <span key={item} className="rounded-full bg-emerald-50 px-2.5 py-1 text-[12px] font-medium text-emerald-700">
                + {item}
              </span>
            ))}
          </div>
        )}

        <Button onClick={onContinue} className="mt-7 h-11 w-full rounded-xl bg-brand text-[15px] font-semibold text-white hover:bg-brand-dark">
          See my profile <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
        <p className="mt-2 text-[12px] text-slate-400" aria-live="polite">
          Taking you there in {secondsLeft}s
        </p>
      </motion.div>
    </div>
  )
}
