"use client"

import { useCallback, useEffect, useState } from "react"
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Code2,
  Palette,
  BarChart3,
  ShieldCheck,
  Cloud,
  LayoutGrid,
  Briefcase,
  Upload,
  User,
  MapPin,
  FileText,
  PartyPopper,
  TrendingUp,
  Star,
  AlertCircle,
} from "lucide-react"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import { toast } from "@/components/ui/use-toast"
import { EXPERIENCE_LEVELS } from "@/lib/constants"
import { prozApi } from "@/lib/api"
import {
  OnboardingShell,
  OnboardingCard,
  OnboardingPrimaryBtn,
} from "@/components/onboarding/onboarding-shell"

const wizardInputClass =
  "h-11 rounded-xl border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-brand"

const WORK_TYPES = [
  { id: "full-time", label: "Full-time", color: "bg-blue-100 text-blue-700 ring-blue-200" },
  { id: "contract", label: "Contract", color: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
  { id: "freelance", label: "Freelance", color: "bg-orange-100 text-orange-700 ring-orange-200" },
  { id: "part-time", label: "Part-time", color: "bg-violet-100 text-violet-700 ring-violet-200" },
]

const EXPERTISE_ICONS = [
  { icon: Code2, color: "bg-indigo-100 text-indigo-600" },
  { icon: Palette, color: "bg-pink-100 text-pink-600" },
  { icon: BarChart3, color: "bg-emerald-100 text-emerald-600" },
  { icon: ShieldCheck, color: "bg-green-100 text-green-600" },
  { icon: Cloud, color: "bg-sky-100 text-sky-600" },
  { icon: LayoutGrid, color: "bg-violet-100 text-violet-600" },
]

const signupSchema = z
  .object({
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(8, { message: "Min 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Min 8 characters" }),
    firstName: z.string().min(2, { message: "Min 2 characters" }),
    lastName: z.string().min(2, { message: "Min 2 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type SignupValues = z.infer<typeof signupSchema>

export function RegisterWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const { register: authRegister, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { createProfile } = useProfile()

  const [formData, setFormData] = useState({
    skills: [] as string[],
    experience: "",
    workTypes: [] as string[],
    portfolioLink: "",
    phoneNumber: "",
    availability: "full-time",
  })
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialtiesLoading, setSpecialtiesLoading] = useState(true)
  const [specialtiesError, setSpecialtiesError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)

  const loadSpecialties = useCallback(async () => {
    setSpecialtiesLoading(true)
    setSpecialtiesError(null)
    try {
      const names = await prozApi.getSpecialties()
      setSpecialties(names)
    } catch (error) {
      setSpecialtiesError(error instanceof Error ? error.message : "Could not load specialties")
    } finally {
      setSpecialtiesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSpecialties()
  }, [loadSpecialties])

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", firstName: "", lastName: "" },
  })

  useEffect(() => {
    if (!authLoading && isAuthenticated && currentStep < 8) {
      router.replace(user?.is_superuser ? "/admin" : "/dashboard")
    }
  }, [isAuthenticated, authLoading, router, user, currentStep])

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 8))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))

  const toggleSkill = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(name)
        ? prev.skills.filter((s) => s !== name)
        : [...prev.skills, name],
    }))
  }

  const toggleWorkType = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      workTypes: prev.workTypes.includes(id)
        ? prev.workTypes.filter((w) => w !== id)
        : [...prev.workTypes, id],
      availability: id,
    }))
  }

  const saveOnboardingData = () => {
    const bio =
      formData.skills.length > 0
        ? `Professional with ${formData.experience || "experience"} specializing in ${formData.skills.slice(0, 3).join(", ")}.`
        : "Professional looking to provide quality services"

    sessionStorage.setItem(
      "onboardingData",
      JSON.stringify({
        skills: formData.skills,
        experience: formData.experience,
        workTypes: formData.workTypes,
        availability: formData.availability,
        portfolio: formData.portfolioLink ? [formData.portfolioLink] : [],
        phoneNumber: formData.phoneNumber,
        bio,
        completedAt: new Date().toISOString(),
      })
    )
    localStorage.setItem("onboardingWizardCompleted", "true")
  }

  const isDuplicateEmailError = (message: string) =>
    /already exists|email.*registered|duplicate/i.test(message)

  const onSubmitSignup = async (values: SignupValues) => {
    setLoading(true)
    setSignupError(null)
    signupForm.clearErrors("email")
    try {
      saveOnboardingData()
      await authRegister({
        email: values.email,
        password: values.password,
        first_name: values.firstName,
        last_name: values.lastName,
      })

      toast({ title: "Registration successful", description: "Setting up your profile..." })

      const onboardingDataStr = sessionStorage.getItem("onboardingData")
      if (onboardingDataStr) {
        const onboardingData = JSON.parse(onboardingDataStr)
        const experienceMapping: Record<string, number> = {
          "0-1 years": 0.5,
          "1-3 years": 2,
          "3-5 years": 4,
          "5+ years": 7,
        }
        try {
          await createProfile({
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            phone_number: formData.phoneNumber || "",
            bio: onboardingData.bio || "Professional looking to provide quality services",
            location: "Remote",
            years_experience: experienceMapping[onboardingData.experience] || 1,
            hourly_rate: 50,
            availability: onboardingData.availability || "full-time",
            education: (onboardingData.skills || []).join(", ") || "Self-taught",
            certifications: (onboardingData.skills || []).join(", ") || "",
            website: onboardingData.portfolio?.[0] || "",
            linkedin: "",
            preferred_contact_method: "email",
          } as any)
          sessionStorage.removeItem("onboardingData")
        } catch {
          /* profile creation optional */
        }
      }
      setCurrentStep(8)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Registration failed. Please try again."
      setSignupError(message)

      if (isDuplicateEmailError(message)) {
        signupForm.setError("email", {
          type: "manual",
          message: "This email is already registered",
        })
      }

      toast({
        title: isDuplicateEmailError(message) ? "Email already in use" : "Registration failed",
        description: message,
        variant: "destructive",
      })
      toastHot.error(message)
      toastNotify.error(message)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <OnboardingCard step={1} time="< 1 min">
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-4xl shadow-inner">
                👋
              </div>
              <h1 className="text-[22px] font-bold text-slate-900">Welcome to Prozlab!</h1>
              <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-slate-600">
                Join a community of verified professionals working on real projects and getting
                paid securely.
              </p>
              <ul className="mx-auto mt-5 max-w-xs space-y-2.5 text-left">
                {[
                  { icon: Star, text: "Skills proven by real work" },
                  { icon: Briefcase, text: "Top companies. Real opportunities" },
                  { icon: ShieldCheck, text: "Secure payments. On time." },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-[13px] text-slate-700">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand/10">
                      <Icon className="h-3.5 w-3.5 text-brand" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
              <OnboardingPrimaryBtn onClick={nextStep}>
                Let&apos;s Get Started <ArrowRight className="h-4 w-4" />
              </OnboardingPrimaryBtn>
              <p className="mt-5 text-[13px] text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-brand hover:text-brand-dark">
                  Sign in
                </Link>
              </p>
            </div>
          </OnboardingCard>
        )

      case 2:
        return (
          <OnboardingCard step={2} time="< 2 min">
            <div className="text-center">
              <div className="mx-auto mb-5 grid w-fit grid-cols-3 gap-2">
                {EXPERTISE_ICONS.map(({ icon: Icon, color }, i) => (
                  <div key={i} className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                ))}
              </div>
              <h2 className="text-[20px] font-bold text-slate-900">What&apos;s your expertise?</h2>
              <p className="mt-2 text-[13px] text-slate-600">
                Select the categories that best match your professional skills.
              </p>
              <div className="mt-5 grid max-h-[280px] grid-cols-2 gap-2 overflow-y-auto pr-1">
                {specialtiesLoading &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                {!specialtiesLoading && specialtiesError && (
                  <div className="col-span-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center">
                    <p className="text-[13px] text-red-600">{specialtiesError}</p>
                    <button
                      type="button"
                      onClick={loadSpecialties}
                      className="mt-2 text-[13px] font-semibold text-brand hover:text-brand-dark"
                    >
                      Try again
                    </button>
                  </div>
                )}
                {!specialtiesLoading && !specialtiesError && specialties.length === 0 && (
                  <p className="col-span-2 text-[13px] text-slate-500">
                    No specialties available yet. Ask an admin to seed the database.
                  </p>
                )}
                {!specialtiesLoading &&
                  !specialtiesError &&
                  specialties.map((name) => {
                    const selected = formData.skills.includes(name)
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleSkill(name)}
                        className={`rounded-xl border px-3 py-2.5 text-left text-[12px] font-medium transition-all ${
                          selected
                            ? "border-brand bg-brand/5 text-brand ring-1 ring-brand/30"
                            : "border-slate-200 text-slate-700 hover:border-brand/30"
                        }`}
                      >
                        {name}
                      </button>
                    )
                  })}
              </div>
              {formData.skills.length > 0 && (
                <p className="mt-3 text-[12px] text-brand">{formData.skills.length} selected</p>
              )}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={formData.skills.length === 0 || specialtiesLoading || !!specialtiesError}
                  onClick={nextStep}
                  className="flex-[2] rounded-xl bg-brand py-3 text-[14px] font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
                >
                  Choose Expertise
                </button>
              </div>
            </div>
          </OnboardingCard>
        )

      case 3:
        return (
          <OnboardingCard step={3} time="< 1 min">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
                <TrendingUp className="h-8 w-8 text-brand" />
              </div>
              <h2 className="text-[20px] font-bold text-slate-900">Tell us about your experience</h2>
              <p className="mt-2 text-[13px] text-slate-600">
                This helps us match you with the right opportunities.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                {EXPERIENCE_LEVELS.map((exp) => (
                  <button
                    key={exp.level}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, experience: exp.level }))}
                    className={`rounded-xl border px-3 py-3 text-center transition-all ${
                      formData.experience === exp.level
                        ? "border-brand bg-brand/5 ring-1 ring-brand/30"
                        : "border-slate-200 hover:border-brand/30"
                    }`}
                  >
                    <div className="text-xl">{exp.icon}</div>
                    <div className="mt-1 text-[12px] font-semibold text-slate-800">{exp.level}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={prevStep} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button type="button" disabled={!formData.experience} onClick={nextStep} className="flex-[2] rounded-xl border-2 border-brand/30 py-3 text-[14px] font-semibold text-brand hover:bg-brand/5 disabled:opacity-50">
                  Select Experience
                </button>
              </div>
            </div>
          </OnboardingCard>
        )

      case 4:
        return (
          <OnboardingCard step={4} time="< 2 min">
            <div className="text-center">
              <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
                <Briefcase className="h-10 w-10 text-amber-700" />
                <span className="absolute -right-6 top-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">Full-time</span>
                <span className="absolute -left-8 bottom-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Contract</span>
                <span className="absolute -right-4 bottom-0 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700">Freelance</span>
              </div>
              <h2 className="text-[20px] font-bold text-slate-900">What are you open to?</h2>
              <p className="mt-2 text-[13px] text-slate-600">
                Choose the types of work you&apos;re interested in right now.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {WORK_TYPES.map((wt) => (
                  <button
                    key={wt.id}
                    type="button"
                    onClick={() => toggleWorkType(wt.id)}
                    className={`rounded-full px-4 py-2 text-[13px] font-semibold ring-1 transition-all ${
                      formData.workTypes.includes(wt.id)
                        ? wt.color + " ring-2"
                        : "bg-slate-100 text-slate-600 ring-slate-200"
                    }`}
                  >
                    {wt.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={prevStep} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button type="button" disabled={formData.workTypes.length === 0} onClick={nextStep} className="flex-[2] rounded-xl border-2 border-brand/30 py-3 text-[14px] font-semibold text-brand hover:bg-brand/5 disabled:opacity-50">
                  Choose Preferences
                </button>
              </div>
            </div>
          </OnboardingCard>
        )

      case 5:
        return (
          <OnboardingCard step={5} time="< 2 min">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                <Upload className="h-8 w-8 text-brand" />
              </div>
              <h2 className="text-[20px] font-bold text-slate-900">Showcase your best work</h2>
              <p className="mt-2 text-[13px] text-slate-600">
                Add your portfolio, projects, or links so clients can see your impact.
              </p>
              <div className="mt-5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8">
                <Upload className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-2 text-[12px] font-medium text-slate-600">
                  Upload or drop files here
                </p>
                <p className="text-[11px] text-slate-400">PDF, PPT, DOC, Images — or add a link</p>
              </div>
              <Input
                placeholder="https://your-portfolio.com"
                value={formData.portfolioLink}
                onChange={(e) => setFormData((p) => ({ ...p, portfolioLink: e.target.value }))}
                className={`mt-3 ${wizardInputClass}`}
              />
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={prevStep} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button type="button" onClick={nextStep} className="flex-[2] rounded-xl border-2 border-brand/30 py-3 text-[14px] font-semibold text-brand hover:bg-brand/5">
                  Add Portfolio
                </button>
              </div>
            </div>
          </OnboardingCard>
        )

      case 6:
        return (
          <OnboardingCard step={6} time="< 1 min">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <ShieldCheck className="h-9 w-9 text-emerald-500" />
              </div>
              <h2 className="text-[20px] font-bold text-slate-900">Verify your skills</h2>
              <p className="mt-2 text-[13px] text-slate-600">
                After signup, submit GitHub, work samples, and recommendations to prove your experience.
              </p>
              <ul className="mx-auto mt-5 max-w-xs space-y-2 text-left">
                {["Link GitHub or portfolio", "Add work samples", "Request recommendations"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-slate-700">
                    <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={prevStep} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button type="button" onClick={nextStep} className="flex-[2] rounded-xl border-2 border-brand/30 py-3 text-[14px] font-semibold text-brand hover:bg-brand/5">
                  Start Assessment
                </button>
              </div>
            </div>
          </OnboardingCard>
        )

      case 7:
        return (
          <OnboardingCard step={7} time="< 1 min">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                <User className="h-8 w-8 text-brand" />
              </div>
              <h2 className="text-[20px] font-bold text-slate-900">Create your profile</h2>
              <p className="mt-2 text-[13px] text-slate-600">
                Add a few details to complete your profile and start getting matched.
              </p>
              <ul className="mx-auto mt-4 mb-5 max-w-xs space-y-2 text-left">
                {[
                  { icon: User, text: "Personal info" },
                  { icon: MapPin, text: "Location & availability" },
                  { icon: FileText, text: "Professional summary" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 text-[13px] text-slate-700">
                    <Icon className="h-4 w-4 text-brand" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSubmitSignup)} className="space-y-3">
                {signupError && (
                  <div
                    role="alert"
                    className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <div>
                      <p className="text-[13px] font-semibold text-red-800">
                        {isDuplicateEmailError(signupError) ? "Email already in use" : "Registration failed"}
                      </p>
                      <p className="mt-0.5 text-[13px] text-red-700">{signupError}</p>
                      {isDuplicateEmailError(signupError) && (
                        <Link
                          href="/login"
                          className="mt-2 inline-block text-[13px] font-semibold text-brand hover:text-brand-dark"
                        >
                          Sign in with this email →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={signupForm.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">First Name</FormLabel>
                      <FormControl><Input placeholder="John" {...field} className={wizardInputClass} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signupForm.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Last Name</FormLabel>
                      <FormControl><Input placeholder="Doe" {...field} className={wizardInputClass} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={signupForm.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[12px]">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                        className={`${wizardInputClass} ${signupForm.formState.errors.email ? "border-red-400 ring-1 ring-red-200" : ""}`}
                        onChange={(e) => {
                          field.onChange(e)
                          if (signupError) setSignupError(null)
                          signupForm.clearErrors("email")
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-3">
                  <FormField control={signupForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Password</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} className={wizardInputClass} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={signupForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[12px]">Confirm</FormLabel>
                      <FormControl><Input type="password" placeholder="••••••••" {...field} className={wizardInputClass} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={prevStep} className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 py-3 text-[14px] font-medium text-slate-600 hover:bg-slate-50">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-[2] rounded-xl bg-brand py-3 text-[14px] font-semibold text-white hover:bg-brand-dark disabled:opacity-50">
                    {loading ? "Creating..." : <>Complete Profile <ArrowRight className="ml-1 inline h-4 w-4" /></>}
                  </button>
                </div>
              </form>
            </Form>
          </OnboardingCard>
        )

      case 8:
        return (
          <OnboardingCard className="bg-gradient-to-b from-brand-light/60 to-white">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand/10">
                <PartyPopper className="h-10 w-10 text-brand" />
              </div>
              <h2 className="text-[22px] font-bold text-slate-900">You&apos;re all set! 🎉</h2>
              <p className="mx-auto mt-3 max-w-sm text-[14px] leading-relaxed text-slate-600">
                Your profile is ready. Our AI will start matching you with the best opportunities.
              </p>
              <div className="mt-5 rounded-xl bg-brand/5 p-4 text-left">
                <p className="mb-3 text-[12px] font-bold uppercase tracking-wide text-brand">What&apos;s next?</p>
                <ul className="space-y-2">
                  {[
                    "Get matched with top clients",
                    "Receive job invitations",
                    "Grow your career and earnings",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[13px] text-slate-700">
                      <Check className="h-4 w-4 text-emerald-500" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <OnboardingPrimaryBtn onClick={() => router.push("/dashboard")}>
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </OnboardingPrimaryBtn>
            </div>
          </OnboardingCard>
        )

      default:
        return null
    }
  }

  return (
    <OnboardingShell currentStep={currentStep}>
      {renderStep()}
    </OnboardingShell>
  )
}
