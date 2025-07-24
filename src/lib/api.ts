import type { FormData } from '@/components/OnboardingWizard'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-laravel-app.com'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
  status?: number
}

export interface SubmissionResponse {
  id: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  step: number
  created_at: string
  updated_at: string
}

export interface Form {
  id: string
  title: string
  slug: string
  description: string
  created_at: string
  updated_at: string 
  fields?: Record<string, unknown>
}

export interface FormResponse {
  status: string
  data: {
    form: Form
  }
  timestamp: string
}

// Enhanced error types for better error handling
export interface ApiError extends Error {
  status?: number
  code?: string
  retryable?: boolean
}

// Configuration for retry logic
interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

class ApiService {
  private retryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private calculateDelay(attempt: number): number {
    const delay = Math.min(
      this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1),
      this.retryConfig.maxDelay
    )
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000
  }

  private isRetryableError(error: unknown, status?: number): boolean {
    // Retry on network errors, 5xx errors, 429 (rate limit), and 408 (timeout)
    // Network error: error is an object with a 'name' property of 'TypeError' or 'AbortError'
    if (!status && error && typeof error === 'object' && 'name' in error) {
      const err = error as { name?: string }
      return err.name === 'TypeError' || err.name === 'AbortError'
    }
    return !status || status >= 500 || status === 429 || status === 408
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        // Handle rate limiting with specific retry logic
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : this.calculateDelay(attempt)
          
          if (attempt < this.retryConfig.maxAttempts) {
            console.warn(`Rate limited, retrying after ${delay}ms (attempt ${attempt}/${this.retryConfig.maxAttempts})`)
            await this.sleep(delay)
            return this.makeRequest<T>(endpoint, options, attempt + 1)
          }
        }

        // Handle other retryable errors
        if (this.isRetryableError(data, response.status) && attempt < this.retryConfig.maxAttempts) {
          const delay = this.calculateDelay(attempt)
          console.warn(`Request failed, retrying after ${delay}ms (attempt ${attempt}/${this.retryConfig.maxAttempts})`)
          await this.sleep(delay)
          return this.makeRequest<T>(endpoint, options, attempt + 1)
        }

        return {
          success: false,
          message: data.message || `Server error (${response.status})`,
          errors: data.errors,
          status: response.status,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('API Request failed:', error)

      // Handle network errors with retry
      if (this.isRetryableError(error) && attempt < this.retryConfig.maxAttempts) {
        const delay = this.calculateDelay(attempt)
        console.warn(`Network error, retrying after ${delay}ms (attempt ${attempt}/${this.retryConfig.maxAttempts})`)
        await this.sleep(delay)
        return this.makeRequest<T>(endpoint, options, attempt + 1)
      }

      return {
        success: false,
        message: error instanceof Error && error.name === 'AbortError' 
          ? 'Request timed out. Please check your connection and try again.'
          : 'Network error. Please check your connection and try again.',
      }
    }
  }

  // Step 1: Create initial submission with personal info
  async createSubmission(data: {
    gender: string
    firstName: string
    lastName: string
    birthdate: string
    nationality: string
    email: string
    phone: string
  }): Promise<ApiResponse<SubmissionResponse>> {
    return this.makeRequest<SubmissionResponse>('/api/submissions', {
      method: 'POST',
      body: JSON.stringify({
        step: 1,
        personal_info: data,
      }),
    })
  }

  // Step 1: Update submission with personal information
  async updatePersonalInfo(submissionId: string, data: {
    gender: string
    firstName: string
    lastName: string
    birthdate: string
    nationality: string
    email: string
    phone: string
  }): Promise<ApiResponse<SubmissionResponse>> {
    return this.makeRequest<SubmissionResponse>(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        step: 1,
        personal_info: data,
      }),
    })
  }

  // Step 2: Update submission with address information
  async updateAddressInfo(submissionId: string, data: {
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string
    country: string
  }): Promise<ApiResponse<SubmissionResponse>> {
    return this.makeRequest<SubmissionResponse>(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        step: 2,
        address_info: data,
      }),
    })
  }

  // Step 3: Update submission with asset information
  async updateAssetInfo(submissionId: string, data: Record<string, unknown>): Promise<ApiResponse<SubmissionResponse>> {
    return this.makeRequest<SubmissionResponse>(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        step: 3,
        asset_info: data,
      }),
    })
  }

  // Step 4: Update submission with legal agreements
  async updateLegalInfo(submissionId: string, data: {
    termsAccepted: boolean
    privacyAccepted: boolean
    marketingConsent: boolean
  }): Promise<ApiResponse<SubmissionResponse>> {
    return this.makeRequest<SubmissionResponse>(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        step: 4,
        legal_info: data,
      }),
    })
  }

  // Step 5: Submit final application
  async submitApplication(submissionId: string): Promise<ApiResponse<SubmissionResponse>> {
    return this.makeRequest<SubmissionResponse>(`/api/submissions/${submissionId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        step: 5,
        status: 'submitted',
      }),
    })
  }

  // Get submission details
  async getSubmission(submissionId: string): Promise<ApiResponse<SubmissionResponse & { form_data: FormData }>> {
    return this.makeRequest<SubmissionResponse & { form_data: FormData }>(`/api/submissions/${submissionId}`)
  }

  // Update any step (for navigation back/forth)
  async updateStep(submissionId: string, step: number, data: Partial<FormData>): Promise<ApiResponse<SubmissionResponse>> {
    return this.makeRequest<SubmissionResponse>(`/api/submissions/${submissionId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        step,
        form_data: data,
      }),
    })
  }

  // Auto-save functionality for better reliability
  async autoSave(submissionId: string, step: number, data: Partial<FormData>): Promise<ApiResponse<SubmissionResponse>> {
    return this.makeRequest<SubmissionResponse>(`/api/submissions/${submissionId}/autosave`, {
      method: 'PATCH',
      body: JSON.stringify({
        step,
        form_data: data,
        is_autosave: true,
      }),
    })
  }

  // Validate step data without saving
  async validateStep(step: number, data: Partial<FormData>): Promise<ApiResponse<{ valid: boolean; errors?: Record<string, string[]> }>> {
    return this.makeRequest<{ valid: boolean; errors?: Record<string, string[]> }>('/api/submissions/validate', {
      method: 'POST',
      body: JSON.stringify({
        step,
        form_data: data,
      }),
    })
  }

  // Check server connectivity
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ status: string }>('/api/health')
      return response.success && response.data?.status === 'ok'
    } catch {
      return false
    }
  }

  // Fetch all forms
  async getAllForms(): Promise<ApiResponse<Form[]>> {
    return this.makeRequest<Form[]>('/api/forms')
  }

  // Fetch a specific form by slug
  async getFormBySlug(slug: string): Promise<ApiResponse<FormResponse>> {
    return this.makeRequest<FormResponse>(`/api/form/${slug}`)
  }

  // Upload file to local /uploads/ directory with random filename
  async uploadFile(file: File): Promise<ApiResponse<{ url: string; filename: string }>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout for file uploads

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `Upload failed (${response.status})`,
          errors: data.errors,
        }
      }

      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error('File upload failed:', error)
      return {
        success: false,
        message: error instanceof Error && error.name === 'AbortError' 
          ? 'File upload timed out. Please try again.'
          : 'File upload failed. Please check your connection and try again.',
      }
    }
  }
}

export const apiService = new ApiService()
export default apiService
