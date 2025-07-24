import FormPageClient from './FormPageClient'
import { getFormSlugsForGeneration } from '@/lib/forms-cache'

// Required for static export with dynamic routes
export async function generateStaticParams() {
  console.log('🏗️  Generating static params for form pages...')
  
  try {
    // Get form slugs from cache (with ultimate fallback)
    const slugs = await getFormSlugsForGeneration()
    
    const params = slugs.map(slug => ({ slug }))
    console.log('🎯 Generated static params:', params.map(p => p.slug))
    
    return params
  } catch (error) {
    console.error('❌ Error in generateStaticParams:', error)
    // Return empty array - in static export mode, this means no pages will be generated
    // which is better than failing the build
    return []
  }
}

export default function FormPage() {
  return <FormPageClient />
} 