import { NextRequest, NextResponse } from 'next/server'
import { readFormsCache, shouldUpdateCache } from '@/lib/forms-cache'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking if forms cache needs updating...')
    
    // Read current cache
    const cache = await readFormsCache()
    
    // Check if update is needed
    if (!shouldUpdateCache(cache)) {
      const nextUpdate = new Date(new Date(cache.lastUpdated!).getTime() + cache.updateInterval)
      console.log(`⏱️  Cache is still fresh. Next update scheduled for: ${nextUpdate.toISOString()}`)
      
      return NextResponse.json({
        success: true,
        message: 'Cache is up to date',
        data: {
          formsCount: cache.forms.length,
          lastUpdated: cache.lastUpdated,
          nextUpdate: nextUpdate.toISOString(),
          needsUpdate: false
        }
      })
    }

    console.log('🔄 Cache is stale, triggering update...')
    
    // Call the cache-forms API to update
    const baseUrl = request.nextUrl.origin
    const updateResponse = await fetch(`${baseUrl}/api/cache-forms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!updateResponse.ok) {
      throw new Error(`Cache update failed: ${updateResponse.status}`)
    }

    const updateResult = await updateResponse.json()
    
    // Schedule next automatic update (optional - for environments that support it)
    scheduleNextUpdate(baseUrl)
    
    return NextResponse.json({
      success: true,
      message: 'Cache updated successfully',
      data: {
        ...updateResult.data,
        needsUpdate: true,
        updatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error in auto-update-cache:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check/update cache',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Schedule next update (for environments that support setTimeout)
 * In production, this should be handled by a proper cron job or scheduler
 */
function scheduleNextUpdate(baseUrl: string) {
  // Only schedule in development or environments that support long-running processes
  if (process.env.NODE_ENV === 'development') {
    console.log('⏰ Scheduling next cache update in 1 hour...')
    
    setTimeout(async () => {
      try {
        console.log('⏰ Triggering scheduled cache update...')
        await fetch(`${baseUrl}/api/auto-update-cache`)
      } catch (error) {
        console.error('❌ Scheduled update failed:', error)
      }
    }, 60 * 60 * 1000) // 1 hour
  } else {
    console.log('ℹ️  Automatic scheduling disabled in production. Use a cron job to call /api/auto-update-cache')
  }
}

export async function POST(request: NextRequest) {
  // Allow manual trigger via POST
  return GET(request)
} 