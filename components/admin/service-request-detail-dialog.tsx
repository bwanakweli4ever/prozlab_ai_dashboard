"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Loader2,
  Mail,
  MessageSquare,
  Paperclip,
  Plus,
  Send,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { taskApi } from "@/lib/api"
import { API_BASE_URL } from "@/lib/api"
import type {
  ProposalLineItem,
  ServiceRequestAdminDetail,
  ServiceRequestProposal,
} from "@/types/api"

interface ServiceRequestDetailDialogProps {
  requestId: string | null
  token: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}

const emptyLineItem = (): ProposalLineItem => ({
  description: "",
  quantity: 1,
  unit_price: 0,
  days: 0,
})

export function ServiceRequestDetailDialog({
  requestId,
  token,
  open,
  onOpenChange,
  onUpdated,
}: ServiceRequestDetailDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<ServiceRequestAdminDetail | null>(null)
  const [saving, setSaving] = useState(false)

  const [messageBody, setMessageBody] = useState("")
  const [messageSubject, setMessageSubject] = useState("")
  const [budgetMin, setBudgetMin] = useState("")
  const [budgetMax, setBudgetMax] = useState("")
  const [requestedDays, setRequestedDays] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  const [proposalTitle, setProposalTitle] = useState("")
  const [proposalIntro, setProposalIntro] = useState("")
  const [proposalTaxRate, setProposalTaxRate] = useState("0")
  const [proposalDays, setProposalDays] = useState("")
  const [proposalNotes, setProposalNotes] = useState("")
  const [lineItems, setLineItems] = useState<ProposalLineItem[]>([emptyLineItem()])
  const [proposalFile, setProposalFile] = useState<File | null>(null)
  const [creatingProposal, setCreatingProposal] = useState(false)
  const [sendingProposalId, setSendingProposalId] = useState<string | null>(null)

  const loadDetail = useCallback(async () => {
    if (!requestId || !token) return
    setLoading(true)
    try {
      const data = await taskApi.getServiceRequestAdminDetail(requestId, token)
      setDetail(data)
    } catch (error) {
      toast({
        title: "Failed to load request",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [requestId, token, toast])

  useEffect(() => {
    if (open && requestId && token) loadDetail()
  }, [open, requestId, token, loadDetail])

  const handleStatusUpdate = async (field: "status" | "priority", value: string) => {
    if (!requestId || !token || !detail) return
    setSaving(true)
    try {
      const updated = await taskApi.updateServiceRequestAdmin(requestId, token, { [field]: value })
      setDetail({ ...detail, request: { ...detail.request, ...updated } })
      onUpdated?.()
      toast({ title: "Request updated" })
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSendMessage = async () => {
    if (!requestId || !token || !messageBody.trim()) return
    setSendingMessage(true)
    try {
      await taskApi.sendServiceRequestMessage(requestId, token, {
        body: messageBody.trim(),
        subject: messageSubject.trim() || undefined,
        message_type: "question",
        requested_budget_min: budgetMin ? Number(budgetMin) : undefined,
        requested_budget_max: budgetMax ? Number(budgetMax) : undefined,
        requested_days: requestedDays ? Number(requestedDays) : undefined,
        send_email_to_client: true,
      })
      setMessageBody("")
      setMessageSubject("")
      setBudgetMin("")
      setBudgetMax("")
      setRequestedDays("")
      await loadDetail()
      onUpdated?.()
      toast({ title: "Message sent to client" })
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSendingMessage(false)
    }
  }

  const handleCreateDynamicProposal = async () => {
    if (!requestId || !token || !proposalTitle.trim()) return
    setCreatingProposal(true)
    try {
      await taskApi.createServiceRequestProposal(requestId, token, {
        proposal_type: "dynamic",
        title: proposalTitle.trim(),
        introduction: proposalIntro.trim() || undefined,
        line_items: lineItems.filter((item) => item.description.trim()),
        tax_rate: Number(proposalTaxRate) || 0,
        estimated_days: proposalDays ? Number(proposalDays) : undefined,
        notes: proposalNotes.trim() || undefined,
      })
      setProposalTitle("")
      setProposalIntro("")
      setProposalNotes("")
      setLineItems([emptyLineItem()])
      await loadDetail()
      toast({ title: "Proposal draft created" })
    } catch (error) {
      toast({
        title: "Failed to create proposal",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setCreatingProposal(false)
    }
  }

  const handleUploadProposal = async () => {
    if (!requestId || !token || !proposalTitle.trim() || !proposalFile) return
    setCreatingProposal(true)
    try {
      const formData = new FormData()
      formData.append("title", proposalTitle.trim())
      if (proposalIntro.trim()) formData.append("introduction", proposalIntro.trim())
      if (proposalDays) formData.append("estimated_days", proposalDays)
      if (proposalNotes.trim()) formData.append("notes", proposalNotes.trim())
      formData.append("file", proposalFile)
      await taskApi.uploadServiceRequestProposal(requestId, token, formData)
      setProposalTitle("")
      setProposalIntro("")
      setProposalNotes("")
      setProposalFile(null)
      await loadDetail()
      toast({ title: "Uploaded proposal saved" })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setCreatingProposal(false)
    }
  }

  const handleSendProposal = async (proposal: ServiceRequestProposal) => {
    if (!token) return
    setSendingProposalId(proposal.id)
    try {
      await taskApi.sendServiceRequestProposal(proposal.id, token)
      await loadDetail()
      toast({ title: "Proposal emailed to client" })
    } catch (error) {
      toast({
        title: "Failed to send proposal",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSendingProposalId(null)
    }
  }

  const request = detail?.request

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{request?.service_title || "Service Request"}</DialogTitle>
          <DialogDescription>
            {request?.company_name} · {request?.client_name} · {request?.client_email}
          </DialogDescription>
        </DialogHeader>

        {loading || !detail ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="messages">Messages ({detail.messages.length})</TabsTrigger>
              <TabsTrigger value="proposals">Proposals ({detail.proposals.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 pt-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={detail.request.status}
                    onValueChange={(v) => handleStatusUpdate("status", v)}
                    disabled={saving}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["pending", "assigned", "accepted", "in_progress", "completed", "cancelled", "rejected"].map((s) => (
                        <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={detail.request.priority}
                    onValueChange={(v) => handleStatusUpdate("priority", v)}
                    disabled={saving}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["low", "medium", "high", "urgent"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-[13px] leading-relaxed text-slate-700">
                <p className="font-medium text-slate-900">Description</p>
                <p className="mt-2 whitespace-pre-wrap">{detail.request.service_description}</p>
              </div>

              <div className="grid gap-3 text-[13px] sm:grid-cols-2">
                <p><span className="font-medium">Category:</span> {detail.request.service_category}</p>
                <p><span className="font-medium">Budget:</span> {detail.request.budget_min ?? "—"} – {detail.request.budget_max ?? "—"}</p>
                <p><span className="font-medium">Duration:</span> {detail.request.expected_duration || "—"}</p>
                <p><span className="font-medium">Phone:</span> {detail.request.client_phone || "—"}</p>
              </div>

              {detail.assignments.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[13px] font-semibold text-slate-900">Assignments</p>
                  {detail.assignments.map((a) => (
                    <div key={a.id} className="rounded-lg border border-slate-200 p-3 text-[12px]">
                      <p className="font-medium">{a.professional_name}</p>
                      <p className="text-slate-500">{a.professional_email}</p>
                      <Badge variant="outline" className="mt-2 capitalize">{a.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="messages" className="space-y-4 pt-4">
              <div className="max-h-56 space-y-3 overflow-y-auto rounded-xl border border-slate-200 p-3">
                {detail.messages.length === 0 ? (
                  <p className="text-[13px] text-slate-500">No messages yet. Ask the client about budget or timeline.</p>
                ) : (
                  detail.messages.map((msg) => (
                    <div key={msg.id} className="rounded-lg bg-slate-50 p-3 text-[13px]">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-slate-900">{msg.author_name}</p>
                        <span className="text-[11px] text-slate-400">{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      {msg.subject && <p className="mt-1 text-[12px] font-medium text-slate-700">{msg.subject}</p>}
                      <p className="mt-2 whitespace-pre-wrap text-slate-600">{msg.body}</p>
                      {(msg.requested_budget_min || msg.requested_budget_max || msg.requested_days) && (
                        <p className="mt-2 text-[11px] text-slate-500">
                          Asked: budget {msg.requested_budget_min ?? "—"}–{msg.requested_budget_max ?? "—"}, {msg.requested_days ?? "—"} days
                        </p>
                      )}
                      {msg.email_sent && (
                        <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-600">
                          <Mail className="h-3 w-3" /> Emailed to client
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                <p className="text-[13px] font-semibold text-slate-900">Ask client for more details</p>
                <Input placeholder="Subject (optional)" value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} />
                <Textarea
                  placeholder="e.g. Can you confirm your budget range and how many days you need this completed?"
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  rows={4}
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input type="number" placeholder="Budget min" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
                  <Input type="number" placeholder="Budget max" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
                  <Input type="number" placeholder="Days needed" value={requestedDays} onChange={(e) => setRequestedDays(e.target.value)} />
                </div>
                <Button onClick={handleSendMessage} disabled={sendingMessage || !messageBody.trim()}>
                  {sendingMessage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Send to client
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="proposals" className="space-y-4 pt-4">
              {detail.proposals.map((proposal) => (
                <div key={proposal.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{proposal.title}</p>
                      <p className="text-[12px] text-slate-500 capitalize">{proposal.proposal_type} · {proposal.status}</p>
                    </div>
                    <div className="flex gap-2">
                      {proposal.public_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={proposal.public_url} target="_blank" rel="noreferrer">Preview</a>
                        </Button>
                      )}
                      {proposal.status === "draft" && (
                        <Button
                          size="sm"
                          onClick={() => handleSendProposal(proposal)}
                          disabled={sendingProposalId === proposal.id}
                        >
                          {sendingProposalId === proposal.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Mail className="mr-1 h-4 w-4" /> Send
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  {proposal.total != null && (
                    <p className="mt-2 text-[13px] font-medium text-brand">
                      Total: {proposal.currency} {proposal.total.toLocaleString()}
                      {proposal.estimated_days ? ` · ${proposal.estimated_days} days` : ""}
                    </p>
                  )}
                  {proposal.line_items && proposal.line_items.length > 0 && (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full text-left text-[12px]">
                        <thead>
                          <tr className="border-b text-slate-500">
                            <th className="py-1 pr-2">Item</th>
                            <th className="py-1 pr-2">Qty</th>
                            <th className="py-1 pr-2">Rate</th>
                            <th className="py-1">Days</th>
                          </tr>
                        </thead>
                        <tbody>
                          {proposal.line_items.map((item, idx) => (
                            <tr key={idx} className="border-b border-slate-100">
                              <td className="py-1 pr-2">{item.description}</td>
                              <td className="py-1 pr-2">{item.quantity}</td>
                              <td className="py-1 pr-2">{item.unit_price}</td>
                              <td className="py-1">{item.days ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {proposal.document_url && (
                    <a
                      href={`${API_BASE_URL}${proposal.document_url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[12px] text-brand hover:underline"
                    >
                      <Paperclip className="h-3 w-3" /> Download document
                    </a>
                  )}
                </div>
              ))}

              <div className="space-y-4 rounded-xl border border-dashed border-slate-300 p-4">
                <p className="text-[13px] font-semibold text-slate-900">Create proforma / proposal</p>
                <Input placeholder="Proposal title" value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} />
                <Textarea placeholder="Introduction (optional)" value={proposalIntro} onChange={(e) => setProposalIntro(e.target.value)} rows={2} />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[12px]">Line items (dynamic)</Label>
                    <Button type="button" size="sm" variant="outline" onClick={() => setLineItems((prev) => [...prev, emptyLineItem()])}>
                      <Plus className="mr-1 h-3 w-3" /> Add line
                    </Button>
                  </div>
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="grid gap-2 sm:grid-cols-[1fr_80px_100px_80px_40px]">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => {
                          const next = [...lineItems]
                          next[idx] = { ...next[idx], description: e.target.value }
                          setLineItems(next)
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => {
                          const next = [...lineItems]
                          next[idx] = { ...next[idx], quantity: Number(e.target.value) }
                          setLineItems(next)
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Unit price"
                        value={item.unit_price}
                        onChange={(e) => {
                          const next = [...lineItems]
                          next[idx] = { ...next[idx], unit_price: Number(e.target.value) }
                          setLineItems(next)
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Days"
                        value={item.days ?? ""}
                        onChange={(e) => {
                          const next = [...lineItems]
                          next[idx] = { ...next[idx], days: Number(e.target.value) }
                          setLineItems(next)
                        }}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setLineItems((prev) => prev.filter((_, i) => i !== idx))}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <Input type="number" placeholder="Tax %" value={proposalTaxRate} onChange={(e) => setProposalTaxRate(e.target.value)} />
                  <Input type="number" placeholder="Estimated days" value={proposalDays} onChange={(e) => setProposalDays(e.target.value)} />
                  <Input placeholder="Notes" value={proposalNotes} onChange={(e) => setProposalNotes(e.target.value)} />
                </div>

                <Button onClick={handleCreateDynamicProposal} disabled={creatingProposal || !proposalTitle.trim()}>
                  {creatingProposal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
                  Save dynamic proposal
                </Button>

                <div className="border-t border-slate-200 pt-4">
                  <Label className="text-[12px]">Or upload PDF / document</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    className="mt-2"
                    onChange={(e) => setProposalFile(e.target.files?.[0] ?? null)}
                  />
                  <Button
                    className="mt-3"
                    variant="outline"
                    onClick={handleUploadProposal}
                    disabled={creatingProposal || !proposalTitle.trim() || !proposalFile}
                  >
                    {creatingProposal ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
                    Upload proposal file
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
