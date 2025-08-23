"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Package, MapPin, Menu, X, Sparkles, Crown, User, Shield, Settings, LogOut, Loader2, UserCircle, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { useRouter } from 'next/navigation'
import { useApi } from '@/hooks/useApi'

type Role = 'general' | 'provider' | 'admin'

export default function DashboardHeader() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const { post } = useApi()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const role = user?.role as Role || 'general'

  // ✅ Logout handler for both desktop and mobile
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      console.log("[DASHBOARD-HEADER] Logging out user")
      
      await post("/auth/logout", {})
      logout()
      router.push("/login")
    } catch (error) {
      console.error("[DASHBOARD-HEADER] Error during logout:", error)
      logout()
      router.push("/login")
    } finally {
      setIsLoggingOut(false)
      setIsMobileMenuOpen(false)
    }
  }

  // ✅ Profile handler for both desktop and mobile
  const handleProfileClick = () => {
    if (role === 'provider') {
      router.push("/provider-profile")
    } else {
      router.push("/profile")
    }
    setIsMobileMenuOpen(false)
  }

  // ✅ Settings handler for both desktop and mobile
  const handleSettingsClick = () => {
    router.push("/settings")
    setIsMobileMenuOpen(false)
  }

  // ✅ User initials helper
  const getUserInitials = (username?: string, email?: string) => {
    if (username) {
      return username.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  // ✅ Role-based styling helpers
  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case 'admin': return <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
      case 'provider': return <Package className="w-3 h-3 sm:w-4 sm:h-4" />
      default: return <User className="w-3 h-3 sm:w-4 sm:h-4" />
    }
  }

  const getRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'admin': return 'from-yellow-500 to-orange-600'
      case 'provider': return 'from-purple-500 to-indigo-600'
      default: return 'from-blue-500 to-cyan-600'
    }
  }

  const getDesktopRoleColor = (userRole: string) => {
    switch (userRole) {
      case 'admin': return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0'
      case 'provider': return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0'
      default: return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0'
    }
  }

  if (loading) {
    return (
      <header className="sticky top-0 z-50 h-14 sm:h-16 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="w-24 h-6 sm:w-28 sm:h-7 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded animate-pulse"></div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-16 h-8 sm:w-20 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  const home = role === 'provider' ? '/provider' : role === 'admin' ? '/admin' : '/dashboard'

  const getActionButton = () => {
    switch (role) {
      case 'provider':
        return (
          <Link href="/provider/create-service">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 px-3 sm:px-4 py-2 h-8 sm:h-10"
            >
              <Package className="h-3 h-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-sm">Create Service</span>
              <span className="sm:hidden text-xs">Service</span>
            </Button>
          </Link>
        )
      case 'general':
        return (
          <Link href="/create-trip">
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 px-3 sm:px-4 py-2 h-8 sm:h-10"
            >
              <MapPin className="h-3 h-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-sm">Create Trip</span>
              <span className="sm:hidden text-xs">Trip</span>
            </Button>
          </Link>
        )
      case 'admin':
        return (
          <Link href="/admin/overview">
            <Button 
              size="sm" 
              variant="outline"
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300 flex items-center gap-2 px-3 sm:px-4 py-2 h-8 sm:h-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm"
            >
              <Shield className="h-3 h-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-sm">Admin Panel</span>
              <span className="sm:hidden text-xs">Admin</span>
            </Button>
          </Link>
        )
      default:
        return null
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 h-14 sm:h-16 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand */}
          <Link href={home} className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                  TripMate
                </span>
                {user && (
                  <div className="hidden sm:flex items-center gap-1">
                    <Badge className={`bg-gradient-to-r ${getRoleColor(role)} text-white border-0 text-xs px-1.5 py-0.5 shadow-sm`}>
                      {getRoleIcon(role)}
                      <span className="ml-1 capitalize">{role}</span>
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* ✅ INTEGRATED: Desktop Navigation with custom dropdown */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {getActionButton()}
            
            {/* ✅ REPLACED: Custom AvatarMenu dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-sm sm:text-base font-bold text-white">
                            {getUserInitials(user.username, user.email)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {user.username || 'User'}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                            {user.email}
                          </p>
                          <div className="mt-1">
                            <Badge className={`text-xs ${getDesktopRoleColor(user.role)} shadow-sm`}>
                              {getRoleIcon(user.role)}
                              <span className="ml-1 capitalize">{user.role}</span>
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
                    onClick={handleProfileClick}
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
                    onClick={handleSettingsClick}
                    className="px-3 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-md group-hover:bg-gray-200 dark:group-hover:bg-gray-700/50 transition-colors">
                        <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Preferences & privacy</p>
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
                          {isLoggingOut ? 'Please wait' : 'Sign out of your account'}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="px-3 py-2 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      TripMate • Version 1.0
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center gap-2">
            {user && (
              <Badge className={`bg-gradient-to-r ${getRoleColor(role)} text-white border-0 text-xs px-2 py-1 shadow-sm`}>
                {getRoleIcon(role)}
                <span className="ml-1 capitalize">{role}</span>
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

      {/* Mobile Menu - Same as before */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-14 right-0 w-72 max-w-[85vw] h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="p-4 space-y-4 h-full flex flex-col">
              
              {/* User Info Header */}
              {user && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-base font-bold text-white">
                        {getUserInitials(user.username, user.email)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <div className="mt-1">
                        <Badge className={`bg-gradient-to-r ${getRoleColor(role)} text-white border-0 text-xs shadow-sm`}>
                          {getRoleIcon(role)}
                          <span className="ml-1 capitalize">{role}</span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="space-y-3">
                {getActionButton()}
              </div>

              {/* Navigation Links */}
              <div className="flex-1 space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                
                {/* Dashboard Link */}
                <button 
                  onClick={() => {
                    router.push(home)
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-md group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                      {role === 'admin' ? (
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : role === 'provider' ? (
                        <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {role === 'admin' ? 'Admin Dashboard' : role === 'provider' ? 'Provider Dashboard' : 'Dashboard'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {role === 'admin' ? 'System management' : role === 'provider' ? 'Manage your services' : 'Your main dashboard'}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Profile Link */}
                <button 
                  onClick={handleProfileClick}
                  className="w-full p-3 text-left hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-md group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                      <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Profile</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account</p>
                    </div>
                  </div>
                </button>

                {/* Settings Link */}
                <button 
                  onClick={handleSettingsClick}
                  className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-800/50 rounded-md group-hover:bg-gray-200 dark:group-hover:bg-gray-700/50 transition-colors">
                      <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Preferences & privacy</p>
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
                        {isLoggingOut ? 'Please wait' : 'Sign out of your account'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="px-3 py-2 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    TripMate • Version 1.0
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
