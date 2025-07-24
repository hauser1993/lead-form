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
  language?: 'en' | 'de'
  t?: (key: string, fallback?: string) => string
}

export default function MoreInfoStep({ formData, updateFormData, onValidationChange, t = (key, fallback) => fallback || key }: MoreInfoStepProps) {

  useEffect(() => {
    const isValid = formData.addressLine1.trim() !== '' &&
                   formData.city.trim() !== '' &&
                   formData.state.trim() !== '' &&
                   formData.postalCode.trim() !== '' &&
                   formData.country.trim() !== ''
    onValidationChange(isValid)
     
    // onValidationChange is stable from parent, safe to omit from deps to prevent infinite loop
  }, [formData.addressLine1, formData.city, formData.state, formData.postalCode, formData.country])

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value })
  }

  const countryOptions = [
    { value: 'germany', label: t('country.germany') },
    { value: 'austria', label: t('country.austria') },
    { value: 'switzerland', label: t('country.switzerland') },
    { value: 'france', label: t('country.france') },
    { value: 'belgium', label: t('country.belgium') },
    { value: 'united-kingdom', label: t('country.unitedKingdom') }, 
    { value: 'netherlands', label: t('country.netherlands') }, 
    { value: 'ireland', label: t('country.ireland') }, 
    { value: 'luxembourg', label: t('country.luxembourg') }, 
    { value: 'poland', label: t('country.poland') }, 
    { value: 'spain', label: t('country.spain') },
    { value: 'sweden', label: t('country.sweden') },
  ]

  return (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('address.title')}</h2>
        <p className="text-gray-600">{t('address.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8">
        <div className="space-y-2">
          <Label htmlFor="addressLine1" className="text-sm font-medium text-gray-700">
            {t('address.line1')} {t('required')}
          </Label>
          <div className="relative">
            <Input
              id="addressLine1"
              type="text"
              placeholder={t('address.line1.placeholder')}
              value={formData.addressLine1}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              className="pl-10"
            />
            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressLine2" className="text-sm font-medium text-gray-700">
            {t('address.line2')} <span className="text-gray-400">{t('address.optional')}</span>
          </Label>
          <div className="relative">
            <Input
              id="addressLine2"
              type="text"
              placeholder={t('address.line2.placeholder')}
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
              {t('address.city')} {t('required')}
            </Label>
            <div className="relative">
              <Input
                id="city"
                type="text"
                placeholder={t('address.city.placeholder')}
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium text-gray-700">
              {t('address.state')} {t('required')}
            </Label>
            <div className="relative">
              <Input
                id="state"
                type="text"
                placeholder={t('address.state.placeholder')}
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
              {t('address.postalCode')} {t('required')}
            </Label>
            <div className="relative">
              <Input
                id="postalCode"
                type="text"
                placeholder={t('address.postalCode.placeholder')}
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                className="pl-10"
              />
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium text-gray-700">
              {t('address.country')} {t('required')}
            </Label>
            <SelectWithAutocomplete 
              name="country"
              autoComplete="country"
              value={formData.country} 
              onValueChange={(value) => handleInputChange('country', value)}
              options={countryOptions}
              placeholder={t('address.country.placeholder')}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <SelectValue placeholder={t('address.country.placeholder')} />
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
          <strong>📍 {t('address.verificationNotice')}</strong> {t('address.verificationDescription')}
        </p>
      </div>
    </div>
  )
}
