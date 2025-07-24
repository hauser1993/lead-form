#!/usr/bin/env node

const fs = require('fs').promises
const path = require('path')

// Simple fetch implementation for Node.js environments that might not have it
const fetch = global.fetch || require('node-fetch')

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-laravel-app.com'
const CACHE_DIR = path.join(process.cwd(), 'public', 'cache')
const CACHE_FILE = path.join(CACHE_DIR, 'forms.json')

/**
 * Fetch forms from the external API
 */
async function fetchFormsFromAPI() {
  console.log('📡 Fetching forms from API:', `${API_BASE_URL}/api/forms`)
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/forms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid API response format')
    }

    console.log(`✅ Successfully fetched ${data.length} forms from API`)
    return data
  } catch (error) {
    console.error('❌ Failed to fetch forms from API:', error.message)
    return null
  }
}

/**
 * Ensure cache directory exists
 */
async function ensureCacheDirectory() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    console.log('📁 Cache directory ensured:', CACHE_DIR)
  } catch (error) {
    console.error('❌ Failed to create cache directory:', error.message)
    throw error
  }
}

/**
 * Write forms to cache file
 */
async function writeCacheFile(forms) {
  const cacheData = {
    forms: forms.map(form => ({
      id: form.id,
      title: form.title,
      slug: form.slug,
      description: form.description,
      created_at: form.created_at,
      updated_at: form.updated_at
    })),
    lastUpdated: new Date().toISOString(),
    updateInterval: 3600000 // 1 hour
  }

  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8')
    console.log(`✅ Cache file updated: ${CACHE_FILE}`)
    console.log(`📋 Cached ${cacheData.forms.length} forms:`, cacheData.forms.map(f => f.slug))
  } catch (error) {
    console.error('❌ Failed to write cache file:', error.message)
    throw error
  }
}

/**
 * Create empty cache file with fallback data
 */
async function createFallbackCache() {
  const fallbackData = {
    forms: [],
    lastUpdated: null,
    updateInterval: 3600000
  }

  try {
    await fs.writeFile(CACHE_FILE, JSON.stringify(fallbackData, null, 2), 'utf-8')
    console.log('⚠️  Created empty cache file (will use fallback slugs)')
  } catch (error) {
    console.error('❌ Failed to create fallback cache:', error.message)
    throw error
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Pre-build cache update starting...')
  
  try {
    // Ensure cache directory exists
    await ensureCacheDirectory()
    
    // Try to fetch forms from API
    const forms = await fetchFormsFromAPI()
    
    if (forms && forms.length > 0) {
      // Write successful cache
      await writeCacheFile(forms)
      console.log('✅ Pre-build cache update completed successfully')
    } else {
      // Create empty cache (will use fallback slugs)
      await createFallbackCache()
      console.log('⚠️  Pre-build cache update completed with fallback')
    }
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Pre-build cache update failed:', error.message)
    
    try {
      // Try to create empty cache as last resort
      await createFallbackCache()
      console.log('🆘 Created minimal cache file to prevent build failure')
      process.exit(0)
    } catch (fallbackError) {
      console.error('💥 Complete failure - could not create any cache file')
      process.exit(1)
    }
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = { main } 