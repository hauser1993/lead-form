'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, User, MapPin, Clock, ArrowRight, Scale, PieChart } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'

interface ConfirmationStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onValidationChange: (isValid: boolean) => void
  submissionId?: string | null
  onSubmit?: () => void
}

export default function ConfirmationStep({ formData, onValidationChange, submissionId, onSubmit }: ConfirmationStepProps) {

  useEffect(() => {
    // Confirmation step is always valid
    onValidationChange(true)
  }, []) // Removed onValidationChange to prevent infinite loops

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit()
    } else {
      console.log('Investor application submitted:', formData)
      alert('Thank you! Your investor application has been submitted successfully. Our team will review your information and contact you within 2-3 business days.')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-700">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Review & Confirm</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Please review your information before submitting your investor application.
        </p>
      </div>

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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-purple-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {formData.assets.length}
                      </div>
                      <div className="text-gray-600">Transactions</div>
                    </div>
                    <div className="bg-pink-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-pink-600">
                        {formData.assets.reduce((sum, asset) => {
                          const quantity = parseFloat(asset.quantity) || 0
                          return sum + quantity
                        }, 0).toLocaleString()}
                      </div>
                      <div className="text-gray-600">Total Quantity</div>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg text-center">
                      <div className="text-lg font-bold text-indigo-600">
                        ${formData.assets.reduce((sum, asset) => {
                          const quantity = parseFloat(asset.quantity) || 0
                          const price = parseFloat(asset.price) || 0
                          return sum + (quantity * price)
                        }, 0).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                      <div className="text-gray-600">Total Value</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Recent Transactions:</span>
                    <div className="mt-2 space-y-2">
                      {formData.assets.slice(0, 3).map((asset, index) => (
                        <div key={asset.id} className="py-2 px-3 bg-gray-50 rounded-lg border">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium">{new Date(asset.transactionDate).toLocaleDateString()}</span>
                            <span>{asset.quantity} units @ ${asset.price}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              Total: ${(parseFloat(asset.quantity) * parseFloat(asset.price)).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                            {asset.proofFile ? (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Proof uploaded
                              </span>
                            ) : (
                              <span className="text-amber-600">No proof document</span>
                            )}
                          </div>
                        </div>
                      ))}
                      {formData.assets.length > 3 && (
                        <div className="text-center text-gray-500 text-xs">
                          +{formData.assets.length - 3} more transactions
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      <span className="font-medium">Document Status:</span>
                      {' '}
                      {formData.assets.filter(asset => asset.proofFile).length} of {formData.assets.length} transactions have proof documents
                    </div>
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

      {/* Legal Disclaimer */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong>Important:</strong> By submitting this application, you acknowledge that you have read and agree to our
          Terms of Service and Privacy Policy. All investments carry risk, and past performance does not guarantee future results.
          Please ensure you understand the risks before investing.
        </p>
      </div>

      {/* Submit Button */}
      <div className="text-center pt-4">
        <Button
          onClick={handleSubmit}
          size="lg"
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Submit Application
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
        <p className="text-sm text-gray-500 mt-3">
          You'll receive a confirmation email shortly after submission
        </p>
      </div>
    </div>
  )
}
