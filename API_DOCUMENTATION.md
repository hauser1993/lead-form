# Investor Onboarding API Documentation

This document outlines the API endpoints required for the investor onboarding wizard integration with your Laravel application.

## Base URL
```
https://your-laravel-app.com/api
```

## Authentication
All requests should include appropriate authentication headers if required by your Laravel application.

```http
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## API Endpoints

### 1. Create New Submission

Creates a new investor onboarding submission with personal information.

**Endpoint:** `POST /investor/submissions`

**Request Body:**
```json
{
  "step": 1,
  "personal_info": {
    "gender": "male|female|other|prefer-not-to-say",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890"
  }
}
```

**Success Response:** `201 Created`
```json
{
  "id": "uuid-string",
  "status": "draft",
  "step": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Error Response:** `422 Unprocessable Entity`
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "personal_info.email": ["The email field is required."],
    "personal_info.firstName": ["The first name field is required."]
  }
}
```

---

### 2. Update Address Information

Updates the submission with address/location information.

**Endpoint:** `PATCH /investor/submissions/{id}`

**Request Body:**
```json
{
  "step": 2,
  "address_info": {
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "United States"
  }
}
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "status": "draft",
  "step": 2,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 3. Update Asset Information

Updates the submission with asset and financial information.

**Endpoint:** `PATCH /investor/submissions/{id}`

**Request Body:**
```json
{
  "step": 3,
  "asset_info": {
    "annual_income": "100000-250000",
    "net_worth": "500000-1000000",
    "investment_experience": "intermediate",
    "risk_tolerance": "moderate",
    "investment_objectives": ["growth", "income"],
    "liquidity_needs": "low"
  }
}
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "status": "draft",
  "step": 3,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 4. Update KYC Information

Updates the submission with KYC verification information.

**Endpoint:** `PATCH /investor/submissions/{id}`

**Request Body:**
```json
{
  "step": 4,
  "kyc_info": {
    "document_type": "passport|drivers_license|national_id",
    "document_number": "ABC123456",
    "document_expiry": "2030-12-31",
    "document_front_url": "https://...",
    "document_back_url": "https://...",
    "selfie_url": "https://...",
    "verification_status": "pending"
  }
}
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "status": "draft",
  "step": 4,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 5. Update Legal Agreements

Updates the submission with legal agreement acceptances.

**Endpoint:** `PATCH /investor/submissions/{id}`

**Request Body:**
```json
{
  "step": 5,
  "legal_info": {
    "termsAccepted": true,
    "privacyAccepted": true,
    "marketingConsent": false,
    "accepted_at": "2024-01-01T00:00:00Z",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "status": "draft",
  "step": 5,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 6. Submit Final Application

Submits the final application for review.

**Endpoint:** `POST /investor/submissions/{id}/submit`

**Request Body:**
```json
{
  "step": 6,
  "status": "submitted"
}
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "status": "submitted",
  "step": 6,
  "submitted_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 7. Get Submission Details

Retrieves current submission data.

**Endpoint:** `GET /investor/submissions/{id}`

**Success Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "status": "draft|submitted|under_review|approved|rejected",
  "step": 3,
  "form_data": {
    "gender": "male",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "United States",
    "termsAccepted": true,
    "privacyAccepted": true,
    "marketingConsent": false
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 8. Update Any Step (Navigation)

Generic endpoint for updating any step when navigating back/forth.

**Endpoint:** `PATCH /investor/submissions/{id}`

**Request Body:**
```json
{
  "step": 2,
  "form_data": {
    "addressLine1": "456 New Street",
    "city": "Boston"
  }
}
```

**Success Response:** `200 OK`
```json
{
  "id": "uuid-string",
  "status": "draft",
  "step": 2,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Error Responses

### Validation Errors
**Status:** `422 Unprocessable Entity`
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": ["Error message 1", "Error message 2"]
  }
}
```

### Not Found
**Status:** `404 Not Found`
```json
{
  "message": "Submission not found."
}
```

### Server Error
**Status:** `500 Internal Server Error`
```json
{
  "message": "Internal server error occurred."
}
```

## Laravel Implementation Example

### Migration
```php
Schema::create('investor_submissions', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])
          ->default('draft');
    $table->integer('step')->default(1);
    $table->json('personal_info')->nullable();
    $table->json('address_info')->nullable();
    $table->json('asset_info')->nullable();
    $table->json('kyc_info')->nullable();
    $table->json('legal_info')->nullable();
    $table->json('form_data')->nullable();
    $table->timestamp('submitted_at')->nullable();
    $table->timestamps();

    $table->index(['status', 'created_at']);
    $table->index('step');
});
```

### Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class InvestorSubmission extends Model
{
    use HasUuids;

    protected $fillable = [
        'status', 'step', 'personal_info', 'address_info',
        'asset_info', 'kyc_info', 'legal_info', 'form_data',
        'submitted_at'
    ];

    protected $casts = [
        'personal_info' => 'array',
        'address_info' => 'array',
        'asset_info' => 'array',
        'kyc_info' => 'array',
        'legal_info' => 'array',
        'form_data' => 'array',
        'submitted_at' => 'datetime',
    ];
}
```

### Controller Example
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InvestorSubmission;
use Illuminate\Http\Request;

class InvestorSubmissionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'step' => 'required|integer|min:1',
            'personal_info.gender' => 'required|string',
            'personal_info.firstName' => 'required|string|max:255',
            'personal_info.lastName' => 'required|string|max:255',
            'personal_info.email' => 'required|email|unique:investor_submissions,personal_info->email',
            'personal_info.phone' => 'required|string|max:20',
        ]);

        $submission = InvestorSubmission::create($validated);

        return response()->json($submission, 201);
    }

    public function update(Request $request, InvestorSubmission $submission)
    {
        $validated = $request->validate([
            'step' => 'required|integer|min:1',
            'address_info' => 'sometimes|array',
            'asset_info' => 'sometimes|array',
            'kyc_info' => 'sometimes|array',
            'legal_info' => 'sometimes|array',
            'form_data' => 'sometimes|array',
        ]);

        $submission->update($validated);

        return response()->json($submission);
    }

    public function submit(InvestorSubmission $submission)
    {
        $submission->update([
            'status' => 'submitted',
            'step' => 6,
            'submitted_at' => now(),
        ]);

        // Trigger any post-submission processes (emails, notifications, etc.)

        return response()->json($submission);
    }

    public function show(InvestorSubmission $submission)
    {
        return response()->json($submission);
    }
}
```

### Routes
```php
Route::prefix('investor')->group(function () {
    Route::post('submissions', [InvestorSubmissionController::class, 'store']);
    Route::get('submissions/{submission}', [InvestorSubmissionController::class, 'show']);
    Route::patch('submissions/{submission}', [InvestorSubmissionController::class, 'update']);
    Route::post('submissions/{submission}/submit', [InvestorSubmissionController::class, 'submit']);
});
```

## Frontend Integration Notes

- The frontend automatically saves progress to localStorage
- API calls are made on each step navigation (forward/backward)
- The submission ID is persisted across browser sessions
- Toast notifications provide user feedback for all API operations
- Form validation prevents API calls with invalid data
- Loading states prevent multiple simultaneous submissions
- Error handling displays specific validation messages to users

## Security Considerations

- Implement proper authentication and authorization
- Validate file uploads for KYC documents
- Log all submission activities for audit trails
- Implement rate limiting on API endpoints
- Sanitize all input data before storage
- Use HTTPS for all API communications
- Consider implementing CSRF protection for web requests
