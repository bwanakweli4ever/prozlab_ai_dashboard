"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"
import type { ProzProfileCreate } from "@/types/api"

const formSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters",
    }),
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Define our form values type explicitly
type FormValues = {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
}

export default function RegisterPage() {
  const { register, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { createProfile } = useProfile()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Get pre-filled data from URL params or onboarding wizard
  const [defaultValues, setDefaultValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues,
  })

  // If already authenticated, redirect away from register
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.is_superuser) {
        router.replace("/admin")
      } else {
        router.replace("/dashboard")
      }
    }
  }, [isAuthenticated, authLoading, router, user])

  // Load pre-filled data on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const onboardingData = sessionStorage.getItem('onboardingData')
    
    if (urlParams.get('fromOnboarding') === 'true' || onboardingData) {
      const data = onboardingData ? JSON.parse(onboardingData) : {}
      setDefaultValues({
        email: urlParams.get('email') || data.email || "",
        password: urlParams.get('password') || data.password || "",
        confirmPassword: urlParams.get('password') || data.password || "",
        firstName: urlParams.get('firstName') || data.firstName || "",
        lastName: urlParams.get('lastName') || data.lastName || "",
      })
    }
  }, [])

  // Update form values when defaultValues change
  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

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

  // If already authenticated, don't render the register form
  if (isAuthenticated) {
    return null // Will redirect in useEffect
  }

  async function onSubmit(values: FormValues) {
    setIsLoading(true)

    try {
      // Step 1: Register the user
      await register({
        email: values.email,
        password: values.password,
        first_name: values.firstName,
        last_name: values.lastName,
      })

      toast({
        title: "Registration successful",
        description: "Setting up your profile...",
      })
      toastHot.success("Registration successful!")
      toastNotify.success("Registration successful!")
      
      // Step 2: Check if there's onboarding data and create profile automatically
      const onboardingDataStr = sessionStorage.getItem('onboardingData')
      console.log('Onboarding data found:', onboardingDataStr ? 'Yes' : 'No')
      
      if (onboardingDataStr) {
        try {
          const onboardingData = JSON.parse(onboardingDataStr)
          console.log('Parsed onboarding data:', onboardingData)
          
          // Map onboarding data to profile creation format
          const experienceMapping: Record<string, number> = {
            "0-1 years": 0.5,
            "1-3 years": 2,
            "3-5 years": 4,
            "5+ years": 7,
          }
          
          const profileData: ProzProfileCreate = {
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            phone_number: onboardingData.phoneNumber || "",
            bio: onboardingData.bio || "Professional looking to provide quality services",
            location: onboardingData.location || "Remote",
            years_experience: experienceMapping[onboardingData.experience] || 1,
            hourly_rate: parseFloat(onboardingData.expectedEarnings) || 50,
            availability: onboardingData.availability || "full-time",
            education: onboardingData.skills?.join(", ") || "Self-taught",
            certifications: onboardingData.certifications?.join(", ") || onboardingData.skills?.join(", ") || "",
            website: "",
            linkedin: "",
            preferred_contact_method: "email",
          }
          
          console.log('Profile data to be created:', profileData)
          
          // Create the profile
          const createdProfile = await createProfile(profileData)
          console.log('Profile created successfully:', createdProfile)
          
          // Store onboarding analytics data for display in dashboard
          if (typeof window !== 'undefined') {
            localStorage.setItem('onboardingSkills', JSON.stringify(onboardingData.skills || []))
            localStorage.setItem('onboardingExperience', onboardingData.experience || '')
            localStorage.setItem('onboardingLocation', onboardingData.location || '')
            localStorage.setItem('onboardingHourlyRate', onboardingData.expectedEarnings || '0')
            localStorage.setItem('profileCreatedFromOnboarding', 'true')
            localStorage.setItem('profileCreatedAt', new Date().toISOString())
            console.log('Analytics data stored in localStorage')
          }
          
          // Clear the onboarding data from sessionStorage
          sessionStorage.removeItem('onboardingData')
          console.log('Onboarding data cleared from sessionStorage')
          
          toast({
            title: "Profile created!",
            description: "Your profile has been set up with your onboarding information. Redirecting to analytics dashboard...",
          })
          toastHot.success("Profile created successfully!")
          
          // Redirect to dashboard with analytics tab
          setTimeout(() => {
            console.log('Redirecting to analytics dashboard...')
            router.push('/dashboard?tab=analytics')
          }, 1500)
        } catch (profileError) {
          console.error("Failed to create profile:", profileError)
          const errorMsg = profileError instanceof Error ? profileError.message : "Failed to create profile"
          console.error("Profile creation error details:", errorMsg)
          
          toast({
            title: "Profile creation failed",
            description: "You can complete your profile from the dashboard. Redirecting...",
            variant: "default",
          })
          toastHot.error(`Profile creation failed: ${errorMsg}`)
          
          // Still redirect to dashboard even if profile creation fails
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      } else {
        console.log('No onboarding data found, normal registration flow')
      }
      
      // The auth context will handle the redirect automatically after login if no onboarding data
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Please check your information and try again"
      toast({
        title: "Registration failed",
        description: msg,
        variant: "destructive",
      })
      toastHot.error(msg)
      toastNotify.error(msg)
    } finally {
      setIsLoading(false)
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
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">Enter your information to create an account</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                <Button type="submit" className="w-full bg-prozlab-blue hover:bg-prozlab-600" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Register"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-prozlab-blue hover:text-prozlab-700 underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      {/* Footer removed as requested */}
    </div>
  )
}
