"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { taskApi, API_BASE_URL } from "@/lib/api"
import type { ServiceRequestProposal } from "@/types/api"

export default function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const [token, setToken] = useState<string>("")
  const [proposal, setProposal] = useState<ServiceRequestProposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then((p) => setToken(p.token))
  }, [params])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    taskApi
      .getPublicProposal(token)
      .then(setProposal)
      .catch((err) => setError(err instanceof Error ? err.message : "Proposal not found"))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="landing-page flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="landing-page flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <h1 className="text-xl font-semibold text-slate-900">Proposal unavailable</h1>
        <p className="mt-2 text-slate-500">{error || "This link may have expired."}</p>
        <Button className="mt-6" asChild><Link href="/">Back to home</Link></Button>
      </div>
    )
  }

  return (
    <div className="landing-page min-h-screen bg-gradient-to-b from-[#EEF2FF] to-white px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <p className="text-[12px] font-semibold uppercase tracking-wide text-brand">Prozlab Proposal</p>
            <CardTitle className="text-2xl">{proposal.title}</CardTitle>
            {proposal.introduction && (
              <p className="text-[14px] leading-relaxed text-slate-600">{proposal.introduction}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {proposal.line_items && proposal.line_items.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Unit price</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposal.line_items.map((item, idx) => (
                      <tr key={idx} className="border-t border-slate-100">
                        <td className="px-4 py-3">{item.description}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{proposal.currency} {item.unit_price.toLocaleString()}</td>
                        <td className="px-4 py-3">{item.days ?? "—"}</td>
                        <td className="px-4 py-3 text-right">
                          {proposal.currency} {(item.quantity * item.unit_price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="rounded-xl bg-slate-50 p-4 text-[14px]">
              {proposal.subtotal != null && <p>Subtotal: {proposal.currency} {proposal.subtotal.toLocaleString()}</p>}
              {proposal.tax_amount != null && proposal.tax_amount > 0 && (
                <p>Tax ({proposal.tax_rate}%): {proposal.currency} {proposal.tax_amount.toLocaleString()}</p>
              )}
              {proposal.total != null && (
                <p className="mt-2 text-lg font-bold text-brand">
                  Total: {proposal.currency} {proposal.total.toLocaleString()}
                </p>
              )}
              {proposal.estimated_days != null && (
                <p className="mt-2 text-slate-600">Estimated timeline: {proposal.estimated_days} day(s)</p>
              )}
            </div>

            {proposal.document_url && (
              <Button asChild>
                <a href={`${API_BASE_URL}${proposal.document_url}`} target="_blank" rel="noreferrer">
                  Download proposal document
                </a>
              </Button>
            )}

            {proposal.notes && (
              <div className="rounded-xl border border-slate-200 p-4 text-[13px] text-slate-600">
                <p className="font-medium text-slate-900">Notes</p>
                <p className="mt-2 whitespace-pre-wrap">{proposal.notes}</p>
              </div>
            )}

            <p className="text-[12px] text-slate-400">
              Questions? Reply to your Prozlab contact or email info@prozlab.com
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
