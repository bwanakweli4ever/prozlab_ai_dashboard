"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Mail } from "lucide-react"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

type FormValues = {
  email: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  // If already authenticated, redirect away from forgot password
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.is_superuser) {
        router.replace("/admin")
      } else {
        router.replace("/dashboard")
      }
    }
  }, [isAuthenticated, authLoading, router, user])

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

  // If already authenticated, don't render the forgot password form
  if (isAuthenticated) {
    return null // Will redirect in useEffect
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      await authApi.forgotPassword(values.email)
      setEmailSent(true)
      toast({ title: "Email sent", description: "Check your email for reset instructions." })
      toastHot.success("Reset email sent")
      toastNotify.success("Reset email sent")
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to send reset email"
      toast({ title: "Error", description: msg, variant: "destructive" })
      toastHot.error(msg)
      toastNotify.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
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
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription>
                We've sent password reset instructions to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Didn't receive the email? Check your spam folder or try again.</p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setEmailSent(false)}
                  className="w-full"
                >
                  Try again
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>
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
            <CardTitle className="text-2xl font-bold text-center">Forgot Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <Button type="submit" className="w-full bg-prozlab-blue hover:bg-prozlab-600" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
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
