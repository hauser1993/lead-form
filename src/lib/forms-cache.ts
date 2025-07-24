import { readFile } from 'fs/promises'
import { join } from 'path'
import { apiService } from './api'

export interface CachedForm {
  id: string
  title: string
  slug: string
  description: string
  created_at: string
  updated_at: string
}

export interface FormsCache {
  forms: CachedForm[]
  lastUpdated: string | null
  updateInterval: number
}

const CACHE_FILE_PATH = join(process.cwd(), 'public', 'cache', 'forms.json')

// Hardcoded fallback slugs as ultimate fallback
const ULTIMATE_FALLBACK_SLUGS = [
  'varta-ag',
  'investment-application',
  'contact-form',
  'survey-form',
  'investor-onboarding'
]

/**
 * Read cached forms from JSON file
 */
export async function readFormsCache(): Promise<FormsCache> {
  try {
    const cacheData = await readFile(CACHE_FILE_PATH, 'utf-8')
    const cache = JSON.parse(cacheData) as FormsCache
    console.log(`📋 Read ${cache.forms.length} forms from cache (updated: ${cache.lastUpdated})`)
    return cache
  } catch (error) {
    console.warn('⚠️  Cache file not found or invalid, returning empty cache')
    return {
      forms: [],
      lastUpdated: null,
      updateInterval: 3600000 // 1 hour
    }
  }
}

/**
 * Get form slugs for static generation
 * Priority: 1) Fresh API fetch 2) Cached forms 3) Ultimate fallback slugs
 */
export async function getFormSlugsForGeneration(): Promise<string[]> {
  console.log('🔍 Getting form slugs for static generation...')
  
  try {
    // Try to fetch fresh forms from API during build
    console.log('📡 Attempting fresh API fetch during build...')
    const apiResponse = await apiService.getAllForms()
    
    if (apiResponse.success && apiResponse.data && Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
      const apiSlugs = apiResponse.data.map(form => form.slug)
      console.log('✅ Fresh API fetch successful, got slugs:', apiSlugs)
      
      // Combine with ultimate fallbacks to ensure we don't miss any critical forms
      const allSlugs = new Set([...apiSlugs, ...ULTIMATE_FALLBACK_SLUGS])
      const finalSlugs = Array.from(allSlugs)
      console.log('🎯 Final slugs (API + fallbacks):', finalSlugs)
      return finalSlugs
    } else {
      console.log('⚠️  Fresh API fetch failed or returned no data, trying cache...')
    }
  } catch (error) {
    console.warn('❌ Fresh API fetch failed:', error)
  }

  try {
    // Fallback to cached forms
    const cache = await readFormsCache()
    
    if (cache.forms.length > 0) {
      const cachedSlugs = cache.forms.map(form => form.slug)
      console.log('✅ Using cached form slugs:', cachedSlugs)
      
      // Combine with ultimate fallbacks
      const allSlugs = new Set([...cachedSlugs, ...ULTIMATE_FALLBACK_SLUGS])
      const finalSlugs = Array.from(allSlugs)
      console.log('🎯 Final slugs (cache + fallbacks):', finalSlugs)
      return finalSlugs
    } else {
      console.log('⚠️  No cached forms found, using ultimate fallback slugs')
    }
  } catch (error) {
    console.error('❌ Error reading forms cache:', error)
  }

  // Ultimate fallback
  console.log('🆘 Using ultimate fallback slugs only:', ULTIMATE_FALLBACK_SLUGS)
  return ULTIMATE_FALLBACK_SLUGS
}

/**
 * Check if cache needs updating (older than 1 hour)
 */
export function shouldUpdateCache(cache: FormsCache): boolean {
  if (!cache.lastUpdated) {
    return true
  }
  
  const lastUpdate = new Date(cache.lastUpdated).getTime()
  const now = Date.now()
  const timeSinceUpdate = now - lastUpdate
  
  return timeSinceUpdate >= cache.updateInterval
}

/**
 * Get cached forms (browser-safe version for client-side)
 */
export async function getCachedFormsBrowser(): Promise<CachedForm[]> {
  try {
    const response = await fetch('/cache/forms.json')
    if (!response.ok) {
      throw new Error('Failed to fetch cache')
    }
    const cache = await response.json() as FormsCache
    return cache.forms
  } catch (error) {
    console.warn('Could not fetch cached forms:', error)
    return []
  }
} 