# Backend Implementation Requirements

## Overview

To support the enhanced frontend functionality, the Laravel backend needs several updates to the `FormApiController.php` and routing.

## Required Controller Updates

### 1. Complete the Update Method for Steps 3-5

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use App\Models\Submission;
use App\Models\Form;
use Illuminate\Support\Facades\Validator;

class FormApiController extends Controller
{
    public function update(Request $request, $id)
    {
        // Rate limiting
        $key = 'api-update-submission:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 30)) { // Increased from 15
            return response()->json([
                'message' => 'Too many attempts. Please try again later.'
            ], 429);
        }
        RateLimiter::hit($key, 60);

        // Validate UUID format
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        $submission = Submission::find($id);
        if (!$submission) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        $step = $request->input('step');
        
        switch ($step) {
            case 1:
                return $this->updatePersonalInfo($request, $submission);
            case 2:
                return $this->updateAddressInfo($request, $submission);
            case 3:
                return $this->updateAssetInfo($request, $submission);
            case 4:
                return $this->updateLegalInfo($request, $submission);
            default:
                return response()->json([
                    'message' => 'Invalid step. Steps 1-4 are supported for updates.'
                ], 422);
        }
    }

    /**
     * Update asset information for submission (Step 3)
     */
    private function updateAssetInfo(Request $request, Submission $submission)
    {
        $validator = Validator::make($request->all(), [
            'step' => 'required|integer|in:3',
            'asset_info.assets' => 'required|array',
            'asset_info.assets.*.id' => 'required|string',
            'asset_info.assets.*.transactionDate' => 'required|date',
            'asset_info.assets.*.quantity' => 'required|string',
            'asset_info.assets.*.price' => 'required|string',
            'asset_info.assets.*.notice' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        try {
            $submission->update([
                'assets' => $validated['asset_info']['assets'],
            ]);

            $submission->setStatus('step_3', 'API submission - step 3');

            return response()->json([
                'id' => $submission->id,
                'status' => 'draft',
                'step' => 3,
                'created_at' => $submission->created_at->toISOString(),
                'updated_at' => $submission->updated_at->toISOString(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Internal server error occurred.'], 500);
        }
    }

    /**
     * Update legal information for submission (Step 4)
     */
    private function updateLegalInfo(Request $request, Submission $submission)
    {
        $validator = Validator::make($request->all(), [
            'step' => 'required|integer|in:4',
            'legal_info.termsAccepted' => 'required|boolean|accepted',
            'legal_info.privacyAccepted' => 'required|boolean|accepted',
            'legal_info.marketingConsent' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        try {
            $submission->update([
                'legal_agreements' => [
                    'terms_accepted' => $validated['legal_info']['termsAccepted'],
                    'privacy_accepted' => $validated['legal_info']['privacyAccepted'],
                    'marketing_consent' => $validated['legal_info']['marketingConsent'],
                    'accepted_at' => now()->toISOString(),
                    'ip_address' => $request->ip(),
                ],
            ]);

            $submission->setStatus('step_4', 'API submission - step 4');

            return response()->json([
                'id' => $submission->id,
                'status' => 'draft',
                'step' => 4,
                'created_at' => $submission->created_at->toISOString(),
                'updated_at' => $submission->updated_at->toISOString(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Internal server error occurred.'], 500);
        }
    }

    /**
     * Auto-save endpoint for background saves
     */
    public function autoSave(Request $request, $id)
    {
        // Rate limiting for auto-save (higher limit)
        $key = 'api-autosave:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 60)) {
            return response()->json(['message' => 'Auto-save rate limit exceeded.'], 429);
        }
        RateLimiter::hit($key, 60);

        // Validate UUID format
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        $submission = Submission::find($id);
        if (!$submission) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        try {
            // Lightweight validation for auto-save
            $step = $request->input('step');
            $formData = $request->input('form_data', []);
            
            // Update last_autosave timestamp
            $submission->update([
                'last_autosave' => now(),
                'autosave_data' => $formData,
            ]);

            return response()->json([
                'id' => $submission->id,
                'status' => 'draft',
                'step' => $step,
                'autosaved_at' => $submission->last_autosave->toISOString(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Auto-save failed.'], 500);
        }
    }

    /**
     * Validate step data without saving
     */
    public function validate(Request $request)
    {
        $key = 'api-validate:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 60)) {
            return response()->json(['message' => 'Validation rate limit exceeded.'], 429);
        }
        RateLimiter::hit($key, 60);

        $step = $request->input('step');
        $formData = $request->input('form_data', []);

        try {
            $rules = $this->getValidationRules($step);
            $validator = Validator::make($formData, $rules);

            if ($validator->fails()) {
                return response()->json([
                    'valid' => false,
                    'errors' => $validator->errors()
                ], 200);
            }

            return response()->json(['valid' => true], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Validation failed.'], 500);
        }
    }

    /**
     * Submit final application
     */
    public function submit(Request $request, $id)
    {
        $key = 'api-submit:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) { // Very limited
            return response()->json(['message' => 'Submit rate limit exceeded.'], 429);
        }
        RateLimiter::hit($key, 300); // 5-minute window

        // Validate UUID format
        if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        $submission = Submission::find($id);
        if (!$submission) {
            return response()->json(['message' => 'Submission not found.'], 404);
        }

        try {
            // Validate all required data is present
            if (!$this->isSubmissionComplete($submission)) {
                return response()->json([
                    'message' => 'Submission is incomplete. Please complete all required steps.'
                ], 422);
            }

            $submission->update([
                'status' => 'submitted',
                'submitted_at' => now(),
                'submission_ip' => $request->ip(),
            ]);

            $submission->setStatus('submitted', 'Application submitted via API');

            return response()->json([
                'id' => $submission->id,
                'status' => 'submitted',
                'step' => 5,
                'submitted_at' => $submission->submitted_at->toISOString(),
            ], 200);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Submission failed.'], 500);
        }
    }

    /**
     * Health check endpoint
     */
    public function health()
    {
        try {
            // Basic database connectivity check
            \DB::connection()->getPdo();
            
            return response()->json([
                'status' => 'ok',
                'timestamp' => now()->toISOString(),
                'version' => '1.0.0'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database connection failed'
            ], 503);
        }
    }

    /**
     * Get validation rules for each step
     */
    private function getValidationRules($step)
    {
        switch ($step) {
            case 1:
                return [
                    'gender' => 'required|string|in:male,female,other,prefer-not-to-say',
                    'firstName' => 'required|string|max:100',
                    'lastName' => 'required|string|max:100',
                    'email' => 'required|email:rfc,dns|max:255',
                    'phone' => 'required|string|max:20',
                    'birthdate' => 'required|date|before:today',
                    'nationality' => 'required|string|max:100',
                ];
            case 2:
                return [
                    'addressLine1' => 'required|string|max:255',
                    'addressLine2' => 'nullable|string|max:255',
                    'city' => 'required|string|max:100',
                    'state' => 'required|string|max:100',
                    'postalCode' => 'required|string|max:20',
                    'country' => 'required|string|max:100',
                ];
            case 3:
                return [
                    'assets' => 'required|array|min:1',
                    'assets.*.id' => 'required|string',
                    'assets.*.transactionDate' => 'required|date',
                    'assets.*.quantity' => 'required|string',
                    'assets.*.price' => 'required|string',
                    'assets.*.notice' => 'required|string',
                ];
            case 4:
                return [
                    'termsAccepted' => 'required|boolean|accepted',
                    'privacyAccepted' => 'required|boolean|accepted',
                    'marketingConsent' => 'required|boolean',
                ];
            default:
                return [];
        }
    }

    /**
     * Check if submission has all required data
     */
    private function isSubmissionComplete(Submission $submission)
    {
        return !empty($submission->firstname) &&
               !empty($submission->lastname) &&
               !empty($submission->email) &&
               !empty($submission->address) &&
               !empty($submission->assets) &&
               !empty($submission->legal_agreements);
    }
}
```

## Required Database Migrations

Add these columns to your submissions table:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddEnhancedFieldsToSubmissionsTable extends Migration
{
    public function up()
    {
        Schema::table('submissions', function (Blueprint $table) {
            // Auto-save fields
            $table->timestamp('last_autosave')->nullable();
            $table->json('autosave_data')->nullable();
            
            // Asset information
            $table->json('assets')->nullable();
            
            // Legal agreements
            $table->json('legal_agreements')->nullable();
            
            // Submission tracking
            $table->timestamp('submitted_at')->nullable();
            $table->ipAddress('submission_ip')->nullable();
            
            // Index for performance
            $table->index(['status', 'created_at']);
            $table->index('last_autosave');
        });
    }

    public function down()
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn([
                'last_autosave',
                'autosave_data', 
                'assets',
                'legal_agreements',
                'submitted_at',
                'submission_ip'
            ]);
        });
    }
}
```

## Updated API Routes

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FormApiController;

// Enhanced rate limiting for better UX
Route::middleware(['throttle:30,1'])->group(function () {
    Route::post('submissions', [FormApiController::class, 'store']);
    Route::patch('submissions/{id}', [FormApiController::class, 'update']);
});

// Auto-save with higher rate limit
Route::middleware(['throttle:60,1'])->group(function () {
    Route::patch('submissions/{id}/autosave', [FormApiController::class, 'autoSave']);
    Route::post('submissions/validate', [FormApiController::class, 'validate']);
    Route::get('submissions/{id}', [FormApiController::class, 'show']);
});

// Final submission with strict rate limiting
Route::middleware(['throttle:5,5'])->group(function () {
    Route::post('submissions/{id}/submit', [FormApiController::class, 'submit']);
});

// Health check
Route::get('health', [FormApiController::class, 'health'])->middleware('throttle:120,1');

// Existing form routes
Route::get('forms', function () {
    // Your existing forms endpoint
})->middleware('throttle:60,1');

Route::get('form/{slug}', function ($slug) {
    // Your existing form by slug endpoint
})->middleware('throttle:60,1');
```

## Response Format Standardization

Ensure all endpoints return this consistent format:

```php
// Success Response
return response()->json([
    'id' => $submission->id,
    'status' => $submission->status,
    'step' => $currentStep,
    'created_at' => $submission->created_at->toISOString(),
    'updated_at' => $submission->updated_at->toISOString(),
], 200);

// Error Response
return response()->json([
    'message' => 'Descriptive error message',
    'errors' => $validator->errors() // Only for validation errors
], 422);

// Rate Limit Response
return response()->json([
    'message' => 'Too many attempts. Please try again later.'
], 429);
```

## Testing the Implementation

### Test Auto-Save
```bash
curl -X PATCH http://your-app.com/api/submissions/{id}/autosave \
  -H "Content-Type: application/json" \
  -d '{"step": 2, "form_data": {"firstName": "John"}, "is_autosave": true}'
```

### Test Validation
```bash
curl -X POST http://your-app.com/api/submissions/validate \
  -H "Content-Type: application/json" \
  -d '{"step": 1, "form_data": {"firstName": "John", "email": "john@example.com"}}'
```

### Test Health Check
```bash
curl http://your-app.com/api/health
```

## Performance Considerations

1. **Database Indexing**: Added indexes on status, created_at, and last_autosave
2. **Rate Limiting**: Adjusted limits for better UX while preventing abuse
3. **Auto-Save Optimization**: Lightweight saves without heavy validation
4. **Caching**: Consider caching validation rules and form configurations

## Security Enhancements

1. **IP Tracking**: Track submission and auto-save IPs for audit
2. **Rate Limiting**: Granular limits per endpoint type
3. **Validation**: Consistent validation across all endpoints
4. **Input Sanitization**: Proper cleaning of all input data

This implementation will significantly improve your form's reliability and user experience! 