import { apiService, type Form } from '@/lib/api'
import FormPageClient from './FormPageClient'

// Fallback form slugs for when API is unavailable during build
const FALLBACK_FORM_SLUGS = [
  'varta-ag',
  'investment-application',
  'contact-form',
  'survey-form',
  'investor-onboarding',
]

// Required for static export with dynamic routes
export async function generateStaticParams() {
  console.log('🏗️  Generating static params for form pages...')
  
  try {
    console.log('📡 Attempting to fetch forms from API...')
    const response = await apiService.getAllForms()
    
    if (response.success && response.data && response.data.length > 0) {
      console.log(`✅ Successfully fetched ${response.data.length} forms from API`)
      const params = response.data.map((form: Form) => ({
        formslug: form.slug,
      }))
      console.log('📝 Generated params from API:', params.map(p => p.formslug))
      return params
    } else {
      console.log('⚠️  API call succeeded but returned no forms or empty data')
      console.log('📋 Using fallback form slugs:', FALLBACK_FORM_SLUGS)
      return FALLBACK_FORM_SLUGS.map(slug => ({ formslug: slug }))
    }
  } catch (error) {
    console.error('❌ Error fetching forms from API during build:', error)
    console.log('📋 Using fallback form slugs:', FALLBACK_FORM_SLUGS)
    return FALLBACK_FORM_SLUGS.map(slug => ({ formslug: slug }))
  }
}

export default function FormPage() {
  return <FormPageClient />
} 