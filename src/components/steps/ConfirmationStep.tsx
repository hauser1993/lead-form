'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, User, MapPin, Clock, ArrowRight, Scale, PieChart } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'

// Ballerine KYC config (replace placeholders with real values as needed)
const ballerineInitConfig = (submissionId: string | null | undefined) => ({
  backendConfig: {
    baseUrl: process.env.NEXT_PUBLIC_KYC_BASE_URL || 'https://example.com/kyc',
    endpoints: {
      startVerification: '/v2/enduser/verify',
      getVerificationStatus: '/v2/enduser/verify/status/{verificationId}',
      processStepData: '/v2/enduser/verify/partial',
      getConfig: '/v2/clients/{clientId}/config',
      uploadFile: '/collection-flow/files1',
      updateContext: '/collection-flow/sync/context',
    },
  },
  translations: {
    remoteUrl: process.env.NEXT_PUBLIC_API_URL + '/kyc/language/en/translations.json',
  },
  endUserInfo: {
    id: submissionId || 'no-submission-id', // Use submissionId as user id 
    language: 'en',
  },
  metricsConfig: {
    enabled: false,
  },
  uiConfig: {
    uiPack: 'default',
    general: {
      colors: {
        primary: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#2563eb',
      },
      fonts: {
        name: 'Inter',
        link: 'https://fonts.googleapis.com/css2?family=Inter:wght@500',
        weight: [500, 700],
      },
    },
    flows: {
      'kyc-mobile': {
        steps: [
          { name: 'welcome', id: 'welcome' },
          {
            name: 'document-selection', id: 'document-selection', documentOptions: [
              { type: 'id_card', kind: 'id_card' },
              { type: 'drivers_license', kind: 'drivers_license' },
              { type: 'passport', kind: 'passport' },
            ]
          },
          { name: 'document-photo', id: 'document-photo' },
          { name: 'check-document', id: 'check-document' },
          { name: 'document-photo-back-start', id: 'document-photo-back-start' },
          { name: 'document-photo-back', id: 'document-photo-back' },
          { name: 'check-document-photo-back', id: 'check-document-photo-back' },
          { name: 'selfie-start', id: 'selfie-start' },
          { name: 'selfie', id: 'selfie' },
          { name: 'check-selfie', id: 'check-selfie' },
          { name: 'loading', id: 'loading' },
          { name: 'final', id: 'final' },
        ],
      },
    },
  },
});

interface ConfirmationStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onValidationChange: (isValid: boolean) => void
  submissionId?: string | null
  onSubmit?: () => void
  onResetData?: () => void
  language?: 'en' | 'de'
  t?: (key: string, fallback?: string) => string
}

export default function ConfirmationStep({ formData, onValidationChange, submissionId, onSubmit, onResetData }: ConfirmationStepProps) {

  useEffect(() => {
    // Confirmation step is always valid
    onValidationChange(true)

    // Mount KYC modal automatically if submissionId is present
    if (submissionId) {

      import('@ballerine/web-ui-sdk').then(({ flows }) => {
        flows.init(ballerineInitConfig(submissionId)).then(() => {
        flows.mount({
          flowName: 'kyc-mobile',
          elementId: 'kyc-container',
            useModal: false,
          });
        });
      })
    }
    // onValidationChange is stable from parent, safe to omit from deps to prevent infinite loop
  }, [])

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit()
    } else {
      console.log('Investor application submitted:', formData)
      alert('Thank you! Your investor application has been submitted successfully. Our team will review your information and contact you within 2-3 business days.')
    }
  }

  const handleResetData = () => {
    if (onResetData) {
      onResetData();
    } else {
      alert('Reset handler not provided. Please refresh the page or contact support.');
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-700">
      {/* Summary Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Summary</h3>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}
                </div>
                <div>
                  <span className="font-medium">Gender:</span> {formData.gender || 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {formData.email}
                </div>
                <div>
                  <span className="font-medium">Phone:</span> {formData.phone}
                </div>
                <div>
                  <span className="font-medium">Birthdate:</span> {formData.birthdate ? new Date(formData.birthdate).toLocaleDateString() : 'Not specified'}
                </div>
                <div>
                  <span className="font-medium">Nationality:</span> {formData.nationality || 'Not specified'}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Address Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div>{formData.addressLine1}</div>
                {formData.addressLine2 && <div>{formData.addressLine2}</div>}
                <div>
                  {formData.city}, {formData.state} {formData.postalCode}
                </div>
                <div>{formData.country}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Asset Information */}
          <div className="flex items-start space-x-3">
            <PieChart className="w-5 h-5 text-purple-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Asset Information</h4>
              {formData.assets && formData.assets.length > 0 ? (
                <div className="space-y-4">
                  {/* Transaction Table/List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 font-medium">Date</th>
                          <th className="px-3 py-2 font-medium">Quantity</th>
                          <th className="px-3 py-2 font-medium">Price</th>
                          <th className="px-3 py-2 font-medium">Total</th>
                          <th className="px-3 py-2 font-medium">Proof</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.assets.map((asset) => (
                          <tr key={asset.id} className="border-b last:border-0">
                            <td className="px-3 py-2">{new Date(asset.transactionDate).toLocaleDateString()}</td>
                            <td className="px-3 py-2">{asset.quantity}</td>
                            <td className="px-3 py-2">${asset.price}</td>
                            <td className="px-3 py-2">${(parseFloat(asset.quantity) * parseFloat(asset.price)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2">
                              {asset.proofFile ? (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Proof uploaded
                                </span>
                              ) : (
                                <span className="text-amber-600">No proof</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <span className="font-medium">Document Status:</span>
                    {' '}
                    {formData.assets.filter(asset => asset.proofFile).length} of {formData.assets.length} transactions have proof documents
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  No transaction data provided
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Legal Agreements */}
          <div className="flex items-start space-x-3">
            <Scale className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Legal Agreements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Terms of Service:</span>
                  {formData.termsAccepted ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accepted
                    </span>
                  ) : (
                    <span className="text-red-600">Not Accepted</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Privacy Policy:</span>
                  {formData.privacyAccepted ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Accepted
                    </span>
                  ) : (
                    <span className="text-red-600">Not Accepted</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <span className="font-medium">Marketing Communications:</span>
                  {formData.marketingConsent ? (
                    <span className="flex items-center text-blue-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Opted In
                    </span>
                  ) : (
                    <span className="text-gray-500">Opted Out</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Information */}
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Application Status</h4>
              <div className="grid grid-cols-1 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Asset Information:</span>
                  {formData.assets && formData.assets.length > 0 ? (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Complete</span>
                  ) : (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
                  )}
                </div>
                <div>
                  <span className="font-medium">KYC Status:</span>
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">📋</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Review Process</h4>
            <p className="text-xs text-gray-600">Our team reviews your application within 24 hours</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">✅</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Verification</h4>
            <p className="text-xs text-gray-600">Complete asset information verification</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
              <span className="text-xl">🚀</span>
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Account Setup</h4>
            <p className="text-xs text-gray-600">Access your investor dashboard and opportunities</p>
          </div>
        </div>
      </div>

      {/* KYC Modal Mount Point */}
      <div id="kyc-container"></div>

    </div>
  )
}
