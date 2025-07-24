'use client'

import { useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Scale, FileText, Shield, ExternalLink } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'

interface LegalStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onValidationChange: (isValid: boolean) => void
  submissionId?: string | null
  onSubmit?: () => void
  language?: 'en' | 'de'
  t?: (key: string, fallback?: string) => string
}

export default function LegalStep({ formData, updateFormData, onValidationChange, t = (key, fallback) => fallback || key }: LegalStepProps) {

  useEffect(() => {
    const isValid = formData.termsAccepted && formData.privacyAccepted
    onValidationChange(isValid)
     
    // onValidationChange is stable from parent, safe to omit from deps to prevent infinite loop
  }, [formData.termsAccepted, formData.privacyAccepted])

  const handleCheckboxChange = (field: keyof FormData, checked: boolean) => {
    updateFormData({ [field]: checked })
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
          <Scale className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('legal.title')}</h2>
        <p className="text-gray-600">{t('legal.subtitle')}</p>
      </div>

      <div className="space-y-6 mt-8">
        {/* Terms of Service */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-start space-x-4">
            <FileText className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('legal.termsTitle')}</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border text-sm text-gray-700 leading-relaxed">
                <div className="space-y-3">
                  <p><strong>1. {t('terms.acceptance')}</strong></p>
                  <p>{t('terms.acceptanceText')}</p>

                  <p><strong>2. {t('terms.risks')}</strong></p>
                  <p>{t('terms.risksText')}</p>

                  <p><strong>3. {t('terms.eligibility')}</strong></p>
                  <p>{t('terms.eligibilityText')}</p>

                  <p><strong>4. {t('terms.responsibilities')}</strong></p>
                  <p>{t('terms.responsibilitiesText')}</p>

                  <p><strong>5. {t('terms.compliance')}</strong></p>
                  <p>{t('terms.complianceText')}</p>

                  <p><strong>6. {t('terms.liability')}</strong></p>
                  <p>{t('terms.liabilityText')}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleCheckboxChange('termsAccepted', checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm font-medium text-gray-900 cursor-pointer">
                    {t('legal.termsAccept')} {t('required')}
                  </Label>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t('legal.fullTerms')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('legal.privacyTitle')}</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border text-sm text-gray-700 leading-relaxed">
                <div className="space-y-3">
                  <p><strong>1. {t('privacy.collection')}</strong></p>
                  <p>{t('privacy.collectionText')}</p>

                  <p><strong>2. {t('privacy.usage')}</strong></p>
                  <p>{t('privacy.usageText')}</p>

                  <p><strong>3. {t('privacy.protection')}</strong></p>
                  <p>{t('privacy.protectionText')}</p>

                  <p><strong>4. {t('privacy.sharing')}</strong></p>
                  <p>{t('privacy.sharingText')}</p>

                  <p><strong>5. {t('privacy.retention')}</strong></p>
                  <p>{t('privacy.retentionText')}</p>

                  <p><strong>6. {t('privacy.rights')}</strong></p>
                  <p>{t('privacy.rightsText')}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="privacy"
                    checked={formData.privacyAccepted}
                    onCheckedChange={(checked) => handleCheckboxChange('privacyAccepted', checked as boolean)}
                  />
                  <Label htmlFor="privacy" className="text-sm font-medium text-gray-900 cursor-pointer">
                    {t('legal.privacyAccept')} {t('required')}
                  </Label>
                </div>
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  {t('legal.fullPolicy')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Optional Marketing Consent */}
        <div className="border border-gray-100 rounded-xl p-6 bg-gray-50">
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 flex items-center justify-center mt-1">
              <span className="text-lg">📧</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('legal.marketingTitle')}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {t('legal.marketingDescription')}
              </p>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="marketing"
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) => handleCheckboxChange('marketingConsent', checked as boolean)}
                />
                <Label htmlFor="marketing" className="text-sm text-gray-700 cursor-pointer">
                  {t('legal.marketingAccept')}
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('legal.marketingUnsubscribe')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <p className="text-sm text-indigo-800">
          <strong>⚖️ {t('legal.notice')}</strong> {t('legal.noticeDescription')}
        </p>
      </div>
    </div>
  )
}
