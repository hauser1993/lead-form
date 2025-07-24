'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
      if (!formSlug) {
        setError('Form not found')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const response = await apiService.getFormBySlug(formSlug)
        
        if (response.success && response.data) {
          setForm(response.data)
        } else {
          setError(response.message || 'Form not found')
          toast.error(response.message || 'Form not found')
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

  if (error || !form) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Form Not Found</h2>
          <p className="text-sm text-gray-600">
            {error || 'The requested form could not be found. Please check the URL and try again.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/form">
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Forms
              </Button>
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 py-8">
      <OnboardingWizard form={form} />
    </main>
  )
} 