"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { OnboardingCard } from "@/components/onboarding/onboarding-shell"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Shield } from "lucide-react"
import { authApi } from "@/lib/api"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  rememberMe: z.boolean().default(false),
})

type FormValues = {
  email: string
  password: string
  rememberMe: boolean
}

const inputClass =
  "h-11 rounded-xl border-slate-200 bg-white text-[14px] placeholder:text-slate-400 focus-visible:ring-brand"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [showOtpReset, setShowOtpReset] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isResettingWithOtp, setIsResettingWithOtp] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.is_superuser) {
        router.replace("/admin")
      } else {
        router.replace("/dashboard")
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  if (isLoading) {
    return (
      <div className="landing-page flex min-h-screen flex-col bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-white">
        <AuthHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-10">
          <OnboardingCard className="max-w-md">
            <div className="flex flex-col items-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <p className="mt-4 text-[14px] text-slate-500">Checking authentication…</p>
            </div>
          </OnboardingCard>
        </main>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  function formatLoginError(message: string): string {
    if (/incorrect email|invalid credentials|could not validate/i.test(message)) {
      return "Incorrect email or password. Please try again."
    }
    if (/no access token|did not return an access token/i.test(message)) {
      return "Could not sign in — backend may be offline or misconfigured. Ensure the API is running on port 8000."
    }
    if (/network error|failed to fetch|could not connect/i.test(message)) {
      return "Cannot reach the server. Check your connection and that the backend is running."
    }
    if (/suspended|policy violation|banned/i.test(message)) {
      return "Your account has been suspended. Contact support@prozlab.com if you believe this is an error."
    }
    return message
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    setLoginError(null)
    form.clearErrors()

    try {
      await login({
        email: values.email,
        password: values.password,
        remember_me: values.rememberMe,
      })

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      })
    } catch (error) {
      const raw = error instanceof Error ? error.message : "Please check your credentials and try again"
      const message = formatLoginError(raw)
      setLoginError(message)

      if (/incorrect email|invalid credentials|password/i.test(message)) {
        form.setError("password", { type: "manual", message: "Invalid credentials" })
      }

      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      })
      toastHot.error(message)
      toastNotify.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    const valid = await form.trigger("email")
    if (!valid) {
      toast({
        title: "Enter a valid email",
        description: "Please provide the email you use for your account.",
        variant: "destructive",
      })
      return
    }

    const email = form.getValues("email")

    try {
      setIsSendingReset(true)
      await authApi.forgotPassword(email)
      toast({ title: "Password reset sent", description: "Check your email for the reset link." })
      toastHot.success("Reset email sent")
      toastNotify.success("Reset email sent")
      setShowOtpReset(true)
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not send reset email"
      toast({ title: "Reset failed", description: msg, variant: "destructive" })
      toastHot.error(msg)
      toastNotify.error(msg)
    } finally {
      setIsSendingReset(false)
    }
  }

  async function handleResetWithOtp() {
    const email = form.getValues("email")
    const emailValid = await form.trigger("email")
    if (!emailValid) return
    if (!otpCode || otpCode.trim().length < 4) {
      toast({ title: "Enter OTP", description: "Please enter the code sent to your email.", variant: "destructive" })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: "Weak password", description: "Password must be at least 8 characters.", variant: "destructive" })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please confirm your new password.", variant: "destructive" })
      return
    }

    try {
      setIsResettingWithOtp(true)
      await authApi.resetPasswordWithOtp(email, otpCode, newPassword, confirmPassword)
      toast({ title: "Password reset", description: "You can now log in with your new password." })
      toastHot.success("Password reset successful")
      toastNotify.success("Password reset successful")
      form.setValue("password", newPassword)
      setShowOtpReset(false)
      setOtpCode("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not reset password with OTP"
      toast({ title: "Reset failed", description: msg, variant: "destructive" })
      toastHot.error(msg)
      toastNotify.error(msg)
    } finally {
      setIsResettingWithOtp(false)
    }
  }

  return (
    <div className="landing-page flex min-h-screen flex-col bg-gradient-to-br from-[#EEF2FF] via-[#F5F3FF] to-white">
      <AuthHeader />

      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          <OnboardingCard>
            <div className="pt-2 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
                <Lock className="h-7 w-7 text-brand" />
              </div>
              <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
                {showOtpReset ? "Reset your password" : "Welcome back"}
              </h1>
              <p className="mt-1.5 text-[14px] text-slate-500">
                {showOtpReset
                  ? "Enter the code from your email and choose a new password"
                  : "Sign in to continue to your ProzLab account"}
              </p>
            </div>

            {showOtpReset ? (
              <div className="mt-6 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">Email</label>
                    <Input
                      type="email"
                      value={form.watch("email")}
                      onChange={(e) => form.setValue("email", e.target.value)}
                      placeholder="email@example.com"
                      className={`mt-1.5 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">OTP Code</label>
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter the code sent to your email"
                      className={`mt-1.5 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`mt-1.5 ${inputClass}`}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-slate-700">Confirm Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`mt-1.5 ${inputClass}`}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowOtpReset(false)}
                    className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 py-3 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetWithOtp}
                    disabled={isResettingWithOtp}
                    className="flex-[2] rounded-xl bg-brand py-3 text-[14px] font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isResettingWithOtp ? "Resetting…" : "Reset Password"}
                  </button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  {loginError && (
                    <div
                      role="alert"
                      className="flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left"
                    >
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                      <div>
                        <p className="text-[13px] font-semibold text-red-800">Sign in failed</p>
                        <p className="mt-0.5 text-[13px] text-red-700">{loginError}</p>
                      </div>
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-medium text-slate-700">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="email@example.com"
                            type="email"
                            className={inputClass}
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              if (loginError) setLoginError(null)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[13px] font-medium text-slate-700">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="••••••••"
                              type={showPassword ? "text" : "password"}
                              className={`pr-11 ${inputClass}`}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                if (loginError) setLoginError(null)
                              }}
                            />
                            <button
                              type="button"
                              className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between pt-1">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => field.onChange(checked === true)}
                              className="border-slate-300 data-[state=checked]:border-brand data-[state=checked]:bg-brand"
                            />
                          </FormControl>
                          <FormLabel className="cursor-pointer text-[13px] font-normal text-slate-600">
                            Remember me
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      className="text-[13px] font-medium text-brand transition-colors hover:text-brand-dark"
                      onClick={handleForgotPassword}
                      disabled={isSendingReset}
                    >
                      {isSendingReset ? "Sending…" : "Forgot password?"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 flex w-full items-center justify-center rounded-xl bg-brand py-3.5 text-[15px] font-semibold text-white shadow-md shadow-indigo-200 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              </Form>
            )}

            {!showOtpReset && (
              <p className="mt-6 text-center text-[14px] text-slate-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-brand hover:text-brand-dark">
                  Get started
                </Link>
              </p>
            )}
          </OnboardingCard>

          <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-slate-400">
            <Shield className="h-3.5 w-3.5 text-brand" />
            <span>Secure &amp; encrypted login</span>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function AuthHeader() {
  return (
    <header className="border-b border-white/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
        <Link href="/">
          <ProzLabLogo size="md" />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600 transition-colors hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    </header>
  )
}
