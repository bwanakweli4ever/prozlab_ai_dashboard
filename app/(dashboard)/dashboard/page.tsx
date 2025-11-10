"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { InfoIcon, Loader2, Target, Zap, Star, Users, DollarSign, Clock, ArrowRight, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/contexts/profile-context"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { profile, isLoading, calculateProfileCompletion } = useProfile()
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "overview")
  const [profileData, setProfileData] = useState({
    completionPercentage: 0,
    verificationStatus: "pending" as "pending" | "verified" | "rejected",
    missingFields: [] as string[],
  })
  const [onboardingCompletedAt, setOnboardingCompletedAt] = useState<string | null>(null)
  const [onboardingSkills, setOnboardingSkills] = useState<string[]>([])
  const [onboardingExperience, setOnboardingExperience] = useState<string>('')
  const [onboardingLocation, setOnboardingLocation] = useState<string>('')
  const [onboardingHourlyRate, setOnboardingHourlyRate] = useState<string>('')
  const [profileCreatedFromOnboarding, setProfileCreatedFromOnboarding] = useState(false)

  useEffect(() => {
    const requestedTab = searchParams.get("tab") || "overview"
    setActiveTab(requestedTab)
  }, [searchParams])

  // Load onboarding completion data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completedAt = localStorage.getItem('onboardingCompletedAt')
      setOnboardingCompletedAt(completedAt)
      
      const skillsStr = localStorage.getItem('onboardingSkills')
      if (skillsStr) {
        try {
          setOnboardingSkills(JSON.parse(skillsStr))
        } catch (e) {
          console.error('Failed to parse onboarding skills:', e)
        }
      }
      
      setOnboardingExperience(localStorage.getItem('onboardingExperience') || '')
      setOnboardingLocation(localStorage.getItem('onboardingLocation') || '')
      setOnboardingHourlyRate(localStorage.getItem('onboardingHourlyRate') || '')
      
      const createdFromOnboarding = localStorage.getItem('profileCreatedFromOnboarding') === 'true'
      setProfileCreatedFromOnboarding(createdFromOnboarding)
      
      console.log('Loaded onboarding analytics:', {
        completedAt,
        skills: skillsStr,
        experience: localStorage.getItem('onboardingExperience'),
        location: localStorage.getItem('onboardingLocation'),
        rate: localStorage.getItem('onboardingHourlyRate'),
        createdFromOnboarding
      })
    }
  }, [])

  // Auto-redirect to analytics if profile is 100% complete and no specific tab is requested
  useEffect(() => {
    if (!isLoading && profile && profileData.completionPercentage === 100) {
      const requestedTab = searchParams.get("tab")
      if (!requestedTab) {
        // Profile is 100% complete and no specific tab requested, show analytics
        setActiveTab("analytics")
        router.replace("/dashboard?tab=analytics", { scroll: false })
      }
    }
  }, [isLoading, profile, profileData.completionPercentage, searchParams, router])

  useEffect(() => {
    if (!isLoading) {
      // Calculate profile completion even if no profile exists
      const { percentage, missingFields } = calculateProfileCompletion()
      setProfileData({
        completionPercentage: percentage,
        verificationStatus: profile?.verification_status || "pending",
        missingFields,
      })
    }
  }, [isLoading, profile, calculateProfileCompletion, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show a clean, minimal prompt if profile is incomplete (under 90%) or doesn't exist, unless viewing analytics
  if ((!profile || profileData.completionPercentage < 90) && activeTab !== "analytics") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="w-full max-w-2xl px-6 py-10">
          <div className="text-center space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.first_name || "there"} 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete your profile to get matched with high‑paying tasks and receive direct calls from clients.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                <span>Profile completion</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{profileData.completionPercentage}%</span>
              </div>
              <Progress value={profileData.completionPercentage} className="h-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile ? (
                  profileData.missingFields.length > 0
                    ? `Complete ${profileData.missingFields.length} more field${profileData.missingFields.length > 1 ? 's' : ''}`
                    : 'Your profile is complete!'
                ) : (
                  'Create your professional profile to start getting calls'
                )}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={() => router.push('/onboarding')} className="px-6">
                <Target className="w-4 h-4 mr-2" />
                {!profile ? 'Create Profile' : 'Complete Profile'}
              </Button>
              <Button variant="secondary" onClick={() => router.push('/dashboard/profile/ai-assist')} className="px-6">
                Use AI to complete
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard?tab=analytics')} className="px-6">
                Skip for now
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Safely access profile properties with fallbacks
  const rating = profile?.rating ?? 0
  const reviewCount = profile?.review_count ?? 0
  const firstName = profile?.first_name || "User"
  const location = profile?.location || "No location provided"
  const yearsExperience = profile?.years_experience ?? 0
  const hourlyRate = profile?.hourly_rate ?? 0
  const availability = profile?.availability || "Not specified"
  
  // Use only real API data fields
  const profileViews = profile?.profile_views || 0
  const messageCount = profile?.message_count || 0
  const unreadMessages = profile?.unread_message_count || 0
  const inquiryCount = profile?.inquiry_count || 0
  const responseRate = profile?.response_rate || 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {firstName}! Here's your ProzLab professional dashboard.</p>
        </div>
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
          {profile?.profile_image_url ? (
            <img
              src={profile.profile_image_url}
              alt={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = "none"
                const fallback = target.parentElement?.querySelector(".fallback-avatar") as HTMLElement
                if (fallback) fallback.style.display = "flex"
              }}
            />
          ) : null}
          <div className="fallback-avatar w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl" style={{ display: profile?.profile_image_url ? "none" : "flex" }}>
            {profile?.first_name?.[0] || "U"}
            {profile?.last_name?.[0] || "P"}
          </div>
        </div>
      </div>

      {profile?.verification_status === "pending" && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Verification Pending</AlertTitle>
          <AlertDescription>
            Your profile is currently under review. We'll notify you once it's verified.
          </AlertDescription>
        </Alert>
      )}

      {profile?.verification_status === "rejected" && (
        <Alert variant="destructive">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Verification Rejected</AlertTitle>
          <AlertDescription>
            Your profile verification was rejected. Please update your profile and resubmit.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileData.completionPercentage}%</div>
            <Progress value={profileData.completionPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {profileData.completionPercentage >= 90
                ? profileData.completionPercentage === 100 
                  ? "Profile complete!" 
                  : "Profile nearly complete!"
                : profileData.missingFields.length > 0
                ? `Missing: ${profileData.missingFields.map((field) => field.replace(/_/g, " ")).join(", ")}`
                : "Complete your profile to get started"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileViews}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {profileViews > 0 
                ? "Profile views tracked" 
                : "Views will appear here"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messageCount}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {messageCount > 0 
                ? unreadMessages > 0 ? `${unreadMessages} unread messages` : "All messages read"
                : "Messages will appear here"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-2">Based on {reviewCount} reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Summary</CardTitle>
              <CardDescription>Here's a summary of your professional profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium">Personal Information</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.first_name || ""} {profile?.last_name || ""}
                    <br />
                    {profile?.email || ""}
                    <br />
                    {location}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Professional Details</h3>
                  <p className="text-sm text-muted-foreground">
                    {yearsExperience} years experience
                    <br />${hourlyRate}/hour
                    <br />
                    {availability} availability
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => router.push("/dashboard/profile")}>
                  {profileData.completionPercentage < 90 ? "Complete Your Profile" : "Edit Profile"}
                </Button>
                <Button variant="outline" onClick={() => router.push("/dashboard/profile/view")}>
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent profile activity and interactions.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Profile viewed by Client XYZ</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Message received from Jane Smith</p>
                      <p className="text-sm text-muted-foreground">Yesterday at 3:45 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Profile verification submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(profile?.created_at || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks that need your attention.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.completionPercentage < 90 && (
                    <div className="flex items-center">
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">Complete your profile</p>
                        <p className="text-sm text-muted-foreground">Add missing information to your profile</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center">
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">Respond to messages</p>
                      <p className="text-sm text-muted-foreground">You have 3 unread messages</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Analytics</CardTitle>
              <CardDescription>View detailed analytics about your profile performance and client engagement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Completion Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {onboardingCompletedAt && (
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Onboarding</p>
                          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            ✓ Complete
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            {new Date(onboardingCompletedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">Profile Status</p>
                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                          {profileData.completionPercentage === 100 ? "Complete" : `${profileData.completionPercentage}%`}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
                        <p className="text-2xl font-bold">{profileViews}</p>
                        <p className="text-xs text-green-600">
                          {profileViews > 0 ? "Total profile views" : "No views yet"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Client Inquiries</p>
                        <p className="text-2xl font-bold">{inquiryCount}</p>
                        <p className="text-xs text-green-600">
                          {inquiryCount > 0 ? "Total client inquiries" : "No inquiries yet"}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Engagement Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Response Rate</span>
                        <span className="text-sm font-medium">{responseRate}%</span>
                      </div>
                      <Progress value={responseRate} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Profile Completion</span>
                        <span className="text-sm font-medium">{profileData.completionPercentage}%</span>
                      </div>
                      <Progress value={profileData.completionPercentage} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Client Satisfaction</span>
                        <span className="text-sm font-medium">{profile?.rating ? profile.rating.toFixed(1) : "N/A"}/5</span>
                      </div>
                      <Progress value={profile?.rating ? (profile.rating / 5) * 100 : 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Years Experience</span>
                        <span className="text-sm font-medium">{profile?.years_experience || 0} years</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Hourly Rate</span>
                        <span className="text-sm font-medium">${profile?.hourly_rate || 0}/hr</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Availability</span>
                        <span className="text-sm font-medium capitalize">{profile?.availability || "Not set"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <span className="text-sm font-medium">{profile?.location || "Not set"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Verification Status</span>
                        <span className={`text-sm font-medium capitalize ${
                          profile?.verification_status === 'verified' ? 'text-green-600' : 
                          profile?.verification_status === 'rejected' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {profile?.verification_status || "Pending"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Dynamic Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {onboardingCompletedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">✅ Onboarding wizard completed</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(onboardingCompletedAt).toLocaleDateString()} at {new Date(onboardingCompletedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {profileCreatedFromOnboarding && typeof window !== 'undefined' && localStorage.getItem('profileCreatedAt') && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">🎉 Profile auto-created from onboarding</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(localStorage.getItem('profileCreatedAt') || '').toLocaleDateString()} at {new Date(localStorage.getItem('profileCreatedAt') || '').toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.created_at && !profileCreatedFromOnboarding && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profile created</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(profile.created_at).toLocaleDateString()} at {new Date(profile.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.updated_at && profile.updated_at !== profile.created_at && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profile updated</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(profile.updated_at).toLocaleDateString()} at {new Date(profile.updated_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {profileViews > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Profile viewed {profileViews} time{profileViews > 1 ? 's' : ''}</p>
                        <p className="text-xs text-muted-foreground">By potential clients</p>
                      </div>
                    </div>
                  )}

                  {inquiryCount > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{inquiryCount} client inquir{inquiryCount > 1 ? 'ies' : 'y'} received</p>
                        <p className="text-xs text-muted-foreground">From interested clients</p>
                      </div>
                    </div>
                  )}

                  {messageCount > 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{messageCount} message{messageCount > 1 ? 's' : ''} received</p>
                        <p className="text-xs text-muted-foreground">{unreadMessages > 0 ? `${unreadMessages} unread` : "All read"}</p>
                      </div>
                    </div>
                  )}

                  {profileViews === 0 && inquiryCount === 0 && messageCount === 0 && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">No activity yet</p>
                        <p className="text-xs text-muted-foreground">Complete your profile to start getting views and inquiries</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Onboarding Data Display */}
              {profileCreatedFromOnboarding && (onboardingSkills.length > 0 || onboardingExperience || onboardingLocation || onboardingHourlyRate) && (
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
                  <CardHeader>
                    <CardTitle className="text-lg text-purple-900 dark:text-purple-100 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Data from Onboarding Wizard
                    </CardTitle>
                    <CardDescription className="text-purple-700 dark:text-purple-300">
                      Information you provided during the onboarding process
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {onboardingSkills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                          Selected Skills ({onboardingSkills.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {onboardingSkills.map((skill, index) => (
                            <div
                              key={index}
                              className="px-3 py-1.5 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 rounded-full text-sm font-medium shadow-sm"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {onboardingExperience && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Experience Level</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{onboardingExperience}</p>
                        </div>
                      )}
                      
                      {onboardingLocation && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Location</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{onboardingLocation}</p>
                        </div>
                      )}
                      
                      {onboardingHourlyRate && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">Hourly Rate</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">${onboardingHourlyRate}/hr</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-300 pt-2 border-t border-purple-200 dark:border-purple-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>This data has been automatically applied to your professional profile</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Success Message for Complete Profile */}
              {profileData.completionPercentage === 100 && (
                <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-700">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                          🎉 Congratulations! Your Profile is Complete
                        </h3>
                        <p className="text-green-700 dark:text-green-300 mt-1">
                          Your profile is now live and optimized for maximum client engagement. You're ready to receive calls and task assignments!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>View and download reports about your profile.</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Reports will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
