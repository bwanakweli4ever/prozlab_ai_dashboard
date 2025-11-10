"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Clock, DollarSign, MapPin, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { taskApi } from "@/lib/api"
import type { ProfessionalTaskResponse } from "@/types/api"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"

export default function TasksPage() {
  const { token, user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<ProfessionalTaskResponse[]>([])
  const [filteredTasks, setFilteredTasks] = useState<ProfessionalTaskResponse[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [hasNetworkError, setHasNetworkError] = useState(false)
  const [pendingAssignments, setPendingAssignments] = useState<any[]>([])
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return

      setIsLoading(true)
      try {
        console.log("Fetching professional tasks for user...")
        const result = await taskApi.getProfessionalTasks(token)
        
        // Check if it's an authentication error response
        if (result && typeof result === 'object' && 'isAuthError' in result && result.isAuthError) {
          console.warn("Authentication error in tasks fetch, user may need to re-login")
          // Don't show error toast for auth errors, the auth context will handle logout
          return
        }
        
        console.log("Professional tasks received:", result)
        console.log("Number of tasks:", result.length)
        setTasks(result)
        setFilteredTasks(result)
        setHasNetworkError(false)
      } catch (error) {
        console.warn("Failed to fetch tasks:", error)
        
        // Check if it's an authentication error
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes("Could not validate credentials") || 
            errorMessage.includes("401") || 
            errorMessage.includes("403")) {
          console.warn("Authentication error in tasks fetch, user may need to re-login")
          // Don't show error toast for auth errors, the auth context will handle logout
          setHasNetworkError(false)
        } else if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
          setHasNetworkError(true)
          toast({
            title: "Connection Issue",
            description: "Unable to connect to the server. Showing cached data or empty state.",
            variant: "destructive",
          })
        } else {
          setHasNetworkError(false)
          toast({
            title: "Error",
            description: "Failed to fetch tasks",
            variant: "destructive",
          })
          toastHot.error("Failed to fetch tasks")
          toastNotify.error("Failed to fetch tasks")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [token])

  // Load pending assignments from localStorage
  useEffect(() => {
    const loadPendingAssignments = () => {
      if (!user?.id) return
      
      try {
        const stored = localStorage.getItem('pendingAssignments')
        if (stored) {
          const allAssignments = JSON.parse(stored)
          console.log("Found pending assignments in localStorage:", allAssignments)
          
          // Filter assignments for the current user
          const userAssignments = allAssignments.filter((assignment: any) => 
            assignment.proz_id === user.id
          )
          console.log("Pending assignments for current user:", userAssignments)
          setPendingAssignments(userAssignments)
        }
      } catch (error) {
        console.error("Error loading pending assignments:", error)
      }
    }
    
    loadPendingAssignments()
  }, [user?.id])

  const retryFetchTasks = async () => {
    if (!token) return
    setIsLoading(true)
    setHasNetworkError(false)
    try {
      const result = await taskApi.getProfessionalTasks(token)
      
      // Check if it's an authentication error response
      if (result && typeof result === 'object' && 'isAuthError' in result && result.isAuthError) {
        console.warn("Authentication error in retry, user may need to re-login")
        // Don't show error toast for auth errors, the auth context will handle logout
        return
      }
      
      setTasks(result)
      setFilteredTasks(result)
      toast({
        title: "Success",
        description: "Tasks loaded successfully",
      })
    } catch (error) {
      console.warn("Retry failed:", error)
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("Could not validate credentials") || 
          errorMessage.includes("401") || 
          errorMessage.includes("403")) {
        console.warn("Authentication error in retry, user may need to re-login")
        // Don't show error toast for auth errors, the auth context will handle logout
      } else if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        setHasNetworkError(true)
        toast({
          title: "Still Unable to Connect",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = tasks

    if (selectedStatus !== "all") {
      filtered = filtered.filter((task) => task.status === selectedStatus)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (task) =>
          task.service_title.toLowerCase().includes(term) ||
          task.company_name.toLowerCase().includes(term) ||
          task.service_category.toLowerCase().includes(term),
      )
    }

    setFilteredTasks(filtered)
  }, [tasks, selectedStatus, searchTerm])

  const handleTaskResponse = async (assignmentId: string, action: string, message?: string) => {
    if (!token) return

    // Set loading state
    setLoadingActions(prev => ({ ...prev, [`${action}-${assignmentId}`]: true }))

    try {
      const result = await taskApi.respondToTaskAssignment(
        assignmentId,
        {
          response_action: action,
          response_message: message,
        },
        token,
      )
      
      // Check if it's an authentication error response
      if (result && result.isAuthError) {
        console.warn("Authentication error in task response, user may need to re-login")
        // Don't show error toast for auth errors, the auth context will handle logout
        return
      }

      // Refresh tasks
      const tasksData = await taskApi.getProfessionalTasks(token)
      setTasks(tasksData)
      setFilteredTasks(tasksData)

      toast({
        title: "Success! 🎉",
        description: `Task ${action}ed successfully`,
      })
      toastHot.success(`Task ${action}ed successfully!`)
      toastNotify.success(`Task ${action}ed successfully!`)
    } catch (error) {
      console.error(`Failed to ${action} task:`, error)
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("Could not validate credentials") || 
          errorMessage.includes("401") || 
          errorMessage.includes("403")) {
        console.warn("Authentication error in task response, user may need to re-login")
        // Don't show error toast for auth errors, the auth context will handle logout
      } else {
        toast({
          title: "Error",
          description: `Failed to ${action} task`,
          variant: "destructive",
        })
        toastHot.error(`Failed to ${action} task`)
        toastNotify.error(`Failed to ${action} task`)
      }
    } finally {
      // Clear loading state
      setLoadingActions(prev => ({ ...prev, [`${action}-${assignmentId}`]: false }))
    }
  }

  const handleStatusUpdate = async (assignmentId: string, newStatus: string, notes?: string) => {
    if (!token) return

    // Set loading state
    setLoadingActions(prev => ({ ...prev, [`update-${assignmentId}`]: true }))

    try {
      const result = await taskApi.updateTaskStatus(assignmentId, newStatus, notes || "", token)
      
      // Check if it's an authentication error response
      if (result && result.isAuthError) {
        console.warn("Authentication error in status update, user may need to re-login")
        // Don't show error toast for auth errors, the auth context will handle logout
        return
      }

      // Refresh tasks
      const tasksData = await taskApi.getProfessionalTasks(token)
      setTasks(tasksData)
      setFilteredTasks(tasksData)

      toast({
        title: "Success! 🎉",
        description: "Task status updated successfully",
      })
      toastHot.success("Task status updated successfully!")
      toastNotify.success("Task status updated successfully!")
    } catch (error) {
      console.error("Failed to update task status:", error)
      
      // Check if it's an authentication error
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("Could not validate credentials") || 
          errorMessage.includes("401") || 
          errorMessage.includes("403")) {
        console.warn("Authentication error in status update, user may need to re-login")
        // Don't show error toast for auth errors, the auth context will handle logout
      } else {
        toast({
          title: "Error",
          description: "Failed to update task status",
          variant: "destructive",
        })
        toastHot.error("Failed to update task status")
        toastNotify.error("Failed to update task status")
      }
    } finally {
      // Clear loading state
      setLoadingActions(prev => ({ ...prev, [`update-${assignmentId}`]: false }))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500"
      case "assigned":
        return "bg-blue-500"
      case "accepted":
        return "bg-green-500"
      case "in_progress":
        return "bg-purple-500"
      case "completed":
        return "bg-emerald-500"
      case "cancelled":
        return "bg-gray-500"
      case "rejected":
        return "bg-red-500"
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">Manage your assigned tasks and projects.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="accepted">Accepted</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Pending Assignments Section */}
      {pendingAssignments.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Assignments ({pendingAssignments.length})
            </CardTitle>
            <CardDescription className="text-orange-700">
              These assignments were created offline and will sync when the API is available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingAssignments.map((assignment, index) => (
                <div key={index} className="p-3 bg-white rounded-md border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Service Request: {assignment.service_request_id}</p>
                      <p className="text-xs text-muted-foreground">
                        Assigned: {new Date(assignment.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Rate: ${assignment.proposed_rate}/hr • Hours: {assignment.estimated_hours}
                      </p>
                    </div>
                    <Badge className="bg-orange-500 text-white">Pending Sync</Badge>
                  </div>
                  {assignment.assignment_notes && (
                    <p className="text-xs text-muted-foreground mt-2">{assignment.assignment_notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({filteredTasks.filter((t) => t.status === "pending" || t.status === "assigned").length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({filteredTasks.filter((t) => t.status === "accepted" || t.status === "in_progress").length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({filteredTasks.filter((t) => t.status === "completed").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {filteredTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-32 space-y-3">
                  <p className="text-muted-foreground">No tasks found</p>
                  <p className="text-xs text-muted-foreground text-center">
                    {tasks.length === 0 
                      ? hasNetworkError 
                        ? "Unable to connect to the server. Please check your connection."
                        : "You don't have any assigned tasks yet. Tasks will appear here when an admin assigns them to you."
                      : "No tasks match your current filters."
                    }
                  </p>
                  {hasNetworkError && (
                    <Button 
                      size="sm" 
                      onClick={retryFetchTasks}
                      disabled={isLoading}
                      className="mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Retrying...
                        </>
                      ) : (
                        "Retry Connection"
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map((task) => (
                <Card key={task.assignment_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{task.service_title}</CardTitle>
                        <CardDescription>
                          {task.company_name} • {task.client_name}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(task.status)} text-white`}>
                          {task.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{task.service_description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${task.proposed_rate || "TBD"}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{task.estimated_hours || "TBD"} hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{task.is_remote ? "Remote" : "On-site"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}</span>
                      </div>
                    </div>

                    {task.assignment_notes && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Assignment Notes:</p>
                        <p className="text-sm text-muted-foreground">{task.assignment_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {task.status === "assigned" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleTaskResponse(task.assignment_id, "accept")}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loadingActions[`accept-${task.assignment_id}`]}
                          >
                            {loadingActions[`accept-${task.assignment_id}`] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Accepting...
                              </>
                            ) : (
                              "Accept"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskResponse(task.assignment_id, "reject", "Not available")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            disabled={loadingActions[`reject-${task.assignment_id}`]}
                          >
                            {loadingActions[`reject-${task.assignment_id}`] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Declining...
                              </>
                            ) : (
                              "Decline"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskResponse(task.assignment_id, "request_info", "Need more details")}
                          >
                            Request Info
                          </Button>
                        </>
                      )}
                      {task.status === "accepted" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(task.assignment_id, "in_progress")}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={loadingActions[`update-${task.assignment_id}`]}
                        >
                          {loadingActions[`update-${task.assignment_id}`] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            "Start Work"
                          )}
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(task.assignment_id, "completed", "Task completed")}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={loadingActions[`update-${task.assignment_id}`]}
                        >
                          {loadingActions[`update-${task.assignment_id}`] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            "Mark Complete"
                          )}
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {filteredTasks
              .filter((t) => t.status === "pending" || t.status === "assigned")
              .map((task) => (
                <Card key={task.assignment_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{task.service_title}</CardTitle>
                        <CardDescription>
                          {task.company_name} • {task.client_name}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(task.status)} text-white`}>
                          {task.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{task.service_description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${task.proposed_rate || "TBD"}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{task.estimated_hours || "TBD"} hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{task.is_remote ? "Remote" : "On-site"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}</span>
                      </div>
                    </div>

                    {task.assignment_notes && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Assignment Notes:</p>
                        <p className="text-sm text-muted-foreground">{task.assignment_notes}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {task.status === "assigned" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleTaskResponse(task.assignment_id, "accept")}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loadingActions[`accept-${task.assignment_id}`]}
                          >
                            {loadingActions[`accept-${task.assignment_id}`] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Accepting...
                              </>
                            ) : (
                              "Accept"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskResponse(task.assignment_id, "reject", "Not available")}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            disabled={loadingActions[`reject-${task.assignment_id}`]}
                          >
                            {loadingActions[`reject-${task.assignment_id}`] ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Declining...
                              </>
                            ) : (
                              "Decline"
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTaskResponse(task.assignment_id, "request_info", "Need more details")}
                          >
                            Request Info
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {filteredTasks
              .filter((t) => t.status === "accepted" || t.status === "in_progress")
              .map((task) => (
                <Card key={task.assignment_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{task.service_title}</CardTitle>
                        <CardDescription>
                          {task.company_name} • {task.client_name}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(task.status)} text-white`}>
                          {task.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{task.service_description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${task.proposed_rate || "TBD"}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{task.estimated_hours || "TBD"} hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{task.is_remote ? "Remote" : "On-site"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {task.status === "accepted" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(task.assignment_id, "in_progress")}
                          className="bg-purple-600 hover:bg-purple-700"
                          disabled={loadingActions[`update-${task.assignment_id}`]}
                        >
                          {loadingActions[`update-${task.assignment_id}`] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Starting...
                            </>
                          ) : (
                            "Start Work"
                          )}
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(task.assignment_id, "completed", "Task completed")}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          disabled={loadingActions[`update-${task.assignment_id}`]}
                        >
                          {loadingActions[`update-${task.assignment_id}`] ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Completing...
                            </>
                          ) : (
                            "Mark Complete"
                          )}
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {filteredTasks
              .filter((t) => t.status === "completed")
              .map((task) => (
                <Card key={task.assignment_id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{task.service_title}</CardTitle>
                        <CardDescription>
                          {task.company_name} • {task.client_name}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        <Badge className={`${getStatusColor(task.status)} text-white`}>COMPLETED</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{task.service_description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>${task.proposed_rate || "TBD"}/hr</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{task.estimated_hours || "TBD"} hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{task.is_remote ? "Remote" : "On-site"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Completed</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Download Invoice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
