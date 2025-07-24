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

export default function LegalStep({ formData, updateFormData, onValidationChange }: LegalStepProps) {

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
        <h2 className="text-2xl font-bold text-gray-900">Legal Agreements</h2>
        <p className="text-gray-600">Please review and accept our terms to continue</p>
      </div>

      <div className="space-y-6 mt-8">
        {/* Terms of Service */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-start space-x-4">
            <FileText className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms of Service</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border text-sm text-gray-700 leading-relaxed">
                <div className="space-y-3">
                  <p><strong>1. Acceptance of Terms</strong></p>
                  <p>By using our investment platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>

                  <p><strong>2. Investment Risks</strong></p>
                  <p>All investments carry risk of loss. Past performance does not guarantee future results. You should carefully consider your investment objectives and risk tolerance.</p>

                  <p><strong>3. Eligibility</strong></p>
                  <p>You must be at least 18 years old and legally capable of entering into binding agreements to use our services.</p>

                  <p><strong>4. Account Responsibilities</strong></p>
                  <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>

                  <p><strong>5. Compliance</strong></p>
                  <p>You agree to comply with all applicable securities laws and regulations in your jurisdiction.</p>

                  <p><strong>6. Limitation of Liability</strong></p>
                  <p>Our liability is limited to the maximum extent permitted by law. We are not liable for market losses or investment performance.</p>
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
                    I have read and accept the Terms of Service *
                  </Label>
                </div>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Full Terms
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
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy Policy</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto border text-sm text-gray-700 leading-relaxed">
                <div className="space-y-3">
                  <p><strong>1. Information Collection</strong></p>
                  <p>We collect personal information necessary for account verification, compliance, and service provision including name, address, financial information, and identification documents.</p>

                  <p><strong>2. Data Usage</strong></p>
                  <p>Your information is used for account management, regulatory compliance, fraud prevention, and to provide investment services.</p>

                  <p><strong>3. Data Protection</strong></p>
                  <p>We employ industry-standard security measures including encryption, secure servers, and access controls to protect your personal information.</p>

                  <p><strong>4. Information Sharing</strong></p>
                  <p>We may share information with regulatory authorities, service providers, and as required by law. We do not sell personal information to third parties.</p>

                  <p><strong>5. Data Retention</strong></p>
                  <p>We retain your information as required by law and for legitimate business purposes. You may request data deletion subject to regulatory requirements.</p>

                  <p><strong>6. Your Rights</strong></p>
                  <p>You have the right to access, correct, and request deletion of your personal information, subject to regulatory constraints.</p>
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
                    I have read and accept the Privacy Policy *
                  </Label>
                </div>
                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Full Policy
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Communications</h3>
              <p className="text-sm text-gray-600 mb-4">
                Stay informed about new investment opportunities, market insights, and platform updates.
              </p>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="marketing"
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) => handleCheckboxChange('marketingConsent', checked as boolean)}
                />
                <Label htmlFor="marketing" className="text-sm text-gray-700 cursor-pointer">
                  I consent to receiving marketing communications via email and SMS (Optional)
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                You can unsubscribe at any time. This does not affect important account notifications.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <p className="text-sm text-indigo-800">
          <strong>⚖️ Legal Notice:</strong> These agreements are legally binding. Please review them carefully.
          Contact our legal team if you have any questions before proceeding.
        </p>
      </div>
    </div>
  )
}
