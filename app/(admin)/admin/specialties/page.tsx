"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { adminApi, prozApi } from "@/lib/api"
import type { SpecialtyAdmin } from "@/types/api"

export default function AdminSpecialtiesPage() {
  const { token } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [specialties, setSpecialties] = useState<SpecialtyAdmin[]>([])
  const [readOnly, setReadOnly] = useState(false)
  const [search, setSearch] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<SpecialtyAdmin | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setReadOnly(false)
    try {
      const rows = await adminApi.getSpecialtiesAdmin(token)
      setSpecialties(rows)
    } catch (error) {
      // Admin CRUD API missing or auth issue — show live public list so admin sees what onboarding uses
      try {
        const names = await prozApi.getSpecialties()
        setSpecialties(
          names.map((skillName) => ({
            id: skillName,
            name: skillName,
            description: null,
            profiles_count: 0,
          })),
        )
        setReadOnly(true)
        toast({
          title: "Read-only view",
          description:
            "Showing skills from the live database. Restart the API after deploy to enable add/edit/delete.",
        })
      } catch {
        toast({
          title: "Failed to load skills",
          description: error instanceof Error ? error.message : "Try again",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }, [token, toast])

  useEffect(() => {
    load()
  }, [load])

  const openCreate = () => {
    if (readOnly) {
      toast({
        title: "Restart API required",
        description: "Deploy the latest backend and restart the API to manage skills.",
        variant: "destructive",
      })
      return
    }
    setEditing(null)
    setName("")
    setDescription("")
    setDialogOpen(true)
  }

  const openEdit = (row: SpecialtyAdmin) => {
    if (readOnly) return
    setEditing(row)
    setName(row.name)
    setDescription(row.description || "")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!token || !name.trim() || readOnly) return
    setSaving(true)
    try {
      if (editing) {
        await adminApi.updateSpecialty(token, editing.id, {
          name: name.trim(),
          description: description.trim() || undefined,
        })
        toast({ title: "Skill updated" })
      } else {
        await adminApi.createSpecialty(token, {
          name: name.trim(),
          description: description.trim() || undefined,
        })
        toast({ title: "Skill added" })
      }
      setDialogOpen(false)
      await load()
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (row: SpecialtyAdmin) => {
    if (!token || readOnly) return
    if (!confirm(`Delete "${row.name}"?`)) return
    try {
      await adminApi.deleteSpecialty(token, row.id)
      toast({ title: "Skill deleted" })
      await load()
    } catch (error) {
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Skill may be in use by profiles",
        variant: "destructive",
      })
    }
  }

  const handleSeed = async () => {
    if (!token || readOnly) {
      toast({
        title: "Restart API required",
        description: "Deploy and restart the backend, then use Seed defaults.",
        variant: "destructive",
      })
      return
    }
    setSeeding(true)
    try {
      const result = await adminApi.seedSpecialties(token)
      toast({
        title: "Default skills synced",
        description: `Created ${result.created}, updated ${result.updated}. ${result.total_in_db} total in database.`,
      })
      await load()
    } catch (error) {
      toast({
        title: "Seed failed",
        description: error instanceof Error ? error.message : "Try again",
        variant: "destructive",
      })
    } finally {
      setSeeding(false)
    }
  }

  const filtered = specialties.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description || "").toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skills & Specialties</h1>
          <p className="text-[14px] text-slate-500">
            Onboarding loads skills from the database — not a hardcoded list. This page manages that list.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button variant="outline" onClick={handleSeed} disabled={seeding || readOnly}>
            {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Seed defaults
          </Button>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add skill
          </Button>
        </div>
      </div>

      {readOnly && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          Read-only mode: showing the same skills onboarding uses. Restart the API after{" "}
          <code className="rounded bg-amber-100 px-1">git pull</code> to enable editing here.
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-9" placeholder="Search skills..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All skills ({filtered.length})</CardTitle>
          <CardDescription>
            {readOnly
              ? "Matches what candidates see during onboarding (from API)."
              : "Add, edit, or remove skills shown in onboarding and profiles."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{row.name}</p>
                    {row.description && <p className="text-[13px] text-slate-500">{row.description}</p>}
                    {!readOnly && (
                      <p className="text-[11px] text-slate-400">{row.profiles_count} profile(s)</p>
                    )}
                  </div>
                  {!readOnly && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                        <Pencil className="mr-1 h-3 w-3" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(row)}>
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="py-8 text-center text-[13px] text-slate-500">
                  No skills found. Run &quot;Seed defaults&quot; or add skills manually.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit skill" : "Add skill"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Web Development" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description for admins"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
