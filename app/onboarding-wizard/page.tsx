"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  CheckCircle,
  Shield,
  Award,
  ArrowLeft,
  TrendingUp,
  Users,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { ProzLabLogo } from "@/components/prozlab-logo"
import { TECH_SKILLS, EXPERIENCE_LEVELS, AVAILABILITY_OPTIONS } from "@/lib/constants"
// Removed step 4 fields (location, availability) — select/label imports no longer needed here
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"
import { toast } from "@/components/ui/use-toast"

export default function OnboardingWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const { register: authRegister, isAuthenticated, isLoading: authLoading, user } = useAuth()
  const { createProfile } = useProfile()
  const [formData, setFormData] = useState({
    bio: "",
    skills: [] as string[],
    experience: "",
    location: "",
    serviceRadius: "",
    expectedEarnings: "",
    certifications: [] as string[],
    portfolio: [] as string[],
    phoneNumber: "",
    availability: "full-time",
  })

  const [loading, setLoading] = useState(false)

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

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema) as any,
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  })

  const nextStep = () => {
    setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }


  const handleCreateProfile = async () => {
    try {
      setLoading(true)
      
      // Generate bio from skills if bio is empty
      const generatedBio = formData.bio || 
        `Professional with ${formData.experience} of experience specializing in ${formData.skills.slice(0, 3).join(", ")}. Ready to provide quality services in ${formData.location}.`
      
      // Store the onboarding data in sessionStorage for use in profile creation
      const onboardingData = {
        skills: formData.skills,
        experience: formData.experience,
        location: formData.location,
        serviceRadius: formData.serviceRadius,
        expectedEarnings: formData.expectedEarnings,
        bio: generatedBio,
        certifications: formData.certifications,
        portfolio: formData.portfolio,
        phoneNumber: formData.phoneNumber,
        availability: formData.availability,
        completedAt: new Date().toISOString(),
      }
      
      // Store in sessionStorage for the profile creation flow
      sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData))
      
      // Track onboarding completion for analytics
      localStorage.setItem('onboardingCompletedAt', new Date().toISOString())
      localStorage.setItem('onboardingWizardCompleted', 'true')
      
      // No redirect here anymore; final step handles signup inline
      setCurrentStep(4)
    } catch (error) {
      console.error("Failed preparing final step:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.is_superuser) {
        router.replace("/admin")
      } else {
        router.replace("/dashboard")
      }
    }
  }, [isAuthenticated, authLoading, router, user])

  const onSubmitSignup = async (values: SignupValues) => {
    setLoading(true)
    try {
      await authRegister({
        email: values.email,
        password: values.password,
        first_name: values.firstName,
        last_name: values.lastName,
      })

      toast({ title: "Registration successful", description: "Setting up your profile..." })

      const onboardingDataStr = sessionStorage.getItem('onboardingData')
      if (onboardingDataStr) {
        const onboardingData = JSON.parse(onboardingDataStr || '{}')
        const experienceMapping: Record<string, number> = {
          "0-1 years": 0.5,
          "1-3 years": 2,
          "3-5 years": 4,
          "5+ years": 7,
        }
        const profileData = {
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone_number: onboardingData.phoneNumber || "",
          bio: onboardingData.bio || "Professional looking to provide quality services",
          location: onboardingData.location || "Remote",
          years_experience: experienceMapping[onboardingData.experience] || 1,
          hourly_rate: parseFloat(onboardingData.expectedEarnings) || 50,
          availability: onboardingData.availability || "full-time",
          education: (onboardingData.skills || []).join(", ") || "Self-taught",
          certifications: (onboardingData.certifications || []).join(", ") || (onboardingData.skills || []).join(", ") || "",
          website: "",
          linkedin: "",
          preferred_contact_method: "email",
        } as any

        try {
          await createProfile(profileData)
          if (typeof window !== 'undefined') {
            localStorage.setItem('onboardingSkills', JSON.stringify(onboardingData.skills || []))
            localStorage.setItem('onboardingExperience', onboardingData.experience || '')
            localStorage.setItem('onboardingLocation', onboardingData.location || '')
            localStorage.setItem('onboardingHourlyRate', onboardingData.expectedEarnings || '0')
            localStorage.setItem('profileCreatedFromOnboarding', 'true')
            localStorage.setItem('profileCreatedAt', new Date().toISOString())
            localStorage.setItem('promptProfileUpdate', 'true')
          }
          sessionStorage.removeItem('onboardingData')
          router.push('/dashboard?tab=analytics')
          return
        } catch (e) {
          // If profile creation fails, continue to dashboard login
          router.push('/dashboard')
          return
        }
      }

      // Fallback
      router.push('/dashboard')
    } catch (error: any) {
      toast({ title: "Registration failed", description: error?.message || 'Try again', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-18 h-18 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl">👋</span>
                </div>
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                  Ready to join the professional revolution?
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto">
                  Let's discover what makes you the perfect professional for our platform and connect you with amazing opportunities!
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-base">Get Verified</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Become a trusted professional with verified credentials</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-base">Find Work</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Connect with clients who need your expertise</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-base">Earn More</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300">Set your rates and grow your business</p>
                </CardContent>
              </Card>
            </div>

            <div className="pt-2">
              <Button
                onClick={nextStep}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-3 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Let's Get Started!
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-18 h-18 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🔧</span>
                </div>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">What's your professional superpower?</h2>
              <p className="text-gray-600 dark:text-gray-300 text-base">Select all the skills you're confident in</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {TECH_SKILLS.map((skill) => {
                const Icon = skill.icon
                const isSelected = formData.skills.includes(skill.name)
                return (
                  <Card
                    key={skill.name}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                      isSelected
                        ? "ring-2 ring-blue-500 dark:ring-blue-400 shadow-xl bg-blue-50 dark:bg-blue-900/30"
                        : "hover:shadow-lg bg-white dark:bg-gray-700"
                    }`}
                    onClick={() => {
                      const newSkills = isSelected
                        ? formData.skills.filter((s: string) => s !== skill.name)
                        : [...formData.skills, skill.name]
                      setFormData({ ...formData, skills: newSkills })
                    }}
                  >
                    <CardContent className="p-3 text-center space-y-2">
                      <div className={`w-10 h-10 ${skill.color} rounded-xl flex items-center justify-center mx-auto shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white text-xs">{skill.name}</div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-2 py-1 ${isSelected ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}
                      >
                        {skill.category}
                      </Badge>
                      <Checkbox
                        checked={isSelected}
                        className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 w-4 h-4"
                      />
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {formData.skills.length > 0 && (
              <div className="text-center">
                <Badge variant="outline" className="px-3 py-1">
                  <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                  {formData.skills.length} skill{formData.skills.length !== 1 ? 's' : ''} selected
                </Badge>
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                size="lg"
                className="px-8 py-3 text-base rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={formData.skills.length === 0}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-4 text-lg rounded-full disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How much experience do you have?</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Companies are switching to part-time tech support to reduce costs. Let's connect you to these
                opportunities.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {EXPERIENCE_LEVELS.map((exp, index) => {
                const colors = [
                  "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-800/30 border-green-200 dark:border-green-700",
                  "bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-800/30 border-blue-200 dark:border-blue-700", 
                  "bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/30 dark:to-violet-800/30 border-purple-200 dark:border-purple-700",
                  "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/30 dark:to-amber-800/30 border-orange-200 dark:border-orange-700"
                ]
                const selectedColors = [
                  "bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800/50 dark:to-emerald-700/50 ring-2 ring-green-500 dark:ring-green-400",
                  "bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-800/50 dark:to-cyan-700/50 ring-2 ring-blue-500 dark:ring-blue-400",
                  "bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-800/50 dark:to-violet-700/50 ring-2 ring-purple-500 dark:ring-purple-400", 
                  "bg-gradient-to-br from-orange-100 to-amber-200 dark:from-orange-800/50 dark:to-amber-700/50 ring-2 ring-orange-500 dark:ring-orange-400"
                ]
                
                return (
                  <Card
                    key={exp.level}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                      formData.experience === exp.level 
                        ? selectedColors[index] + " shadow-xl" 
                        : colors[index] + " hover:shadow-lg"
                    }`}
                    onClick={() => setFormData({ ...formData, experience: exp.level })}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <div className="text-3xl mb-1">{exp.icon}</div>
                      <div className={`font-semibold text-xs ${
                        formData.experience === exp.level 
                          ? index === 0 ? "text-green-800 dark:text-green-200" :
                            index === 1 ? "text-blue-800 dark:text-blue-200" :
                            index === 2 ? "text-purple-800 dark:text-purple-200" :
                            "text-orange-800 dark:text-orange-200"
                          : index === 0 ? "text-green-700 dark:text-green-300" :
                            index === 1 ? "text-blue-700 dark:text-blue-300" :
                            index === 2 ? "text-purple-700 dark:text-purple-300" :
                            "text-orange-700 dark:text-orange-300"
                      }`}>{exp.level}</div>
                      <div className={`text-xs ${
                        formData.experience === exp.level 
                          ? index === 0 ? "text-green-700 dark:text-green-300" :
                            index === 1 ? "text-blue-700 dark:text-blue-300" :
                            index === 2 ? "text-purple-700 dark:text-purple-300" :
                            "text-orange-700 dark:text-orange-300"
                          : index === 0 ? "text-green-600 dark:text-green-400" :
                            index === 1 ? "text-blue-600 dark:text-blue-400" :
                            index === 2 ? "text-purple-600 dark:text-purple-400" :
                            "text-orange-600 dark:text-orange-400"
                      }`}>{exp.title}</div>
                      <div className={`text-xs ${
                        formData.experience === exp.level 
                          ? index === 0 ? "text-green-600 dark:text-green-400" :
                            index === 1 ? "text-blue-600 dark:text-blue-400" :
                            index === 2 ? "text-purple-600 dark:text-purple-400" :
                            "text-orange-600 dark:text-orange-400"
                          : index === 0 ? "text-green-500 dark:text-green-500" :
                            index === 1 ? "text-blue-500 dark:text-blue-500" :
                            index === 2 ? "text-purple-500 dark:text-purple-500" :
                            "text-orange-500 dark:text-orange-500"
                      }`}>{exp.description}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                size="lg"
                className="px-8 py-3 text-base rounded-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={nextStep}
                disabled={!formData.experience}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 text-base rounded-full disabled:opacity-50"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="text-center space-y-8 max-w-2xl mx-auto">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                <span className="text-4xl">🎉</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">Awesome, glad you're here!</h2>
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Your <span className="font-semibold text-blue-600">{formData.experience}</span> of experience puts you
                  in
                  <span className="font-semibold text-green-600"> high demand</span>, as our data shows companies prefer
                  <span className="font-semibold"> experienced</span> professionals who require less management and
                  <span className="font-semibold"> training</span>, enhancing efficiency.
                </p>
                <p className="text-gray-600 mt-4">
                  We're thrilled you're here — just a few more questions, and we'll
                  <span className="font-semibold text-blue-600"> connect you</span> to these
                  <span className="font-semibold"> businesses</span> eager for your expertise!
                </p>
              </div>
            </div>

            <Button
              onClick={nextStep}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg rounded-full"
            >
              Continue
            </Button>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Final step: sign up to save your progress</p>
            </div>

            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSubmitSignup)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={signupForm.control}
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
                    control={signupForm.control}
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
                  control={signupForm.control}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={signupForm.control}
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
                    control={signupForm.control}
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
                </div>
                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    size="lg"
                    className="px-8 py-3 text-base rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-3 text-base rounded-full disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {loading ? "Creating account..." : (
                      <>
                        Finish & Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )


      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ProzLabLogo size="md" />
            </div>
            <div className="flex items-center gap-4">
              {currentStep === 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/")}
                  className="rounded-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              )}
              <Badge variant="secondary" className="px-3 py-1">
                <Shield className="w-4 h-4 mr-1" />
                Secure Setup
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step {currentStep} of 4
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((currentStep / 4) * 100)}% Complete
              </span>
            </div>
            <Progress 
              value={(currentStep / 4) * 100} 
              className="h-1.5 bg-gray-200 dark:bg-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 min-h-[calc(100vh-180px)] flex items-center">
        <div className="w-full max-w-4xl mx-auto">
          <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardContent className="p-6">
              {renderStepContent()}
            </CardContent>
          </Card>
          {/* AI Assist CTA */}
          <div className="mt-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 md:p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-sm md:text-base text-gray-800 dark:text-gray-100">
                  <div className="font-semibold mb-1">🎯 Ready to Get Called for Tasks?</div>
                  <div className="text-gray-600 dark:text-gray-300">Complete your profile in just 2 minutes and start receiving direct calls from clients for high-paying tasks!</div>
                </div>
                <Link href="/dashboard/profile/ai-assist" className="inline-flex">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full">
                    Use AI to complete profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Navigation Footer - Only show progress dots */}
      {currentStep > 1 && currentStep <= 4 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i + 1 <= currentStep
                    ? "bg-blue-500 dark:bg-blue-400"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer removed as requested */}
    </div>
  )
}
