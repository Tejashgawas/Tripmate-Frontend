"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  User, LogOut, Settings, Shield, Crown, 
  UserCircle, Mail, Loader2, ChevronDown 
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"

export default function AvatarMenu() {
  const router = useRouter()
  const { user, logout } = useAuth() // ✅ NEW: Use auth context
  const { post, loading: apiLoading } = useApi() // ✅ NEW: Use API client
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // ✅ REMOVED: BASE_URL and manual fetch logic

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      console.log("[AVATAR-MENU] Logging out user")
      
      // Call the logout API endpoint
      await post("/auth/logout", {})
      
      // Use the logout function from auth context
      logout()
      
      router.push("/login")
    } catch (error) {
      console.error("[AVATAR-MENU] Error during logout:", error)
      // Even if API call fails, log out locally
      logout()
      router.push("/login")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const getUserInitials = (username?: string, email?: string) => {
    if (username) {
      return username.substring(0, 2).toUpperCase()
    }
    if (email) {
      return email.substring(0, 2).toUpperCase()
    }
    return "U"
  }

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Crown className="w-3 h-3" />
      case 'moderator':
        return <Shield className="w-3 h-3" />
      default:
        return <User className="w-3 h-3" />
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0'
      case 'moderator':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0'
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0'
    }
  }

  return (
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
                    <Badge className={`text-xs ${getRoleColor(user.role)} shadow-sm`}>
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
            onClick={() => router.push("/settings")}
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
  )
}
