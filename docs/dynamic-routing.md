# Dynamic Form Routing

This document describes the dynamic routing system implemented for forms based on their slugs.

## Overview

The application now supports dynamic routing where forms are accessed via their unique slugs under the `/form` path instead of being displayed on the root URL. This allows for multiple forms to be hosted on the same platform with clean URLs and better organization.

## URL Structure

- **Root URL (`/`)**: Shows a welcome screen and automatically redirects to `/form`
- **Form Selection URL (`/form`)**: Displays a list of available forms
- **Individual Form URL (`/form/[formslug]`)**: Displays the specific form based on its slug

## API Endpoints

### Get All Forms
- **Endpoint**: `GET /api/forms`
- **Description**: Retrieves a list of all available forms
- **Response**: Array of form objects with `id`, `title`, `slug`, `description`, etc.

### Get Form by Slug
- **Endpoint**: `GET /api/forms/{slug}`
- **Description**: Retrieves a specific form by its slug
- **Response**: Single form object with all details

## Components

### HomePage (`src/app/page.tsx`)
- Shows a welcome screen with automatic redirect to `/form`
- Provides manual navigation option if automatic redirect fails
- Handles user-friendly redirection experience

### FormSelectionPage (`src/app/form/page.tsx`)
- Fetches all available forms using `apiService.getAllForms()`
- Displays them in a grid layout with cards
- Allows users to select and navigate to specific forms at `/form/{slug}`
- Handles loading and error states

### FormPage (`src/app/form/[formslug]/page.tsx`)
- Dynamic route that accepts a form slug parameter
- Fetches form data using `apiService.getFormBySlug(slug)`
- Renders the `OnboardingWizard` component with the fetched form data
- Handles loading and error states for form not found scenarios
- Provides navigation back to form selection page

### OnboardingWizard Updates
- Now accepts an optional `form` prop containing form metadata
- Displays form title and description in the header instead of generic text
- Passes form data to step components that need it

### WelcomeStep Updates
- Accepts form data and displays form-specific welcome message
- Shows form title and description if available
- Falls back to generic messaging if no form data is provided

## API Service Updates

### Existing Method: `getFormBySlug()`
```typescript
async getFormBySlug(slug: string): Promise<ApiResponse<Form>> {
  return this.makeRequest<Form>(`/api/forms/${slug}`)
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

- **Form not found**: Displays a user-friendly error page with retry option and navigation back to form selection
- **Network errors**: Shows appropriate error messages with retry functionality
- **Loading states**: Provides visual feedback during API calls
- **Automatic redirects**: Graceful handling of root URL access with automatic redirect to forms

## Benefits

1. **Scalability**: Support for multiple forms on the same platform
2. **SEO-friendly**: Clean URLs with meaningful slugs under organized `/form` path
3. **User Experience**: Clear navigation and form identification with dedicated form portal
4. **Maintainability**: Modular routing structure that's easy to extend
5. **Organization**: Forms are properly organized under `/form` namespace

## Usage Example

1. User visits `/` and sees welcome screen with automatic redirect
2. User is redirected to `/form` and sees a list of available forms
3. User clicks on a form card (e.g., "Investment Application")
4. User is redirected to `/form/investment-application`
5. User completes the form using the OnboardingWizard component
6. User can navigate back to form selection at any time

## Migration Notes

This update moves forms from the root domain (`/{slug}`) to the organized form namespace (`/form/{slug}`). The root URL now serves as a welcome page that automatically redirects users to the forms portal for better user experience and organization. 