'use client'

import { useEffect } from 'react'
import { TrendingUp, Shield, DollarSign, Users } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'

interface WelcomeStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onValidationChange: (isValid: boolean) => void
  submissionId?: string | null
  onSubmit?: () => void
}

export default function WelcomeStep({ onValidationChange }: WelcomeStepProps) {
  useEffect(() => {
    // Welcome step is always valid
    onValidationChange(true)
  }, [onValidationChange])

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: 'Investment Opportunities',
      description: 'Access exclusive investment deals and growth potential'
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: 'Secure & Compliant',
      description: 'Bank-level security with full regulatory compliance'
    },
    {
      icon: <DollarSign className="w-6 h-6 text-purple-500" />,
      title: 'Portfolio Growth',
      description: 'Diversify your portfolio with our curated investments'
    },
    {
      icon: <Users className="w-6 h-6 text-orange-500" />,
      title: 'Expert Support',
      description: 'Dedicated team to guide your investment journey'
    }
  ]

  return (
    <div className="text-center space-y-8 animate-in fade-in-50 duration-700">
      <div className="space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
          <TrendingUp className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Welcome to Your Investment Journey!</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Thank you for your interest in investing with us. This quick onboarding process will
          collect the necessary information to get your investment account set up.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 bg-white/50 hover:bg-white/80 transition-all duration-300 hover:shadow-md"
          >
            <div className="flex-shrink-0">
              {feature.icon}
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
        <p className="text-sm text-green-800">
          <strong>⏱️ Takes just 5-7 minutes</strong> - Your information is encrypted and protected according to financial industry standards.
        </p>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>📋 What You'll Need:</strong> Personal information, address details, and identification for verification purposes.
        </p>
      </div>
    </div>
  )
}
