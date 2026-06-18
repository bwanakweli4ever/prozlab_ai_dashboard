"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react"

import { ProzLabLogo } from "@/components/prozlab-logo"
import { OnboardingCard } from "@/components/onboarding/onboarding-shell"
import { emailApi } from "@/lib/api"

type VerifyState = "loading" | "success" | "error" | "missing"

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-white">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      }
    >
      <VerifyEmailPageContent />
    </Suspense>
  )
}

function VerifyEmailPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<VerifyState>("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      setState("missing")
      setMessage("This verification link is missing a token. Request a new verification email from the login page.")
      return
    }

    let cancelled = false

    async function verify() {
      try {
        const result = await emailApi.verifyToken(token!)
        if (cancelled) return

        if (result?.success) {
          setState("success")
          setMessage(result.message || "Your email has been verified successfully.")
          window.setTimeout(() => router.replace("/login"), 3500)
          return
        }

        setState("error")
        setMessage(result?.message || "This verification link is invalid or has expired.")
      } catch (error) {
        if (cancelled) return
        setState("error")
        setMessage(
          error instanceof Error
            ? error.message
            : "We could not verify your email. The link may have expired.",
        )
      }
    }

    verify()
    return () => {
      cancelled = true
    }
  }, [searchParams, router])

  return (
    <div className="landing-page flex min-h-screen flex-col bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-white">
      <header className="border-b border-white/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
          <Link href="/">
            <ProzLabLogo size="md" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <OnboardingCard>
            <div className="pt-2 text-center">
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  state === "success"
                    ? "bg-emerald-100"
                    : state === "loading"
                      ? "bg-brand/10"
                      : "bg-red-50"
                }`}
              >
                {state === "loading" && <Loader2 className="h-7 w-7 animate-spin text-brand" />}
                {state === "success" && <CheckCircle2 className="h-7 w-7 text-emerald-600" />}
                {(state === "error" || state === "missing") && (
                  <AlertCircle className="h-7 w-7 text-red-500" />
                )}
              </div>

              <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
                {state === "loading" && "Verifying your email"}
                {state === "success" && "Email verified"}
                {(state === "error" || state === "missing") && "Verification failed"}
              </h1>
              <p className="mt-1.5 text-[14px] text-slate-500">
                {state === "loading" && "Please wait while we confirm your email address…"}
                {state === "success" && "Redirecting you to sign in…"}
                {(state === "error" || state === "missing") && "You can request a new link below."}
              </p>
            </div>

            <div className="mt-6 space-y-4 text-center">
              {message && (
                <p
                  className={`rounded-xl px-4 py-3 text-[13px] leading-relaxed ${
                    state === "success"
                      ? "bg-emerald-50 text-emerald-800"
                      : state === "loading"
                        ? "bg-slate-50 text-slate-600"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  {message}
                </p>
              )}

              {state === "success" && (
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-brand py-3.5 text-[15px] font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-brand-dark"
                >
                  Continue to sign in
                </Link>
              )}

              {(state === "error" || state === "missing") && (
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-[15px] font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-brand-dark"
                >
                  <Mail className="h-4 w-4" />
                  Go to login &amp; resend verification
                </Link>
              )}
            </div>
          </OnboardingCard>
        </motion.div>
      </main>
    </div>
  )
}
