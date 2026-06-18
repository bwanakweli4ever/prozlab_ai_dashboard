"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  FileText,
  Rocket,
  ShieldCheck,
  Target,
  UserCog,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

const STEPS = [
  {
    icon: UserCog,
    title: "Request Review",
    description: "Our team will review your request and match you with work-verified professionals.",
  },
  {
    icon: Target,
    title: "Professional Matching",
    description: "We'll connect you with verified professionals who match your requirements.",
  },
  {
    icon: Rocket,
    title: "Project Kickoff",
    description: "Once matched, you can start collaborating with your assigned professional.",
  },
] as const

export default function RequestServiceSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="landing-page flex min-h-screen items-center justify-center bg-gradient-to-b from-[#EEF2FF] to-white">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <RequestServiceSuccessContent />
    </Suspense>
  )
}

function RequestServiceSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [requestId, setRequestId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get("id")
    if (id) setRequestId(id)
    else router.push("/request-service")
  }, [searchParams, router])

  const copyRequestId = () => {
    if (!requestId) return
    navigator.clipboard.writeText(requestId)
    toast({ title: "Copied!", description: "Request ID copied to clipboard" })
  }

  if (!requestId) {
    return (
      <div className="landing-page flex min-h-screen items-center justify-center bg-gradient-to-b from-[#EEF2FF] to-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="landing-page min-h-screen bg-gradient-to-b from-[#EEF2FF] via-[#F8FAFF] to-white px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl">
        {/* Success header */}
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg ring-4 ring-emerald-100">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" strokeWidth={2.5} />
            </div>
          </div>
          <h1 className="text-[clamp(1.5rem,4vw,2rem)] font-extrabold tracking-tight text-slate-900">
            Request Submitted Successfully!
          </h1>
          <p className="mt-2 text-[15px] text-slate-500">
            Your service request has been received and is being processed.
          </p>
        </div>

        {/* Dark card */}
        <div className="overflow-hidden rounded-3xl bg-[#0B1220] shadow-2xl shadow-indigo-900/20 ring-1 ring-white/10">
          <div className="p-6 sm:p-8">
            {/* Request details */}
            <div className="mb-8">
              <div className="mb-4 flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-indigo-300" />
                <h2 className="text-lg font-semibold">Request Details</h2>
              </div>
              <p className="mb-4 text-[13px] text-slate-400">
                Please save your request ID for tracking and future reference.
              </p>
              <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Request ID</p>
                  <p className="mt-1 break-all font-mono text-[13px] font-medium text-indigo-600 sm:text-sm">
                    {requestId}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyRequestId}
                  className="shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  <Copy className="mr-1.5 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>

            {/* Timeline */}
            <div className="mb-8">
              <h3 className="mb-5 text-base font-semibold text-white">What happens next?</h3>
              <div className="relative space-y-6 pl-2">
                <div className="absolute bottom-4 left-[19px] top-4 w-px border-l border-dashed border-slate-600" />
                {STEPS.map((step, index) => {
                  const Icon = step.icon
                  return (
                    <div key={step.title} className="relative flex gap-4">
                      <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/40">
                        {index + 1}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-indigo-300" />
                          <p className="font-semibold text-white">{step.title}</p>
                        </div>
                        <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Important note */}
            <div className="mb-8 rounded-2xl border border-amber-400/30 bg-amber-50/95 p-4 sm:p-5">
              <div className="flex gap-3">
                <div className="mt-0.5 text-amber-500">⚠️</div>
                <div>
                  <p className="font-semibold text-amber-900">Important Note</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-amber-800">
                    You will receive an email confirmation shortly. Please check your spam folder if you
                    don&apos;t see it in your inbox. Questions? Email{" "}
                    <a href="mailto:support@prozlab.com" className="font-semibold text-amber-900 underline">
                      support@prozlab.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-[14px] font-semibold hover:from-indigo-700 hover:to-violet-700"
                asChild
              >
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-1 rounded-xl border-indigo-400/40 bg-transparent text-[14px] font-semibold text-white hover:bg-white/10 hover:text-white"
                asChild
              >
                <Link href="/request-service">
                  Submit Another Request
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Security footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[12px] text-slate-500">
          <ShieldCheck className="h-4 w-4 text-brand" />
          <span>Your data is secure with us. We use industry-standard encryption to protect your information.</span>
        </div>
      </div>
    </div>
  )
}
