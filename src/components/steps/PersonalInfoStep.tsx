'use client'

import { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, Phone, UserCheck, Calendar, Globe } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'

interface PersonalInfoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onValidationChange: (isValid: boolean) => void
  submissionId?: string | null
  onSubmit?: () => void
}

export default function PersonalInfoStep({ formData, updateFormData, onValidationChange }: PersonalInfoStepProps) {

  useEffect(() => {
    const isValid = formData.gender.trim() !== '' &&
                   formData.firstName.trim() !== '' &&
                   formData.lastName.trim() !== '' &&
                   formData.email.trim() !== '' &&
                   formData.phone.trim() !== '' &&
                   formData.birthdate.trim() !== '' &&
                   formData.nationality.trim() !== ''
    onValidationChange(isValid)
  }, [formData.gender, formData.firstName, formData.lastName, formData.email, formData.phone, formData.birthdate, formData.nationality]) // Removed onValidationChange to prevent infinite loops

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value })
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-gray-600">Please provide your basic personal details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
            Gender *
          </Label>
          <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
            <SelectTrigger className="w-full">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder="Select your gender" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            First Name *
          </Label>
          <div className="relative">
            <Input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="pl-10"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            Last Name *
          </Label>
          <div className="relative">
            <Input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="pl-10"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthdate" className="text-sm font-medium text-gray-700">
            Date of Birth *
          </Label>
          <div className="relative">
            <Input
              id="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={(e) => handleInputChange('birthdate', e.target.value)}
              className="pl-10"
              max={new Date().toISOString().split('T')[0]}
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality" className="text-sm font-medium text-gray-700">
            Nationality *
          </Label>
          <div className="relative">
            <Input
              id="nationality"
              type="text"
              placeholder="Enter your nationality"
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              className="pl-10"
            />
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address *
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone Number *
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="pl-10"
            />
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-sm text-blue-800">
          <strong>🔒 Privacy Notice:</strong> Your personal information is securely encrypted and will only be used for account verification and investment processing purposes.
        </p>
      </div>
    </div>
  )
}
