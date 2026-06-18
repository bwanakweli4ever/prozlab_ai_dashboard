"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Briefcase, Building2, Loader2, Mail, MapPin, Phone, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { taskApi } from "@/lib/api"
import type { ServiceRequestCreate } from "@/types/api"

export default function RequestServicePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [clientName, setClientName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (description.trim().length < 10) {
      toast({
        title: "Description required",
        description: "Please describe what you need in at least 10 characters.",
        variant: "destructive",
      })
      return
    }

    if (!email.trim() && !phone.trim()) {
      toast({
        title: "Contact required",
        description: "Please provide an email or phone number so we can reach you.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const payload: ServiceRequestCreate = {
        service_description: description.trim(),
      }

      if (clientName.trim()) payload.client_name = clientName.trim()
      if (companyName.trim()) payload.company_name = companyName.trim()
      if (location.trim()) payload.location_preference = location.trim()
      if (email.trim()) payload.client_email = email.trim()
      if (phone.trim()) payload.client_phone = phone.trim()

      const response = await taskApi.createServiceRequest(payload)
      router.push(`/request-service/success?id=${response.id}`)
    } catch (error) {
      console.error("Failed to submit service request:", error)
      toast({
        title: "Could not submit request",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="landing-page min-h-screen bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-white">
      <header className="border-b border-white/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[720px] items-center justify-between px-4 sm:px-6">
          <Link href="/">
            <ProzLabLogo size="md" />
          </Link>
          <Link
            href="/register"
            className="text-[13px] font-medium text-slate-600 transition-colors hover:text-brand"
          >
            I&apos;m a Professional
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
            <Briefcase className="h-7 w-7 text-brand" />
          </div>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-slate-900 sm:text-[2rem]">
            Request a professional
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
            Tell us what you need. Only a short description and your email or phone are required.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client_name" className="flex items-center gap-2 text-[13px]">
                <User className="h-4 w-4 text-slate-400" />
                Your name
              </Label>
              <Input
                id="client_name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Jane Smith"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_name" className="flex items-center gap-2 text-[13px]">
                <Building2 className="h-4 w-4 text-slate-400" />
                Business name
              </Label>
              <Input
                id="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2 text-[13px]">
              <MapPin className="h-4 w-4 text-slate-400" />
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, country, or Remote"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[13px]">
              What do you need? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work, timeline, and any important details..."
              rows={5}
              className="resize-none"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 text-[13px]">
                <Mail className="h-4 w-4 text-slate-400" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-[13px]">
                <Phone className="h-4 w-4 text-slate-400" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 123 4567"
                className="h-11"
              />
            </div>
          </div>
          <p className="text-[12px] text-slate-500">Provide at least one: email or phone.</p>

          <Button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-xl bg-brand text-[15px] font-semibold shadow-md shadow-indigo-200 hover:bg-brand-dark"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Submit request
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  )
}
