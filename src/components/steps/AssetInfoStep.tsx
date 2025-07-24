'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import { PieChart, Plus, Trash2, Calendar, Hash, DollarSign, FileText, Upload, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'
import { apiService } from '@/lib/api'

interface AssetInfoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onValidationChange: (isValid: boolean) => void
  submissionId?: string | null
  onSubmit?: () => void
  language?: 'en' | 'de'
  t?: (key: string, fallback?: string) => string
}

interface UploadedFile {
  fileName: string
  fileUrl: string
}

interface Transaction {
  id: string
  transactionDate: string
  quantity: string
  price: string
  notice: string
  proofFile?: File | null
  uploadedFiles?: UploadedFile[]
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error'
  uploadError?: string
}

export default function AssetInfoStep({ formData, updateFormData, onValidationChange, t = (key, fallback) => fallback || key }: AssetInfoStepProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(formData.assets || [])

  useEffect(() => {
    // Validate that we have at least one complete transaction
    const hasValidTransactions = transactions.length > 0 && transactions.every(transaction =>
      transaction.transactionDate.trim() !== '' &&
      transaction.quantity.trim() !== '' &&
      transaction.price.trim() !== ''
    )
    onValidationChange(hasValidTransactions)
     
    // onValidationChange is stable from parent, safe to omit from deps to prevent infinite loop
  }, [transactions])

  // Update parent form data whenever transactions change
  useEffect(() => {
    updateFormData({ assets: transactions })
     
    // updateFormData is stable from parent, safe to omit from deps to prevent infinite loop
  }, [transactions])

  const addTransaction = () => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      transactionDate: '',
      quantity: '',
      price: '',
      notice: '',
      proofFile: null,
      uploadStatus: 'idle'
    }
    setTransactions([...transactions, newTransaction])
  }

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id))
  }

  const updateTransaction = (id: string, field: keyof Omit<Transaction, 'id'>, value: string) => {
    setTransactions(transactions.map(transaction =>
      transaction.id === id ? { ...transaction, [field]: value } : transaction
    ))
  }

  const updateTransactionFile = async (id: string, file: File | null) => {
    if (!file) {
      // Clear file and reset status - this now just clears the upload state, not existing files
      setTransactions(prevTransactions => prevTransactions.map(transaction =>
        transaction.id === id ? { 
          ...transaction, 
          proofFile: null, 
          uploadStatus: 'idle',
          uploadError: undefined
        } : transaction
      ))
      return
    }

    // Set uploading status 
    setTransactions(prevTransactions => prevTransactions.map(transaction =>
      transaction.id === id ? { 
        ...transaction, 
        proofFile: file, 
        uploadStatus: 'uploading',
        uploadError: undefined
      } : transaction
    ))

    try {
      // Upload the file
      const response = await apiService.uploadFile(file)
      
      if (response.success && response.data) {
        // Add the new file to the uploadedFiles array
        setTransactions(prevTransactions => prevTransactions.map(transaction =>
          transaction.id === id ? { 
            ...transaction, 
            proofFile: null, // Clear the temporary file
            uploadedFiles: [
              ...(transaction.uploadedFiles || []),
              {
                fileName: file.name,
                fileUrl: response.data!.url
              }
            ],
            uploadStatus: 'success',
            uploadError: undefined
          } : transaction
        ))
      } else {
        // Update with error status
        setTransactions(prevTransactions => prevTransactions.map(transaction =>
          transaction.id === id ? { 
            ...transaction, 
            uploadStatus: 'error',
            uploadError: response.message || t('assets.uploadFailed')
          } : transaction
        ))
      }
    } catch (error) {
      // Handle upload error
      setTransactions(prevTransactions => prevTransactions.map(transaction =>
        transaction.id === id ? { 
          ...transaction, 
          uploadStatus: 'error',
          uploadError: t('assets.uploadFailed') + '. Please try again.'
        } : transaction
      ))
    }
  }

  const removeUploadedFile = (transactionId: string, fileIndex: number) => {
    setTransactions(prevTransactions => prevTransactions.map(transaction =>
      transaction.id === transactionId ? {
        ...transaction,
        uploadedFiles: transaction.uploadedFiles?.filter((_, index) => index !== fileIndex) || []
      } : transaction
    ))
  }

  // Helper to format numbers as XXX.XXX,XX (European style)
  function formatEuropeanNumber(value: string | number) {
    if (value === undefined || value === null || value === '') return '';
    let number: number;
    if (typeof value === 'string') {
      // Remove thousands separators and convert comma to dot for decimal
      const cleaned = value.replace(/\./g, '').replace(',', '.');
      number = parseFloat(cleaned);
    } else {
      number = value;
    }
    if (isNaN(number)) return '';
    return number.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <PieChart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">{t('assets.title')}</h2>
        <p className="text-gray-600">{t('assets.subtitle')}</p>
      </div>

      <div className="space-y-6 mt-8">
        {/* Transactions Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t('assets.transactionsTitle')}</h3>
          <Button
            type="button"
            onClick={addTransaction}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('assets.addTransaction')}</span>
          </Button>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">{t('assets.noTransactions')}</h4>
              <p className="text-gray-600 mb-4">{t('assets.noTransactionsDescription')}</p>
              <Button onClick={addTransaction} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>{t('assets.addTransaction')}</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction, index) => (
              <Card key={transaction.id} className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      {t('assets.transactionNumber')}{index + 1}
                    </h4>
                    <Button
                      type="button"
                      onClick={() => removeTransaction(transaction.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Transaction Date */}
                    <div className="space-y-2">
                      <Label htmlFor={`date-${transaction.id}`} className="text-sm font-medium text-gray-700">
                        {t('assets.transactionDate')} {t('required')}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`date-${transaction.id}`}
                          type="date"
                          value={transaction.transactionDate}
                          onChange={(e) => updateTransaction(transaction.id, 'transactionDate', e.target.value)}
                          className="pl-10"
                          required
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor={`quantity-${transaction.id}`} className="text-sm font-medium text-gray-700">
                        {t('assets.quantity')} {t('required')}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`quantity-${transaction.id}`}
                          type="text"
                          placeholder={t('assets.quantity.placeholder')}
                          value={transaction.quantity}
                          onChange={(e) => {
                            // Remove formatting for internal state
                            const raw = e.target.value.replace(/\./g, '').replace(',', '.');
                            updateTransaction(transaction.id, 'quantity', raw);
                          }}
                          onBlur={(e) => {
                            // Format for display
                            updateTransaction(transaction.id, 'quantity', formatEuropeanNumber(e.target.value));
                          }}
                          className="pl-10"
                          required
                        />
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor={`price-${transaction.id}`} className="text-sm font-medium text-gray-700">
                        {t('assets.price')} {t('required')}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`price-${transaction.id}`}
                          type="text"
                          placeholder={t('assets.price.placeholder')}
                          value={transaction.price}
                          onChange={(e) => {
                            // Remove formatting for internal state
                            const raw = e.target.value.replace(/\./g, '').replace(',', '.');
                            updateTransaction(transaction.id, 'price', raw);
                          }}
                          onBlur={(e) => {
                            // Format for display
                            updateTransaction(transaction.id, 'price', formatEuropeanNumber(e.target.value));
                          }}
                          className="pl-10"
                          required
                        />
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Total Value (Calculated) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {t('assets.totalValue')}
                      </Label>
                      <div className="h-12 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600">
                        {transaction.quantity && transaction.price
                          ? formatEuropeanNumber(
                              parseFloat(transaction.quantity.replace(/\./g, '').replace(',', '.')) *
                              parseFloat(transaction.price.replace(/\./g, '').replace(',', '.'))
                            )
                          : '0,00'} €
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="space-y-2">
                      <Label htmlFor={`notice-${transaction.id}`} className="text-sm font-medium text-gray-700">
                        {t('assets.notes')} <span className="text-gray-400">{t('address.optional')}</span>
                      </Label>
                      <Textarea
                        id={`notice-${transaction.id}`}
                        placeholder={t('assets.notes.placeholder')}
                        value={transaction.notice}
                        onChange={(e) => updateTransaction(transaction.id, 'notice', e.target.value)}
                        className="min-h-[80px] resize-none"
                        rows={3}
                      />
                    </div>

                    {/* Proof Document Upload */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>{t('assets.proofDocument')} <span className="text-gray-400">{t('address.optional')}</span></span>
                      </Label>
                      
                      {/* Uploaded Files List */}
                      {transaction.uploadedFiles && transaction.uploadedFiles.length > 0 && (
                        <div className="space-y-2">
                          {transaction.uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {file.fileName.toLowerCase().includes('.pdf') ? (
                                    <FileText className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-green-900 truncate">
                                    {file.fileName}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <a 
                                  href={file.fileUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                                >
                                  {t('assets.view')}
                                </a>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeUploadedFile(transaction.id, index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Upload Status Card for current upload */}
                      {transaction.uploadStatus === 'uploading' && (
                        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">
                                {transaction.proofFile?.name}
                              </p>
                              <p className="text-xs text-blue-600">{t('assets.uploading')}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error Status Card */}
                      {transaction.uploadStatus === 'error' && (
                        <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                          <div className="flex items-center space-x-3">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-900">
                                {transaction.proofFile?.name || t('assets.uploadFailed')}
                              </p>
                              <p className="text-xs text-red-600">
                                {transaction.uploadError || t('assets.uploadFailed')}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => updateTransactionFile(transaction.id, null)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      {/* Upload new file area */}
                      {(!transaction.uploadStatus || transaction.uploadStatus === 'idle' || transaction.uploadStatus === 'success') && (
                        <FileUpload
                          id={`proof-${transaction.id}`}
                          onFileSelect={(file) => updateTransactionFile(transaction.id, file)}
                          selectedFile={transaction.proofFile}
                          placeholder={transaction.uploadedFiles && transaction.uploadedFiles.length > 0 ? t('assets.uploadAdditional') : t('assets.uploadProof')}
                          maxSize={10}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}


      </div>

      <div className="mt-8 space-y-3">
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-sm text-purple-800">
            <strong>📊 {t('assets.investmentNotice')}</strong> {t('assets.investmentDescription')}
          </p>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-100">
          <p className="text-sm text-green-800">
            <strong>📁 {t('assets.fileUploadNotice')}</strong> {t('assets.fileUploadDescription')}
          </p>
        </div>
      </div>
    </div>
  )
}
