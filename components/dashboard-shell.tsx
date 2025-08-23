"use client"

import { ReactNode, useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
  MapPin, Calendar, CheckSquare, IndianRupee,
  Star, MessageCircle, Mail, Menu, X, 
  Home, User, Settings, LogOut, ChevronRight,
  Sparkles, Crown, Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import AvatarMenu from "@/components/avatar-menu"

interface ShellProps { 
  children: ReactNode 
}

const items = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: MapPin, label: "Trips", href: "/trips" },
  { icon: Mail, label: "Invites", href: "/invites" },
  { icon: Calendar, label: "Itineraries", href: "/itineraries" },
  { icon: CheckSquare, label: "Checklist", href: "/checklist" },
  { icon: IndianRupee, label: "Expenses", href: "/expenses" },
  { icon: Star, label: "Recommendations", href: "/recommendations" },
  { icon: MessageCircle, label: "Feedback", href: "/feedback" },
]

export default function DashboardShell({ children }: ShellProps) {
  const { user, loading, logout } = useAuth() // ✅ NEW: Use auth context
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = () => {
      if (sidebarOpen) setSidebarOpen(false)
    }
    
    if (sidebarOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [sidebarOpen])

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
      case 'provider': return <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
      default: return <User className="w-3 h-3 sm:w-4 sm:h-4" />
    }
  }

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'from-yellow-500 to-orange-600'
      case 'provider': return 'from-purple-500 to-indigo-600'
      default: return 'from-blue-500 to-cyan-600'
    }
  }

  const handleLogout = async () => {
    try {
      logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 relative">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 flex h-14 sm:h-16 items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 w-8 h-8 sm:w-10 sm:h-10 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </Button>

            {/* Brand */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
                TripMate
              </span>
            </Link>
          </div>

          {/* Desktop User Info & Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {user.username || 'User'}
                  </p>
                  <Badge className={`bg-gradient-to-r ${getRoleColor(user.role)} text-white border-0 text-xs shadow-sm`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </Badge>
                </div>
              </div>
            )}
            <AvatarMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
          className={`hidden lg:block fixed left-0 top-14 sm:top-16 z-40 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]
                      bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700
                      transition-all duration-300 ease-in-out shadow-lg
                      ${sidebarExpanded ? "w-64" : "w-16"}`}
        >
          <div className="p-3 sm:p-4">
            {items.map(({ icon: Icon, label, href }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link key={href} href={href} className="block relative group">
                  {/* Curved bracket indicator (collapsed + active) */}
                  {active && !sidebarExpanded && (
                    <>
                      <span className="absolute -left-[1px] top-[6px] h-[18px] w-0.5 bg-blue-600 rounded-tr-full"/>
                      <span className="absolute -left-[1px] bottom-[6px] h-[18px] w-0.5 bg-blue-600 rounded-br-full"/>
                    </>
                  )}

                  <div
                    className={`flex items-center gap-3 p-3 mb-2 rounded-lg transition-all duration-300
                                hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md
                                ${active && sidebarExpanded ? "bg-blue-50 dark:bg-blue-900/20 shadow-md" : ""}
                                ${active ? "border-l-2 border-blue-600" : ""}`}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 transition-all duration-300
                                  ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}
                                  group-hover:text-blue-600 dark:group-hover:text-blue-400
                                  group-hover:scale-110`}
                    />
                    <span
                      className={`text-sm font-medium transition-all duration-300
                                  ${sidebarExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}
                                  ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}
                                  group-hover:text-blue-600 dark:group-hover:text-blue-400`}
                    >
                      {label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="relative w-80 max-w-[85vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TripMate
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 w-8 h-8 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info */}
              {user && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-white">
                        {user.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {user.username || 'User'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      <Badge className={`bg-gradient-to-r ${getRoleColor(user.role)} text-white border-0 text-xs mt-1 shadow-sm`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {items.map(({ icon: Icon, label, href }) => {
                  const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  return (
                    <Link 
                      key={href} 
                      href={href} 
                      onClick={() => setSidebarOpen(false)}
                      className="block"
                    >
                      <div
                        className={`flex items-center justify-between gap-3 p-3 rounded-lg transition-all duration-300
                                    hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-md group
                                    ${active ? "bg-blue-50 dark:bg-blue-900/20 shadow-md border border-blue-200 dark:border-blue-700" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`h-5 w-5 transition-all duration-300
                                        ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}
                                        group-hover:text-blue-600 dark:group-hover:text-blue-400
                                        group-hover:scale-110`}
                          />
                          <span
                            className={`text-sm font-medium
                                        ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}
                                        group-hover:text-blue-600 dark:group-hover:text-blue-400`}
                          >
                            {label}
                          </span>
                        </div>
                        <ChevronRight className={`h-4 w-4 transition-all duration-300 ${active ? "text-blue-600 dark:text-blue-400" : "text-gray-400"} group-hover:text-blue-600 dark:group-hover:text-blue-400`} />
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Link href="/profile" onClick={() => setSidebarOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile</span>
                  </div>
                </Link>
                <Link href="/settings" onClick={() => setSidebarOpen(false)}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                >
                  <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out px-4 sm:px-6 py-4 sm:py-6
                      ${sidebarExpanded ? "lg:ml-64" : "lg:ml-16"}`}
        >
          {/* Content wrapper with animated background */}
          <div className="relative">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
