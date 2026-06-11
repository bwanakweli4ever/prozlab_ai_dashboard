"use client"

import { useCallback, useEffect, useState } from "react"
import {
  AlertTriangle,
  Ban,
  Flag,
  Loader2,
  RefreshCw,
  Scan,
  ShieldAlert,
  ShieldCheck,
  Search,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { fraudApi } from "@/lib/api"
import type { FraudCandidate } from "@/types/api"
import { cn } from "@/lib/utils"

const RISK_STYLES: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: "text-red-700",
  high: "text-orange-700",
  medium: "text-amber-700",
  low: "text-slate-600",
}

export default function AdminFraudPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [candidates, setCandidates] = useState<FraudCandidate[]>([])
  const [stats, setStats] = useState({ total: 0, flagged: 0, banned: 0, highRisk: 0 })
  const [tab, setTab] = useState("all")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<FraudCandidate | null>(null)
  const [actionOpen, setActionOpen] = useState(false)
  const [actionType, setActionType] = useState<"flag" | "unflag" | "ban" | "unban">("flag")
  const [actionReason, setActionReason] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const filter =
        tab === "flagged" ? "flagged" : tab === "banned" ? "banned" : tab === "high_risk" ? "high_risk" : undefined
      const data = await fraudApi.getCandidates(token, { filter, search: search || undefined })
      setCandidates(data.candidates)
      setStats({
        total: data.total,
        flagged: data.flagged_count,
        banned: data.banned_count,
        highRisk: data.high_risk_count,
      })
    } catch (error) {
      toast({
        title: "Failed to load fraud data",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [token, tab, search, toast])

  useEffect(() => {
    load()
  }, [load])

  const runScan = async () => {
    if (!token) return
    setScanning(true)
    try {
      const results = await fraudApi.scanAll(token, true)
      const flagged = results.filter((r) => r.auto_flagged).length
      toast({
        title: "Fraud scan complete",
        description: `Scanned ${results.length} candidates. ${flagged} auto-flagged.`,
      })
      await load()
    } catch (error) {
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setScanning(false)
    }
  }

  const openAction = (candidate: FraudCandidate, type: typeof actionType) => {
    setSelected(candidate)
    setActionType(type)
    setActionReason("")
    setActionOpen(true)
  }

  const confirmAction = async () => {
    if (!token || !selected || !actionReason.trim()) return
    setActionLoading(true)
    try {
      if (actionType === "flag") await fraudApi.flagUser(selected.user_id, token, actionReason)
      else if (actionType === "unflag") await fraudApi.unflagUser(selected.user_id, token, actionReason)
      else if (actionType === "ban") await fraudApi.banUser(selected.user_id, token, actionReason)
      else await fraudApi.unbanUser(selected.user_id, token, actionReason)

      toast({ title: "Action applied" })
      setActionOpen(false)
      await load()
    } catch (error) {
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const scanOne = async (userId: string) => {
    if (!token) return
    try {
      const result = await fraudApi.scanUser(userId, token, true)
      toast({
        title: `Risk: ${result.risk_level}`,
        description: `Score ${result.fraud_score}${result.auto_flagged ? " — auto-flagged" : ""}`,
      })
      await load()
    } catch (error) {
      toast({
        title: "Scan failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fraud Detection</h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Scan candidates for suspicious patterns, flag for review, or ban fraudulent accounts.
          </p>
        </div>
        <Button onClick={runScan} disabled={scanning} className="bg-brand hover:bg-brand/90">
          {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Scan className="mr-2 h-4 w-4" />}
          Run fraud scan
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total monitored", value: stats.total, icon: ShieldCheck, color: "text-brand" },
          { label: "High risk", value: stats.highRisk, icon: AlertTriangle, color: "text-orange-600" },
          { label: "Flagged", value: stats.flagged, icon: Flag, color: "text-amber-600" },
          { label: "Banned", value: stats.banned, icon: Ban, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label} className="border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <s.icon className={cn("h-8 w-8", s.color)} />
              <div>
                <p className="text-[12px] text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-900">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-[16px]">Candidates</CardTitle>
              <CardDescription>Rule-based fraud scoring from profile, verification, and identity signals</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search..."
                  className="pl-9 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={load}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-4 bg-slate-100">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="high_risk">High risk</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="banned">Banned</TabsTrigger>
            </TabsList>
            <TabsContent value={tab}>
              {loading ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              ) : candidates.length === 0 ? (
                <p className="py-12 text-center text-[14px] text-slate-500">No candidates match this filter.</p>
              ) : (
                <div className="space-y-3">
                  {candidates.map((c) => (
                    <div
                      key={c.user_id}
                      className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-900">
                              {c.first_name} {c.last_name}
                            </p>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                                RISK_STYLES[c.risk_level] || RISK_STYLES.low
                              )}
                            >
                              {c.risk_level} · {c.fraud_score}%
                            </span>
                            {c.is_banned && (
                              <Badge variant="destructive" className="text-[10px]">Banned</Badge>
                            )}
                            {c.is_flagged && !c.is_banned && (
                              <Badge className="bg-amber-500 text-[10px]">Flagged</Badge>
                            )}
                            {!c.is_active && !c.is_banned && (
                              <Badge variant="outline" className="text-[10px]">Inactive</Badge>
                            )}
                          </div>
                          <p className="text-[13px] text-slate-500">{c.email}</p>
                          {c.fraud_signals.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {c.fraud_signals.slice(0, 3).map((s, i) => (
                                <li key={i} className={cn("text-[12px]", SEVERITY_STYLES[s.severity])}>
                                  • {s.message}
                                </li>
                              ))}
                              {c.fraud_signals.length > 3 && (
                                <li className="text-[11px] text-slate-400">
                                  +{c.fraud_signals.length - 3} more signals
                                </li>
                              )}
                            </ul>
                          )}
                          {c.ban_reason && (
                            <p className="mt-1 text-[12px] text-red-600">Ban reason: {c.ban_reason}</p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 shrink-0">
                          <Button size="sm" variant="outline" onClick={() => scanOne(c.user_id)}>
                            <Scan className="mr-1 h-3.5 w-3.5" />
                            Scan
                          </Button>
                          {!c.is_flagged && !c.is_banned && (
                            <Button size="sm" variant="outline" onClick={() => openAction(c, "flag")}>
                              <Flag className="mr-1 h-3.5 w-3.5" />
                              Flag
                            </Button>
                          )}
                          {c.is_flagged && !c.is_banned && (
                            <Button size="sm" variant="outline" onClick={() => openAction(c, "unflag")}>
                              Unflag
                            </Button>
                          )}
                          {!c.is_banned ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openAction(c, "ban")}
                            >
                              <Ban className="mr-1 h-3.5 w-3.5" />
                              Ban
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => openAction(c, "unban")}>
                              <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                              Unban
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={actionOpen} onOpenChange={setActionOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="capitalize">{actionType} candidate</DialogTitle>
          </DialogHeader>
          {selected && (
            <p className="text-[13px] text-slate-600">
              {selected.first_name} {selected.last_name} ({selected.email})
            </p>
          )}
          <Textarea
            placeholder={
              actionType === "ban"
                ? "Reason for ban (required) — shown internally and blocks login"
                : "Reason / notes (required)"
            }
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            className="bg-white"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={actionLoading || !actionReason.trim()}
              variant={actionType === "ban" ? "destructive" : "default"}
              className={actionType !== "ban" ? "bg-brand hover:bg-brand/90" : ""}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
