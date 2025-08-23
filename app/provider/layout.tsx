"use client"

import { ReactNode, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardHeader from '@/components/dashboard-header'
import ProviderSidebar from './Sidebar'
import { Loader2, AlertTriangle, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProviderLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth() // ✅ NEW: Use auth context
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ✅ REMOVED: fetchMe and manual authentication logic

  /* ───── Role gate using auth context ───── */
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'provider') {
        // User is authorized, no action needed
        return
      } else if (user.role === 'admin') {
        router.replace('/admin')
      } else {
        router.replace('/dashboard')
      }
    } else if (!loading && !user) {
      // Not logged in
      router.replace('/login')
    }
  }, [user, loading, router])

  // Handle sidebar collapse state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
        setMobileMenuOpen(false)
      } else {
        setSidebarCollapsed(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Show loading while auth is loading or user role is being checked
  if (loading) {
    return <LoadingScreen />
  }

  // Show unauthorized screen if user is not a provider
  if (user && user.role !== 'provider') {
    return <UnauthorizedScreen />
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] z-30 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        }`}>
          <ProviderSidebar 
            current={pathname} 
            defaultCollapsed={sidebarCollapsed}
            onCollapseChange={setSidebarCollapsed}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="relative w-80 max-w-[85vw] h-full">
              <ProviderSidebar 
                current={pathname} 
                defaultCollapsed={false}
                isMobile={true}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main content wrapper */}
        <div className="flex-1 flex flex-col">
          {/* Fixed header */}
          <div className="fixed top-0 left-0 right-0 z-40">
            <DashboardHeader />
          </div>

          {/* Main content area with responsive margin */}
          <main className={`flex-1 pt-16 transition-all duration-300 min-h-screen ${
            sidebarCollapsed 
              ? 'lg:ml-20' 
              : 'lg:ml-72'
          }`}>
            <div className="p-4 sm:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

/* ── Enhanced Loading Screen ─────────────────────────────────────── */
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full animate-pulse shadow-lg"></div>
            <Loader2 className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 animate-spin text-white p-4 sm:p-5" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Loading Provider Dashboard
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Preparing your workspace...
        </p>
      </div>
    </div>
  )
}

/* ── Unauthorized Screen ─────────────────────────────────────── */
function UnauthorizedScreen() {
  const router = useRouter()
  const { user } = useAuth()

  const handleRedirect = () => {
    if (user?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-950 dark:via-gray-900 dark:to-orange-950 p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative text-center max-w-md w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-2xl border-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Access Denied
        </h2>
        
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          You don't have permission to access the Provider Dashboard. This area is restricted to service providers only.
        </p>

        <div className="space-y-3">
          <Button 
            onClick={handleRedirect}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12"
          >
            Go to {user?.role === 'admin' ? 'Admin' : 'Main'} Dashboard
          </Button>
          
          <Button 
            onClick={() => router.push('/provider-profile')}
            variant="outline"
            className="w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 h-10 sm:h-12"
          >
            View Profile
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            If you believe this is an error, please contact support or check your account role in your profile settings.
          </p>
        </div>
      </div>
    </div>
  )
}
