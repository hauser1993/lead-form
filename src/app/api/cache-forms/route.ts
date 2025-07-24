import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { apiService } from '@/lib/api'

interface FormsCache {
  forms: Array<{
    id: string
    title: string
    slug: string
    description: string
    created_at: string
    updated_at: string
  }>
  lastUpdated: string | null
  updateInterval: number
}

const CACHE_FILE_PATH = join(process.cwd(), 'public', 'cache', 'forms.json')

async function readCache(): Promise<FormsCache> {
  try {
    const cacheData = await readFile(CACHE_FILE_PATH, 'utf-8')
    return JSON.parse(cacheData)
  } catch (error) {
    console.warn('Cache file not found or invalid, returning default structure')
    return {
      forms: [],
      lastUpdated: null,
      updateInterval: 3600000 // 1 hour in milliseconds
    }
  }
}

async function writeCache(cache: FormsCache): Promise<void> {
  try {
    await writeFile(CACHE_FILE_PATH, JSON.stringify(cache, null, 2), 'utf-8')
    console.log('✅ Forms cache updated successfully')
  } catch (error) {
    console.error('❌ Failed to write forms cache:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting forms cache update...')
    
    // Fetch forms from external API
    const response = await apiService.getAllForms()
    
    if (!response.success || !response.data) {
      console.error('❌ Failed to fetch forms from API:', response.message)
      return NextResponse.json(
        { 
          success: false, 
          message: response.message || 'Failed to fetch forms from API' 
        },
        { status: 500 }
      )
    }

    // Read current cache
    const currentCache = await readCache()
    
    // Update cache with new data
    const updatedCache: FormsCache = {
      forms: response.data.map(form => ({
        id: form.id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        created_at: form.created_at,
        updated_at: form.updated_at
      })),
      lastUpdated: new Date().toISOString(),
      updateInterval: currentCache.updateInterval
    }

    // Write updated cache to file
    await writeCache(updatedCache)

    console.log(`✅ Successfully cached ${updatedCache.forms.length} forms`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully cached ${updatedCache.forms.length} forms`,
      data: {
        formsCount: updatedCache.forms.length,
        lastUpdated: updatedCache.lastUpdated,
        forms: updatedCache.forms.map(f => ({ slug: f.slug, title: f.title }))
      }
    })

  } catch (error) {
    console.error('❌ Error in cache-forms API:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error while updating forms cache' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Allow manual cache refresh via POST
  return GET(request)
} 