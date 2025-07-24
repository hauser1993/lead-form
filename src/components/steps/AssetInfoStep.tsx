'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { FileUpload } from '@/components/ui/file-upload'
import { PieChart, Plus, Trash2, Calendar, Hash, DollarSign, FileText, Upload } from 'lucide-react'
import type { FormData } from '../OnboardingWizard'

interface AssetInfoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onValidationChange: (isValid: boolean) => void
  submissionId?: string | null
  onSubmit?: () => void
}

interface Transaction {
  id: string
  transactionDate: string
  quantity: string
  price: string
  notice: string
  proofFile?: File | null
}

export default function AssetInfoStep({ formData, updateFormData, onValidationChange }: AssetInfoStepProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(formData.assets || [])

  useEffect(() => {
    // Validate that we have at least one complete transaction
    const hasValidTransactions = transactions.length > 0 && transactions.every(transaction =>
      transaction.transactionDate.trim() !== '' &&
      transaction.quantity.trim() !== '' &&
      transaction.price.trim() !== ''
    )
    onValidationChange(hasValidTransactions)
  }, [transactions, onValidationChange])

  // Update parent form data whenever transactions change
  useEffect(() => {
    updateFormData({ assets: transactions })
  }, [transactions, updateFormData])

  const addTransaction = () => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      transactionDate: '',
      quantity: '',
      price: '',
      notice: '',
      proofFile: null
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

  const updateTransactionFile = (id: string, file: File | null) => {
    setTransactions(transactions.map(transaction =>
      transaction.id === id ? { ...transaction, proofFile: file } : transaction
    ))
  }

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '')

    // Ensure only one decimal point
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('')
    }

    return numericValue
  }

  const formatNumber = (value: string) => {
    // Remove non-numeric characters except decimal point
    return value.replace(/[^0-9.]/g, '')
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-5 duration-500">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <PieChart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Asset Information</h2>
        <p className="text-gray-600">Please provide details about your investment transactions</p>
      </div>

      <div className="space-y-6 mt-8">
        {/* Transactions Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Investment Transactions</h3>
          <Button
            type="button"
            onClick={addTransaction}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </Button>
        </div>

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Transactions Added</h4>
              <p className="text-gray-600 mb-4">Add your first investment transaction to get started</p>
              <Button onClick={addTransaction} className="flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Transaction</span>
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
                      Transaction #{index + 1}
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
                        Transaction Date *
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
                        Quantity *
                      </Label>
                      <div className="relative">
                        <Input
                          id={`quantity-${transaction.id}`}
                          type="text"
                          placeholder="e.g., 100"
                          value={transaction.quantity}
                          onChange={(e) => updateTransaction(transaction.id, 'quantity', formatNumber(e.target.value))}
                          className="pl-10"
                          required
                        />
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label htmlFor={`price-${transaction.id}`} className="text-sm font-medium text-gray-700">
                        Price per Unit ($) *
                      </Label>
                      <div className="relative">
                        <Input
                          id={`price-${transaction.id}`}
                          type="text"
                          placeholder="e.g., 25.50"
                          value={transaction.price}
                          onChange={(e) => updateTransaction(transaction.id, 'price', formatCurrency(e.target.value))}
                          className="pl-10"
                          required
                        />
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Total Value (Calculated) */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Total Value
                      </Label>
                      <div className="h-12 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600">
                        ${transaction.quantity && transaction.price
                          ? (parseFloat(transaction.quantity) * parseFloat(transaction.price)).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })
                          : '0.00'}
                      </div>
                    </div>

                    {/* Notice */}
                    <div className="space-y-2">
                      <Label htmlFor={`notice-${transaction.id}`} className="text-sm font-medium text-gray-700">
                        Notes <span className="text-gray-400">(Optional)</span>
                      </Label>
                      <Textarea
                        id={`notice-${transaction.id}`}
                        placeholder="Add any additional notes about this transaction..."
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
                        <span>Proof Document <span className="text-gray-400">(Optional)</span></span>
                      </Label>
                      <FileUpload
                        id={`proof-${transaction.id}`}
                        onFileSelect={(file) => updateTransactionFile(transaction.id, file)}
                        selectedFile={transaction.proofFile}
                        placeholder="Upload transaction proof"
                        maxSize={10}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
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
            <strong>📊 Investment Data:</strong> Please provide accurate transaction details for proper portfolio assessment and compliance verification.
          </p>
        </div>

        <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
          <p className="text-sm text-amber-800">
            <strong>📁 File Upload Note:</strong> Uploaded proof documents are temporarily stored. Please ensure all files are uploaded before proceeding, as they won't be preserved if you refresh the page.
          </p>
        </div>
      </div>
    </div>
  )
}
