import type { FormData } from '@/components/OnboardingWizard'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-laravel-app.com'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
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

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'An error occurred',
          errors: data.errors,
        }
      }

      return {
        success: true,
        data,
      }
    } catch (error) {
      console.error('API Request failed:', error)
      return {
        success: false,
        message: 'Network error. Please check your connection and try again.',
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

  // Fetch all forms
  async getAllForms(): Promise<ApiResponse<Form[]>> {
    return this.makeRequest<Form[]>('/api/forms')
  }

  // Fetch a specific form by slug
  async getFormBySlug(slug: string): Promise<ApiResponse<Form>> {
    return this.makeRequest<Form>(`/api/form/${slug}`)
  }
}

export const apiService = new ApiService()
export default apiService
