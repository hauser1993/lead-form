'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import OnboardingWizard from '@/components/OnboardingWizard'
import { apiService, type Form } from '@/lib/api'

export default function FormPage() {
  const params = useParams()
  const formslug = params.formslug as string
  
  const [form, setForm] = useState<Form | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForm() {
      if (!formslug) {
        setError('Form slug is required')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await apiService.getFormBySlug(formslug)
        
        if (response.success && response.data) {
          setForm(response.data)
        } else {
          setError(response.message || 'Failed to fetch form')
          toast.error(response.message || 'Failed to fetch form')
        }
      } catch (err) {
        const errorMessage = 'Failed to load form. Please check your connection and try again.'
        setError(errorMessage)
        toast.error(errorMessage)
        console.error('Error fetching form:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchForm()
  }, [formslug])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Loading form...</h2>
          <p className="text-sm text-gray-600">Please wait while we fetch the form details.</p>
        </div>
      </main>
    )
  }

  if (error || !form) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Form Not Found</h2>
          <p className="text-sm text-gray-600">
            {error || 'The requested form could not be found. Please check the URL and try again.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <OnboardingWizard form={form} />
    </main>
  )
} 