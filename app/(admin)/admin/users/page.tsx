"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Loader2, MoreHorizontal, Edit, Save, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { authApi, publicApi, adminApi, prozProfilesApi } from "@/lib/api"
import type { PublicProzProfileWithReviews, ProzProfileUpdate } from "@/types/api"
import type { User } from "@/types/api"

export default function AdminUsersPage() {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [sortField, setSortField] = useState<keyof User>("first_name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profile, setProfile] = useState<PublicProzProfileWithReviews | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editFormData, setEditFormData] = useState<ProzProfileUpdate>({})
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteReason, setDeleteReason] = useState("")

  const handleEditProfile = () => {
    if (profile) {
      setEditFormData({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number || "",
        bio: profile.bio || "",
        location: profile.location || "",
        years_experience: profile.years_experience || 0,
        hourly_rate: profile.hourly_rate || 0,
        availability: profile.availability || "",
        education: profile.education || "",
        certifications: profile.certifications || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        preferred_contact_method: profile.preferred_contact_method || "",
        verification_status: profile.verification_status,
        is_featured: profile.is_featured,
        specialties: profile.specialties || []
      })
      setIsEditMode(true)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile || !token) return

    // Basic validation
    if (!editFormData.first_name || !editFormData.last_name) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSaving(true)
      const updatedProfile = await prozProfilesApi.updateProfile(editFormData, token)
      setProfile(updatedProfile)
      setIsEditMode(false)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditFormData({})
  }


  const getProfileIdFromUserId = async (userId: string, userEmail?: string): Promise<string | null> => {
    try {
      // 1) Try using userId as profileId (common when IDs match)
      try {
        await publicApi.getProfile(userId, false)
        return userId
      } catch (e) {
        // continue to next strategy
      }

      // 2) Try include_unverified=true in case profile exists but is not verified yet
      try {
        await publicApi.getProfile(userId, true)
        return userId
      } catch (e) {
        // continue to next strategy
      }

      // 3) Fallback: search admin profiles by email to find the actual profileId
      if (token && userEmail) {
        const adminList = await adminApi.getProfilesForVerification(token, 1, 20, undefined, userEmail)
        const match = (adminList?.profiles || []).find((p: any) => (p.email || "").toLowerCase() === userEmail.toLowerCase())
        if (match?.id) {
          return match.id
        }
      }

      return null
    } catch (error) {
      console.error("Error finding profile ID:", error)
      return null
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete || !token || !deleteReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for deletion",
        variant: "destructive",
      })
      return
    }

    try {
      setIsDeleting(true)
      
      console.log("Attempting to delete user:", {
        id: userToDelete.id,
        name: `${userToDelete.first_name} ${userToDelete.last_name}`,
        email: userToDelete.email,
        reason: deleteReason.trim(),
        fullUserObject: userToDelete
      })
      
      // First, find the profile ID for this user
      const profileId = await getProfileIdFromUserId(userToDelete.id, userToDelete.email || undefined)
      
      console.log("Found profile ID:", profileId)
      
      if (!profileId) {
        toast({
          title: "Error",
          description: "No profile found for this user. Cannot delete user without a profile.",
          variant: "destructive",
        })
        return
      }

      // Delete the profile using the profile ID
      await authApi.deleteUser(profileId, deleteReason.trim(), token)
      
      // Remove user from the list
      setUsers(users.filter(user => user.id !== userToDelete.id))
      
      toast({
        title: "Success",
        description: `User ${userToDelete.first_name} ${userToDelete.last_name} has been deleted successfully`,
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      setDeleteReason("")
    }
  }

  const cancelDeleteUser = () => {
    setIsDeleteDialogOpen(false)
    setUserToDelete(null)
    setDeleteReason("")
  }

  const handleViewProfile = async (userId: string, userEmail?: string) => {
    try {
      setIsProfileLoading(true)
      setProfile(null)
      // 1) Try public by provided ID as profileId (common when IDs match)
      try {
        const data = await publicApi.getProfile(userId, false)
        setProfile(data)
        setIsProfileOpen(true)
        return
      } catch (e) {
        // continue to next strategy
      }

      // 2) Try include_unverified=true in case profile exists but is not verified yet
      try {
        const dataUnverified = await publicApi.getProfile(userId, true)
        setProfile(dataUnverified)
        setIsProfileOpen(true)
        return
      } catch (e) {
        // continue to next strategy
      }

      // 3) Fallback: search admin profiles by email to find the actual profileId
      if (token && userEmail) {
        const adminList = await adminApi.getProfilesForVerification(token, 1, 20, undefined, userEmail)
        const match = (adminList?.profiles || []).find((p: any) => (p.email || "").toLowerCase() === userEmail.toLowerCase())
        if (match?.id) {
          try {
            const data2 = await publicApi.getProfile(match.id, false)
            setProfile(data2)
            setIsProfileOpen(true)
            return
          } catch (e) {
            try {
              const data3 = await publicApi.getProfile(match.id, true)
              setProfile(data3)
              setIsProfileOpen(true)
              return
            } catch (e2) {
              // fall through to toast
            }
          }
        }
      }

      toast({
        title: "Profile not found",
        description: "No public profile is associated with this user or it is not accessible.",
        variant: "destructive",
      })
    } catch (error) {
      console.error("Failed to fetch public profile:", error)
      toast({
        title: "Profile not found",
        description: "No public profile is associated with this user.",
        variant: "destructive",
      })
    } finally {
      setIsProfileLoading(false)
    }
  }

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return

      setIsLoading(true)
      try {
        const usersData = await authApi.getUsers(token)
        setUsers(usersData)
      } catch (error) {
        console.error("Failed to fetch users:", error)
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [token])

  // Filter and sort users
  const filteredUsers = users
    .filter((user) =>
      user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortDirection === "asc" 
        ? (aValue as any) - (bValue as any)
        : (bValue as any) - (aValue as any)
    })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 mx-2 sm:mx-4 md:mx-6 lg:mx-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage registered users and their permissions.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name or email..."
            className="pl-8 border-border focus:ring-2 focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-border hover:bg-muted">
          Filter
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("first_name")}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {sortField === "first_name" && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      Email
                      {sortField === "email" && (
                        <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors duration-200">
                      <TableCell>
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.first_name} {user.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {user.is_superuser && <Badge variant="destructive">Admin</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {user.is_superuser ? "Superuser" : "User"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(user.created_at || Date.now()).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-muted">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewProfile(user.id, user.email || undefined)}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewProfile(user.id, user.email || undefined).then(() => handleEditProfile())}>
                              Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="border-border hover:bg-muted disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="border-border hover:bg-muted disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isProfileOpen} onOpenChange={(open) => {
        setIsProfileOpen(open)
        if (!open) {
          setIsEditMode(false)
          setEditFormData({})
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {isEditMode ? "Edit Profile" : "Profile Details"}
              {profile && !isEditMode && (
                <Button onClick={handleEditProfile} size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              {isProfileLoading ? "Loading profile..." : profile ? `${profile.first_name} ${profile.last_name}` : "No profile available"}
            </DialogDescription>
          </DialogHeader>
          {isProfileLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {isEditMode ? (
                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={editFormData.first_name || ""}
                        onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={editFormData.last_name || ""}
                        onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone_number">Phone Number</Label>
                      <Input
                        id="phone_number"
                        value={editFormData.phone_number || ""}
                        onChange={(e) => setEditFormData({...editFormData, phone_number: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={editFormData.location || ""}
                        onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editFormData.bio || ""}
                      onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
                      rows={3}
                    />
                  </div>

                  {/* Professional Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="years_experience">Years of Experience</Label>
                      <Input
                        id="years_experience"
                        type="number"
                        value={editFormData.years_experience || 0}
                        onChange={(e) => setEditFormData({...editFormData, years_experience: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                      <Input
                        id="hourly_rate"
                        type="number"
                        value={editFormData.hourly_rate || 0}
                        onChange={(e) => setEditFormData({...editFormData, hourly_rate: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Input
                      id="availability"
                      value={editFormData.availability || ""}
                      onChange={(e) => setEditFormData({...editFormData, availability: e.target.value})}
                    />
                  </div>

                  {/* Education and Certifications */}
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Textarea
                      id="education"
                      value={editFormData.education || ""}
                      onChange={(e) => setEditFormData({...editFormData, education: e.target.value})}
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="certifications">Certifications</Label>
                    <Textarea
                      id="certifications"
                      value={editFormData.certifications || ""}
                      onChange={(e) => setEditFormData({...editFormData, certifications: e.target.value})}
                      rows={2}
                    />
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={editFormData.website || ""}
                        onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={editFormData.linkedin || ""}
                        onChange={(e) => setEditFormData({...editFormData, linkedin: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                    <Select
                      value={editFormData.preferred_contact_method || ""}
                      onValueChange={(value) => setEditFormData({...editFormData, preferred_contact_method: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Admin Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="verification_status">Verification Status</Label>
                      <Select
                        value={editFormData.verification_status || "pending"}
                        onValueChange={(value) => setEditFormData({...editFormData, verification_status: value as "pending" | "verified" | "rejected"})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="verified">Verified</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={editFormData.is_featured || false}
                        onChange={(e) => setEditFormData({...editFormData, is_featured: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="is_featured">Featured Profile</Label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button onClick={handleCancelEdit} variant="outline" disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Basics</h3>
                    <p className="text-sm text-muted-foreground">{profile.location || "Location not specified"}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {(profile.specialties || []).map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Rating</div>
                      <div className="font-medium">{profile.rating ?? "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Reviews</div>
                      <div className="font-medium">{profile.review_count ?? 0}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Experience</div>
                      <div className="font-medium">{profile.years_experience ?? 0} yrs</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Hourly Rate</div>
                      <div className="font-medium">{profile.hourly_rate ? `$${profile.hourly_rate}/hr` : "—"}</div>
                    </div>
                  </div>
                  {profile.bio && (
                    <div>
                      <h3 className="font-semibold">About</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.first_name} {userToDelete?.last_name}? 
              This action cannot be undone and will permanently remove the user from the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="delete-reason">Reason for deletion (required)</Label>
              <Textarea
                id="delete-reason"
                placeholder="Please provide a reason for deleting this user..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={cancelDeleteUser}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDeleteUser}
              disabled={isDeleting || !deleteReason.trim()}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
