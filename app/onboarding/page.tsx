"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CheckCircle2, ChevronRight, Loader2, Zap, Target, Star, Users, DollarSign, Clock, TrendingUp, ArrowRight, Eye, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import type { ProzProfileCreate } from "@/types/api"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"

// Define the steps and their schemas
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
})

const professionalInfoSchema = z.object({
  yearsExperience: z.coerce.number().min(0, "Years must be a positive number"),
  hourlyRate: z.coerce.number().min(0, "Rate must be a positive number"),
  availability: z.string().min(1, "Please select your availability"),
})

const bioSchema = z.object({
  bio: z.string().min(50, "Bio must be at least 50 characters"),
})

const educationSchema = z.object({
  education: z.string().min(10, "Education details must be at least 10 characters"),
  certifications: z.string().min(5, "Please add at least one certification or write 'None' if you don't have any"),
})

const contactInfoSchema = z.object({
  // Optional: allow blank string; if provided, must be a valid URL or 'None'
  website: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val === "None" || val.startsWith("http"), "Please enter a valid URL, leave blank, or write 'None'"),
  // Optional: allow blank string; if provided, must be a valid URL or 'None'
  linkedin: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val === "None" || val.startsWith("http"), "Please enter a valid URL, leave blank, or write 'None'"),
  // Optional: allow blank string; if provided, must be one of allowed values
  preferredContactMethod: z
    .union([z.literal(""), z.enum(["email", "phone", "website", "linkedin"])])
    .optional(),
})

// Combined schema for all steps
const profileSchema = z.object({
  ...personalInfoSchema.shape,
  ...professionalInfoSchema.shape,
  ...bioSchema.shape,
  ...educationSchema.shape,
  ...contactInfoSchema.shape,
})

type ProfileFormValues = z.infer<typeof profileSchema>

const steps = [
  {
    id: "personal",
    name: "Personal Information",
    fields: ["firstName", "lastName", "email", "phoneNumber", "location"],
    schema: personalInfoSchema,
  },
  {
    id: "professional",
    name: "Professional Details",
    fields: ["yearsExperience", "hourlyRate", "availability"],
    schema: professionalInfoSchema,
  },
  {
    id: "bio",
    name: "Professional Bio",
    fields: ["bio"],
    schema: bioSchema,
  },
  {
    id: "education",
    name: "Education & Certifications",
    fields: ["education", "certifications"],
    schema: educationSchema,
  },
  {
    id: "contact",
    name: "Contact Preferences",
    fields: ["website", "linkedin", "preferredContactMethod"],
    schema: contactInfoSchema,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  
  const { user, token } = useAuth()
  const { createProfile, updateProfile, profile, isLoading, calculateProfileCompletion } = useProfile()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isClientReady, setIsClientReady] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [showPreview, setShowPreview] = useState(false)
  const [autoSaveData, setAutoSaveData] = useState<any>(null)
  const prevFormValuesRef = useRef<any>(null)

  // Get default values from onboarding wizard data
  const getDefaultValues = () => {
    // Check if we're on the client side before accessing sessionStorage
    if (typeof window !== 'undefined') {
      const onboardingData = sessionStorage.getItem('onboardingData')
      if (onboardingData) {
        try {
          const data = JSON.parse(onboardingData)
            return {
              firstName: data.firstName || user?.first_name || "",
              lastName: data.lastName || user?.last_name || "",
              email: data.email || user?.email || "",
              phoneNumber: data.phone || "",
              location: data.location || "",
              yearsExperience: data.experience ? parseInt(data.experience.split('-')[0]) || 0 : 0,
              hourlyRate: data.expectedEarnings ? parseInt(data.expectedEarnings.split('-')[0].replace('$', '')) || 0 : 0,
              availability: "",
              bio: "",
              education: "",
              certifications: "",
              website: "",
              linkedin: "",
              preferredContactMethod: "email",
            }
        } catch (error) {
          console.error('Error parsing onboarding data:', error)
        }
      }
    }
    return {
      firstName: user?.first_name || "",
      lastName: user?.last_name || "",
      email: user?.email || "",
      phoneNumber: "",
      location: "",
      yearsExperience: 0,
      hourlyRate: 0,
      availability: "",
      bio: "",
      education: "",
      certifications: "",
      website: "",
      linkedin: "",
      preferredContactMethod: "email",
    }
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: getDefaultValues(),
    mode: "onChange",
  })

  // Set client-ready state after mount to avoid hydration mismatch
  useEffect(() => {
    setIsClientReady(true)
    
    // Load auto-saved data
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onboardingAutoSave')
      if (saved) {
        try {
          const data = JSON.parse(saved)
          setAutoSaveData(data)
        } catch (error) {
          console.error('Failed to load auto-saved data:', error)
        }
      }
    }
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (!isClientReady || isEditing) return

    const autoSave = () => {
      const formValues = form.getValues()
      const validValues = Object.fromEntries(
        Object.entries(formValues).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ""
        )
      )

      if (Object.keys(validValues).length > 0) {
        const saveData = {
          data: validValues,
          step: currentStep,
          timestamp: new Date().toISOString()
        }
        
        localStorage.setItem('onboardingAutoSave', JSON.stringify(saveData))
        setAutoSaveData(saveData)
      }
    }

    // Auto-save every 30 seconds
    const interval = setInterval(autoSave, 30000)
    return () => clearInterval(interval)
  }, [isClientReady, currentStep, form, isEditing])

  // Track step completion
  useEffect(() => {
    const currentFormValues = form.getValues()
    const currentValuesString = JSON.stringify(currentFormValues)
    
    // Only update if form values actually changed
    if (prevFormValuesRef.current !== currentValuesString) {
      prevFormValuesRef.current = currentValuesString
      
      const newCompletedSteps = new Set<number>()
      
      steps.forEach((step, index) => {
        const stepValues = Object.fromEntries(
          Object.entries(currentFormValues).filter(([key]) => step.fields.includes(key))
        )
        
        try {
          step.schema.parse(stepValues)
          newCompletedSteps.add(index)
        } catch {
          // Step not completed
        }
      })
      
      setCompletedSteps(newCompletedSteps)
    }
  })

  // If profile is already complete, never allow staying on onboarding
  useEffect(() => {
    if (!isLoading) {
      const { percentage } = calculateProfileCompletion()
      if (percentage === 100) {
        router.replace("/dashboard?tab=analytics")
      }
    }
  }, [isLoading, calculateProfileCompletion, router])

  // Check if user already has a profile and set editing mode
  useEffect(() => {
    if (!isLoading && profile) {
      setIsEditing(true)
      // Pre-fill form with existing profile data
      form.reset({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: profile.email || "",
        phoneNumber: profile.phone_number || "",
        location: profile.location || "",
        yearsExperience: profile.years_experience || 0,
        hourlyRate: profile.hourly_rate || 0,
        availability: profile.availability || "",
        bio: profile.bio || "",
        education: profile.education || "",
        certifications: profile.certifications || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        preferredContactMethod: profile.preferred_contact_method || "",
      })
    }
  }, [profile, isLoading, form])

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.setValue("firstName", user.first_name || "")
      form.setValue("lastName", user.last_name || "")
      form.setValue("email", user.email || "")
    }
  }, [user, form])

  const currentSchema = steps[currentStep].schema
  const currentFields = steps[currentStep].fields

  // Calculate progress percentage
  const progress = ((currentStep + 1) / steps.length) * 100
  const overallCompletion = (completedSteps.size / steps.length) * 100

  async function onSubmit(values: ProfileFormValues) {
    const isLastStep = currentStep === steps.length - 1

    if (!isLastStep) {
      // Validate only the current step's fields
      try {
        const currentValues = Object.fromEntries(Object.entries(values).filter(([key]) => currentFields.includes(key)))

        const validationResult = await currentSchema.safeParseAsync(currentValues)

        if (validationResult.success) {
          console.log("Current step validation successful, moving to next step")
          setCurrentStep(currentStep + 1)
        } else {
          console.error("Validation errors:", validationResult.error)
          // Focus on the first field with an error
          const firstErrorField = Object.keys(validationResult.error.formErrors.fieldErrors)[0]
          if (firstErrorField) {
            form.setFocus(firstErrorField as any)
          }
        }
        return
      } catch (error) {
        console.error("Validation error:", error)
        return
      }
    }

    // Submit the form if it's the last step
    setIsSubmitting(true)

    try {
      if (!token) {
        throw new Error("You must be logged in to create a profile")
      }

      // Log all form values to verify they're being captured
      console.log("All form values:", form.getValues())

      const profileData: ProzProfileCreate = {
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone_number: values.phoneNumber || "",
        bio: values.bio,
        location: values.location,
        years_experience: values.yearsExperience,
        hourly_rate: values.hourlyRate,
        availability: values.availability,
        education: values.education || "",
        certifications: values.certifications || "",
        website: values.website || "",
        linkedin: values.linkedin || "",
        preferred_contact_method: values.preferredContactMethod || "",
      }

      console.log("Submitting profile data:", profileData)

      if (isEditing && profile) {
        // Update existing profile
        const updateData = {
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: values.phoneNumber || "",
          location: values.location,
          years_experience: values.yearsExperience,
          hourly_rate: values.hourlyRate,
          availability: values.availability,
          bio: values.bio,
          education: values.education || "",
          certifications: values.certifications || "",
          website: values.website || "",
          linkedin: values.linkedin || "",
          preferred_contact_method: values.preferredContactMethod || "",
        }

        console.log("Updating profile data:", updateData)
        await updateProfile(updateData)

        toast({
          title: "Profile updated successfully!",
          description: "Your professional profile has been updated. Redirecting to dashboard...",
        })
        toastHot.success("Profile updated successfully!")
        toastNotify.success("Profile updated successfully!")
      } else {
        // Create new profile
        await createProfile(profileData)

        toast({
          title: "Profile created successfully",
          description: "Your profile has been created and is pending verification.",
        })
        toastHot.success("Profile created successfully!")
        toastNotify.success("Profile created successfully!")

        // Clear onboarding data from sessionStorage and localStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('onboardingData')
          localStorage.removeItem('onboardingAutoSave')
        }
      }

      // Show success celebration
      setShowSuccess(true)
    } catch (error) {
      console.error("Error creating profile:", error)

      let errorMessage = "Please check your information and try again"
      if (error instanceof Error) {
        errorMessage = error.message
      }

      toast({
        title: "Profile creation failed",
        description: errorMessage,
        variant: "destructive",
      })
      toastHot.error(errorMessage)
      toastNotify.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // AI helpers: fetch review suggestions and nudge fields
  const aiReviewAndNudge = async (field: "bio" | "education" | "certifications") => {
    try {
      let res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/proz/ai/review-profile`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      })
      if (res.status === 404) {
        // No saved profile yet; review draft with current form values
        const draft = {
          first_name: form.getValues().firstName,
          last_name: form.getValues().lastName,
          email: form.getValues().email,
          location: form.getValues().location,
          years_experience: form.getValues().yearsExperience,
          bio: form.getValues().bio,
          education: form.getValues().education,
          certifications: form.getValues().certifications,
          website: form.getValues().website,
          linkedin: form.getValues().linkedin,
        }
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/proz/ai/review-draft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify(draft),
        })
      }
      if (!res.ok) return
      const data = await res.json()
      const updates = (data && data.suggested_updates) || {}
      if (field === "bio") {
        const bioSuggestion = updates.bio || (Array.isArray(data.rephrased_bio) ? data.rephrased_bio[0] : "")
        if (bioSuggestion) form.setValue("bio", bioSuggestion)
      } else if (field === "education") {
        if (updates.education) form.setValue("education", updates.education)
      } else if (field === "certifications") {
        if (updates.certifications) form.setValue("certifications", updates.certifications)
      }
    } catch (e) {
      // silent fail for UX
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle next button click manually
  function handleNextClick() {
    const currentValues = Object.fromEntries(
      Object.entries(form.getValues()).filter(([key]) => currentFields.includes(key)),
    )

    currentSchema.parse(currentValues)
    setCurrentStep(currentStep + 1)
  }

  // If loading or profile exists, show loading state
  if (isLoading) {
    return (
      <div className="container max-w-3xl py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Don't render form until client-side is ready to avoid hydration mismatch
  if (!isClientReady) {
    return (
      <div className="container max-w-3xl py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show success celebration
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center space-y-8 max-w-2xl"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl"
          >
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              🎉 Profile Complete!
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Your profile is now live! Clients can see your skills and will start calling you for high-paying tasks.
            </p>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              What happens next?
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: Target, text: "Get task assignments", description: "Clients will call you directly for matching tasks" },
                { icon: Users, text: "Receive client calls", description: "Get called for urgent and high-paying projects" },
                { icon: DollarSign, text: "Start earning today", description: "Begin earning money from your first task" }
              ].map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg"
                  >
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {step.text}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {step.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Button
              onClick={() => router.replace("/dashboard?tab=analytics")}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-12 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Zap className="w-5 h-5 mr-2" />
              Go to Dashboard Analytics
            </Button>
          </motion.div>

          {/* Motivational Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-6"
          >
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
              🎯 You're all set! Clients will start calling you for high-paying tasks that match your skills.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
              Keep your phone ready - you could receive your first call within hours!
            </p>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container max-w-4xl py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <ProzLabLogo size="md" className="mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isEditing ? "Update Your Profile" : "Complete Your Profile"}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mb-4">
            {isEditing 
              ? "Update your professional profile information to keep it current and accurate."
              : "Let's set up your professional profile so clients can call you directly for high-paying tasks!"
            }
          </p>
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl max-w-2xl">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              🎯 Complete profiles get called for tasks 5x more often and earn 40% more!
            </p>
          </div>
        </motion.div>

        {/* AI Assist CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm md:text-base text-gray-800 dark:text-gray-100">
              <div className="font-semibold mb-1">🎯 Ready to Get Called for Tasks?</div>
              <div className="text-gray-600 dark:text-gray-300">Complete your profile in just 2 minutes and start receiving direct calls from clients for high-paying tasks!</div>
            </div>
            <a href="/dashboard/profile/ai-assist" className="inline-flex">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full">
                Use AI to complete profile
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>
            <div className="flex justify-center gap-2">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative w-3 h-3 rounded-full transition-all duration-300 ${
                    completedSteps.has(index)
                      ? "bg-green-500 dark:bg-green-400"
                      : index === currentStep
                      ? "bg-blue-500 dark:bg-blue-400"
                      : index < currentStep
                      ? "bg-blue-300 dark:bg-blue-600"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                  title={step.name}
                >
                  {completedSteps.has(index) && (
                    <CheckCircle2 className="absolute -top-1 -right-1 w-4 h-4 text-green-600 dark:text-green-400" />
                  )}
                </div>
              ))}
            </div>
            {autoSaveData && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Last saved: {new Date(autoSaveData.timestamp).toLocaleTimeString()}
              </div>
            )}
          </div>
        </motion.div>

        {/* Profile Preview */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Profile Preview</CardTitle>
                <CardDescription>This is how your profile will appear to clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <span className="text-xl text-white font-bold">
                      {form.getValues().firstName?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {form.getValues().firstName} {form.getValues().lastName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {form.getValues().location} • {form.getValues().yearsExperience} years experience
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      ${form.getValues().hourlyRate}/hour • {form.getValues().availability}
                    </p>
                  </div>
                </div>
                {form.getValues().bio && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Bio</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                      {form.getValues().bio}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Contact:</span>
                    <p className="text-gray-600 dark:text-gray-300">{form.getValues().preferredContactMethod}</p>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <p className="text-gray-600 dark:text-gray-300">{form.getValues().phoneNumber || "Not provided"}</p>
                  </div>
                </div>
                {(form.getValues().website || form.getValues().linkedin) && (
                  <div className="flex gap-2">
                    {form.getValues().website && form.getValues().website !== "None" && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        Website
                      </span>
                    )}
                    {form.getValues().linkedin && form.getValues().linkedin !== "None" && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        LinkedIn
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-2"
              >
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  {steps[currentStep].name}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentStep === 0 && "Enter your basic personal information to get started"}
                  {currentStep === 1 && "Tell us about your professional experience and rates"}
                  {currentStep === 2 && "Write a compelling professional bio"}
                  {currentStep === 3 && "Add your education and certifications"}
                  {currentStep === 4 && "Add your contact preferences and online presence"}
                </CardDescription>
              </motion.div>
            </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              id="onboarding-form"
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit(onSubmit)(e)
              }}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <>
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
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="New York, NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="yearsExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate ($)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your availability" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                            <SelectItem value="not-available">Not Available</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 2 && (
                <>
                  <div className="flex items-center justify-between">
                    <FormLabel className="m-0">Professional Bio</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={() => aiReviewAndNudge("bio")}> 
                      <Sparkles className="w-4 h-4 mr-1" /> Improve with AI
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your professional background, skills, and expertise..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 50 characters. This will be visible on your public profile.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 3 && (
                <>
                  <div className="flex items-center justify-between">
                    <FormLabel className="m-0">Education</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={() => aiReviewAndNudge("education")}>
                      <Sparkles className="w-4 h-4 mr-1" /> Improve with AI
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="List your educational background, degrees, and institutions..."
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <FormLabel className="m-0">Certifications</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={() => aiReviewAndNudge("certifications")}>
                      <Sparkles className="w-4 h-4 mr-1" /> Improve with AI
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name="certifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="List any relevant certifications or professional qualifications..."
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include certification name, issuing organization, and date. If you don't have any, write "None".
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {currentStep === 4 && (
                <>
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Website</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://yourwebsite.com"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              console.log("Website updated:", e.target.value)
                            }}
                          />
                        </FormControl>
                        <FormDescription>Include your personal or portfolio website. If you don't have one, write "None".</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://linkedin.com/in/yourprofile"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e)
                              console.log("LinkedIn updated:", e.target.value)
                            }}
                          />
                        </FormControl>
                        <FormDescription>Include your LinkedIn profile URL. If you don't have one, write "None".</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferredContactMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Contact Method</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            console.log("Preferred contact method updated:", value)
                          }}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your preferred contact method" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="website">Website Contact Form</SelectItem>
                            <SelectItem value="linkedin">LinkedIn Message</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </form>
          </Form>
        </CardContent>
            <CardFooter className="flex justify-between items-center pt-6">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={previousStep} 
                  disabled={currentStep === 0}
                  className="px-6 py-2"
                >
                  Previous
                </Button>
                {completedSteps.size > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPreview ? "Hide Preview" : "Preview Profile"}
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {completedSteps.size === steps.length && (
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    ✓ All steps completed
                  </span>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/profile/ai-assist")}
                  className="px-6 py-2"
                >
                  Use AI to complete
                </Button>

                {currentStep === steps.length - 1 ? (
                  <Button 
                    type="submit" 
                    form="onboarding-form" 
                    disabled={isSubmitting || completedSteps.size < steps.length}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Profile...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        {isEditing ? "Update Profile" : "Complete Profile & Get Called!"}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      try {
                        // Manually validate the current step
                        const currentValues = Object.fromEntries(
                          Object.entries(form.getValues()).filter(([key]) => currentFields.includes(key)),
                        )

                        const validationResult = currentSchema.safeParse(currentValues)

                        if (validationResult.success) {
                          setCurrentStep(currentStep + 1)
                        } else {
                          // Trigger validation errors to be displayed
                          form.trigger(currentFields as any)
                        }
                      } catch (error) {
                        console.error("Validation error:", error)
                      }
                    }}
                    disabled={!completedSteps.has(currentStep)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
