'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Check, Loader2, Wifi, WifiOff, Save, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import WelcomeStep from './steps/WelcomeStep'
import PersonalInfoStep from './steps/PersonalInfoStep'
import MoreInfoStep from './steps/MoreInfoStep'
import AssetInfoStep from './steps/AssetInfoStep'
import LegalStep from './steps/LegalStep'
import ConfirmationStep from './steps/ConfirmationStep'
import { apiService } from '@/lib/api'

export interface FormData {
  // Personal Information
  gender: string
  firstName: string
  lastName: string
  birthdate: string
  nationality: string
  email: string
  phone: string
  // More Information
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  country: string
  // Asset Information
  assets: Array<{
    id: string
    transactionDate: string
    quantity: string
    price: string
    notice: string
    proofFile?: File | null
  }>
  // Legal Agreements
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingConsent: boolean
  // KYC Verification (empty for now)
}

interface OnboardingWizardProps {
  form?: {
    id: string
    title: string
    slug: string
    description: string
    created_at: string
    updated_at: string
    fields?: Record<string, unknown>
  }
}

const steps = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'personal', title: 'Personal Info', component: PersonalInfoStep },
  { id: 'address', title: 'More Info', component: MoreInfoStep },
  { id: 'assets', title: 'Asset Info', component: AssetInfoStep },
  { id: 'legal', title: 'Legal', component: LegalStep },
  { id: 'confirmation', title: 'Confirmation', component: ConfirmationStep },
]

export default function OnboardingWizard({ form }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const lastAutoSaveDataRef = useRef<string>('')

  const [formData, setFormData] = useState<FormData>({
    // Personal Information
    gender: '',
    firstName: '',
    lastName: '',
    birthdate: '',
    nationality: '',
    email: '',
    phone: '',
    // More Information
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    // Asset Information
    assets: [],
    // Legal Agreements
    termsAccepted: false,
    privacyAccepted: false,
    marketingConsent: false,
  })
  const [isStepValid, setIsStepValid] = useState(false)
  const [isNavigatingBack, setIsNavigatingBack] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // Get steps for navigation (excluding welcome step)
  const navigationSteps = steps.slice(1)
  const progress = currentStep === 0 ? 0 : ((currentStep) / (steps.length - 1)) * 100
  const CurrentStepComponent = steps[currentStep].component

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Connection restored')
      // Attempt to sync unsaved changes
      if (hasUnsavedChanges && submissionId) {
        performAutoSave()
      }
    }
    const handleOffline = () => {
      setIsOnline(false)
      toast.error('Working offline - changes will be saved when connection is restored')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial connectivity check
    apiService.healthCheck().then(setIsOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [hasUnsavedChanges, submissionId])

  // Helper function to serialize form data without file objects for localStorage
  const serializeFormData = (data: FormData) => {
    return {
      ...data,
      assets: data.assets.map(asset => ({
        id: asset.id,
        transactionDate: asset.transactionDate,
        quantity: asset.quantity,
        price: asset.price,
        notice: asset.notice,
        // Store only file name for reference, not the actual file
        proofFileName: asset.proofFile?.name || null
      }))
    }
  }

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!submissionId || !isOnline || currentStep === 0) return

    const currentDataString = JSON.stringify(serializeFormData(formData))
    if (currentDataString === lastAutoSaveDataRef.current) return

    setIsAutoSaving(true)
    try {
      const response = await apiService.autoSave(submissionId, currentStep, formData)
      if (response.success) {
        setLastSaved(new Date())
        setHasUnsavedChanges(false)
        lastAutoSaveDataRef.current = currentDataString
        console.log('✅ Auto-save successful')
      } else {
        console.warn('⚠️ Auto-save failed:', response.message)
      }
    } catch (error) {
      console.error('❌ Auto-save error:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }, [submissionId, isOnline, currentStep, formData])

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    if (hasUnsavedChanges && submissionId && isOnline && currentStep > 0) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave()
      }, 2000) // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [hasUnsavedChanges, submissionId, isOnline, currentStep, performAutoSave])

  // Load submission from localStorage on mount
  useEffect(() => {
    console.log('🔄 Loading saved submission data from localStorage...')
    const savedSubmissionId = localStorage.getItem('investor_submission_id')
    const savedStep = localStorage.getItem('investor_current_step')
    const savedFormData = localStorage.getItem('investor_form_data')
    const savedCompletedSteps = localStorage.getItem('investor_completed_steps')

    if (savedSubmissionId && savedFormData) {
      console.log('✅ Found saved data:', {
        submissionId: savedSubmissionId,
        step: savedStep,
        formDataKeys: Object.keys(JSON.parse(savedFormData))
      })
      setSubmissionId(savedSubmissionId)
      setFormData(JSON.parse(savedFormData))
      if (savedStep) {
        const stepNumber = parseInt(savedStep)
        setCurrentStep(stepNumber)
        // Mark all previous steps as completed
        const completed = new Set<number>()
        for (let i = 0; i < stepNumber; i++) {
          completed.add(i)
        }
        if (savedCompletedSteps) {
          const saved = JSON.parse(savedCompletedSteps)
          saved.forEach((step: number) => completed.add(step))
        }
        setCompletedSteps(completed)
      }
    } else {
      console.log('ℹ️ No saved submission data found')
    }
  }, [])

  // Save to localStorage whenever form data or step changes
  useEffect(() => {
    if (submissionId) {
      console.log('💾 Saving to localStorage:', {
        submissionId,
        currentStep,
        completedSteps: Array.from(completedSteps)
      })
      localStorage.setItem('investor_submission_id', submissionId)
      localStorage.setItem('investor_current_step', currentStep.toString())
      localStorage.setItem('investor_form_data', JSON.stringify(serializeFormData(formData)))
      localStorage.setItem('investor_completed_steps', JSON.stringify(Array.from(completedSteps)))
    }
  }, [submissionId, currentStep, formData, completedSteps])

  const handleApiCall = async (stepNumber: number, data: Partial<FormData>, showSuccessToast: boolean = true) => {
    console.log(`🚀 Making API call for step ${stepNumber}:`, { data, submissionId })
    setIsLoading(true)

    try {
      let response

      switch (stepNumber) {
        case 1: // Personal Info Step
          if (!submissionId) {
            console.log('📝 Creating new submission...')
            // Create new submission
            response = await apiService.createSubmission({
              gender: data.gender!,
              firstName: data.firstName!,
              lastName: data.lastName!,
              birthdate: data.birthdate!,
              nationality: data.nationality!,
              email: data.email!,
              phone: data.phone!,
            })
            if (response.success && response.data) {
              console.log('✅ Submission created successfully:', response.data)
              setSubmissionId(response.data.id)
              setLastSaved(new Date())
              if (showSuccessToast) toast.success('Application started successfully!')
            } else {
              console.error('❌ Failed to create submission:', response)
            }
          } else {
            console.log('🔄 Updating existing personal information...')
            // Update existing submission with personal info
            response = await apiService.updatePersonalInfo(submissionId, {
              gender: data.gender!,
              firstName: data.firstName!,
              lastName: data.lastName!,
              birthdate: data.birthdate!,
              nationality: data.nationality!,
              email: data.email!,
              phone: data.phone!,
            })
            if (response.success) {
              console.log('✅ Personal information updated')
              setLastSaved(new Date())
              if (showSuccessToast) toast.success('Personal information updated!')
            } else {
              console.error('❌ Failed to update personal info:', response)
            }
          }
          break

        case 2: // Address Info Step
          if (submissionId) {
            console.log('🏠 Updating address information...')
            response = await apiService.updateAddressInfo(submissionId, {
              addressLine1: data.addressLine1!,
              addressLine2: data.addressLine2!,
              city: data.city!,
              state: data.state!,
              postalCode: data.postalCode!,
              country: data.country!,
            })
            if (response.success) {
              console.log('✅ Address information updated')
              setLastSaved(new Date())
              if (showSuccessToast) toast.success('Address information updated!')
            } else {
              console.error('❌ Failed to update address info:', response)
            }
          }
          break

        case 3: // Asset Info Step
          if (submissionId) {
            console.log('💰 Updating asset information...')
            response = await apiService.updateAssetInfo(submissionId, {
              assets: data.assets || []
            })
            if (response.success) {
              console.log('✅ Asset information updated')
              setLastSaved(new Date())
              if (showSuccessToast) toast.success('Asset information updated!')
            } else {
              console.error('❌ Failed to update asset info:', response)
            }
          }
          break

        case 4: // Legal Step
          if (submissionId) {
            console.log('⚖️ Updating legal agreements...')
            response = await apiService.updateLegalInfo(submissionId, {
              termsAccepted: data.termsAccepted!,
              privacyAccepted: data.privacyAccepted!,
              marketingConsent: data.marketingConsent!,
            })
            if (response.success) {
              console.log('✅ Legal agreements updated')
              setLastSaved(new Date())
              if (showSuccessToast) toast.success('Legal agreements updated!')
            } else {
              console.error('❌ Failed to update legal info:', response)
            }
          }
          break

        case 5: // Confirmation/Submit Step
          if (submissionId) {
            console.log('📤 Submitting final application...')
            response = await apiService.submitApplication(submissionId)
            if (response.success) {
              console.log('✅ Application submitted successfully')
              setLastSaved(new Date())
              toast.success('Application submitted successfully!')
              // Clear localStorage after successful submission
              localStorage.removeItem('investor_submission_id')
              localStorage.removeItem('investor_current_step')
              localStorage.removeItem('investor_form_data')
              localStorage.removeItem('investor_completed_steps')
              console.log('🗑️ Cleared localStorage after successful submission')
            } else {
              console.error('❌ Failed to submit application:', response)
            }
          }
          break

        default:
          console.log('⚠️ Unknown step number:', stepNumber)
          return
      }

      if (response && !response.success) {
        console.error('❌ API call failed:', response)
        toast.error(response.message || 'An error occurred')
        if (response.errors) {
          console.error('Validation errors:', response.errors)
          Object.entries(response.errors).forEach(([field, messages]) => {
            toast.error(`${field}: ${messages.join(', ')}`)
          })
        }
        return false
      }

      setHasUnsavedChanges(false)
      return true

    } catch (error) {
      console.error('🚫 API call exception:', error)
      toast.error('Network error. Please check your connection.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = async () => {
    console.log(`➡️ Moving to next step from ${currentStep}`)
    setIsNavigatingBack(false)

    if (currentStep === 0) {
      // Welcome step, just move to next
      console.log('👋 Welcome step completed, moving to personal info')
      setCurrentStep(1)
      setIsStepValid(false)
      return
    }

    // Make API call for current step before moving forward
    const success = await handleApiCall(currentStep, formData)

    if (success && currentStep < steps.length - 1) {
      const nextStep = currentStep + 1
      console.log(`📍 Moving from step ${currentStep} to step ${nextStep}`)

      // Mark current step as completed
      setCompletedSteps(prev => new Set([...prev, currentStep]))

      setCurrentStep(nextStep)
      setIsStepValid(false)
    }
  }

  const handlePrevious = async () => {
    console.log(`⬅️ Moving to previous step from ${currentStep}`)
    setIsNavigatingBack(true)

    // Don't allow going back to welcome step (step 0)
    if (currentStep > 1) {
      // Only save current step data if it's valid (don't save incomplete data when going back)
      if (currentStep > 0 && submissionId && isStepValid) {
        console.log('💾 Saving current step data before going back...')
        await handleApiCall(currentStep, formData, false) // Don't show success toast for navigation saves
      } else {
        console.log('⏭️ Skipping API call - step invalid or navigating back')
      }

      const prevStep = currentStep - 1
      console.log(`📍 Moving from step ${currentStep} to step ${prevStep}`)
      setCurrentStep(prevStep)
      // When navigating back, set step as valid to prevent validation errors
      setIsStepValid(true)

      // Reset navigation flag after a longer delay to ensure step component has rendered
      setTimeout(() => {
        setIsNavigatingBack(false)
      }, 300)
    }
  }

  const handleStepClick = async (stepIndex: number) => {
    console.log(`🖱️ Step clicked: ${stepIndex} (current: ${currentStep})`)

    // Prevent going back to welcome step (step 0)
    if (stepIndex === 0) {
      console.log('🚫 Cannot navigate back to welcome step')
      return
    }

    if (stepIndex <= currentStep && submissionId) {
      const isGoingBack = stepIndex < currentStep
      setIsNavigatingBack(isGoingBack)

      // Only save current step data if it's valid or if we're moving forward
      if (currentStep > 0 && (!isGoingBack || isStepValid)) {
        console.log('💾 Saving current step data before step switch...')
        await handleApiCall(currentStep, formData, false) // Don't show success toast for navigation saves
      } else {
        console.log('⏭️ Skipping API call - navigating back with invalid data')
      }

      console.log(`📍 Switching to step ${stepIndex}`)
      setCurrentStep(stepIndex)

      // If navigating to a previous step, mark as valid
      // Welcome step (step 0) is always valid
      if (isGoingBack || stepIndex === 0) {
        setIsStepValid(true)
      } else {
        setIsStepValid(false)
      }

      // Reset navigation flag after a longer delay to ensure step component has rendered
      setTimeout(() => {
        setIsNavigatingBack(false)
      }, 300)
    }
  }

  const updateFormData = (data: Partial<FormData>) => {
    console.log('📝 Form data updated:', data)
    setFormData(prev => ({ ...prev, ...data }))
    setHasUnsavedChanges(true)
  }

  const handleSubmit = async () => {
    console.log('📤 Handling final submission...')
    if (submissionId) {
      await handleApiCall(5, formData)
    }
  }

  // Enhanced validation change handler that considers navigation state
  const handleValidationChange = (isValid: boolean) => {
    // Don't show validation errors when navigating back
    if (isNavigatingBack) {
      console.log('⬅️ Navigating back - skipping validation')
      setIsStepValid(true)
      return
    }

    // If returning to a previously completed step, consider it valid
    if (completedSteps.has(currentStep)) {
      console.log(`✅ Returning to completed step ${currentStep} - marking as valid`)
      setIsStepValid(true)
      return
    }

    console.log(`✅ Step ${currentStep} validation:`, isValid)
    setIsStepValid(isValid)
  }

  // Format last saved time
  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'just now'
    if (minutes === 1) return '1 minute ago'
    if (minutes < 60) return `${minutes} minutes ago`
    
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  console.log('🎯 Current state:', {
    currentStep,
    submissionId: submissionId ? `${submissionId.slice(-8)}...` : null,
    isStepValid,
    isNavigatingBack,
    isLoading,
    isAutoSaving,
    isOnline,
    hasUnsavedChanges,
    completedSteps: Array.from(completedSteps),
    formDataKeys: Object.keys(formData).filter(key => {
      const value = formData[key as keyof FormData]
      return typeof value === 'string' ? value.trim() !== '' : value !== false
    })
  })

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        {/* Conditionally render header only for non-welcome steps */}
        {currentStep > 0 && (
          <CardHeader className="space-y-6 pb-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {form?.title || 'Investor Onboarding'}
                  </h1>
                  {form?.description && (
                    <p className="text-sm text-gray-600 mt-1">{form.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {/* Connectivity Status */}
                  <div className="flex items-center space-x-1">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-xs text-gray-500">
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>

                  {/* Auto-save Status */}
                  {submissionId && (
                    <div className="flex items-center space-x-1">
                      {isAutoSaving ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                          <span className="text-xs text-blue-600">Saving...</span>
                        </>
                      ) : hasUnsavedChanges ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-600">Unsaved</span>
                        </>
                      ) : lastSaved ? (
                        <>
                          <Save className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">
                            Saved {formatLastSaved(lastSaved)}
                          </span>
                        </>
                      ) : null}
                    </div>
                  )}

                  {submissionId && (
                    <Badge variant="outline" className="text-xs">
                      ID: {submissionId.slice(-8)}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="px-3 py-1">
                    {currentStep} of {navigationSteps.length}
                  </Badge>
                </div>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Navigation */}
            <div className="flex justify-between items-center">
              {navigationSteps.map((step, index) => {
                const actualStepIndex = index + 1 // Offset by 1 since we're excluding welcome step
                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center space-y-2 cursor-pointer group"
                    onClick={() => handleStepClick(actualStepIndex)}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        actualStepIndex < currentStep
                          ? 'bg-green-500 text-white'
                          : actualStepIndex === currentStep
                          ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                          : actualStepIndex <= currentStep
                          ? 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {actualStepIndex < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium transition-colors duration-300 hidden sm:block ${
                        actualStepIndex <= currentStep ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardHeader>
        )}

        <CardContent className={currentStep === 0 ? "pb-8 pt-8" : "pb-8"}>
          {/* Step Content */}
          <div className="min-h-[400px] transition-all duration-500 ease-in-out">
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
              onValidationChange={handleValidationChange}
              submissionId={submissionId}
              onSubmit={currentStep === steps.length - 1 ? handleSubmit : undefined}
              onStart={currentStep === 0 ? handleNext : undefined}
              form={form}
            />
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Saving...</span>
            </div>
          )}

          {/* Navigation Buttons - only show for non-welcome steps */}
          {currentStep > 0 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep <= 1 || isLoading}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={
                  currentStep === steps.length - 1 ||
                  (currentStep > 0 && !isStepValid && !isNavigatingBack) ||
                  isLoading
                }
                className="flex items-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{currentStep === steps.length - 1 ? 'Submit' : 'Next'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
