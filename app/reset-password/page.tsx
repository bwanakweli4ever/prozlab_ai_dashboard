"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { toast } from "@/components/ui/use-toast"
import { authApi } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, CheckCircle } from "lucide-react"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"

const formSchema = z.object({
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const otpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  otpCode: z.string().min(4, { message: "Enter the 4-6 digit code" }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type FormValues = {
  newPassword: string
  confirmPassword: string
}

type OtpFormValues = {
  email: string
  otpCode: string
  newPassword: string
  confirmPassword: string
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      email: "",
      otpCode: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // If already authenticated, redirect away from reset password
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.is_superuser) {
        router.replace("/admin")
      } else {
        router.replace("/dashboard")
      }
    }
  }, [isAuthenticated, authLoading, router, user])

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [searchParams])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-prozlab-red-10 to-white dark:from-gray-900 dark:to-gray-800 landing-override">
        <div className="w-full max-w-md">
          <Card className="border-prozlab-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
            <CardContent className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-prozlab-blue mx-auto mb-4"></div>
                <p className="text-muted-foreground">Checking authentication...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If already authenticated, don't render the reset password form
  if (isAuthenticated) {
    return null // Will redirect in useEffect
  }

  async function onSubmit(values: FormValues) {
    if (!token) return

    setIsSubmitting(true)

    try {
      await authApi.resetPassword(token, values.newPassword, values.confirmPassword)
      setPasswordReset(true)
      toast({ title: "Password reset successful", description: "Your password has been updated successfully." })
      toastHot.success("Password reset successful")
      toastNotify.success("Password reset successful")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to reset password"
      toast({ title: "Error", description: msg, variant: "destructive" })
      toastHot.error(msg)
      toastNotify.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function onSubmitOtp(values: OtpFormValues) {
    setIsSubmitting(true)
    try {
      await authApi.resetPasswordWithOtp(values.email, values.otpCode, values.newPassword, values.confirmPassword)
      setPasswordReset(true)
      toast({ title: "Password reset successful", description: "Your password has been updated successfully." })
      toastHot.success("Password reset successful")
      toastNotify.success("Password reset successful")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to reset password"
      toast({ title: "Error", description: msg, variant: "destructive" })
      toastHot.error(msg)
      toastNotify.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (passwordReset) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-prozlab-red-10 to-white dark:from-gray-900 dark:to-gray-800 landing-override">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-prozlab-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-6">
                <ProzLabLogo size="md" />
              </div>
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Password Reset Complete</CardTitle>
              <CardDescription>
                Your password has been successfully updated. You can now log in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full bg-prozlab-blue hover:bg-prozlab-600">
                  Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-prozlab-red-10 to-white dark:from-gray-900 dark:to-gray-800 landing-override">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-prozlab-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-6">
                <ProzLabLogo size="md" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Reset Password with OTP</CardTitle>
              <CardDescription className="text-center">
                Enter your email, OTP code received, and choose a new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4">
                  <FormField
                    control={otpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="email@example.com" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={otpForm.control}
                    name="otpCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the code from your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={otpForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={otpForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input placeholder="••••••••" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-prozlab-blue hover:bg-prozlab-600" disabled={isSubmitting}>
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardContent className="pt-0">
              <div className="text-sm text-center text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-prozlab-blue hover:text-prozlab-700 underline-offset-4 hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 bg-gradient-to-b from-prozlab-red-10 to-white dark:from-gray-900 dark:to-gray-800 landing-override">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-prozlab-200 dark:border-gray-700 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-6">
              <ProzLabLogo size="md" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input placeholder="••••••••" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full bg-prozlab-blue hover:bg-prozlab-600" disabled={isSubmitting}>
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardContent className="pt-0">
            <div className="text-sm text-center text-muted-foreground">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-prozlab-blue hover:text-prozlab-700 underline-offset-4 hover:underline"
              >
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
