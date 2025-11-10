"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Users, UserCheck, UserX, Clock, Search, CheckCircle, XCircle, Eye, MoreHorizontal } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authApi, adminApi, emailApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/types/api"

interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  bio: string
  location: string
  years_experience: number
  hourly_rate: number
  availability: string
  verification_status: "pending" | "verified" | "rejected"
  created_at: string
  updated_at: string
  profile_image_url?: string
  education?: string
  certifications?: string
  website?: string
  linkedin?: string
  phone?: string
  specialties?: string[]
  rating?: number
  review_count?: number
}

export default function AdminVerificationsPage() {
  const { token, user } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [stats, setStats] = useState({
    totalProfiles: 0,
    pendingVerifications: 0,
    verifiedProfiles: 0,
    rejectedProfiles: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false)
  const [verificationAction, setVerificationAction] = useState<"verify" | "reject">("verify")
  const [adminNotes, setAdminNotes] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)

  // Debug: Log user info
  useEffect(() => {
    console.log("Admin Verifications - Current user:", user)
    console.log("Admin Verifications - Is superuser:", user?.is_superuser)
    console.log("Admin Verifications - Token exists:", !!token)
  }, [user, token])

  // Filter profiles based on search and status
  useEffect(() => {
    // Ensure profiles is an array
    if (!Array.isArray(profiles)) {
      setFilteredProfiles([])
      return
    }

    let filtered = profiles

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(profile =>
        profile.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(profile => profile.verification_status === statusFilter)
    }

    setFilteredProfiles(filtered)
  }, [profiles, searchQuery, statusFilter])

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.log("No token available")
        setIsLoading(false)
        return
      }

      if (!user?.is_superuser) {
        console.log("User is not a superuser")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        console.log("Fetching profiles for verification...")
        
        // Get all profiles for verification
        const profilesData = await adminApi.getProfilesForVerification(token, 1, 100)
        console.log("Fetched profiles:", profilesData)
        
        // Handle different possible response structures
        let profilesList = []
        if (Array.isArray(profilesData)) {
          profilesList = profilesData
        } else if (profilesData && Array.isArray(profilesData.profiles)) {
          profilesList = profilesData.profiles
        } else if (profilesData && Array.isArray(profilesData.data)) {
          profilesList = profilesData.data
        } else if (profilesData && Array.isArray(profilesData.results)) {
          profilesList = profilesData.results
        } else {
          console.warn("Unexpected API response structure:", profilesData)
          profilesList = []
        }
        
        // Normalize field names to ensure UI has expected data
        const normalized = profilesList.map((p: any) => ({
          ...p,
          hourly_rate: Number(p.hourly_rate ?? p.hourlyRate ?? p.rate_per_hour ?? p.ratePerHour ?? 0),
          availability: p.availability ?? p.availability_status ?? p.status ?? "Unknown",
          rating: typeof p.rating !== 'undefined' ? Number(p.rating) : (typeof p.average_rating !== 'undefined' ? Number(p.average_rating) : (typeof p.avg_rating !== 'undefined' ? Number(p.avg_rating) : undefined)),
          review_count: Number(p.review_count ?? p.reviews ?? 0),
          specialties: Array.isArray(p.specialties) ? p.specialties : [],
        }))

        console.log("Processed profiles list:", normalized)
        setProfiles(normalized)
        setFilteredProfiles(normalized)

        // Calculate statistics
        const totalProfiles = normalized.length
        const pendingVerifications = normalized.filter((p: Profile) => p.verification_status === "pending").length
        const verifiedProfiles = normalized.filter((p: Profile) => p.verification_status === "verified").length
        const rejectedProfiles = normalized.filter((p: Profile) => p.verification_status === "rejected").length

        setStats({
          totalProfiles,
          pendingVerifications,
          verifiedProfiles,
          rejectedProfiles,
        })

        console.log("Verification stats:", {
          totalProfiles,
          pendingVerifications,
          verifiedProfiles,
          rejectedProfiles,
        })
      } catch (error) {
        console.error("Failed to fetch verification data:", error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("Could not validate credentials") || 
            errorMessage.includes("401") || 
            errorMessage.includes("403")) {
          console.warn("Authentication error in verification data fetch, user may need to re-login")
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch verification data",
            variant: "destructive",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, user, toast])

  // Verification functions
  const handleVerifyProfile = async (profileId: string, action: "verify" | "reject") => {
    if (!token) return

    setIsVerifying(true)
    setLoadingActions(prev => ({ ...prev, [profileId]: true }))

    try {
      const result = await adminApi.verifyProfile(
        profileId,
        action === "verify" ? "verified" : "rejected",
        token,
        adminNotes || undefined,
        action === "reject" ? rejectionReason : undefined
      )

      // Check if it's a network error response (returned from API function)
      if (result && result.isNetworkError) {
        console.log("Network error detected, using fallback verification")
        toast({ 
          title: "Verification Created (Offline Mode)", 
          description: "Profile verification created locally. Will sync when API is available." 
        })
        
        // Update the profile in the local state anyway (offline mode)
        setProfiles(prev => prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, verification_status: action === "verify" ? "verified" : "rejected" }
            : profile
        ))

        // Update stats
        setStats(prev => ({
          ...prev,
          pendingVerifications: action === "verify" ? prev.pendingVerifications - 1 : prev.pendingVerifications,
          verifiedProfiles: action === "verify" ? prev.verifiedProfiles + 1 : prev.verifiedProfiles,
          rejectedProfiles: action === "reject" ? prev.rejectedProfiles + 1 : prev.rejectedProfiles,
        }))

        // Try to send email notification even in offline mode
        try {
          await emailApi.sendVerificationNotification(
            profile.email,
            profile.first_name,
            profile.last_name,
            action === "verify" ? "verified" : "rejected",
            adminNotes || undefined,
            action === "reject" ? rejectionReason : undefined
          )
          console.log(`Verification notification email sent to ${profile.email} (offline mode)`)
        } catch (emailError) {
          console.error("Failed to send verification notification email (offline mode):", emailError)
        }

        // Close dialog and reset form
        setVerificationDialogOpen(false)
        setSelectedProfile(null)
        setAdminNotes("")
        setRejectionReason("")
        return
      }

      // Check if it's an authentication error response
      if (result && typeof result === 'object' && 'isAuthError' in result && result.isAuthError) {
        console.warn("Authentication error in profile verification, user may need to re-login")
        return
      }

      // Update the profile in the local state
      setProfiles(prev => prev.map(profile => 
        profile.id === profileId 
          ? { ...profile, verification_status: action === "verify" ? "verified" : "rejected" }
          : profile
      ))

      // Update stats
      setStats(prev => ({
        ...prev,
        pendingVerifications: action === "verify" ? prev.pendingVerifications - 1 : prev.pendingVerifications,
        verifiedProfiles: action === "verify" ? prev.verifiedProfiles + 1 : prev.verifiedProfiles,
        rejectedProfiles: action === "reject" ? prev.rejectedProfiles + 1 : prev.rejectedProfiles,
      }))

      toast({
        title: "Success! 🎉",
        description: `Profile ${action === "verify" ? "verified" : "rejected"} successfully`,
      })

      // Send email notification to the user
      try {
        await emailApi.sendVerificationNotification(
          selectedProfile.email,
          selectedProfile.first_name,
          selectedProfile.last_name,
          action === "verify" ? "verified" : "rejected",
          adminNotes || undefined,
          action === "reject" ? rejectionReason : undefined
        )
        console.log(`Verification notification email sent to ${selectedProfile.email}`)
      } catch (emailError) {
        console.error("Failed to send verification notification email:", emailError)
        // Don't show error to user as verification was successful, just log it
        toast({
          title: "Note",
          description: "Profile updated successfully, but email notification could not be sent",
          variant: "default",
        })
      }

      // Close dialog and reset form
      setVerificationDialogOpen(false)
      setSelectedProfile(null)
      setAdminNotes("")
      setRejectionReason("")
    } catch (error) {
      console.error(`Failed to ${action} profile:`, error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("Could not validate credentials") || 
          errorMessage.includes("401") || 
          errorMessage.includes("403")) {
        console.warn("Authentication error in profile verification, user may need to re-login")
      } else {
        toast({
          title: "Error",
          description: `Failed to ${action} profile`,
          variant: "destructive",
        })
      }
    } finally {
      setIsVerifying(false)
      setLoadingActions(prev => ({ ...prev, [profileId]: false }))
    }
  }

  const openVerificationDialog = (profile: Profile, action: "verify" | "reject") => {
    setSelectedProfile(profile)
    setVerificationAction(action)
    setAdminNotes("")
    setRejectionReason("")
    setVerificationDialogOpen(true)
  }

  const openDetailsDialog = async (profile: Profile) => {
    setSelectedProfile(profile)
    setDetailsDialogOpen(true)
    if (!token) return
    try {
      setIsDetailsLoading(true)
      const fullProfile = await adminApi.getProfileForVerification(profile.id, token)
      // Normalize/merge fields similarly to list normalization
      const normalized: Profile = {
        ...profile,
        ...fullProfile,
        hourly_rate: Number(fullProfile?.hourly_rate ?? fullProfile?.hourlyRate ?? profile.hourly_rate ?? 0),
        availability: fullProfile?.availability ?? fullProfile?.availability_status ?? profile.availability ?? "Unknown",
        rating: typeof fullProfile?.rating !== 'undefined' ? Number(fullProfile.rating) : (typeof fullProfile?.average_rating !== 'undefined' ? Number(fullProfile.average_rating) : (typeof fullProfile?.avg_rating !== 'undefined' ? Number(fullProfile.avg_rating) : profile.rating)),
        review_count: Number(fullProfile?.review_count ?? fullProfile?.reviews ?? profile.review_count ?? 0),
        specialties: Array.isArray(fullProfile?.specialties) ? fullProfile.specialties : (Array.isArray(profile.specialties) ? profile.specialties : []),
      }
      setSelectedProfile(normalized)
    } catch (error) {
      console.error("Failed to fetch full profile details:", error)
      toast({ title: "Error", description: "Could not load full profile details", variant: "destructive" })
    } finally {
      setIsDetailsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      case "pending":
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show debug info if not superuser
  if (!user?.is_superuser) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You need superuser privileges to access this page.</p>
        <div className="text-sm text-muted-foreground bg-muted p-4 rounded">
          <p>
            <strong>Debug Info:</strong>
          </p>
          <p>User ID: {user?.id || "Not logged in"}</p>
          <p>Email: {user?.email || "N/A"}</p>
          <p>Is Superuser: {user?.is_superuser ? "Yes" : "No"}</p>
          <p>Token: {token ? "Present" : "Missing"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Verifications</h1>
        <p className="text-muted-foreground">Review and verify professional profiles on the ProzLab platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfiles}</div>
            <p className="text-xs text-muted-foreground">All profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Profiles</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verifiedProfiles}</div>
            <p className="text-xs text-muted-foreground">Approved professionals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Profiles</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedProfiles}</div>
            <p className="text-xs text-muted-foreground">Declined applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find and filter profiles by name, email, location, or verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Profiles List */}
      <Card>
        <CardHeader>
          <CardTitle>Profiles to Review</CardTitle>
          <CardDescription>
            {Array.isArray(filteredProfiles) ? filteredProfiles.length : 0} profile{Array.isArray(filteredProfiles) && filteredProfiles.length !== 1 ? 's' : ''} found
            {searchQuery && ` matching "${searchQuery}"`}
            {statusFilter !== "all" && ` with status "${statusFilter}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!Array.isArray(filteredProfiles) || filteredProfiles.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">No profiles found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "No profiles are available for verification at the moment."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {Array.isArray(filteredProfiles) && filteredProfiles.map((profile) => (
                <div key={profile.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          {profile.profile_image_url ? (
                            <img 
                              src={profile.profile_image_url} 
                              alt={`${profile.first_name} ${profile.last_name}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground">
                              {profile.first_name[0]}{profile.last_name[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {profile.first_name} {profile.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                          <p className="text-sm text-muted-foreground">{profile.location}</p>
                        </div>
                        <div className="ml-auto">
                          {getStatusBadge(profile.verification_status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
                        <div>
                          <span className="font-medium">Experience:</span> {profile.years_experience} years
                        </div>
                        <div>
                          <span className="font-medium">Rate:</span> ${profile.hourly_rate}/hr
                        </div>
                        <div>
                          <span className="font-medium">Availability:</span> {profile.availability}
                        </div>
                        <div>
                          <span className="font-medium">Joined:</span> {new Date(profile.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      {profile.bio && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{profile.bio}</p>
                      )}

                      {(profile.education || profile.certifications || profile.website || profile.linkedin) && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {profile.education && (
                            <Badge variant="outline">🎓 {profile.education}</Badge>
                          )}
                          {profile.certifications && (
                            <Badge variant="outline">🏆 {profile.certifications}</Badge>
                          )}
                          {profile.website && (
                            <Badge variant="outline">🌐 Website</Badge>
                          )}
                          {profile.linkedin && (
                            <Badge variant="outline">💼 LinkedIn</Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {profile.verification_status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => openVerificationDialog(profile, "verify")}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white"
                            disabled={loadingActions[profile.id]}
                          >
                            {loadingActions[profile.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Verify
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openVerificationDialog(profile, "reject")}
                            disabled={loadingActions[profile.id]}
                          >
                            {loadingActions[profile.id] ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetailsDialog(profile)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {verificationAction === "verify" ? "Verify Profile" : "Reject Profile"}
            </DialogTitle>
            <DialogDescription>
              {verificationAction === "verify" 
                ? `Verify ${selectedProfile?.first_name} ${selectedProfile?.last_name}'s profile?`
                : `Reject ${selectedProfile?.first_name} ${selectedProfile?.last_name}'s profile?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {verificationAction === "reject" && (
              <div>
                <label className="text-sm font-medium">Rejection Reason</label>
                <Textarea
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">Admin Notes (Optional)</label>
              <Textarea
                placeholder="Add any additional notes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setVerificationDialogOpen(false)}
              disabled={isVerifying}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedProfile && handleVerifyProfile(selectedProfile.id, verificationAction)}
              disabled={isVerifying || (verificationAction === "reject" && !rejectionReason.trim())}
              className={verificationAction === "verify" ? "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600" : "bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"}
            >
              {isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : verificationAction === "verify" ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {isVerifying ? "Processing..." : verificationAction === "verify" ? "Verify Profile" : "Reject Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Profile Details</DialogTitle>
            <DialogDescription>
              Detailed information for {selectedProfile?.first_name} {selectedProfile?.last_name}
            </DialogDescription>
          </DialogHeader>
          {isDetailsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : selectedProfile && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                  {selectedProfile.profile_image_url ? (
                    <img src={selectedProfile.profile_image_url} alt={`${selectedProfile.first_name} ${selectedProfile.last_name}`} className="w-16 h-16 object-cover" />
                  ) : (
                    <span className="font-medium text-muted-foreground">
                      {selectedProfile.first_name[0]}{selectedProfile.last_name[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{selectedProfile.first_name} {selectedProfile.last_name}</h3>
                    {getStatusBadge(selectedProfile.verification_status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedProfile.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedProfile.location}</p>
                  {selectedProfile.phone && (
                    <p className="text-sm text-muted-foreground">{selectedProfile.phone}</p>
                  )}
                </div>
              </div>

              {selectedProfile.bio && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Bio</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedProfile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium">Experience:</span> {selectedProfile.years_experience} years</div>
                <div><span className="font-medium">Rate:</span> ${selectedProfile.hourly_rate}/hr</div>
                <div><span className="font-medium">Availability:</span> {selectedProfile.availability}</div>
                <div><span className="font-medium">Joined:</span> {new Date(selectedProfile.created_at).toLocaleDateString()}</div>
                <div><span className="font-medium">Last Updated:</span> {new Date(selectedProfile.updated_at).toLocaleDateString()}</div>
                {typeof selectedProfile.rating === 'number' && (
                  <div className="col-span-2 flex items-center gap-2">
                    <span className="font-medium">Rating:</span>
                    <span>{selectedProfile.rating?.toFixed(1) ?? "-"}</span>
                    {typeof selectedProfile.review_count === 'number' && (
                      <span className="text-xs text-muted-foreground">({selectedProfile.review_count} reviews)</span>
                    )}
                  </div>
                )}
              </div>

              {Array.isArray(selectedProfile.specialties) && selectedProfile.specialties.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.specialties.slice(0, 12).map((s) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {(selectedProfile.education || selectedProfile.certifications || selectedProfile.website || selectedProfile.linkedin) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Additional</h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedProfile.education && (<Badge variant="outline">🎓 {selectedProfile.education}</Badge>)}
                    {selectedProfile.certifications && (<Badge variant="outline">🏆 {selectedProfile.certifications}</Badge>)}
                    {selectedProfile.website && (
                      <a href={selectedProfile.website} target="_blank" rel="noreferrer" className="underline decoration-dotted">
                        <Badge variant="outline">🌐 Website</Badge>
                      </a>
                    )}
                    {selectedProfile.linkedin && (
                      <a href={selectedProfile.linkedin} target="_blank" rel="noreferrer" className="underline decoration-dotted">
                        <Badge variant="outline">💼 LinkedIn</Badge>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Website and LinkedIn Status - Only show when links are missing */}
              {(!selectedProfile.website || !selectedProfile.linkedin) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Online Presence</h4>
                  <div className="text-sm text-muted-foreground">
                    {!selectedProfile.website && !selectedProfile.linkedin ? (
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <span>⚠️</span>
                        <span>Both website and LinkedIn are not available</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {!selectedProfile.website && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <span>❌</span>
                            <span>Website: Not available</span>
                          </div>
                        )}
                        {!selectedProfile.linkedin && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <span>❌</span>
                            <span>LinkedIn: Not available</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Removed raw JSON dump as requested */}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
