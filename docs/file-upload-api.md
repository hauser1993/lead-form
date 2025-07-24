# File Upload API

## Overview
The file upload API is a Next.js API route that allows users to upload proof documents for investment transactions. Files are stored locally in the `public/uploads/` directory with randomly generated filenames to ensure uniqueness and security.

## API Endpoint

### POST `/api/upload`

Local Next.js API route that uploads a file to the server and returns the file URL.

#### Request
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Timeout**: 60 seconds
- **Location**: `src/app/api/upload/route.ts`

#### Form Data Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | The file to upload |

#### Response

**Success (200)**
```json
{
  "success": true,
  "data": {
    "url": "/uploads/abc123def456.pdf",
    "filename": "abc123def456.pdf"
  }
}
```

**Error (4xx/5xx)**
```json
{
  "success": false,
  "message": "Upload failed (400)",
  "errors": {
    "file": ["File size exceeds maximum limit"]
  }
}
```

## Client Implementation

### API Service Method

```typescript
async uploadFile(file: File): Promise<ApiResponse<{ url: string; filename: string }>>
```

The upload method:
1. Generates a random filename using `Math.random().toString(36)`
2. Creates a FormData object with the file and filename
3. Sends a POST request to `/api/upload`
4. Returns the file URL on success

### Filename Generation

Random filenames are generated using:
```typescript
const fileExtension = file.name.split('.').pop()
const randomString = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15)
const filename = `${randomString}.${fileExtension}`
```

This creates a 26-character random string plus the original file extension.

## Usage in Components

### AssetInfoStep Component

The component uses the upload functionality in transaction proof documents:

```typescript
const updateTransactionFile = async (id: string, file: File | null) => {
  if (!file) {
    // Clear file logic
    return
  }

  // Set uploading status
  setTransactions(/* update with uploading status */)

  try {
    const response = await apiService.uploadFile(file)
    if (response.success) {
      // Update with file URL
      setTransactions(/* update with success status and fileUrl */)
    }
  } catch (error) {
    // Handle error
  }
}
```

### Upload States

Each transaction tracks the following upload states:

| State | Description |
|-------|-------------|
| `idle` | No upload in progress |
| `uploading` | File upload in progress |
| `success` | File uploaded successfully |
| `error` | Upload failed |

## File Storage

- **Directory**: `/uploads/`
- **Naming**: Random 26-character string + original extension
- **Access**: Files are accessible via direct URL path
- **Security**: Random filenames prevent enumeration attacks

## Supported File Types

- PDF documents (`.pdf`)
- Images (`.jpg`, `.jpeg`, `.png`)
- Maximum file size: 10MB

## Error Handling

The implementation includes comprehensive error handling:

- **Network errors**: Automatic retry with exponential backoff
- **Timeout errors**: 60-second timeout for uploads
- **File validation**: Size and type validation
- **Server errors**: Graceful error display to users

## User Experience

- **Real-time feedback**: Loading spinner during upload
- **Success indicators**: Green checkmark with "View file" link
- **Error messages**: Clear error descriptions with retry options
- **File preview**: Link to view uploaded files 