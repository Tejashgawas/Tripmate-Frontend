'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { AlertTriangle, X, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const REQUIRED_FIELDS = [
  'name',
  'contact_email', 
  'contact_phone',
  'location',
  'description'
] as const

export default function ProviderProfileBanner() {
  const router = useRouter()
  const { user } = useAuth()
  const { get } = useApi()
  
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [hasChecked, setHasChecked] = useState(false)
  const [hasError, setHasError] = useState(false) // ✅ NEW: Track errors

  // ✅ FIXED: All hooks at top level
  const handleDismiss = useCallback(() => {
    setShow(false)
  }, [])

  const handleCompleteProfile = useCallback(() => {
    router.push('/provider-profile')
  }, [router])

  const checkProfileCompleteness = useCallback(async () => {
    // ✅ ENHANCED: Better guards to prevent infinite loops
    if (loading || hasChecked || hasError || !user || user.role !== 'provider') {
      return
    }
    
    try {
      setLoading(true)
      setHasError(false)
      console.log('[PROVIDER-BANNER] Checking profile completeness - Single Call')
      
      const profile = await get('/me/get-provider')
      
      if (!profile) {
        console.log('[PROVIDER-BANNER] Profile is null or undefined')
        setHasChecked(true)
        setShow(false)
        return
      }
      
      const incomplete = REQUIRED_FIELDS.filter(field => {
        const value = profile?.[field]
        return !value || 
               value === null || 
               value === undefined || 
               (typeof value === 'string' && value.trim() === '')
      })
      
      console.log('[PROVIDER-BANNER] Profile check complete:', {
        complete: incomplete.length === 0,
        missingFields: incomplete
      })
      
      // ✅ FIXED: Only update state if values actually changed
      setMissingFields(prev => {
        const hasChanged = JSON.stringify(prev) !== JSON.stringify(incomplete)
        return hasChanged ? incomplete : prev
      })
      
      setShow(incomplete.length > 0)
      setHasChecked(true)
      
    } catch (error: any) {
      console.error('[PROVIDER-BANNER] Error checking profile:', error)
      
      // ✅ ENHANCED: Handle different error types
      if (error?.message?.includes('404') || error?.message?.includes('Not Found')) {
        console.log('[PROVIDER-BANNER] Provider profile not found - user may need to create profile')
        setShow(true) // Show banner to prompt profile creation
        setMissingFields(REQUIRED_FIELDS.slice()) // All fields missing
      } else {
        console.log('[PROVIDER-BANNER] API error - hiding banner to prevent spam')
        setShow(false) // Hide banner on other errors
      }
      
      setHasError(true) // ✅ NEW: Prevent further attempts
      setHasChecked(true)
    } finally {
      setLoading(false)
    }
  }, [user?.id, get, loading, hasChecked, hasError]) // ✅ FIXED: Stable dependencies

  // ✅ ENHANCED: Better effect with cleanup and error recovery
  useEffect(() => {
    let isMounted = true
    let timeoutId: NodeJS.Timeout

    const runCheck = async () => {
      if (isMounted && user && user.role === 'provider' && !hasChecked && !hasError) {
        // ✅ NEW: Add small delay to prevent rapid-fire requests
        timeoutId = setTimeout(() => {
          if (isMounted) {
            checkProfileCompleteness()
          }
        }, 100)
      }
    }

    runCheck()

    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [user?.id, user?.role, hasChecked, hasError, checkProfileCompleteness])

  // ✅ ENHANCED: Reset error state when user changes (for role switches, etc.)
  useEffect(() => {
    if (user?.id) {
      setHasError(false)
      setHasChecked(false)
    }
  }, [user?.id])

  // ✅ FIXED: All conditions after hooks
  if (!user || user.role !== 'provider' || !show || hasError) {
    return null
  }

  const getFieldDisplayName = (field: string) => {
    switch (field) {
      case 'name': return 'Business Name'
      case 'contact_email': return 'Contact Email'
      case 'contact_phone': return 'Phone Number'
      case 'location': return 'Service Location'
      case 'description': return 'Business Description'
      default: return field
    }
  }

  return (
    <div className="mb-4 sm:mb-6 animate-in slide-in-from-top-2 duration-500">
      <Card className="border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 shadow-lg">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-bold text-amber-900 dark:text-amber-100 mb-1 sm:mb-2">
                    Complete Your Provider Profile
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200 mb-3 sm:mb-4 leading-relaxed">
                    Your profile is missing some important information. Complete it to unlock all provider features and help travelers find your services.
                  </p>
                  
                  {missingFields.length > 0 && (
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-200 mb-2">
                        Missing information:
                      </p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {missingFields.slice(0, 3).map((field) => (
                          <span 
                            key={field}
                            className="inline-flex items-center px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-full"
                          >
                            {getFieldDisplayName(field)}
                          </span>
                        ))}
                        {missingFields.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs rounded-full">
                            +{missingFields.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button
                      onClick={handleCompleteProfile}
                      className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 h-9 sm:h-10 px-4 sm:px-6 text-sm"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Complete Profile
                    </Button>
                    
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 h-9 sm:h-10 px-4 sm:px-6 text-sm"
                    >
                      Remind Me Later
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="flex-shrink-0 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/50 w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-amber-200 dark:border-amber-800">
            <div className="flex items-center justify-between text-xs sm:text-sm text-amber-700 dark:text-amber-300">
              <span className="font-medium">Profile Completeness</span>
              <span className="font-bold">
                {Math.round(((REQUIRED_FIELDS.length - missingFields.length) / REQUIRED_FIELDS.length) * 100)}%
              </span>
            </div>
            <div className="mt-2 w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${((REQUIRED_FIELDS.length - missingFields.length) / REQUIRED_FIELDS.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
