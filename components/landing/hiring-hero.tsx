"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"

const HERO_SUB =
  "We verify real projects, performance signals, and work history to predict who will succeed—so you can hire with confidence."

const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`

const easeOut = [0.22, 1, 0.36, 1] as const

export function HiringHero() {
  const reduceMotion = useReducedMotion()
  const imgRef = useRef<HTMLImageElement>(null)
  const [imageReady, setImageReady] = useState(false)

  useEffect(() => {
    if (imgRef.current?.complete) setImageReady(true)
  }, [])

  const reveal = !reduceMotion && imageReady

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#EEF2FF] via-[#F3F0FF] to-white">
      <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="relative w-full">
          {/* Ambient gradient — slow drift */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            animate={reduceMotion ? undefined : { opacity: [0.88, 1, 0.88] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{
              background: [
                "radial-gradient(ellipse 90% 70% at 72% 38%, rgba(165, 180, 252, 0.28) 0%, transparent 68%)",
                "radial-gradient(ellipse 70% 55% at 18% 22%, rgba(238, 242, 255, 0.95) 0%, transparent 72%)",
                "radial-gradient(ellipse 80% 45% at 50% 100%, rgba(255, 255, 255, 0.92) 0%, transparent 70%)",
                "linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 42%, #F8F7FF 100%)",
              ].join(", "),
            }}
          />

          {/* Floating accent orbs */}
          {!reduceMotion && (
            <>
              <motion.div
                className="pointer-events-none absolute left-[58%] top-[18%] z-[1] h-32 w-32 rounded-full bg-indigo-300/20 blur-3xl sm:h-40 sm:w-40"
                aria-hidden
                animate={{ x: [0, 18, 0], y: [0, -12, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="pointer-events-none absolute left-[8%] top-[42%] z-[1] h-24 w-24 rounded-full bg-violet-200/25 blur-2xl sm:h-28 sm:w-28"
                aria-hidden
                animate={{ x: [0, -10, 0], y: [0, 8, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              />
            </>
          )}

          <motion.div
            className="relative z-[1]"
            initial={reduceMotion ? false : { filter: "blur(28px)", opacity: 0.55, scale: 1.04 }}
            animate={
              reduceMotion
                ? { filter: "blur(0px)", opacity: 1, scale: 1 }
                : reveal
                  ? { filter: "blur(0px)", opacity: 1, scale: 1 }
                  : { filter: "blur(28px)", opacity: 0.55, scale: 1.04 }
            }
            transition={{ duration: 1.15, ease: easeOut }}
          >
            <img
              ref={imgRef}
              src="/images/hero/prozlab_hero_exact_image.svg"
              alt=""
              className="block h-auto w-full max-h-[min(74vh,780px)] object-contain object-center"
              width={1672}
              height={941}
              decoding="async"
              fetchPriority="high"
              aria-hidden
              onLoad={() => setImageReady(true)}
            />
          </motion.div>

          {/* Granular noise — dissolves as image sharpens */}
          {!reduceMotion && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-[2] mix-blend-soft-light"
              aria-hidden
              style={{ backgroundImage: GRAIN_BG, backgroundSize: "128px 128px" }}
              initial={{ opacity: 0.42 }}
              animate={{ opacity: reveal ? 0 : 0.42 }}
              transition={{ duration: 1.25, ease: easeOut, delay: 0.05 }}
            />
          )}

          {/* Edge fades — blend image into page gradient */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[10%] bg-gradient-to-r from-[#EEF2FF]/90 to-transparent sm:w-[8%]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[8%] bg-gradient-to-l from-[#F3F0FF]/85 to-transparent sm:w-[6%]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[18%] bg-gradient-to-t from-white via-white/70 to-transparent" />

          {/* Soft headline wash */}
          <div className="pointer-events-none absolute left-0 top-0 z-[2] h-[30%] w-[52%] bg-gradient-to-br from-[#EEF2FF]/75 via-[#EEF2FF]/35 to-transparent sm:w-[46%] lg:w-[40%]" />

          <div className="absolute inset-0 z-[3] flex flex-col justify-between">
            <motion.div
              className="w-full max-w-[48%] px-[2%] pt-[2.5%] sm:max-w-[46%] sm:pt-[3%] lg:max-w-[44%] lg:pt-[3.5%]"
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: easeOut, delay: reduceMotion ? 0 : 0.35 }}
            >
              <h1 className="text-[clamp(1.35rem,2.2vw,2.85rem)] font-extrabold leading-[1.1] tracking-tight text-slate-900">
                Skills Proven by{" "}
                <motion.span
                  className="inline-block text-brand"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: easeOut, delay: reduceMotion ? 0 : 0.55 }}
                >
                  Real Work,
                </motion.span>
                <br />
                Not Interviews.
              </h1>

              <motion.p
                className="mt-[2%] max-w-[95%] text-[clamp(12px,1.05vw,16px)] leading-relaxed text-slate-600"
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: easeOut, delay: reduceMotion ? 0 : 0.7 }}
              >
                {HERO_SUB}
              </motion.p>
            </motion.div>

            <motion.div
              className="w-full max-w-[48%] px-[2%] pb-[1.5%] sm:max-w-[46%] sm:pb-[2%] lg:max-w-[44%] lg:pb-[2.5%]"
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeOut, delay: reduceMotion ? 0 : 0.85 }}
            >
              <div className="rounded-2xl border border-white/90 bg-white/95 p-2 shadow-[0_12px_40px_-12px_rgba(99,102,241,0.45)] backdrop-blur-md ring-1 ring-indigo-100/80 sm:p-2.5 lg:p-3">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
                  <Button
                    className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-[#5B5FE8] via-[#6B5CF6] to-[#7C4DFF] px-5 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/40 transition-all hover:from-[#4F46E5] hover:via-[#5B4AE8] hover:to-[#6D3FE8] hover:shadow-xl hover:shadow-indigo-500/50 sm:h-12 sm:w-auto sm:px-6 sm:text-[14px] lg:px-7 lg:text-[15px]"
                    asChild
                  >
                    <Link href="/request-service">Hire Proven Professionals</Link>
                  </Button>
                  <Button
                    className="h-11 w-full rounded-xl border-2 border-[#C7D2FE] bg-white px-5 text-[13px] font-bold text-slate-800 shadow-md shadow-slate-200/80 transition-all hover:border-[#A5B4FC] hover:bg-[#F5F3FF] sm:h-12 sm:w-auto sm:px-6 sm:text-[14px] lg:px-7 lg:text-[15px]"
                    asChild
                  >
                    <Link href="/register">I&apos;m a Professional</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
