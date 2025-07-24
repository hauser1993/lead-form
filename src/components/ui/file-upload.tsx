import * as React from "react"
import { Upload, X, FileText, Image, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

interface FileUploadProps {
  id?: string
  onFileSelect: (file: File | null) => void
  selectedFile?: File | null
  className?: string
  accept?: string
  maxSize?: number // in MB
  placeholder?: string
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ id, onFileSelect, selectedFile, className, accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx", maxSize = 5, placeholder = "Upload proof document", ...props }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const validateFile = (file: File): string | null => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        return `File size must be less than ${maxSize}MB`
      }

      // Check file type
      const allowedTypes = accept.split(',').map(type => type.trim())
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      const isValidType = allowedTypes.some(type =>
        type === fileExtension ||
        (type.startsWith('.') && fileExtension === type)
      )

      if (!isValidType) {
        return `File type not supported. Allowed: ${allowedTypes.join(', ')}`
      }

      return null
    }

    const handleFileSelect = (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      onFileSelect(file)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
    }

    const handleRemoveFile = () => {
      setError(null)
      onFileSelect(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }

    const getFileIcon = (fileName: string) => {
      const extension = fileName.split('.').pop()?.toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
        return <Image className="w-4 h-4" />
      }
      if (['pdf'].includes(extension || '')) {
        return <FileText className="w-4 h-4" />
      }
      return <File className="w-4 h-4" />
    }

    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    return (
      <div className={cn("space-y-2", className)}>
        {!selectedFile ? (
          <div
            className={cn(
              "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              id={id}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              {...props}
            />
            <div className="space-y-2">
              <Upload className="w-8 h-8 mx-auto text-gray-400" />
              <div className="text-sm">
                <span className="font-medium text-gray-900">{placeholder}</span>
                <p className="text-gray-600 mt-1">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supported: PDF, JPG, PNG, DOC (max {maxSize}MB)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {getFileIcon(selectedFile.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
            {error}
          </p>
        )}
      </div>
    )
  }
)

FileUpload.displayName = "FileUpload"

export { FileUpload }
