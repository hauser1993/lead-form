# Static Parameters Generation for Dynamic Routes

## Overview
The `generateStaticParams` function is required for dynamic routes when using Next.js with `output: 'export'` configuration. This function tells Next.js which static paths to generate at build time for the `[formslug]` dynamic route.

## Implementation
Location: `src/app/form/[formslug]/page.tsx` (Server Component)

```typescript
const FALLBACK_FORM_SLUGS = [
  'varta-ag',
  'investment-application',
  'contact-form',
  'survey-form',
  'investor-onboarding',
]

export async function generateStaticParams() {
  try {
    const response = await apiService.getAllForms()
    
    if (response.success && response.data && response.data.length > 0) {
      return response.data.map((form: Form) => ({
        formslug: form.slug,
      }))
    } else {
      return FALLBACK_FORM_SLUGS.map(slug => ({ formslug: slug }))
    }
  } catch (error) {
    console.error('Error generating static params:', error)
    return FALLBACK_FORM_SLUGS.map(slug => ({ formslug: slug }))
  }
}

export default function FormPage() {
  return <FormPageClient />
}
```

## Architecture
The implementation uses a split-component architecture:
- **Server Component** (`page.tsx`): Exports `generateStaticParams()` and renders the client component
- **Client Component** (`FormPageClient.tsx`): Contains all client-side logic with hooks and interactivity

## How It Works
1. **Build Time Execution**: This function runs during the build process
2. **API Call**: Fetches all available forms using `apiService.getAllForms()`
3. **Path Generation**: Maps each form's slug to generate static paths
4. **Error Handling**: Returns empty array if API call fails, allowing build to continue

## Requirements
- API endpoint `/api/forms` must be accessible during build time
- Each form must have a unique `slug` property
- API server should be running during the build process

## Static Export Benefits
- **Performance**: Pre-generated pages load instantly
- **SEO**: Better search engine optimization with static HTML
- **Hosting**: Can be hosted on any static hosting service
- **Reliability**: No runtime API dependencies for page rendering

## Fallback Behavior
If the API is unavailable during build time:
- Function uses a predefined list of known form slugs
- Build process continues without errors
- All expected form pages are generated statically
- Client-side functionality remains intact for runtime form fetching

## Fallback Form Slugs
The system includes these fallback slugs for reliable builds:
- `varta-ag`
- `investment-application`
- `contact-form`
- `survey-form`
- `investor-onboarding`

These can be updated in the `FALLBACK_FORM_SLUGS` array as needed.

## Adding New Form Slugs
When you add new forms to your backend, you should:

1. **Add to fallback list**: Update `FALLBACK_FORM_SLUGS` in `src/app/form/[formslug]/page.tsx`
2. **Test locally**: Ensure the form works with client-side fetching
3. **Rebuild**: Run your build process to generate the new static pages

## Debugging Build Issues
If you encounter missing form slug errors:

1. **Check build logs**: Look for console messages during `generateStaticParams()`
2. **Verify API accessibility**: Ensure your API server can be reached during build
3. **Add temporary slugs**: Add the missing slug to `FALLBACK_FORM_SLUGS` as a quick fix
4. **Check API response**: Verify your `/api/forms` endpoint returns the expected forms

## Related Files
- `src/lib/api.ts` - Contains `getAllForms()` method
- `next.config.js` - Static export configuration
- `src/app/form/[formslug]/page.tsx` - Server component with `generateStaticParams()`
- `src/app/form/[formslug]/FormPageClient.tsx` - Client component with form logic 