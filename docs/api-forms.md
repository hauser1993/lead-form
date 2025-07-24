# Enhanced API Forms Documentation

## Overview

This document outlines the enhanced API integration for the investor onboarding form system, including new reliability features, error handling, and auto-save functionality.

## Key Improvements

### 1. **Enhanced Error Handling & Retry Logic**
- **Automatic Retry**: Failed requests are automatically retried up to 3 times with exponential backoff
- **Smart Rate Limiting**: Handles 429 responses with proper retry delays
- **Network Resilience**: Graceful handling of network timeouts and connectivity issues
- **Request Timeout**: 30-second timeout with abort controller for better UX

### 2. **Auto-Save Functionality**
- **Debounced Auto-Save**: Automatically saves form data after 2 seconds of inactivity
- **Data Deduplication**: Only saves when data actually changes
- **Offline Support**: Queues saves when offline and syncs when connection is restored
- **Visual Feedback**: Real-time save status indicators for users

### 3. **Connectivity Management**
- **Online/Offline Detection**: Real-time monitoring of connection status
- **Connection Restoration**: Automatic sync when connection is restored
- **Health Checks**: Regular API health monitoring
- **Graceful Degradation**: Continues working offline with localStorage backup

### 4. **Enhanced User Experience**
- **Smart Navigation**: Prevents data loss during step navigation
- **Progress Persistence**: Reliable restoration of user progress
- **Validation Sync**: Better coordination between frontend and backend validation
- **Loading States**: Clear feedback for all async operations

### 5. **Multiple File Upload System**
- **Multiple Proof Documents**: Upload multiple files per transaction
- **Individual File Management**: View, remove, or replace specific files
- **Real-time Upload Status**: Visual feedback for each upload
- **File Type Validation**: Restricted to JPG, JPEG, PNG, and PDF files
- **Size Limits**: Maximum 10MB per file
- **Secure Storage**: Files stored with random filenames in `/uploads/` directory

## API Endpoints

### Core Submission Endpoints

#### Create Submission (Step 1)
```typescript
POST /api/submissions
Content-Type: application/json

{
  "step": 1,
  "personal_info": {
    "gender": "male" | "female" | "other" | "prefer-not-to-say",
    "firstName": "string",
    "lastName": "string", 
    "email": "string",
    "phone": "string",
    "birthdate": "YYYY-MM-DD",
    "nationality": "string"
  }
}
```

#### Update Submission (Steps 2-5)
```typescript
PATCH /api/submissions/{id}
Content-Type: application/json

// Step 2 - Address Information
{
  "step": 2,
  "address_info": {
    "addressLine1": "string",
    "addressLine2": "string?",
    "city": "string",
    "state": "string", 
    "postalCode": "string",
    "country": "string"
  }
}

// Step 3 - Asset Information
{
  "step": 3,
  "asset_info": {
    "assets": [
      {
        "id": "string",
        "transactionDate": "YYYY-MM-DD",
        "quantity": "string",
        "price": "string", 
        "notice": "string",
        "uploadedFiles": [
          {
            "fileName": "string",
            "fileUrl": "string"
          }
        ]
      }
    ]
  }
}

// Step 4 - Legal Agreements
{
  "step": 4,
  "legal_info": {
    "termsAccepted": boolean,
    "privacyAccepted": boolean,
    "marketingConsent": boolean
  }
}
```

### New Enhanced Endpoints

#### Auto-Save (NEW)
```typescript
PATCH /api/submissions/{id}/autosave
Content-Type: application/json

{
  "step": number,
  "form_data": FormData,
  "is_autosave": true
}
```

#### Step Validation (NEW)
```typescript
POST /api/submissions/validate
Content-Type: application/json

{
  "step": number,
  "form_data": FormData
}

Response:
{
  "valid": boolean,
  "errors"?: Record<string, string[]>
}
```

#### Health Check (NEW)
```typescript
GET /api/health

Response:
{
  "status": "ok"
}
```

#### File Upload (NEW)
```typescript
POST /api/upload
Content-Type: multipart/form-data

FormData:
- file: File (JPG, JPEG, PNG, PDF only, max 10MB)

Response:
{
  "success": boolean,
  "data": {
    "url": "/uploads/{randomfilename}.{ext}",
    "filename": "string"
  },
  "message"?: "string"
}
```

#### Final Submission
```typescript
POST /api/submissions/{id}/submit
Content-Type: application/json

{
  "step": 5,
  "status": "submitted"
}
```

## Error Handling

### Standard Response Format
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}
```

### HTTP Status Codes
- **200**: Success
- **201**: Created successfully  
- **422**: Validation errors
- **429**: Rate limited (with Retry-After header)
- **500**: Server error
- **408**: Request timeout

### Retry Logic
- **Retryable Errors**: 429 (rate limit), 5xx (server errors), 408 (timeout), network errors
- **Max Attempts**: 3 retries
- **Backoff Strategy**: Exponential with jitter (1s, 2s, 4s + random)
- **Max Delay**: 10 seconds

## Form State Management

### localStorage Keys
- `investor_submission_id`: Current submission UUID
- `investor_current_step`: Current step number (1-5)
- `investor_form_data`: Serialized form data
- `investor_completed_steps`: Array of completed step numbers

## Data Structures

### Transaction Interface
```typescript
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
  uploadedFiles?: UploadedFile[]
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error'
  uploadError?: string
}
```

### File Upload States
- **idle**: No upload in progress, ready for new file
- **uploading**: File upload in progress with loading indicator
- **success**: File uploaded successfully, added to uploadedFiles array
- **error**: Upload failed, showing error message

### Auto-Save Behavior
1. **Trigger**: 2 seconds after user stops typing/changing data
2. **Conditions**: Only when online, submission exists, not on welcome step
3. **Deduplication**: Only saves if data actually changed
4. **Fallback**: localStorage backup if API fails

### Data Synchronization
- **On Load**: Attempts to restore from localStorage
- **On Save**: Updates both API and localStorage
- **On Reconnect**: Syncs unsaved changes automatically
- **On Submit**: Clears all localStorage data

## Usage Examples

### Basic API Service Usage
```typescript
import { apiService } from '@/lib/api'

// Create new submission
const response = await apiService.createSubmission(personalData)
if (response.success) {
  const submissionId = response.data.id
}

// Update with auto-retry
const updateResponse = await apiService.updateAddressInfo(submissionId, addressData)
// Automatically retries on failure with exponential backoff
```

### Error Handling Patterns
```typescript
try {
  const response = await apiService.updateAssetInfo(submissionId, assets)
  if (!response.success) {
    // Handle API errors
    toast.error(response.message)
    if (response.errors) {
      Object.entries(response.errors).forEach(([field, messages]) => {
        toast.error(`${field}: ${messages.join(', ')}`)
      })
    }
  }
} catch (error) {
  // Handle network/unexpected errors
  toast.error('Network error occurred')
}
```

### Auto-Save Integration
```typescript
// In component
const updateFormData = (data: Partial<FormData>) => {
  setFormData(prev => ({ ...prev, ...data }))
  setHasUnsavedChanges(true) // Triggers auto-save after 2s
}
```

### File Upload Usage
```typescript
// Upload a file
const uploadFile = async (file: File) => {
  const response = await apiService.uploadFile(file)
  if (response.success) {
    // File uploaded successfully
    const fileUrl = response.data.url
    const fileName = response.data.filename
    
    // Add to transaction's uploadedFiles array
    updateTransaction(transactionId, {
      uploadedFiles: [
        ...transaction.uploadedFiles,
        { fileName: file.name, fileUrl }
      ]
    })
  }
}

// Multiple file management
const removeFile = (transactionId: string, fileIndex: number) => {
  setTransactions(prev => prev.map(transaction =>
    transaction.id === transactionId ? {
      ...transaction,
      uploadedFiles: transaction.uploadedFiles?.filter((_, index) => index !== fileIndex)
    } : transaction
  ))
}
```

## Backend Requirements

### Required Laravel Controller Updates

The following methods need to be implemented in `FormApiController.php`:

```php
// Handle steps 3-5 in the update method
public function update(Request $request, $id) {
    $step = $request->input('step');
    
    switch ($step) {
        case 2:
            return $this->updateAddressInfo($request, $submission);
        case 3:
            return $this->updateAssetInfo($request, $submission);
        case 4:
            return $this->updateLegalInfo($request, $submission);
        default:
            return response()->json(['message' => 'Invalid step'], 422);
    }
}

// Auto-save endpoint
public function autoSave(Request $request, $id) {
    // Handle lightweight auto-save operations
}

// Validation endpoint  
public function validate(Request $request) {
    // Validate step data without saving
}

// Health check endpoint
public function health() {
    return response()->json(['status' => 'ok']);
}

// Submit endpoint
public function submit(Request $request, $id) {
    // Handle final submission
}

// File upload endpoint
public function upload(Request $request) {
    // Handle file uploads with validation
    // Store in public/uploads/ with random filename
    // Return file URL for frontend use
}
```

### Rate Limiting Adjustments
```php
// In routes/api.php - Increase rate limits for better UX
Route::middleware(['throttle:30,1'])->group(function () {
    Route::post('submissions', [FormApiController::class, 'store']);
    Route::patch('submissions/{id}', [FormApiController::class, 'update']);
    Route::patch('submissions/{id}/autosave', [FormApiController::class, 'autoSave']);
});

Route::middleware(['throttle:60,1'])->group(function () {
    Route::get('submissions/{id}', [FormApiController::class, 'show']);
    Route::post('submissions/validate', [FormApiController::class, 'validate']);
    Route::get('health', [FormApiController::class, 'health']);
});

Route::middleware(['throttle:20,1'])->group(function () {
    Route::post('upload', [FormApiController::class, 'upload']);
});
```

## Security Considerations

### Input Validation
- All input is sanitized using `strip_tags()` and appropriate filters
- Email validation uses `FILTER_SANITIZE_EMAIL`
- Phone numbers stripped of non-numeric/formatting characters
- Date validation ensures reasonable birthdate ranges

### Rate Limiting
- Submission creation: 30/minute (increased from 10)
- Updates: 30/minute (increased from 15)
- Auto-save: Higher limits for better UX
- Validation: 60/minute for real-time feedback

### Data Protection
- UUIDs used for submission IDs
- Sensitive data not logged
- File uploads properly validated
- CSRF protection maintained

### File Upload Security
- **File Type Validation**: Only JPG, JPEG, PNG, and PDF files allowed
- **File Size Limits**: Maximum 10MB per file
- **Random Filenames**: 26-character random strings prevent enumeration attacks
- **Secure Storage**: Files stored in `public/uploads/` with direct URL access
- **MIME Type Checking**: Server-side validation of actual file content
- **Upload Directory**: Automatically created if it doesn't exist

## Performance Optimizations

### Frontend
- **Debounced Auto-Save**: Prevents excessive API calls
- **Request Deduplication**: Only saves changed data
- **Local Storage Backup**: Instant feedback, API sync in background
- **Retry with Backoff**: Prevents server overload during issues

### Backend Recommendations
- **Database Indexing**: Index on submission UUID and status
- **Caching**: Cache form configurations and validation rules
- **Background Jobs**: Move heavy operations to queues
- **Response Compression**: Enable gzip for API responses

## Monitoring & Debugging

### Frontend Logging
```typescript
// Enable detailed logging
console.log('🎯 Current state:', {
  currentStep,
  submissionId,
  isStepValid,
  isOnline,
  hasUnsavedChanges,
  completedSteps
})
```

### Error Tracking
- All API failures are logged with context
- Network issues tracked separately from server errors
- Auto-save failures logged but don't interrupt user flow
- Retry attempts logged for debugging

### Key Metrics to Monitor
- Auto-save success rate
- API retry frequency
- Average form completion time
- Step abandonment rates
- Error frequency by step 