'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
          <p className="text-lg text-gray-600">
            Access our forms and applications portal
          </p>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Click the button below to browse available forms:
          </p>
          <Link href="/form">
            <Button className="w-full group">
              Go to Forms
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
