# Dynamic Form Routing

This document describes the dynamic routing system implemented for forms based on their slugs.

## Overview

The application now supports dynamic routing where forms are accessed via their unique slugs instead of being displayed on the root URL. This allows for multiple forms to be hosted on the same platform with clean URLs.

## URL Structure

- **Root URL (`/`)**: Displays a list of available forms
- **Form URL (`/[formslug]`)**: Displays the specific form based on its slug

## API Endpoints

### Get All Forms
- **Endpoint**: `GET /forms`
- **Description**: Retrieves a list of all available forms
- **Response**: Array of form objects with `id`, `title`, `slug`, `description`, etc.

### Get Form by Slug
- **Endpoint**: `GET /forms/{slug}`
- **Description**: Retrieves a specific form by its slug
- **Response**: Single form object with all details

## Components

### HomePage (`src/app/page.tsx`)
- Fetches all available forms using `apiService.getAllForms()`
- Displays them in a grid layout with cards
- Allows users to select and navigate to specific forms
- Handles loading and error states

### FormPage (`src/app/[formslug]/page.tsx`)
- Dynamic route that accepts a form slug parameter
- Fetches form data using `apiService.getFormBySlug(slug)`
- Renders the `OnboardingWizard` component with the fetched form data
- Handles loading and error states for form not found scenarios

### OnboardingWizard Updates
- Now accepts an optional `form` prop containing form metadata
- Displays form title and description in the header instead of generic text
- Passes form data to step components that need it

### WelcomeStep Updates
- Accepts form data and displays form-specific welcome message
- Shows form title and description if available
- Falls back to generic messaging if no form data is provided

## API Service Updates

### New Method: `getFormBySlug()`
```typescript
async getFormBySlug(slug: string): Promise<ApiResponse<Form>> {
  return this.makeRequest<Form>(`/forms/${slug}`)
}
```

## Form Data Structure

```typescript
interface Form {
  id: string
  title: string
  slug: string
  description: string
  created_at: string
  updated_at: string
  fields?: Record<string, unknown>
}
```

## Error Handling

- **Form not found**: Displays a user-friendly error page with retry option
- **Network errors**: Shows appropriate error messages with retry functionality
- **Loading states**: Provides visual feedback during API calls

## Benefits

1. **Scalability**: Support for multiple forms on the same platform
2. **SEO-friendly**: Clean URLs with meaningful slugs
3. **User Experience**: Clear navigation and form identification
4. **Maintainability**: Modular routing structure that's easy to extend

## Usage Example

1. User visits `/` and sees a list of available forms
2. User clicks on a form card (e.g., "Investment Application")
3. User is redirected to `/investment-application`
4. The form loads with specific branding and content
5. User completes the form with the same familiar multi-step process

## Migration Notes

- The root URL now shows a form selection page instead of directly displaying a form
- Existing bookmarks to the root URL will still work but show the form list
- Form-specific URLs are now the primary way to access forms
- All existing form functionality remains unchanged 