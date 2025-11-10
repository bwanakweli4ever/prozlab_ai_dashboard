"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff } from "lucide-react"
import { authApi } from "@/lib/api"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"

// Define the form schema with explicit types
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
  rememberMe: z.boolean().default(false),
})

// Define our form values type explicitly
type FormValues = {
  email: string
  password: string
  rememberMe: boolean
}

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })
  
  // If already authenticated, redirect away from login
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.is_superuser) {
        router.replace("/admin")
      } else {
        router.replace("/dashboard")
      }
    }
  }, [isAuthenticated, isLoading, router, user])

  // Show loading while checking authentication
  if (isLoading) {
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

  // If already authenticated, don't render the login form
  if (isAuthenticated) {
    return null // Will redirect in useEffect
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      await login({
        email: values.email,
        password: values.password,
        remember_me: values.rememberMe, // Pass the remember_me flag to the login function
      })

      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      })
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleForgotPassword() {
    const email = form.getValues("email")
    // Validate email field first
    const valid = await form.trigger("email")
    if (!valid) {
      toast({
        title: "Enter a valid email",
        description: "Please provide the email you use for your account.",
        variant: "destructive",
      })
      return
    }

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
    // Quick client validation
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
      // Prefill password and collapse the OTP form
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
            <CardTitle className="text-2xl font-bold text-center">{showOtpReset ? "Reset Password" : "Login to your account"}</CardTitle>
            <CardDescription className="text-center">{showOtpReset ? "Enter your email, OTP code, and a new password" : "Enter your email and password to login"}</CardDescription>
          </CardHeader>
          <CardContent>
            {showOtpReset ? (
              <div className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                    <Input
                      type="email"
                      value={form.watch("email")}
                      onChange={(e) => form.setValue("email", e.target.value)}
                      placeholder="email@example.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">OTP Code</label>
                    <Input
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter the code sent to your email"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">New Password</label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Confirm Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button type="button" onClick={handleResetWithOtp} disabled={isResettingWithOtp}>
                    {isResettingWithOtp ? "Resetting..." : "Reset Password"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowOtpReset(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="••••••••" 
                              type={showPassword ? "text" : "password"} 
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-1">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked === true)
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Remember me</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm text-prozlab-blue hover:text-prozlab-700 underline-offset-4 hover:underline"
                      onClick={handleForgotPassword}
                      disabled={isSendingReset}
                    >
                      {isSendingReset ? "Sending..." : "Forgot password?"}
                    </Button>
                  </div>
                  <Button type="submit" className="w-full bg-prozlab-blue hover:bg-prozlab-600" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          {!showOtpReset && (
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-prozlab-blue hover:text-prozlab-700 underline-offset-4 hover:underline"
                >
                  Register
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
