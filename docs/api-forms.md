# Forms API Documentation

## getAllForms()

Fetches all available forms from the backend API.

### Endpoint
`GET /api/forms`

### Description
Retrieves a list of all forms with their metadata including title, description, status, and timestamps.

### Usage
```typescript
import { apiService } from '@/lib/api'

const fetchForms = async () => {
  const response = await apiService.getAllForms()
  
  if (response.success && response.data) {
    console.log('Forms:', response.data)
    // Handle the forms data
  } else {
    console.error('Error:', response.message)
  }
}
```

### Response Structure
```typescript
interface Form {
  id: string
  title: string
  description: string
  created_at: string
  updated_at: string
  status: 'active' | 'inactive' | 'draft'
  fields?: Record<string, unknown>
}
```

### Example Response
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Investor Onboarding Form",
      "description": "Complete onboarding process for new investors",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "status": "active",
      "fields": {
        "steps": 5,
        "required_documents": ["id", "proof_of_address"]
      }
    }
  ]
}
```

### Error Handling
The method returns an `ApiResponse<Form[]>` object with:
- `success: boolean` - Indicates if the request was successful
- `data?: Form[]` - Array of forms (only present on success)
- `message?: string` - Error message (present on failure)
- `errors?: Record<string, string[]>` - Validation errors (if applicable) 