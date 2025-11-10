"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { taskApi } from "@/lib/api"
import type { ServiceRequestCreate } from "@/types/api"
import toastHot from "react-hot-toast"
import { toast as toastNotify } from "react-toastify"
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react"

export default function RequestServicePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ServiceRequestCreate>({
    company_name: "",
    client_name: "",
    client_email: "",
    client_phone: "",
    service_title: "",
    service_description: "",
    service_category: "",
    required_skills: "",
    budget_min: undefined,
    budget_max: undefined,
    expected_duration: "",
    deadline: "",
    location_preference: "",
    remote_work_allowed: true,
    priority: "medium",
  })

  const handleInputChange = (field: keyof ServiceRequestCreate, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Normalize fields to match API expectations
      const normalizedPriority = (formData.priority || "").toString().toUpperCase()
      const normalizedDeadline = formData.deadline
        ? `${formData.deadline}T00:00:00Z`
        : undefined

      const payload: Partial<ServiceRequestCreate> & Record<string, any> = {
        ...formData,
        priority: normalizedPriority as any,
        deadline: normalizedDeadline,
      }

      // Remove undefined fields to avoid validation issues
      Object.keys(payload).forEach((k) => {
        if (payload[k as keyof typeof payload] === undefined || payload[k as keyof typeof payload] === "") {
          delete payload[k as keyof typeof payload]
        }
      })

      const response = await taskApi.createServiceRequest(payload as ServiceRequestCreate)

      toast({
        title: "Success",
        description: "Your service request has been submitted successfully!",
      })
      toastHot.success("Service request submitted successfully!")
      toastNotify.success("Service request submitted successfully!")

      // Redirect to a success page or show the request ID
      router.push(`/request-service/success?id=${response.id}`)
    } catch (error) {
      console.error("Failed to submit service request:", error)
      const msg = "Failed to submit service request. Please try again."
      toast({
        title: "Error",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
              <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Request Professional Services
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Tell us about your project and we'll connect you with qualified professionals who can bring your vision to life.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <Badge variant="secondary" className="px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                Free Consultation
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Star className="w-4 h-4 mr-1 text-yellow-500" />
                Verified Professionals
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Clock className="w-4 h-4 mr-1 text-blue-600" />
                24h Response Time
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information Card */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Company Information</CardTitle>
                  <CardDescription>Tell us about your organization</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name" className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Company Name *
                  </Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange("company_name", e.target.value)}
                    placeholder="Your company name"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_name" className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Contact Person *
                  </Label>
                  <Input
                    id="client_name"
                    value={formData.client_name}
                    onChange={(e) => handleInputChange("client_name", e.target.value)}
                    placeholder="Your full name"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="client_email"
                    type="email"
                    value={formData.client_email}
                    onChange={(e) => handleInputChange("client_email", e.target.value)}
                    placeholder="your.email@company.com"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="client_phone"
                    type="tel"
                    value={formData.client_phone}
                    onChange={(e) => handleInputChange("client_phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details Card */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                  <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Project Details</CardTitle>
                  <CardDescription>Describe your project requirements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="service_title" className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Project Title *
                </Label>
                <Input
                  id="service_title"
                  value={formData.service_title}
                  onChange={(e) => handleInputChange("service_title", e.target.value)}
                  placeholder="e.g., Website Development, Marketing Campaign, Business Consulting, Design Project"
                  className="h-11"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service_description" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Project Description *
                </Label>
                <Textarea
                  id="service_description"
                  value={formData.service_description}
                  onChange={(e) => handleInputChange("service_description", e.target.value)}
                  placeholder="Describe your project in detail: What do you need help with? What are your goals? What specific requirements or features are important to you? Include any relevant background information..."
                  rows={5}
                  className="resize-none"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  The more details you provide, the better we can match you with the right professional.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="service_category" className="text-sm font-medium">
                    Service Category *
                  </Label>
                  <Select
                    value={formData.service_category}
                    onValueChange={(value) => handleInputChange("service_category", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web-development">🌐 Web Development</SelectItem>
                      <SelectItem value="mobile-development">📱 Mobile Development</SelectItem>
                      <SelectItem value="design">🎨 Design & UI/UX</SelectItem>
                      <SelectItem value="marketing">📈 Digital Marketing</SelectItem>
                      <SelectItem value="consulting">💼 Business Consulting</SelectItem>
                      <SelectItem value="writing">✍️ Content Writing</SelectItem>
                      <SelectItem value="data-analysis">📊 Data Analysis</SelectItem>
                      <SelectItem value="cybersecurity">🔒 Cybersecurity</SelectItem>
                      <SelectItem value="other">🔧 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Priority Level
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange("priority", value as any)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Low - Flexible timeline</SelectItem>
                      <SelectItem value="medium">🟡 Medium - Standard timeline</SelectItem>
                      <SelectItem value="high">🟠 High - Rush project</SelectItem>
                      <SelectItem value="urgent">🔴 Urgent - ASAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="required_skills" className="text-sm font-medium">
                  Required Skills & Technologies
                </Label>
                <Input
                  id="required_skills"
                  value={formData.required_skills}
                  onChange={(e) => handleInputChange("required_skills", e.target.value)}
                  placeholder="e.g., React, Photoshop, Google Ads, Business Analysis, Content Writing, Data Analysis"
                  className="h-11"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  List specific skills, technologies, tools, or expertise your project requires.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Budget and Timeline Card */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Budget & Timeline</CardTitle>
                  <CardDescription>Set your budget and project timeline</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget_min" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Minimum Budget ($)
                  </Label>
                  <Input
                    id="budget_min"
                    type="number"
                    value={formData.budget_min || ""}
                    onChange={(e) =>
                      handleInputChange("budget_min", e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="1000"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget_max" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Maximum Budget ($)
                  </Label>
                  <Input
                    id="budget_max"
                    type="number"
                    value={formData.budget_max || ""}
                    onChange={(e) =>
                      handleInputChange("budget_max", e.target.value ? Number(e.target.value) : undefined)
                    }
                    placeholder="5000"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expected_duration" className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Expected Duration
                  </Label>
                  <Input
                    id="expected_duration"
                    value={formData.expected_duration}
                    onChange={(e) => handleInputChange("expected_duration", e.target.value)}
                    placeholder="e.g., 1 week, 2-3 weeks, 1 month, 3 months, Ongoing"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Project Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange("deadline", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Preferences Card */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Work Preferences</CardTitle>
                  <CardDescription>Define your working arrangements</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location_preference" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Preference
                </Label>
                <Input
                  id="location_preference"
                  value={formData.location_preference}
                  onChange={(e) => handleInputChange("location_preference", e.target.value)}
                  placeholder="e.g., New York, Los Angeles, Remote, On-site, Hybrid, Any Location"
                  className="h-11"
                />
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Checkbox
                  id="remote_work_allowed"
                  checked={formData.remote_work_allowed}
                  onCheckedChange={(checked) => handleInputChange("remote_work_allowed", checked)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div className="flex-1">
                  <Label htmlFor="remote_work_allowed" className="text-sm font-medium cursor-pointer">
                    Remote work is acceptable
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allow professionals to work remotely for this project
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-orange-50 dark:from-blue-900/20 dark:to-orange-900/20">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Info className="w-4 h-4" />
                  <span>By submitting this form, you agree to our terms of service and privacy policy.</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting Request...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Submit Request
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.back()}
                    className="flex-1 h-12 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
      {/* Footer removed as requested */}
    </div>
  )
}
