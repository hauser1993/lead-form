'use client'

import { useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SelectWithAutocomplete, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Mail, Phone, UserCheck, Calendar, Globe } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'

interface PersonalInfoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onValidationChange: (isValid: boolean) => void
  submissionId?: string | null
  onSubmit?: () => void
  language?: 'en' | 'de'
  t?: (key: string, fallback?: string) => string
}

export default function PersonalInfoStep({ formData, updateFormData, onValidationChange, t = (key, fallback) => fallback || key }: PersonalInfoStepProps) {

  useEffect(() => {
    const isValid = formData.gender.trim() !== '' &&
                   formData.firstName.trim() !== '' &&
                   formData.lastName.trim() !== '' &&
                   formData.email.trim() !== '' &&
                   formData.phone.trim() !== '' &&
                   formData.birthdate.trim() !== '' &&
                   formData.nationality.trim() !== ''
    onValidationChange(isValid)
     
    // onValidationChange is stable from parent, safe to omit from deps to prevent infinite loop
  }, [formData.gender, formData.firstName, formData.lastName, formData.email, formData.phone, formData.birthdate, formData.nationality])

  const handleInputChange = (field: keyof FormData, value: string) => {
    updateFormData({ [field]: value })
  }

  const genderOptions = [
    { value: 'male', label: t('gender.male') },
    { value: 'female', label: t('gender.female') },
    { value: 'other', label: t('gender.other') },
    { value: 'prefer-not-to-say', label: t('gender.preferNotToSay') },
  ]

  const nationalityOptions = [
    { value: 'german', label: t('nationality.german') },
    { value: 'austrian', label: t('nationality.austrian') },
    { value: 'swiss', label: t('nationality.swiss') },
    { value: 'french', label: t('nationality.french') },
    { value: 'belgian', label: t('nationality.belgian') },
    { value: 'british', label: t('nationality.british') }, 
    { value: 'dutch', label: t('nationality.dutch') }, 
    { value: 'irish', label: t('nationality.irish') }, 
    { value: 'luxembourgish', label: t('nationality.luxembourgish') }, 
    { value: 'polish', label: t('nationality.polish') }, 
    { value: 'spanish', label: t('nationality.spanish') },
    { value: 'swedish', label: t('nationality.swedish') },
  ]

  return (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('personal.title')}</h2>
        <p className="text-gray-600">{t('personal.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="gender" className="text-sm font-medium text-gray-700">
            {t('personal.gender')} {t('required')}
          </Label>
          <SelectWithAutocomplete 
            name="gender"
            autoComplete="sex"
            value={formData.gender} 
            onValueChange={(value) => handleInputChange('gender', value)}
            options={genderOptions}
            placeholder={t('personal.gender.placeholder')}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder={t('personal.gender.placeholder')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectWithAutocomplete>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
            {t('personal.firstName')} {t('required')}
          </Label>
          <div className="relative">
            <Input
              id="firstName"
              type="text"
              placeholder={t('personal.firstName.placeholder')}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="pl-10"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
            {t('personal.lastName')} {t('required')}
          </Label>
          <div className="relative">
            <Input
              id="lastName"
              type="text"
              placeholder={t('personal.lastName.placeholder')}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="pl-10"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthdate" className="text-sm font-medium text-gray-700">
            {t('personal.birthdate')} {t('required')}
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
            {t('personal.nationality')} {t('required')}
          </Label>
          <SelectWithAutocomplete 
            name="nationality"
            autoComplete="nationality"
            value={formData.nationality} 
            onValueChange={(value) => handleInputChange('nationality', value)}
            options={nationalityOptions}
            placeholder={t('personal.nationality.placeholder')}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <SelectValue placeholder={t('personal.nationality.placeholder')} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {nationalityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectWithAutocomplete>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            {t('personal.email')} {t('required')}
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder={t('personal.email.placeholder')}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="pl-10"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
            {t('personal.phone')} {t('required')}
          </Label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              placeholder={t('personal.phone.placeholder')}
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
          <strong>🔒 {t('personal.privacyNotice')}</strong> {t('personal.privacyDescription')}
        </p>
      </div>
    </div>
  )
}
