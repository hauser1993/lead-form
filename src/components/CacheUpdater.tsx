'use client'

import { useEffect, useRef } from 'react'

export default function CacheUpdater() {
  const hasTriggeredRef = useRef(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Trigger cache check on app load (only once)
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      checkAndUpdateCache('App Load')
    }

    // Set up interval to check every hour
    intervalRef.current = setInterval(() => {
      checkAndUpdateCache('Scheduled Check')
    }, 60 * 60 * 1000) // 1 hour

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  async function checkAndUpdateCache(trigger: string) {
    try {
      console.log(`🔍 [${trigger}] Checking forms cache...`)
      
      const response = await fetch('/api/auto-update-cache', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Cache check failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        if (result.data.needsUpdate) {
          console.log(`✅ [${trigger}] Cache updated:`, {
            formsCount: result.data.formsCount,
            lastUpdated: result.data.lastUpdated
          })
        } else {
          console.log(`ℹ️  [${trigger}] Cache is up to date:`, {
            formsCount: result.data.formsCount,
            nextUpdate: result.data.nextUpdate
          })
        }
      } else {
        console.warn(`⚠️  [${trigger}] Cache check failed:`, result.message)
      }
    } catch (error) {
      console.error(`❌ [${trigger}] Error checking cache:`, error)
      // Don't throw - we don't want to break the app if cache update fails
    }
  }

  // This component doesn't render anything visible
  return null
} 