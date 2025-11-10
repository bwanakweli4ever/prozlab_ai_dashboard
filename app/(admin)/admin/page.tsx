"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Users, UserCheck, UserX, Clock, TrendingUp, Activity, DollarSign, ArrowUpRight, ArrowDownRight, Eye, Settings, BarChart3, PieChart, Trash2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { authApi, taskApi, publicApi } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import type { User } from "@/types/api"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, Line, LineChart, Pie, PieChart as RechartsPieChart, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function AdminDashboardPage() {
  const { token, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    verifiedProfiles: 0,
    rejectedProfiles: 0,
    totalRequests: 0,
    completedRequests: 0,
    activeProfessionals: 0,
    revenue: 0,
  })
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [chartData, setChartData] = useState({
    userGrowth: [],
    requestTrends: [],
    revenueData: [],
    verificationStatus: [],
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteReason, setDeleteReason] = useState("")
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // AI Match state
  const [aiServiceRequestId, setAiServiceRequestId] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiRows, setAiRows] = useState<Array<{
    proz_id: string
    name: string
    email: string
    location: string | null
    rating: number
    years_experience: number | null
    hourly_rate: number | null
    specialties: string[]
    profile_image_url?: string | null
    score: number
    reasons: string[]
  }> | null>(null)

  // Debug: Log user info
  useEffect(() => {
    console.log("Admin Dashboard - Current user:", user)
    console.log("Admin Dashboard - Is superuser:", user?.is_superuser)
    console.log("Admin Dashboard - Token exists:", !!token)
  }, [user, token])

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
        console.log("Fetching admin data...")
        
        // Get recent users (admin-protected)
        const users = await authApi.getUsers(token)
        console.log("Fetched users:", users.length)
        setRecentUsers(users.slice(0, 5)) // Show last 5 users

        // Get total verified public profiles count via public endpoint
        const publicProfiles = await publicApi.searchProfiles({
          page: 1,
          page_size: 12,
          verification_status: "verified",
          show_unverified: false,
          sort_by: "rating",
          sort_order: "desc",
        })
        const totalUsersFromPublic = publicProfiles.total_count || 0

        // Get task stats
        let taskStats = {
          total_requests: 0,
          completed_requests: 0,
          active_professionals: 0,
        }
        
        try {
          taskStats = await taskApi.getAdminTaskStats(token)
        } catch (error) {
          console.warn("Failed to fetch task stats, using defaults:", error)
        }

        // Calculate stats
        const totalUsers = totalUsersFromPublic
        const pendingVerifications = Math.floor(totalUsers * 0.25)
        const verifiedProfiles = Math.floor(totalUsers * 0.65)
        const rejectedProfiles = Math.floor(totalUsers * 0.10)
        const revenue = Math.floor(totalUsers * 150) // Mock revenue calculation

        setStats({
          totalUsers,
          pendingVerifications,
          verifiedProfiles,
          rejectedProfiles,
          totalRequests: taskStats.total_requests,
          completedRequests: taskStats.completed_requests,
          activeProfessionals: taskStats.active_professionals,
          revenue,
        })

        // Generate mock chart data
        const userGrowth = [
          { month: "Jan", users: 45, professionals: 12 },
          { month: "Feb", users: 78, professionals: 18 },
          { month: "Mar", users: 120, professionals: 25 },
          { month: "Apr", users: 156, professionals: 32 },
          { month: "May", users: 189, professionals: 38 },
          { month: "Jun", users: 234, professionals: 45 },
          { month: "Jul", users: 267, professionals: 52 },
          { month: "Aug", users: 298, professionals: 58 },
          { month: "Sep", users: 334, professionals: 65 },
          { month: "Oct", users: 367, professionals: 72 },
          { month: "Nov", users: 389, professionals: 78 },
          { month: "Dec", users: totalUsers, professionals: Math.floor(totalUsers * 0.2) },
        ]

        const requestTrends = [
          { week: "Week 1", requests: 12, completed: 8 },
          { week: "Week 2", requests: 18, completed: 15 },
          { week: "Week 3", requests: 25, completed: 22 },
          { week: "Week 4", requests: 32, completed: 28 },
        ]

        const revenueData = [
          { month: "Jan", revenue: 4500, profit: 3200 },
          { month: "Feb", revenue: 7200, profit: 5100 },
          { month: "Mar", revenue: 9800, profit: 7200 },
          { month: "Apr", revenue: 12400, profit: 9200 },
          { month: "May", revenue: 15200, profit: 11400 },
          { month: "Jun", revenue: 18900, profit: 14200 },
          { month: "Jul", revenue: 22100, profit: 16800 },
          { month: "Aug", revenue: 25600, profit: 19500 },
          { month: "Sep", revenue: 28900, profit: 22100 },
          { month: "Oct", revenue: 32400, profit: 24800 },
          { month: "Nov", revenue: 35600, profit: 27200 },
          { month: "Dec", revenue: revenue, profit: Math.floor(revenue * 0.75) },
        ]

        const verificationStatus = [
          { name: "Verified", value: verifiedProfiles, color: "#10b981" },
          { name: "Pending", value: pendingVerifications, color: "#f59e0b" },
          { name: "Rejected", value: rejectedProfiles, color: "#ef4444" },
        ]

        setChartData({
          userGrowth,
          requestTrends,
          revenueData,
          verificationStatus,
        })

      } catch (error) {
        console.error("Failed to fetch admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token, user])

  const openDeleteDialog = (id: string) => {
    setUserIdToDelete(id)
    setDeleteReason("")
    setDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!token || !userIdToDelete) return
    if (!deleteReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for deletion.",
        variant: "destructive",
      })
      return
    }
    setIsDeleting(true)
    try {
      await authApi.deleteUser(userIdToDelete, deleteReason.trim(), token)
      setRecentUsers((prev) => prev.filter((u) => u.id !== userIdToDelete))
      setStats((s) => ({ ...s, totalUsers: Math.max(0, s.totalUsers - 1) }))
      toast({ title: "User deleted", description: "The user was removed successfully." })
      setDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: error instanceof Error ? error.message : "Could not delete user.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setUserIdToDelete(null)
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

  // Chart configurations
  const userGrowthConfig = {
    users: {
      label: "Total Users",
      color: "hsl(var(--chart-1))",
    },
    professionals: {
      label: "Professionals",
      color: "hsl(var(--chart-2))",
    },
  }

  const requestTrendsConfig = {
    requests: {
      label: "New Requests",
      color: "hsl(var(--chart-3))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-4))",
    },
  }

  const runAIMatch = async () => {
    if (!token || !aiServiceRequestId) return
    setAiRows(null)
    setAiLoading(true)
    try {
      const rows = await taskApi.aiMatchProfessionals(aiServiceRequestId, 5, token)
      setAiRows(rows || [])
    } catch (e) {
      setAiRows([])
    } finally {
      setAiLoading(false)
    }
  }

  const assignFromAI = async (prozId: string) => {
    if (!token || !aiServiceRequestId) return
    try {
      await taskApi.assignTaskToProfessional({ service_request_id: aiServiceRequestId, proz_id: prozId }, token)
    } catch (e) {}
  }

  const revenueConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 lg:gap-8 p-2 sm:p-3 md:p-4 lg:p-6 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
        {/* Header */}
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm md:text-base leading-relaxed">
              Comprehensive overview of your ProzLab platform
            </p>
          </div>
          <div className="flex flex-row gap-2 sm:gap-3 flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-card/80 backdrop-blur-sm border-border hover:bg-accent text-xs sm:text-sm px-2 sm:px-3"
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Settings</span>
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Reports</span>
            </Button>
          </div>
      </div>

      {/* Stats Cards */}
        <div className="grid gap-2 sm:gap-3 md:gap-4 lg:gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Users</h3>
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                {stats.totalUsers}
              </div>
              <div className="flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 dark:text-green-400 mr-1" />
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">+12% from last month</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Active Professionals</h3>
              <div className="p-1.5 sm:p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex-shrink-0">
                <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                {stats.activeProfessionals}
              </div>
              <div className="flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 dark:text-green-400 mr-1" />
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">+8% from last month</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Total Requests</h3>
              <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                {stats.totalRequests}
              </div>
              <div className="flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 dark:text-green-400 mr-1" />
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">+15% from last month</p>
              </div>
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border hover:shadow-lg transition-all duration-300 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground truncate">Revenue</h3>
              <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
                ${stats.revenue.toLocaleString()}
              </div>
              <div className="flex items-center">
                <ArrowUpRight className="h-3 w-3 text-green-500 dark:text-green-400 mr-1" />
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">+22% from last month</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* User Growth Chart */}
          <Card className="bg-card/80 backdrop-blur-sm border-border p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">User Growth</h3>
                <p className="text-xs text-muted-foreground">Monthly user and professional registrations</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ChartContainer config={userGrowthConfig} className="h-full w-full">
                <AreaChart data={chartData.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="var(--color-users)"
                    fill="var(--color-users)"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="professionals"
                    stroke="var(--color-professionals)"
                    fill="var(--color-professionals)"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
        </Card>

          {/* Verification Status Pie Chart */}
          <Card className="bg-card/80 backdrop-blur-sm border-border p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Verification Status</h3>
                <p className="text-xs text-muted-foreground">Profile verification distribution</p>
              </div>
              <PieChart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ChartContainer config={{}} className="h-full w-full">
                <RechartsPieChart>
                  <Pie
                    data={chartData.verificationStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.verificationStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend 
                    content={<ChartLegendContent />}
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </RechartsPieChart>
              </ChartContainer>
            </div>
          </Card>
        </div>

        {/* Revenue and Request Trends */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="bg-card/80 backdrop-blur-sm border-border p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Revenue Trends</h3>
                <p className="text-xs text-muted-foreground">Monthly revenue and profit analysis</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ChartContainer config={revenueConfig} className="h-full w-full">
                <LineChart data={chartData.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="month" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="var(--color-profit)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-profit)", strokeWidth: 2, r: 2 }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </Card>

          {/* Request Trends */}
          <Card className="bg-card/80 backdrop-blur-sm border-border p-3 sm:p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Request Trends</h3>
                <p className="text-xs text-muted-foreground">Weekly request completion rates</p>
              </div>
              <Activity className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
            <div className="h-[200px] sm:h-[250px] md:h-[300px]">
              <ChartContainer config={requestTrendsConfig} className="h-full w-full">
                <BarChart data={chartData.requestTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="week" 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    className="text-muted-foreground"
                    tick={{ fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="requests" fill="var(--color-requests)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="completed" fill="var(--color-completed)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </div>
          </Card>
        </div>

        {/* Recent Users and Quick Actions */}
        <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border p-3 sm:p-4">
            <div className="mb-3">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Recent Users</h3>
              <p className="text-xs text-muted-foreground">Latest user registrations and activity</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {recentUsers.length === 0 ? (
                <div className="text-center py-4 sm:py-6">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-xs sm:text-sm">No users found</p>
                </div>
              ) : (
                recentUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-2 sm:p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-xs sm:text-sm truncate">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Badge 
                        variant={user.is_active ? "default" : "secondary"}
                        className={`text-xs ${user.is_active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {user.is_superuser && (
                        <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs">
                          Admin
                        </Badge>
                      )}
                      {!user.is_superuser && (
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => openDeleteDialog(user.id)}>
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-border p-3 sm:p-4">
            <div className="mb-3">
              <h3 className="text-sm sm:text-base font-semibold text-foreground">Quick Actions</h3>
              <p className="text-xs text-muted-foreground">Common administrative tasks</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <Button size="sm" className="w-full justify-start bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 text-xs">
                <UserCheck className="h-3 w-3 mr-2" />
                <span className="truncate">Review Verifications</span>
                <Badge variant="secondary" className="ml-auto bg-white/20 dark:bg-black/20 text-white text-xs">
                  {stats.pendingVerifications}
                </Badge>
              </Button>
              
              <Button size="sm" variant="outline" className="w-full justify-start border-border hover:bg-accent text-xs">
                <Users className="h-3 w-3 mr-2" />
                <span className="truncate">Manage Users</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {stats.totalUsers}
                </Badge>
              </Button>
              
              <Button size="sm" variant="outline" className="w-full justify-start border-border hover:bg-accent text-xs">
                <Activity className="h-3 w-3 mr-2" />
                <span className="truncate">View Tasks</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {stats.totalRequests}
                </Badge>
              </Button>
              
              <Button size="sm" variant="outline" className="w-full justify-start border-border hover:bg-accent text-xs">
                <Settings className="h-3 w-3 mr-2" />
                <span className="truncate">System Settings</span>
              </Button>
            </div>
          </Card>
        </div>
              </div>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Please provide a reason for deleting this user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Textarea
              placeholder="Enter deletion reason"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
