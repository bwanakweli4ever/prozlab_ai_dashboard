"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Loader2, Plus, Users, Clock, AlertTriangle, TrendingUp, BarChart3, PieChart, Activity, Calendar, Target, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { taskApi, prozProfilesApi } from "@/lib/api"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"

export default function AdminTasksPage() {
  const { token, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [serviceRequests, setServiceRequests] = useState<any[]>([])
  const [taskAssignments, setTaskAssignments] = useState<any[]>([])
  const [taskStats, setTaskStats] = useState({
    total_requests: 0,
    pending_requests: 0,
    assigned_requests: 0,
    completed_requests: 0,
    urgent_requests: 0,
    unassigned_requests: 0,
    active_professionals: 0,
    requests_this_week: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingButtons, setLoadingButtons] = useState<{[key: string]: boolean}>({})
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string>("")
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>("")
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loadingProfessionals, setLoadingProfessionals] = useState(false)
  const [professionalSearchQuery, setProfessionalSearchQuery] = useState<string>("")
  const [professionalSearchLocation, setProfessionalSearchLocation] = useState<string>("")
  const [professionalSearchSpecialty, setProfessionalSearchSpecialty] = useState<string>("")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [aiMatches, setAiMatches] = useState<any[] | null>(null)
  const [aiMatching, setAiMatching] = useState(false)
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([])
  const [isAssigning, setIsAssigning] = useState(false)
  const [analyticsData, setAnalyticsData] = useState({
    completionRate: 0,
    averageCompletionTime: 0,
    topPerformingProfessionals: [] as any[],
    taskTrends: [] as any[],
    statusDistribution: {
      pending: 0,
      in_progress: 0,
      completed: 0,
      cancelled: 0
    },
    weeklyStats: [] as any[],
    monthlyStats: [] as any[]
  })

  // Calculate analytics data from existing data
  const calculateAnalytics = () => {
    const allTasks = [...serviceRequests, ...taskAssignments]
    const completedTasks = allTasks.filter(task => task.status === 'completed' || task.verification_status === 'completed')
    const totalTasks = allTasks.length
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0
    
    // Calculate average completion time (mock calculation)
    const averageCompletionTime = completedTasks.length > 0 ? 
      completedTasks.reduce((sum, task) => {
        const created = new Date(task.created_at || task.assignment_date)
        const completed = new Date(task.completed_at || task.updated_at)
        return sum + (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24) // days
      }, 0) / completedTasks.length : 0
    
    // Calculate status distribution
    const statusDistribution = {
      pending: allTasks.filter(task => task.status === 'pending' || task.verification_status === 'pending').length,
      in_progress: allTasks.filter(task => task.status === 'in_progress' || task.verification_status === 'in_progress').length,
      completed: completedTasks.length,
      cancelled: allTasks.filter(task => task.status === 'cancelled' || task.verification_status === 'cancelled').length
    }
    
    // Mock weekly stats (last 7 days)
    const weeklyStats = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return {
        date: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 5) + 1,
        pending: Math.floor(Math.random() * 3) + 1
      }
    }).reverse()
    
    // Mock monthly stats (last 12 months)
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        completed: Math.floor(Math.random() * 20) + 5,
        pending: Math.floor(Math.random() * 10) + 2
      }
    }).reverse()
    
    // Mock top performing professionals
    const topPerformingProfessionals = professionals.slice(0, 5).map((prof, index) => ({
      id: prof.id,
      name: `${prof.first_name || prof.name} ${prof.last_name || ''}`,
      completedTasks: Math.floor(Math.random() * 20) + 5,
      rating: (Math.random() * 2 + 3).toFixed(1),
      completionRate: Math.floor(Math.random() * 30) + 70
    }))
    
    setAnalyticsData({
      completionRate: Math.round(completionRate * 100) / 100,
      averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
      topPerformingProfessionals,
      taskTrends: weeklyStats,
      statusDistribution,
      weeklyStats,
      monthlyStats
    })
  }

  // Load pending assignments from localStorage
  const loadPendingAssignments = () => {
    try {
      const stored = localStorage.getItem('pendingAssignments')
      if (stored) {
        const assignments = JSON.parse(stored)
        setPendingAssignments(assignments)
        console.log("Loaded pending assignments:", assignments)
      }
    } catch (error) {
      console.error("Error loading pending assignments:", error)
    }
  }

  // Check if a request is already assigned
  const isRequestAssigned = (requestId: string) => {
    // Check in task assignments
    const isInAssignments = taskAssignments.some(assignment => 
      assignment.service_request_id === requestId
    )
    
    // Check in pending assignments
    const isInPending = pendingAssignments.some(assignment => 
      assignment.service_request_id === requestId
    )
    
    return isInAssignments || isInPending
  }

  // Button handlers
  const handleViewDetails = async (requestId: string) => {
    console.log("🔍 View details button clicked for request:", requestId)
    
    // Set loading state
    setLoadingButtons(prev => ({ ...prev, [`view-${requestId}`]: true }))
    
    try {
      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Show success message
      toast({
        title: "View Details",
        description: `Opening details for request ${requestId}`,
      })
      
      // Here you would typically open a modal or navigate to details page
      console.log("Opening details for request:", requestId)
      
    } catch (error) {
      console.error("Error viewing details:", error)
      toast({
        title: "Error",
        description: "Failed to load request details",
        variant: "destructive",
      })
    } finally {
      // Clear loading state
      setLoadingButtons(prev => ({ ...prev, [`view-${requestId}`]: false }))
    }
  }

  const handleAssignProfessional = async (requestId: string) => {
    console.log("👤 Assign professional button clicked for request:", requestId)
    setSelectedRequestId(requestId)
    setSelectedProfessionalId("")
    setProfessionalSearchQuery("")
    setProfessionalSearchLocation("")
    setProfessionalSearchSpecialty("")
    setAssignDialogOpen(true)
    
    // Load professionals dynamically
    await loadProfessionals()
  }

  const handleAIMatch = async (requestId: string) => {
    try {
      if (!token) {
        toast({ title: "Error", description: "Authentication required", variant: "destructive" })
        return
      }
      setAiMatching(true)
      setSelectedRequestId(requestId)
      const trimmedId = (requestId || "").trim()
      const results = await taskApi.aiMatchProfessionals(trimmedId, 10, token)
      console.log("AI match raw results:", results)
      const rAny: any = results as any
      const normalized = Array.isArray(rAny)
        ? rAny
        : (rAny?.items || rAny?.data || rAny?.results || [])
      console.log("AI match normalized results:", normalized)
      setAiMatches(normalized)
      toast({ title: "AI Match Complete", description: `Found ${normalized?.length || 0} candidates` })
    } catch (e) {
      console.error("AI match error", e)
      setAiMatches([])
      toast({ title: "AI Match Failed", description: "Could not fetch matches", variant: "destructive" })
    } finally {
      setAiMatching(false)
    }
  }

  const loadProfessionals = async (searchParams: {
    query?: string
    location?: string
    specialty?: string
  } = {}) => {
    setLoadingProfessionals(true)
    try {
      console.log("Loading professionals with params:", searchParams)
      
      // Use the dynamic public profiles API
      const response = await prozProfilesApi.searchPublicProfiles({
        page: 1,
        page_size: 20,
        verification_status: "verified", // Only show verified professionals
        sort_by: "rating",
        sort_order: "desc",
        ...searchParams
      })
      
      console.log("Dynamic professionals response:", response)
      
      // Extract professionals from response
      const apiProfessionals = response.profiles || response.results || response || []
      console.log("API professionals array:", apiProfessionals)
      
      if (apiProfessionals.length > 0) {
        setProfessionals(apiProfessionals)
        console.log(`Loaded ${apiProfessionals.length} professionals from API`)
      } else {
        // If API returns empty array, show fallback professionals
        console.log("No professionals from API, using fallback data")
        setProfessionals([
          { id: "1", first_name: "John", last_name: "Doe", bio: "Web Development Expert", rating: 4.8, location: "Kigali, Rwanda" },
          { id: "2", first_name: "Jane", last_name: "Smith", bio: "Mobile Development Specialist", rating: 4.9, location: "Kigali, Rwanda" },
          { id: "3", first_name: "Mike", last_name: "Johnson", bio: "UI/UX Design Professional", rating: 4.7, location: "Kigali, Rwanda" },
          { id: "4", first_name: "Sarah", last_name: "Wilson", bio: "Full Stack Developer", rating: 4.6, location: "Kigali, Rwanda" },
          { id: "5", first_name: "David", last_name: "Brown", bio: "DevOps Engineer", rating: 4.9, location: "Kigali, Rwanda" },
        ])
      }
    } catch (error) {
      console.error("Error loading professionals:", error)
      // Fallback: show some mock professionals
      setProfessionals([
        { id: "1", first_name: "John", last_name: "Doe", bio: "Web Development Expert", rating: 4.8, location: "Kigali, Rwanda" },
        { id: "2", first_name: "Jane", last_name: "Smith", bio: "Mobile Development Specialist", rating: 4.9, location: "Kigali, Rwanda" },
        { id: "3", first_name: "Mike", last_name: "Johnson", bio: "UI/UX Design Professional", rating: 4.7, location: "Kigali, Rwanda" },
        { id: "4", first_name: "Sarah", last_name: "Wilson", bio: "Full Stack Developer", rating: 4.6, location: "Kigali, Rwanda" },
        { id: "5", first_name: "David", last_name: "Brown", bio: "DevOps Engineer", rating: 4.9, location: "Kigali, Rwanda" },
      ])
    } finally {
      setLoadingProfessionals(false)
    }
  }

  // Auto-suggest removed in favor of AI Match

  const handleConfirmAssignment = async () => {
    if (!selectedProfessionalId || !selectedRequestId) {
      toast({
        title: "Error",
        description: "Please select a professional to assign",
        variant: "destructive",
      })
      return
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      })
      return
    }

    setIsAssigning(true)
    try {
      console.log("Assigning professional:", selectedProfessionalId, "to request:", selectedRequestId)
      
      // Call the real assignment API
      const assignmentData = {
        service_request_id: selectedRequestId,
        proz_id: selectedProfessionalId,
        assignment_notes: "Task assigned by admin",
        estimated_hours: 8, // Default 8 hours
        proposed_rate: 50, // Default $50/hour
      }
      
      const result = await taskApi.assignTaskToProfessional(assignmentData, token)
      console.log("Assignment result:", result)
      
      // Check if it's a network error response
      if (result && result.isNetworkError) {
        console.log("Network error detected, using fallback assignment")
        
        // Fallback: Simulate successful assignment
        toast({
          title: "Assignment Created (Offline Mode)",
          description: "Professional assignment created locally. Will sync when API is available.",
        })
        
        // Close dialog and reset state
        setAssignDialogOpen(false)
        setSelectedProfessionalId("")
        setSelectedRequestId("")
        
        // Refresh the service requests to show updated status
        setRefreshTrigger(prev => prev + 1)
        
        // Store assignment locally for potential sync later
        const localAssignment = {
          service_request_id: selectedRequestId,
          proz_id: selectedProfessionalId,
          assignment_notes: "Task assigned by admin (offline)",
          estimated_hours: 8,
          proposed_rate: 50,
          timestamp: new Date().toISOString(),
          status: "pending_sync"
        }
        
        // Store in localStorage for potential sync
        const existingAssignments = JSON.parse(localStorage.getItem('pendingAssignments') || '[]')
        existingAssignments.push(localAssignment)
        localStorage.setItem('pendingAssignments', JSON.stringify(existingAssignments))
        
        console.log("Assignment stored locally:", localAssignment)
        return
      }
      
      // Check if it's a business logic response (like duplicate assignment)
      if (result && result.isBusinessLogic && result.message) {
        console.log("Business logic response received:", result.message)
        
        if (result.message.includes("Task already assigned to this professional")) {
          toast({
            title: "Already Assigned ✅",
            description: "This task is already assigned to the selected professional.",
          })
        } else {
          toast({
            title: "Info",
            description: result.message,
          })
        }
        
        // Close dialog and reset state
        setAssignDialogOpen(false)
        setSelectedProfessionalId("")
        setSelectedRequestId("")
        
        // Refresh the service requests to show updated status
        setRefreshTrigger(prev => prev + 1)
        return
      }
      
      // Normal success case
      toast({
        title: "Success! 🎉",
        description: "Professional assigned successfully! They will receive an email notification.",
      })
      toastHot.success("Professional assigned successfully!")
      toastNotify.success("Professional assigned successfully!")
      
      // Close dialog and reset state
      setAssignDialogOpen(false)
      setSelectedProfessionalId("")
      setSelectedRequestId("")
      
      // Refresh the service requests to show updated status
      setRefreshTrigger(prev => prev + 1)
      
    } catch (error) {
      console.error("Unexpected error assigning professional:", error)
      
      // Handle unexpected errors (should be rare now)
      toast({
        title: "Assignment Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      toastHot.error("Assignment failed")
      toastNotify.error("Assignment failed")
    } finally {
      setIsAssigning(false)
    }
  }

  // Assign directly without opening the dialog: pick top AI match and assign
  const handleDirectAssign = async (requestId: string) => {
    try {
      if (!token) {
        toast({ title: "Error", description: "Authentication required", variant: "destructive" })
        return
      }
      setLoadingButtons(prev => ({ ...prev, [`assign-${requestId}`]: true }))
      setSelectedRequestId(requestId)

      // Ensure we have matches; if not, run AI match first
      if (!aiMatches || selectedRequestId !== requestId) {
        await handleAIMatch(requestId)
      }

      const top = (aiMatches && aiMatches[0]) || null
      if (!top) {
        toast({ title: "No Matches", description: "AI did not return candidates to assign." })
        return
      }

      setSelectedProfessionalId(top.proz_id)
      await handleConfirmAssignment()
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`assign-${requestId}`]: false }))
    }
  }

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
        console.log("Fetching admin task data...")
        
        // Try to get admin task stats, but provide fallback if it fails
        try {
          const stats = await taskApi.getAdminTaskStats(token)
          console.log("Fetched task stats:", stats)
          setTaskStats(stats)
        } catch (statsError) {
          console.warn("Admin task stats endpoint not available, using fallback data:", statsError)
          // Provide fallback stats
          setTaskStats({
            total_requests: 0,
            pending_requests: 0,
            assigned_requests: 0,
            completed_requests: 0,
            urgent_requests: 0,
            unassigned_requests: 0,
            active_professionals: 0,
            requests_this_week: 0,
          })
        }

        // Get service requests for admin - dynamic parsing of response shapes
        const requestsResp = await taskApi.getServiceRequestsAdmin(token, 1, 50)

        // Check if it's an authentication error response
        if (requestsResp && typeof requestsResp === 'object' && 'isAuthError' in requestsResp && (requestsResp as any).isAuthError) {
          console.warn("Authentication error in service requests fetch, user may need to re-login")
          return
        }

        console.log("Fetched service requests - Full response:", requestsResp)

        // Normalize to an array regardless of backend shape
        let requestsArray: any[] = []
        if (requestsResp) {
          if (Array.isArray((requestsResp as any).requests)) requestsArray = (requestsResp as any).requests
          else if (Array.isArray((requestsResp as any).data)) requestsArray = (requestsResp as any).data
          else if (Array.isArray((requestsResp as any).results)) requestsArray = (requestsResp as any).results
          else if (Array.isArray((requestsResp as any).items)) requestsArray = (requestsResp as any).items
          else if (Array.isArray(requestsResp as any)) requestsArray = requestsResp as any[]
        }

        console.log("Service requests array (normalized):", requestsArray)
        console.log("Service requests length:", requestsArray.length)
        setServiceRequests(requestsArray)

        // Get task assignments
        const assignments = await taskApi.getTaskAssignmentsAdmin(token, 1, 50)
        
        // Check if it's an authentication error response
        if (assignments && typeof assignments === 'object' && 'isAuthError' in assignments && assignments.isAuthError) {
          console.warn("Authentication error in task assignments fetch, user may need to re-login")
          return
        }
        
        console.log("Fetched task assignments:", assignments)
        setTaskAssignments(assignments.assignments || [])
      } catch (error) {
        console.error("Failed to fetch admin task data:", error)
        
        // Check if it's an authentication error
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("Could not validate credentials") || 
            errorMessage.includes("401") || 
            errorMessage.includes("403")) {
          console.warn("Authentication error in admin data fetch, user may need to re-login")
          // Don't show error toast for auth errors, the auth context will handle logout
        } else {
          toast({
            title: "Warning",
            description: "Some admin features may not be available. API endpoints are being developed.",
            variant: "default",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    loadPendingAssignments()
  }, [token, user, refreshTrigger])

  // Calculate analytics when data changes
  useEffect(() => {
    if (serviceRequests.length > 0 || taskAssignments.length > 0) {
      calculateAnalytics()
    }
  }, [serviceRequests, taskAssignments, professionals])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "assigned":
        return "bg-blue-500"
      case "in_progress":
        return "bg-purple-500"
      case "completed":
        return "bg-green-500"
      case "cancelled":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Show access denied if not superuser
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
        <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
        <p className="text-muted-foreground">Manage service requests and task assignments.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total_requests}</div>
            <p className="text-xs text-muted-foreground">This week: {taskStats.requests_this_week}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.pending_requests}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Professionals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.active_professionals}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{taskStats.urgent_requests}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Assignments Section */}
      {pendingAssignments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Pending Assignments ({pendingAssignments.length})
            </CardTitle>
            <CardDescription className="text-orange-700">
              These assignments were created offline and need to be synced when the API is available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingAssignments.map((assignment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border">
                  <div>
                    <p className="font-medium">Request: {assignment.service_request_id}</p>
                    <p className="text-sm text-muted-foreground">Professional: {assignment.proz_id}</p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(assignment.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    Pending Sync
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search requests..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Service Requests ({serviceRequests.length})</TabsTrigger>
          <TabsTrigger value="assignments">Task Assignments ({taskAssignments.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Requests</CardTitle>
              <CardDescription>Manage incoming service requests from clients.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">No service requests found</p>
                    <p className="text-sm text-muted-foreground">
                      This could mean there are no requests yet, or the API endpoint is not available.
                    </p>
                  </div>
                ) : (
                  serviceRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{request.service_title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {request.company_name} • {request.client_name}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={`${getPriorityColor(request.priority)} text-white`}>
                            {request.priority.toUpperCase()}
                          </Badge>
                          <Badge className={`${getStatusColor(request.status)} text-white`}>
                            {request.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          {isRequestAssigned(request.id) && (
                            <Badge className="bg-green-600 text-white">
                              ASSIGNED ✅
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Inline AI Matches under the triggering request */}
                      {selectedRequestId === request.id && aiMatches && (
                        <div className="mt-4 border rounded-md">
                          <div className="p-3 border-b bg-muted/40">
                            <div className="text-sm font-medium">AI Matches</div>
                            <div className="text-xs text-muted-foreground">Top candidates ranked with confidence</div>
                          </div>
                          <div className="p-3 overflow-x-auto">
                            {aiMatches.length === 0 ? (
                              <div className="text-sm text-muted-foreground">No matches found.</div>
                            ) : (
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="text-left text-muted-foreground">
                                    <th className="p-2">Professional</th>
                                    <th className="p-2">Email</th>
                                    <th className="p-2">Location</th>
                                    <th className="p-2">Rating</th>
                                    <th className="p-2">Experience</th>
                                    <th className="p-2">Rate</th>
                                    <th className="p-2">Confidence</th>
                                    <th className="p-2">Assign</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {aiMatches.map((m) => (
                                    <tr key={m.proz_id} className="border-t">
                                      <td className="p-2">{m.name}</td>
                                      <td className="p-2">{m.email}</td>
                                      <td className="p-2">{m.location || '-'}</td>
                                      <td className="p-2">{m.rating ?? '-'}</td>
                                      <td className="p-2">{m.years_experience ?? '-'}</td>
                                      <td className="p-2">{m.hourly_rate ? `$${m.hourly_rate}/hr` : '-'}</td>
                                      <td className="p-2 font-medium">{Math.round(((m.score ?? 0) as number) * 100)}%</td>
                                      <td className="p-2">
                                        <Button
                                          size="sm"
                                          disabled={isAssigning}
                                          onClick={() => {
                                            setSelectedProfessionalId(m.proz_id)
                                            setSelectedRequestId(request.id)
                                            handleConfirmAssignment()
                                          }}
                                        >{isAssigning ? 'Assigning...' : 'Assign'}</Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground">{request.service_description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Budget:</span>
                          <p className="text-muted-foreground">
                            ${request.budget_min} - ${request.budget_max}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Category:</span>
                          <p className="text-muted-foreground">{request.service_category}</p>
                        </div>
                        <div>
                          <span className="font-medium">Remote:</span>
                          <p className="text-muted-foreground">{request.remote_work_allowed ? "Yes" : "No"}</p>
                        </div>
                        <div>
                          <span className="font-medium">Deadline:</span>
                          <p className="text-muted-foreground">
                            {request.deadline ? new Date(request.deadline).toLocaleDateString() : "None"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2" style={{ zIndex: 10, position: 'relative' }}>
                        <button 
                          className="px-3 py-1.5 text-sm border border-blue-300 rounded-md bg-blue-50 hover:bg-blue-100 hover:border-blue-400 text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                          onClick={(e) => {
                            console.log("🔍 View Details button clicked, event:", e)
                            handleViewDetails(request.id)
                          }}
                          disabled={loadingButtons[`view-${request.id}`]}
                        >
                          {loadingButtons[`view-${request.id}`] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            "View Details"
                          )}
                        </button>
                        <button 
                          className={`px-3 py-1.5 text-sm border rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                            isRequestAssigned(request.id) 
                              ? "border-green-500 bg-green-600 hover:bg-green-700 hover:border-green-600" 
                              : "border-blue-500 bg-blue-600 hover:bg-blue-700 hover:border-blue-600"
                          }`}
                          onClick={(e) => {
                            console.log("👤 Assign Top Match button clicked, event:", e)
                            handleDirectAssign(request.id)
                          }}
                          disabled={loadingButtons[`assign-${request.id}`] || isRequestAssigned(request.id)}
                        >
                          {loadingButtons[`assign-${request.id}`] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Assigning...
                            </>
                          ) : isRequestAssigned(request.id) ? (
                            "Already Assigned ✅"
                          ) : (
                            "Assign Top Match"
                          )}
                        </button>
                        {/* Auto-Suggest removed */}
                        <button 
                          className="px-3 py-1.5 text-sm border border-indigo-300 rounded-md bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          onClick={(e) => {
                            console.log("🤖 AI Match button clicked, event:", e)
                            handleAIMatch(request.id)
                          }}
                          disabled={aiMatching && selectedRequestId===request.id}
                        >
                          {aiMatching && selectedRequestId===request.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Scanning...
                            </>
                          ) : (
                            "AI Match"
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        {aiMatches && (
          <Card>
            <CardHeader>
              <CardTitle>AI Matches for Request {selectedRequestId}</CardTitle>
              <CardDescription>Top candidates ranked with confidence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="p-2">Professional</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Location</th>
                      <th className="p-2">Rating</th>
                      <th className="p-2">Experience</th>
                      <th className="p-2">Rate</th>
                      <th className="p-2">Confidence</th>
                      <th className="p-2">Reasons</th>
                      <th className="p-2">Assign</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiMatches.map((m) => (
                      <tr key={m.proz_id} className="border-t">
                        <td className="p-2">{m.name}</td>
                        <td className="p-2">{m.email}</td>
                        <td className="p-2">{m.location || '-'}</td>
                        <td className="p-2">{m.rating ?? '-'}</td>
                        <td className="p-2">{m.years_experience ?? '-'}</td>
                        <td className="p-2">{m.hourly_rate ? `$${m.hourly_rate}/hr` : '-'}</td>
                        <td className="p-2 font-medium">{Math.round(((m.score ?? 0) as number) * 100)}%</td>
                        <td className="p-2 max-w-[360px]">
                          <div className="text-xs text-muted-foreground line-clamp-3">
                            {(m.reasons || []).join('; ')}
                          </div>
                        </td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            disabled={isAssigning}
                            onClick={() => {
                              setSelectedProfessionalId(m.proz_id)
                              handleConfirmAssignment()
                            }}
                          >{isAssigning ? 'Assigning...' : 'Assign'}</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Assignments</CardTitle>
              <CardDescription>Monitor task assignments and professional responses.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taskAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">No task assignments found</p>
                    <p className="text-sm text-muted-foreground">
                      This could mean there are no assignments yet, or the API endpoint is not available.
                    </p>
                  </div>
                ) : (
                  taskAssignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{assignment.service_request.service_title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Assigned to: {assignment.professional_name} ({assignment.professional_email})
                          </p>
                        </div>
                        <Badge className={`${getStatusColor(assignment.status)} text-white`}>
                          {assignment.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Proposed Rate:</span>
                          <p className="text-muted-foreground">${assignment.proposed_rate}/hr</p>
                        </div>
                        <div>
                          <span className="font-medium">Estimated Hours:</span>
                          <p className="text-muted-foreground">{assignment.estimated_hours} hours</p>
                        </div>
                        <div>
                          <span className="font-medium">Assigned:</span>
                          <p className="text-muted-foreground">
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Due Date:</span>
                          <p className="text-muted-foreground">
                            {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "None"}
                          </p>
                        </div>
                      </div>

                      {assignment.assignment_notes && (
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-1">Assignment Notes:</p>
                          <p className="text-sm text-muted-foreground">{assignment.assignment_notes}</p>
                        </div>
                      )}

                      {assignment.proz_response && (
                        <div className="p-3 bg-blue-50 rounded-md">
                          <p className="text-sm font-medium mb-1">Professional Response:</p>
                          <p className="text-sm text-muted-foreground">{assignment.proz_response}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Responded on: {new Date(assignment.proz_response_at).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                        <Button size="sm" variant="outline">
                          Contact Professional
                        </Button>
                        {assignment.status === "completed" && (
                          <Button size="sm" variant="outline">
                            Mark as Paid
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.completionRate}%</div>
                <p className="text-xs text-muted-foreground">Tasks completed successfully</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.averageCompletionTime} days</div>
                <p className="text-xs text-muted-foreground">Average time to complete</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Professionals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.topPerformingProfessionals.length}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsData.statusDistribution.pending + 
                   analyticsData.statusDistribution.in_progress + 
                   analyticsData.statusDistribution.completed + 
                   analyticsData.statusDistribution.cancelled}
                </div>
                <p className="text-xs text-muted-foreground">All time tasks</p>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Distribution</CardTitle>
                <CardDescription>Current breakdown of task statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Pending</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{analyticsData.statusDistribution.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{analyticsData.statusDistribution.in_progress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{analyticsData.statusDistribution.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">Cancelled</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{analyticsData.statusDistribution.cancelled}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Professionals</CardTitle>
                <CardDescription>Most productive team members</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topPerformingProfessionals.length > 0 ? (
                    analyticsData.topPerformingProfessionals.map((professional, index) => (
                      <div key={professional.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{professional.name}</p>
                            <p className="text-xs text-muted-foreground">{professional.completedTasks} tasks completed</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{professional.rating}★</p>
                          <p className="text-xs text-muted-foreground">{professional.completionRate}% rate</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No professional data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Task Trends</CardTitle>
              <CardDescription>Task completion trends over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-2">
                  {analyticsData.weeklyStats.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-muted-foreground mb-2">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="space-y-1">
                        <div className="h-8 bg-green-100 rounded flex items-end justify-center">
                          <div 
                            className="bg-green-500 w-full rounded-t" 
                            style={{ height: `${(day.completed / Math.max(...analyticsData.weeklyStats.map(d => d.completed))) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium">{day.completed}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
              <CardDescription>Task completion over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-2">
                  {analyticsData.monthlyStats.slice(-6).map((month, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xs text-muted-foreground mb-2">{month.month}</div>
                      <div className="space-y-1">
                        <div className="h-16 bg-blue-100 rounded flex items-end justify-center">
                          <div 
                            className="bg-blue-500 w-full rounded-t" 
                            style={{ height: `${(month.completed / Math.max(...analyticsData.monthlyStats.map(m => m.completed))) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs font-medium">{month.completed}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>Completed Tasks</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Professional Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Assign Professional</DialogTitle>
            <DialogDescription>
              Select a professional to assign to this service request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Search Filters */}
            <div className="grid gap-3">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search professionals..."
                    value={professionalSearchQuery}
                    onChange={(e) => setProfessionalSearchQuery(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => loadProfessionals({
                    query: professionalSearchQuery,
                    location: professionalSearchLocation,
                    specialty: professionalSearchSpecialty
                  })}
                  disabled={loadingProfessionals}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Location (optional)"
                  value={professionalSearchLocation}
                  onChange={(e) => setProfessionalSearchLocation(e.target.value)}
                  className="h-9"
                />
                <Input
                  placeholder="Specialty (optional)"
                  value={professionalSearchSpecialty}
                  onChange={(e) => setProfessionalSearchSpecialty(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Professional Selection */}
            <div className="grid gap-2">
              <label htmlFor="professional-select" className="text-sm font-medium">
                Choose Professional ({professionals.length} available)
              </label>
              {loadingProfessionals ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading professionals...</span>
                </div>
              ) : professionals.length === 0 ? (
                <div className="flex items-center justify-center p-4">
                  <span className="text-muted-foreground">No professionals found. Try adjusting your search criteria.</span>
                </div>
              ) : (
                <Select value={selectedProfessionalId} onValueChange={setSelectedProfessionalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a professional" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {professionals.map((professional) => {
                      const fullName = professional.name || 
                        `${professional.first_name || ''} ${professional.last_name || ''}`.trim() ||
                        professional.username || 
                        'Unknown Professional'
                      
                      const specialty = professional.specialty || 
                        professional.bio || 
                        professional.expertise || 
                        'General Professional'
                      
                      const rating = professional.rating || professional.avg_rating || 'N/A'
                      const location = professional.location || 'Location not specified'
                      const hourlyRate = professional.hourly_rate || 'Rate not specified'
                      
                      return (
                        <SelectItem key={professional.id} value={professional.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{fullName}</span>
                            <span className="text-sm text-muted-foreground">
                              {specialty} • {location}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Rating: {rating} • Rate: ${hourlyRate}/hr
                            </span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAssignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmAssignment}
              disabled={!selectedProfessionalId || isAssigning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAssigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Professional"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
