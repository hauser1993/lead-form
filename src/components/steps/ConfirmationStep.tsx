'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, User, MapPin, Clock, ArrowRight, Scale, PieChart } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'

// Ballerine KYC config (replace placeholders with real values as needed)
const ballerineInitConfig = (submissionId: string | null | undefined) => ({
  backendConfig: {
    baseUrl: process.env.NEXT_PUBLIC_EXTERN_API_DOMAIN || 'https://example.com/kyc',
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
    remoteUrl: process.env.NEXT_PUBLIC_EXTERN_API_DOMAIN + '/kyc/language/en/translations.json',
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

export default function ConfirmationStep({ formData, onValidationChange, submissionId, onSubmit, onResetData, t = (key, fallback) => fallback || key }: ConfirmationStepProps) {
  const [isKycModalOpen, setIsKycModalOpen] = useState(false)

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
      alert(t('toast.applicationSubmitted'))
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
        <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('confirmation.summaryTitle')}</h3>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">{t('confirmation.personalInfo')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">{t('confirmation.name')}</span> {formData.firstName} {formData.lastName}
                </div>
                <div>
                  <span className="font-medium">{t('confirmation.gender')}</span> {formData.gender || t('confirmation.notSpecified')}
                </div>
                <div>
                  <span className="font-medium">{t('confirmation.email')}</span> {formData.email}
                </div>
                <div>
                  <span className="font-medium">{t('confirmation.phone')}</span> {formData.phone}
                </div>
                <div>
                  <span className="font-medium">{t('confirmation.birthdate')}</span> {formData.birthdate ? new Date(formData.birthdate).toLocaleDateString() : t('confirmation.notSpecified')}
                </div>
                <div>
                  <span className="font-medium">{t('confirmation.nationality')}</span> {formData.nationality || t('confirmation.notSpecified')}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">{t('confirmation.addressInfo')}</h4>
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
              <h4 className="font-medium text-gray-900 mb-2">{t('confirmation.assetInfo')}</h4>
              {formData.assets && formData.assets.length > 0 ? (
                <div className="space-y-4">
                  {/* Transaction Table/List */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 font-medium">{t('assets.transactionDate')}</th>
                          <th className="px-3 py-2 font-medium">{t('assets.quantity')}</th>
                          <th className="px-3 py-2 font-medium">{t('assets.price')}</th>
                          <th className="px-3 py-2 font-medium">{t('assets.totalValue')}</th>
                          <th className="px-3 py-2 font-medium">{t('assets.proofDocument')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.assets.map((asset) => (
                          <tr key={asset.id} className="border-b last:border-0">
                            <td className="px-3 py-2">{new Date(asset.transactionDate).toLocaleDateString()}</td>
                            <td className="px-3 py-2">{asset.quantity}</td>
                            <td className="px-3 py-2">€{asset.price}</td>
                            <td className="px-3 py-2">€{(parseFloat(asset.quantity) * parseFloat(asset.price)).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-3 py-2">
                              {asset.proofFile ? (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {t('assets.uploadProof')}
                                </span>
                              ) : (
                                <span className="text-amber-600">{t('assets.uploadFailed')}</span>
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
                    {formData.assets.filter(asset => asset.proofFile).length} of {formData.assets.length} {t('confirmation.transactions')} have proof documents
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
              <h4 className="font-medium text-gray-900 mb-2">{t('confirmation.legalInfo')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{t('legal.termsTitle')}:</span>
                  {formData.termsAccepted ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('confirmation.agreed')}
                    </span>
                  ) : (
                    <span className="text-red-600">{t('confirmation.declined')}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{t('legal.privacyTitle')}:</span>
                  {formData.privacyAccepted ? (
                    <span className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('confirmation.agreed')}
                    </span>
                  ) : (
                    <span className="text-red-600">{t('confirmation.declined')}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2 md:col-span-2">
                  <span className="font-medium">{t('confirmation.marketingConsent')}:</span>
                  {formData.marketingConsent ? (
                    <span className="flex items-center text-blue-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('confirmation.agreed')}
                    </span>
                  ) : (
                    <span className="text-gray-500">{t('confirmation.declined')}</span>
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
                  <span className="font-medium">{t('confirmation.assetInfo')}:</span>
                  {formData.assets && formData.assets.length > 0 ? (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Complete</span>
                  ) : (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
                  )}
                </div>
                <div>
                  <span className="font-medium">KYC Status:</span>
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>
                  <button
                    type="button"
                    className="ml-4 px-3 py-1 text-xs border border-yellow-300 rounded bg-white hover:bg-yellow-50 transition-colors"
                    onClick={() => setIsKycModalOpen(true)}
                  >
                    Details
                  </button>
                </div>
              </div>

              {/* KYC Verification Details - now always visible */}
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-800">Verification Pending</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Your KYC verification is currently being processed. This typically takes 24-48 hours.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">What happens next:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Document verification (ID, passport, or driver's license)</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Identity confirmation through selfie verification</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Final review and account activation</span>
                    </li>
                  </ul>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> KYC verification is required by financial regulations to ensure secure and compliant investment services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps - Investment Journey */}
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-blue-50 rounded-xl p-8 border border-green-200 shadow-sm">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">🚀 Your Investment Journey Begins!</h3>
          <p className="text-gray-600">Here's what happens next on your path to investment success</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: KYC */}
          <div className="text-center p-4 bg-white rounded-lg border-2 border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-2xl">🆔</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Complete your KYC</h4>
            <p className="text-sm text-gray-600 mb-2">Verify your identity with our secure Know Your Customer process</p>
            <div className="inline-flex items-center text-xs text-green-700 bg-green-50 px-3 py-1 rounded-full font-semibold">
              Step 1
            </div>
          </div>
          {/* Card 2: Asset Review */}
          <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-2xl">👥</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Asset Review</h4>
            <p className="text-sm text-gray-600 mb-2">One of our consultants will check your assets and investment history</p>
            <div className="inline-flex items-center text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full font-semibold">
              Step 2
            </div>
          </div>
          {/* Card 3: Free Buy Offer */}
          <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <span className="text-2xl">🎁</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Free Buy Offer</h4>
            <p className="text-sm text-gray-600 mb-2">Receive exclusive access to our complimentary investment opportunity</p>
            <div className="inline-flex items-center text-xs text-purple-700 bg-purple-50 px-3 py-1 rounded-full font-semibold">
              Step 3
            </div>
          </div>
        </div>
      </div>

      {/* KYC Modal Mount Point */}
      <div id="kyc-container"></div>

      {/* KYC Information Modal - now empty */}
      {isKycModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={() => setIsKycModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">KYC Verification Details</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700 p-1 rounded"
                onClick={() => setIsKycModalOpen(false)}
                aria-label="Close"
              >
                {/* X icon using SVG */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-8">
                This modal is empty.
              </p>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  className="px-6 py-2 bg-yellow-100 text-yellow-900 rounded hover:bg-yellow-200 font-medium"
                  onClick={() => setIsKycModalOpen(false)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
