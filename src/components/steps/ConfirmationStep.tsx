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
    // remoteUrl: 'https://example.com/translations.json',
    overrides: {
      "en": {
        "welcome": {
          "title": "Verify your identity",
          "button": "Choose document type",
          "description": "We need some information to help us confirm your identity.",
          "tip": "Verifying usually takes a few hours."
        },
        "qrcode": {
          "title": "Continue on your mobile",
          "description": "To continue, please scan this QR code with your phone. You will complete the next steps on your mobile device.",
          "button": "Continue on this device"
        },
        "document-selection": {
          "title": "Upload ID",
          "description": "Choose the document type you would like to identify with",
          "tip": "Choose document type"
        },
        "document-options": {
          "passport-title": "Passport",
          "passport-description": "Your official travel document.",
          "id_card-title": "ID Card",
          "id_card-description": "Government-issued personal ID.",
          "drivers_license-title": "Drivers license",
          "drivers_license-description": "Government-issued Drivers license",
          "voter_id-title": "Voter ID",
          "voter_id-description": "Government-issued Voter ID"
        },
        "document-start": {
          "title": "Document",
          "button": "Take a picture",
          "description": "Please take a picture of your document. Make sure its fully visible inside the picture.",
          "operating_license": {
            "title": "Operating license",
            "button": "Take a picture",
            "description": "Please take a picture of your business’s operating license. Make sure the document is fully visible inside the picture."
          },
          "business_registration": {
            "title": "Business Registration",
            "button": "Take a picture",
            "description": "Please take a picture of your business registration document. Make sure the document is fully visible inside the picture."
          },
          "proof_of_business_tax_id": {
            "title": "TIN ID / Certificate",
            "button": "Take a picture",
            "description": "Please take a picture of your business TIN ID or certificate. Make sure the document is fully visible inside the picture."
          },
          "bank_statement": {
            "title": "Bank Statement/Letter",
            "button": "Take a picture",
            "description": "Please take a picture of a bank statement or of a letter from the bank. Make sure the document is fully visible inside the picture."
          }
        },
        "document-photo": {
          "title": "Document Upload",
          "description": "Place the document inside the frame and take a picture. Make sure it is not cut or has any glare.",
          "id_card": {
            "title": "Upload ID",
            "description": "Place your ID inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "passport": {
            "title": "Passport",
            "description": "Place your passport inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "voter_id": {
            "title": "Voter ID front side",
            "description": "Place your voter card inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "ife_card": {
            "title": "IFE card front side",
            "description": "Place your IFE card inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "ine_card": {
            "title": "INE card front side",
            "description": "Place your INE card inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "drivers_license": {
            "title": "Drivers license",
            "description": "Place your drivers license inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "proof_of_business_tax_id": {
            "title": "Business TIN ID/certificate",
            "description": "Place the business TIN ID/certificate inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "bank_statement": {
            "title": "Bank Statement/Letter",
            "description": "Place the bank Statement/letter inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "business_registration": {
            "title": "Business Registration",
            "description": "Place the business registration document inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "operating_license": {
            "title": "Operating license",
            "description": "Place the operating license document inside the frame and take a picture. Make sure it is not cut or has any glare."
          }
        },
        "document-photo-back": {
          "passport": {
            "title": "Passport back side",
            "description": "Place the back side of your Passport card inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "id_card": {
            "title": "ID Card back side",
            "description": "Place the back side of your ID Card inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "voter_id": {
            "title": "Voter ID back side",
            "description": "Place the back side of your Voter ID inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "ife_card": {
            "title": "IFE card back side",
            "description": "Place the back side of your IFE card inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "ine_card": {
            "title": "INE card back side",
            "description": "Place the back side of your INE card inside the frame and take a picture. Make sure it is not cut or has any glare."
          },
          "drivers_license": {
            "title": "Drivers license back side",
            "description": "Place the back side of your Drivers license inside the frame and take a picture. Make sure it is not cut or has any glare."
          }
        },
        "check-document": {
          "title": "Review picture",
          "description": "Make sure the information is seen clearly, with no blur or glare."
        },
        "document-photo-back-start": {
          "title": "ID back side",
          "description": "Please take a picture of the back side of your ID",
          "button": "Take photo",
          "voter_id": {
            "description": "Please take a picture of the back side of your Voter ID",
            "title": "Voter ID back side"
          },
          "drivers_license": {
            "title": "Drivers license back side",
            "description": "Please take a picture of the back side of your Drivers license"
          }
        },
        "check-document-photo-back": {
          "title": "Review picture",
          "description": "Make sure the information is seen clearly, with no blur or glare."
        },
        "navigation-buttons": {
          "next": "Looks good",
          "back": "Take again"
        },
        "selfie-start": {
          "title": "Selfie",
          "button": "Take a selfie",
          "description": "Make sure your face is clear and is fully inside the frame."
        },
        "selfie": {
          "title": "Selfie",
          "description": "Place your face inside the frame and take a picture. Make sure it is clearly visible."
        },
        "check-selfie": {
          "title": "Review picture",
          "description": "Make sure your face is clearly visible and fits inside the frame."
        },
        "final": {
          "title": "Successfully Uploaded",
          "description": "Your documents got successfully uploaded, you will receive an email when we verified your identity.",
          "button": "Close Window"
        },
        "loader": {
          "text-one": "We are currently uploading your documents",
          "text-two": "This may take a few seconds",
          "text-three": "Taking more than usual"
        },
        "resubmission": {
          "201-title": "Missing images",
          "201-button": "Retry uploading",
          "201-description": "It seems like you haven&#039;t sent us all of the images we need in order to verify you. Please retry uploading the images.",
          "204-title": "Couldn’t verify the images",
          "204-button": "Retry uploading",
          "204-description": "The image of the document you have sent us was in bad quality. Please retry uploading the images",
          "205-title": "Couldn’t verify the images",
          "205-button": "Retry uploading",
          "205-description": "The document you have sent us seems to be damaged, please retry uploading using a different document.",
          "206-title": "Unsupported document",
          "206-button": "Choose different document",
          "206-description": "The document you have sent us was not supported. Please take a photo of a valid document.",
          "207-title": "Expired document",
          "207-button": "Retry uploading",
          "207-description": "The document you have sent seems to be expired. Please take a photo of a valid document.",
          "606-title": "Unclear selfie",
          "606-button": "Retry uploading",
          "606-description": "It seems like the photo of your face was not clear, please try again.",
          "614-title": "Document not fully visible",
          "614-button": "Retry uploading",
          "614-description": "The document you have sent is not fully inside the picture.",
          "615-title": "Back side not fully visible",
          "615-button": "Retry uploading",
          "615-description": "The back side of the document you have sent is not fully inside the picture."
        },
        "loading": {
          "review-hint": "Uploading your document"
        },
        "decline": {
          "title": "Failed to verify",
          "button": "Close",
          "description": "It seems like there was an issue verifying your documents."
        },
        "error": {
          "title": "Failed to verify",
          "button": "Close"
        },
        "timeout": {
          "title": "Something went wrong",
          "button": "Close",
          "description": "It seems like there was an issue verifiying your documents."
        },
        "general": {
          "online": "You are online!",
          "offline": "You are offline, please check your connection",
          "errorDocuments": "Error sending documents",
          "errorDocumentVerification": "Error document verification",
          "errorCameraAccess": "Cannot access your device&#039;s camera. To proceed, go to the app&#039;s settings and enable camera permissions."
        }
      }
    }
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
  }, [onValidationChange])

  // Mount Ballerine SDK only when modal is open and submissionId is present
  useEffect(() => {
    if (isKycModalOpen && submissionId) {
      // Wait for the modal and #kyc-container to be in the DOM
      const mountKyc = async () => {
        const { flows } = await import('@ballerine/web-ui-sdk');
        await flows.init(ballerineInitConfig(submissionId));
        // Defensive: check if container exists
        const container = document.getElementById('kyc-container');
        if (container) {
          flows.mount({
            flowName: 'kyc-mobile',
            elementId: 'kyc-container',
            useModal: false,
          });
        }
      };
      mountKyc();
    }
  }, [isKycModalOpen, submissionId]);

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
      <div className="rounded-2xl bg-green-50 border border-gray-200 p-6 flex flex-col items-center mb-8">
        <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-white">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold text-green-900 mb-2">
          {t('confirmation.title', 'Application Submitted!')}
        </h2>
        <p className="text-lg text-green-800 max-w-xl mx-auto">
          {t('confirmation.description', 'Please review your details and complete the KYC process to continue.')}
        </p>
      </div>
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

      {/* KYC Information Modal - now contains the mount point */}
      {isKycModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          // No backdrop
        >
          {/* Fullscreen KYC container */}
          <div className="relative w-full h-full max-w-none max-h-none p-0 m-0">
            {/* Close button overlayed in top-right */}
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-2 rounded z-10 bg-white/80"
              onClick={() => setIsKycModalOpen(false)}
              aria-label="Close"
            >
              <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
            <div id="kyc-container" className="w-full h-full" />
          </div>
        </div>
      )}

    </div>
  )
}
