// User types
export interface User {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  is_active: boolean | null
  is_superuser: boolean | null
}

export interface UserCreate {
  email: string
  password: string
  first_name?: string | null
  last_name?: string | null
  is_active?: boolean | null
  is_superuser?: boolean | null
}

export interface UserLogin {
  email: string
  password: string
}

// Professional profile types
export interface ProzProfileResponse {
  id: string
  user_id?: string
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  profile_image_url?: string
  bio?: string
  location?: string
  years_experience?: number
  hourly_rate?: number
  availability?: string
  education?: string
  certifications?: string
  website?: string
  linkedin?: string
  preferred_contact_method?: string
  verification_status: "pending" | "verified" | "rejected"
  is_featured: boolean
  rating: number
  review_count: number
  email_verified: boolean
  specialties?: string[]
  created_at: string
  updated_at?: string
  // Analytics fields
  profile_views?: number
  message_count?: number
  unread_message_count?: number
  inquiry_count?: number
  response_rate?: number
}

export interface ProzProfileUpdate {
  first_name?: string
  last_name?: string
  phone_number?: string
  profile_image_url?: string
  bio?: string
  location?: string
  years_experience?: number
  hourly_rate?: number
  availability?: string
  education?: string
  certifications?: string
  website?: string
  linkedin?: string
  preferred_contact_method?: string
  verification_status?: "pending" | "verified" | "rejected"
  is_featured?: boolean
  specialties?: string[]
}

export interface ProzProfileCreate {
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  bio: string
  location: string
  years_experience: number
  hourly_rate: number
  availability: string
  education: string
  certifications?: string
  website?: string
  linkedin?: string
  preferred_contact_method: string
}

export interface ProzProfileUpdate {
  first_name?: string
  last_name?: string
  phone_number?: string
  bio?: string
  location?: string
  years_experience?: number
  hourly_rate?: number
  availability?: string
  education?: string
  certifications?: string
  website?: string
  linkedin?: string
  preferred_contact_method?: string
}

// Public profile types
export interface PublicProzProfileCard {
  id: string
  first_name: string
  last_name: string
  profile_image_url?: string
  bio?: string
  location?: string
  years_experience?: number
  hourly_rate?: number
  availability?: string
  verification_status: string
  is_featured: boolean
  rating: number
  review_count: number
  specialties: string[]
}

export interface PublicProzProfileWithReviews extends PublicProzProfileCard {
  education?: string
  certifications?: string
  website?: string
  linkedin?: string
  created_at: string
  reviews: PublicReviewResponse[]
}

export interface PublicReviewResponse {
  id: string
  client_name: string
  rating: number
  review_text?: string
  created_at: string
}

// Admin types
export interface AdminDashboardResponse {
  stats: VerificationStatsAdmin
  recent_submissions: AdminProfileListItem[]
  pending_reviews: AdminProfileListItem[]
  recent_verifications: VerificationHistoryItem[]
}

export interface AdminProfileListItem {
  id: string
  first_name: string
  last_name: string
  email: string
  profile_image_url?: string
  location?: string
  years_experience?: number
  verification_status: string
  is_featured: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

export interface VerificationStatsAdmin {
  total_profiles: number
  pending_verification: number
  verified_profiles: number
  rejected_profiles: number
  profiles_this_week: number
  verifications_this_week: number
  avg_verification_time_hours: number
  pending_oldest_date?: string
}

export interface VerificationHistoryItem {
  id: string
  profile_id: string
  old_status: string
  new_status: string
  admin_user_id?: string
  admin_notes?: string
  rejection_reason?: string
  created_at: string
}

// Task Management types
export interface ServiceRequestCreate {
  company_name: string
  client_name: string
  client_email: string
  client_phone?: string
  service_title: string
  service_description: string
  service_category: string
  required_skills?: string
  budget_min?: number
  budget_max?: number
  expected_duration?: string
  deadline?: string
  location_preference?: string
  remote_work_allowed?: boolean
  priority?: "low" | "medium" | "high" | "urgent"
}

export interface ServiceRequestResponse extends ServiceRequestCreate {
  id: string
  status: TaskStatusEnum
  priority: TaskPriorityEnum
  admin_notes?: string
  created_at: string
  updated_at: string
  assignments_count: number
}

export interface TaskAssignmentCreate {
  service_request_id: string
  proz_id: string
  assignment_notes?: string
  estimated_hours?: number
  proposed_rate?: number
  due_date?: string
}

export interface TaskAssignmentResponse extends TaskAssignmentCreate {
  id: string
  assigned_by_user_id?: string
  status: TaskStatusEnum
  proz_response?: string
  proz_response_at?: string
  assigned_at: string
  completed_at?: string
  service_request: ServiceRequestResponse
  professional_name: string
  professional_email: string
}

export interface ProfessionalTaskResponse {
  assignment_id: string
  service_title: string
  company_name: string
  client_name: string
  service_description: string
  service_category: string
  budget_range?: string
  estimated_hours?: number
  proposed_rate?: number
  status: TaskStatusEnum
  priority: TaskPriorityEnum
  assignment_notes?: string
  assigned_at: string
  due_date?: string
  deadline?: string
  is_remote: boolean
}

export interface DashboardStatsResponse {
  total_assignments: number
  pending_assignments: number
  active_assignments: number
  completed_assignments: number
  unread_notifications: number
  this_week_earnings: number
  this_month_earnings: number
  average_rating: number
}

export interface NotificationResponse {
  id: string
  title: string
  message: string
  notification_type: string
  is_read: boolean
  created_at: string
  task_assignment_id?: string
}

// Enums
export type TaskStatusEnum =
  | "pending"
  | "assigned"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rejected"
export type TaskPriorityEnum = "low" | "medium" | "high" | "urgent"
export type VerificationStatus = "pending" | "verified" | "rejected"

// OTP and Email Verification types
export interface OTPSendRequest {
  phone_number: string
}

export interface OTPVerifyRequest {
  phone_number: string
  otp_code: string
}

export interface OTPResponse {
  success: boolean
  message: string
  expires_in_minutes?: number
}

export interface OTPVerificationResponse {
  success: boolean
  message: string
  phone_verified: boolean
}

export interface EmailVerificationRequest {
  email: string
}

export interface EmailVerificationResponse {
  success: boolean
  message: string
  expires_in_hours?: number
}

// File Upload types
export interface FileUploadResponse {
  success: boolean
  message: string
  file_url?: string
  file_name?: string
  file_size?: number
}

export interface ProfileImageUpdateRequest {
  image_url: string
}

export interface ProfileImageResponse {
  success: boolean
  message: string
  profile_image_url?: string
}

// Search and Filter types
export interface ProfileSearchRequest {
  query?: string
  location?: string
  specialty?: string
  min_rating?: number
  max_hourly_rate?: number
  min_experience?: number
  availability?: string
  is_featured?: boolean
  verification_status?: string
  show_unverified?: boolean
}

export interface ProfileSearchResponse {
  profiles: PublicProzProfileCard[]
  total_count: number
  page: number
  page_size: number
  total_pages: number
  filters_applied: ProfileSearchRequest
}

export interface ProfileCategoriesResponse {
  specialties: string[]
  locations: string[]
  availability_options: string[]
  experience_ranges: object[]
  rating_ranges: object[]
}

export interface ProfileStatsResponse {
  total_profiles: number
  verified_profiles: number
  pending_profiles: number
  rejected_profiles: number
  featured_profiles: number
  specialties_count: number
  average_rating: number
  locations_count: number
}
