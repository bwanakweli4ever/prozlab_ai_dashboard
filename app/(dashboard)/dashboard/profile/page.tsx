"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { useProfile } from "@/contexts/profile-context"
import { useAuth } from "@/contexts/auth-context"
import { mediaApi } from "@/lib/api"
import { Loader2, Upload, Camera, X, Check } from "lucide-react"
import Image from "next/image"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"

const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z.string().optional(),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  yearsExperience: z.coerce.number().min(0, "Years must be a positive number"),
  hourlyRate: z.coerce.number().min(0, "Rate must be a positive number"),
  availability: z.string().min(1, "Please select your availability"),
  education: z.string().min(10, "Education details must be at least 10 characters"),
  certifications: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  preferredContactMethod: z.string().min(1, "Please select a contact method"),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const router = useRouter()
  const { profile, isLoading, updateProfile, fetchProfile } = useProfile()
  const { token } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isClientReady, setIsClientReady] = useState(false)
  const [activeTab, setActiveTab] = useState("personal")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  // Set client-ready state after mount to avoid hydration mismatch
  useEffect(() => {
    setIsClientReady(true)
  }, [])

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      bio: "",
      location: "",
      yearsExperience: 0,
      hourlyRate: 0,
      availability: "",
      education: "",
      certifications: "",
      website: "",
      linkedin: "",
      preferredContactMethod: "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (profile && !isLoading && isClientReady) {
      console.log("Setting form values from profile:", profile)
      form.reset({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phoneNumber: profile.phone_number || "",
        bio: profile.bio || "",
        location: profile.location || "",
        yearsExperience: profile.years_experience || 0,
        hourlyRate: profile.hourly_rate || 0,
        availability: profile.availability || "",
        education: profile.education || "",
        certifications: profile.certifications || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        preferredContactMethod: profile.preferred_contact_method || "",
      })

      // Log the values to verify they're being set correctly
      console.log("Form values after reset:", form.getValues())
    }
  }, [profile, isLoading, form, isClientReady])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleImageUpload called", event.target.files)
    
    const file = event.target.files?.[0]
    if (!file) {
      console.log("No file selected")
      return
    }
    
    if (!token) {
      console.log("No token available")
      toast({
        title: "Authentication required",
        description: "Please log in to upload images",
        variant: "destructive",
      })
      return
    }

    console.log("Selected file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      token: token ? "Present" : "Missing"
    })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploadingImage(true)
      console.log("Starting image upload...")
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload image
      const result = await mediaApi.uploadProfileImage(file, token)
      console.log("Upload result:", result)
      console.log("File URL from upload:", result.file_url)
      
      // If we got a file URL from the upload, we can update the profile immediately
      if (result.file_url && updateProfile) {
        console.log("Updating profile with new image URL:", result.file_url)
        try {
          await updateProfile({ profile_image_url: result.file_url })
          console.log("Profile updated with new image URL")
        } catch (updateError) {
          console.error("Failed to update profile with image URL:", updateError)
        }
      }
      
      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      })
      toastHot.success("Profile image uploaded successfully!")
      toastNotify.success("Profile image uploaded successfully!")
      
      // Wait a moment for the server to process the image
      console.log("Waiting for server to process image...")
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Refresh profile data to get updated image URL
      if (fetchProfile) {
        console.log("Refreshing profile data...")
        await fetchProfile()
        console.log("Profile data refreshed")
        
        // Wait a bit more and try again if image URL is still not updated
        await new Promise(resolve => setTimeout(resolve, 1000))
        await fetchProfile()
        console.log("Profile after refresh:", profile)
        console.log("Profile image URL:", profile?.profile_image_url)
      }
      
      // Clear the preview since we now have the actual uploaded image
      setImagePreview(null)
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: "Failed to upload profile image. Please try again.",
        variant: "destructive",
      })
      toastHot.error("Failed to upload profile image")
      toastNotify.error("Failed to upload profile image")
      setImagePreview(null)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImagePreview = () => {
    setImagePreview(null)
  }

  async function onSubmit(values: ProfileFormValues) {
    setIsSaving(true)
    console.log("Submitting profile update with values:", values)

    try {
      // Create a clean update object with all fields explicitly set
      const updateData = {
        first_name: values.firstName,
        last_name: values.lastName,
        phone_number: values.phoneNumber || "",
        bio: values.bio,
        location: values.location,
        years_experience: values.yearsExperience,
        hourly_rate: values.hourlyRate,
        availability: values.availability,
        education: values.education || "", // Ensure this has a default value
        certifications: values.certifications || "",
        website: values.website || "",
        linkedin: values.linkedin || "",
        preferred_contact_method: values.preferredContactMethod || "", // Ensure this has a default value
      }

      console.log("Formatted update data:", updateData)

      await updateProfile(updateData)

      // Show brief success animation
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)

      toast({
        title: "✅ Profile Updated Successfully!",
        description: "Your changes have been saved and are now live on your profile.",
        duration: 4000,
      })
      toastHot.success("Profile updated successfully!")
      toastNotify.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      const msg = error instanceof Error ? error.message : "Failed to update profile"
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      })
      toastHot.error(msg)
      toastNotify.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading || !isClientReady) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <h2 className="text-2xl font-bold">No Profile Found</h2>
        <p className="text-muted-foreground">You need to create a profile first.</p>
        <Button onClick={() => router.push("/onboarding")}>Create Profile</Button>
      </div>
    )
  }

  return (
    <div className="container max-w-7xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Update your professional profile to showcase your skills and experience.
        </p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <TabsContent value="personal" className="space-y-4">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profile Image Upload */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
                        {imagePreview ? (
                          <Image
                            src={imagePreview}
                            alt="Profile preview"
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        ) : profile?.profile_image_url ? (
                          <Image
                            src={profile.profile_image_url}
                            alt={`${profile.first_name} ${profile.last_name}`}
                            width={128}
                            height={128}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = "none"
                              const fallback = target.parentElement?.querySelector(".fallback-avatar") as HTMLElement
                              if (fallback) fallback.style.display = "flex"
                            }}
                          />
                        ) : null}
                        <div className="fallback-avatar w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl" style={{ display: (imagePreview || profile?.profile_image_url) ? "none" : "flex" }}>
                          {profile?.first_name?.[0] || "U"}
                          {profile?.last_name?.[0] || "P"}
                        </div>
                      </div>
                      {imagePreview && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                          onClick={removeImagePreview}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Profile Photo</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="profile-image-upload"
                            disabled={isUploadingImage}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isUploadingImage}
                            className="flex items-center gap-2"
                            onClick={() => {
                              console.log("Upload button clicked")
                              const fileInput = document.getElementById('profile-image-upload') as HTMLInputElement
                              if (fileInput) {
                                console.log("File input found, triggering click")
                                fileInput.click()
                              } else {
                                console.log("File input not found")
                              }
                            }}
                          >
                            {isUploadingImage ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Camera className="h-4 w-4" />
                            )}
                            {isUploadingImage ? "Uploading..." : "Upload Photo"}
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            JPG, PNG up to 5MB
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              console.log("Manual profile refresh requested")
                              if (fetchProfile) {
                                fetchProfile().then(() => {
                                  toast({
                                    title: "Profile refreshed",
                                    description: "Profile data has been updated",
                                  })
                                })
                              }
                            }}
                            className="text-xs"
                          >
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
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
                </CardContent>
              </TabsContent>

              <TabsContent value="professional" className="space-y-4">
                <CardHeader>
                  <CardTitle>Professional Details</CardTitle>
                  <CardDescription>Update your professional information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
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
                        <Select onValueChange={field.onChange} value={field.value || ""}>
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
                </CardContent>
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                <CardHeader>
                  <CardTitle>Education & Certifications</CardTitle>
                  <CardDescription>Update your educational background.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
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
                  <FormField
                    control={form.control}
                    name="certifications"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Certifications</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List any relevant certifications or professional qualifications..."
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional. Include certification name, issuing organization, and date.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4">
                <CardHeader>
                  <CardTitle>Contact Preferences</CardTitle>
                  <CardDescription>Update your contact information and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://yourwebsite.com" {...field} />
                        </FormControl>
                        <FormDescription>Optional. Include your personal or portfolio website.</FormDescription>
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
                          <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                        </FormControl>
                        <FormDescription>Optional. Include your LinkedIn profile URL.</FormDescription>
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
                        <Select onValueChange={field.onChange} value={field.value || ""}>
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
                </CardContent>
              </TabsContent>

              <CardFooter className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isSaving} 
                  className={`min-w-[120px] transition-all duration-300 ${
                    showSuccess ? 'bg-green-600 hover:bg-green-700' : ''
                  }`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : showSuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}
