'use client'

import { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectWithAutocomplete, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Home, Building2, Globe } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'

interface MoreInfoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onValidationChange: (isValid: boolean) => void
  submissionId?: string | null
  onSubmit?: () => void
}

export default function MoreInfoStep({ formData, updateFormData, onValidationChange }: MoreInfoStepProps) {

  useEffect(() => {
    const isValid = formData.addressLine1.trim() !== '' &&
                   formData.city.trim() !== '' &&
                   formData.state.trim() !== '' &&
                   formData.postalCode.trim() !== '' &&
                   formData.country.trim() !== ''
    onValidationChange(isValid)
  }, [formData.addressLine1, formData.city, formData.state, formData.postalCode, formData.country]) // Removed onValidationChange to prevent infinite loops

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value })
  }

  const countryOptions = [
    { value: 'germany', label: 'Germany' },
    { value: 'austria', label: 'Austria' },
    { value: 'switzerland', label: 'Switzerland' },
    { value: 'france', label: 'France' },
    { value: 'belgium', label: 'Belgium' },
    { value: 'united-kingdom', label: 'United Kingdom' }, 
    { value: 'netherlands', label: 'Netherlands' }, 
    { value: 'ireland', label: 'Ireland' }, 
    { value: 'luxembourg', label: 'Luxembourg' }, 
    { value: 'poland', label: 'Poland' }, 
    { value: 'spain', label: 'Spain' },
    { value: 'sweden', label: 'Sweden' },
  ]

  return (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Address Information</h2>
        <p className="text-gray-600">Please provide your residential address details</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8">
        <div className="space-y-2">
          <Label htmlFor="addressLine1" className="text-sm font-medium text-gray-700">
            Address Line 1 *
          </Label>
          <div className="relative">
            <Input
              id="addressLine1"
              type="text"
              placeholder="Enter your street address"
              value={formData.addressLine1}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              className="pl-10"
            />
            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine2" className="text-sm font-medium text-gray-700">
            Address Line 2 <span className="text-gray-400">(Optional)</span>
          </Label>
          <div className="relative">
            <Input
              id="addressLine2"
              type="text"
              placeholder="Apartment, suite, unit, building, floor, etc."
              value={formData.addressLine2}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              className="pl-10"
            />
            <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-sm font-medium text-gray-700">
              City *
            </Label>
            <div className="relative">
              <Input
                id="city"
                type="text"
                placeholder="Enter your city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium text-gray-700">
              State/Province *
            </Label>
            <div className="relative">
              <Input
                id="state"
                type="text"
                placeholder="Enter your state or province"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
              Postal/ZIP Code *
            </Label>
            <div className="relative">
              <Input
                id="postalCode"
                type="text"
                placeholder="Enter your postal or ZIP code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">
              Country *
            </Label>
            <SelectWithAutocomplete 
              name="country"
              autoComplete="country"
              value={formData.country} 
              onValueChange={(value) => handleInputChange('country', value)}
              options={countryOptions}
              placeholder="Select your country"
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder="Select your country" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectWithAutocomplete>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
        <p className="text-sm text-green-800">
          <strong>📍 Address Verification:</strong> This address will be used for identity verification and compliance purposes. Please ensure all details are accurate.
        </p>
      </div>
    </div>
  )
}
