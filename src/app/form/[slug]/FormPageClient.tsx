'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import OnboardingWizard from '@/components/OnboardingWizard'
import { apiService, type Form } from '@/lib/api'

export default function FormPageClient() {
  const params = useParams()
  const formSlug = params.slug as string
  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForm() {
      console.debug('[FormPageClient] fetchForm called with formSlug:', formSlug)
      
      // If no slug provided, show 404
      if (!formSlug) {
        console.debug('[FormPageClient] No formSlug provided')
        notFound()
        return
      }

      try {
        console.debug('[FormPageClient] Starting form fetch for slug:', formSlug)
        setIsLoading(true)
        setError(null)
        
        const response = await apiService.getFormBySlug(formSlug)
        console.debug('[FormPageClient] getFormBySlug response:', {
          success: response.success,
          status: response.status,
          hasData: !!response.data,
          message: response.message
        })
        
        if (response.success && response.data) {
          const formData = response.data.data.form
          console.debug('[FormPageClient] Form loaded successfully:', {
            title: formData.title,
            slug: formData.slug,
            id: formData.id
          })
          setForm(formData)
        } else {
          console.debug('[FormPageClient] Form fetch failed:', {
            message: response.message,
            status: response.status,
            hasData: !!response.data
          })
          
          // If it's a "not found" type error, show 404
          if (response.status === 404 ||
              response.message?.toLowerCase().includes('not found') || 
              response.message?.toLowerCase().includes('404') ||
              !response.data) {
            console.debug('[FormPageClient] Treating as 404 - calling notFound()')
            notFound()
            return
          }
          // Otherwise it's a server/network error, show error UI
          console.debug('[FormPageClient] Treating as server error - showing error UI')
          setError(response.message || 'Server error occurred')
          toast.error(response.message || 'Server error occurred')
        }
      } catch (err) {
        const errorMessage = 'Failed to load form. Please check your connection and try again.'
        console.debug('[FormPageClient] Exception in fetchForm:', {
          error: err,
          message: errorMessage,
          formSlug
        })
        setError(errorMessage)
        toast.error(errorMessage)
        console.error('Error fetching form:', err)
      } finally {
        console.debug('[FormPageClient] fetchForm completed, setting loading to false')
        setIsLoading(false)
      }
    }

    console.debug('[FormPageClient] useEffect triggered with formSlug:', formSlug)
    fetchForm()
  }, [formSlug])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Loading form...</h2>
          <p className="text-sm text-gray-600">Please wait while we prepare your form.</p>
        </div>
      </main>
    )
  }

  // Only show error UI for actual server/network errors, not "not found" cases
  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Server Error</h2>
          <p className="text-sm text-gray-600">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  // If form is null at this point, it means we couldn't load it - show 404
  if (!form) {
    notFound()
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 py-8">
      <OnboardingWizard form={form} />
    </main>
  )
} 