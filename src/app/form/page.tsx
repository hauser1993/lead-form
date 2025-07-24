'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, FileText, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiService, type Form } from '@/lib/api'

export default function FormSelection() {
  const router = useRouter()
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchForms() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await apiService.getAllForms()
        
        if (response.success && response.data) {
          setForms(response.data)
        } else {
          setError(response.message || 'Failed to fetch forms')
          toast.error(response.message || 'Failed to fetch forms')
        }
      } catch (err) {
        const errorMessage = 'Failed to load forms. Please check your connection and try again.'
        setError(errorMessage)
        toast.error(errorMessage)
        console.error('Error fetching forms:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchForms()
  }, [])

  const handleFormSelect = (slug: string) => {
    router.push(`/form/${slug}`)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Loading forms...</h2>
          <p className="text-sm text-gray-600">Please wait while we fetch available forms.</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
          <h2 className="text-lg font-semibold text-gray-900">Error Loading Forms</h2>
          <p className="text-sm text-gray-600">{error}</p>
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

  if (forms.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <FileText className="w-8 h-8 mx-auto text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">No Forms Available</h2>
          <p className="text-sm text-gray-600">
            There are currently no forms available. Please contact support for assistance.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Forms</h1>
          <p className="text-lg text-gray-600">
            Select a form to begin your application process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form) => (
            <Card 
              key={form.id} 
              className="hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border-0"
              onClick={() => handleFormSelect(form.slug)}
            >
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>{form.title}</span>
                </CardTitle>
                {form.description && (
                  <CardDescription>{form.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full group" 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleFormSelect(form.slug)
                  }}
                >
                  Start Application
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
} 