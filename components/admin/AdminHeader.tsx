"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { 
  User, LogOut, MapPin, Menu, X, Settings, Shield, 
  Crown, BarChart3, Users, Building, Sparkles, 
  Loader2, UserCircle, Home
} from "lucide-react"

export default function AdminHeader() {
  const router = useRouter()
  const { user, loading, logout } = useAuth() // ✅ NEW: Use auth context
  const { post } = useApi() // ✅ NEW: Use API client
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // ✅ REMOVED: BASE_URL and manual fetch

  // ✅ UPDATED: Handle logout using new API system
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      console.log("[ADMIN-HEADER] Logging out admin user")
      
      await post("/auth/logout", {})
      logout()
      router.push("/login")
    } catch (error) {
      console.error("[ADMIN-HEADER] Error during logout:", error)
      logout()
      router.push("/login")
    } finally {
      setIsLoggingOut(false)
      setIsMobileMenuOpen(false)
    }
  }

  // ✅ NEW: Navigation handlers
  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  // ✅ NEW: User initials helper
  const getUserInitials = (username?: string, email?: string) => {
    if (username) {
      return username.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "A"
  }

  // ✅ NEW: Loading state
  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          <div className="w-32 h-8 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded animate-pulse"></div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
          {/* ✅ ENHANCED: Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 sm:gap-3 group">
              <div className="relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full border border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                  TripMate
                </span>
                <div className="flex items-center gap-1">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 text-xs px-1.5 py-0.5 shadow-sm">
                    <Crown className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                    <span className="hidden sm:inline">Admin Portal</span>
                    <span className="sm:hidden">Admin</span>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ ENHANCED: Desktop Navigation & User Menu */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <nav className="flex items-center gap-2 lg:gap-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin')}
                className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-medium h-9"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin/analytics')}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-9"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin/users')}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-9"
              >
                <Users className="w-4 h-4 mr-2" />
                Users
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/admin/providers')}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-9"
              >
                <Building className="w-4 h-4 mr-2" />
                Providers
              </Button>
            </nav>

            {/* ✅ ENHANCED: Desktop Avatar Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center justify-center w-full h-full">
                    {user ? (
                      <span className="text-sm sm:text-base font-semibold">
                        {getUserInitials(user.username, user.email)}
                      </span>
                    ) : (
                      <UserCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent 
                align="end" 
                className="w-64 sm:w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-xl p-2"
              >
                {/* User Info Header */}
                {user && (
                  <>
                    <DropdownMenuLabel className="px-3 py-3 border-b border-gray-200 dark:border-gray-700 mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-sm sm:text-base font-bold text-white">
                            {getUserInitials(user.username, user.email)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {user.username || 'Admin User'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          <div className="mt-1">
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 text-xs shadow-sm">
                              <Crown className="w-3 h-3 mr-1" />
                              <span className="capitalize">Admin</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                  </>
                )}

                {/* Menu Items */}
                <div className="space-y-1">
                  <DropdownMenuItem 
                    onClick={() => router.push('/admin/profile')}
                    className="px-3 py-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account</p>
                      </div>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    onClick={() => router.push('/admin/settings')}
                    className="px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-md group-hover:bg-gray-200 dark:group-hover:bg-gray-700/50 transition-colors">
                        <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">System preferences</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-700" />

                {/* Logout */}
                <div className="pt-1">
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-md group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                        {isLoggingOut ? (
                          <Loader2 className="h-4 w-4 text-red-600 dark:text-red-400 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-red-700 dark:text-red-400">
                          {isLoggingOut ? 'Signing out...' : 'Sign out'}
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-500">
                          {isLoggingOut ? 'Please wait' : 'Sign out of admin panel'}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-3 py-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      TripMate Admin • Version 1.0
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* ✅ ENHANCED: Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 text-xs px-2 py-1 shadow-sm">
                <Crown className="w-3 h-3 mr-1" />
                <span className="capitalize">Admin</span>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 w-8 h-8 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* ✅ ENHANCED: Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-14 right-0 w-72 max-w-[85vw] h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="p-4 space-y-4 h-full flex flex-col">
              
              {/* User Info Header */}
              {user && (
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 rounded-xl border border-yellow-200 dark:border-yellow-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-base font-bold text-white">
                        {getUserInitials(user.username, user.email)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user.username || 'Admin User'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1">
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 text-xs shadow-sm">
                          <Crown className="w-3 h-3 mr-1" />
                          <span className="capitalize">Admin</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex-1 space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                
                {/* Dashboard Link */}
                <button 
                  onClick={() => handleNavigation('/admin')}
                  className="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      <Home className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dashboard</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Admin overview</p>
                    </div>
                  </div>
                </button>

                {/* Analytics Link */}
                <button 
                  onClick={() => handleNavigation('/admin/analytics')}
                  className="w-full p-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-md group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                      <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Analytics</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">System metrics</p>
                    </div>
                  </div>
                </button>

                {/* Users Link */}
                <button 
                  onClick={() => handleNavigation('/admin/users')}
                  className="w-full p-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-md group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                      <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Users</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">User management</p>
                    </div>
                  </div>
                </button>

                {/* Providers Link */}
                <button 
                  onClick={() => handleNavigation('/admin/providers')}
                  className="w-full p-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-md group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800/50 transition-colors">
                      <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Providers</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Service providers</p>
                    </div>
                  </div>
                </button>

                {/* Profile Link */}
                <button 
                  onClick={() => handleNavigation('/admin/profile')}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-md group-hover:bg-gray-200 dark:group-hover:bg-gray-700/50 transition-colors">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Account settings</p>
                    </div>
                  </div>
                </button>

                {/* Settings Link */}
                <button 
                  onClick={() => handleNavigation('/admin/settings')}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-md group-hover:bg-gray-200 dark:group-hover:bg-gray-700/50 transition-colors">
                      <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">System preferences</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Logout Section */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-red-100 dark:bg-red-900/50 rounded-md group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-colors">
                      {isLoggingOut ? (
                        <Loader2 className="h-4 w-4 text-red-600 dark:text-red-400 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        {isLoggingOut ? 'Signing out...' : 'Sign out'}
                      </p>
                      <p className="text-xs text-red-500 dark:text-red-500">
                        {isLoggingOut ? 'Please wait' : 'Sign out of admin panel'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    TripMate Admin • Version 1.0
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
