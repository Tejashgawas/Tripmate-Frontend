"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { 
  ClipboardList, 
  MessageCircle, 
  Home, 
  BarChart3, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Crown,
  Users,
  Calendar,
  Bell,
  HelpCircle,
  X,
  Menu,
  Star,
  TrendingUp,
  Package,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/* Enhanced navigation map with more options */
const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { href: '/provider', icon: Home, label: 'Dashboard', badge: null },
      { href: '/provider/analytics', icon: BarChart3, label: 'Analytics', badge: 'Pro' },
    ]
  },
  {
    title: 'Services',
    items: [
      { href: '/provider/services', icon: ClipboardList, label: 'My Services', badge: null },
      { href: '/provider/create-service', icon: Package, label: 'Create Service', badge: null },
      { href: '/provider/bookings', icon: Calendar, label: 'Bookings', badge: '3' },
    ]
  },
  {
    title: 'Communication',
    items: [
      { href: '/provider/feedback', icon: MessageCircle, label: 'Feedback', badge: null },
      { href: '/provider/customers', icon: Users, label: 'Customers', badge: null },
      { href: '/provider/notifications', icon: Bell, label: 'Notifications', badge: '12' },
    ]
  }
] as const

const BOTTOM_NAV = [
  { href: '/provider/settings', icon: Settings, label: 'Settings' },
  { href: '/provider/help', icon: HelpCircle, label: 'Help & Support' },
] as const

interface ProviderSidebarProps {
  defaultCollapsed?: boolean
  current?: string
  isMobile?: boolean
  onClose?: () => void
  onCollapseChange?: (collapsed: boolean) => void
}

export default function ProviderSidebar({ 
  defaultCollapsed = false, 
  current,
  isMobile = false,
  onClose,
  onCollapseChange
}: ProviderSidebarProps) {
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { get, loading, error } = useApi() // ✅ NEW: Use API client
  const pathname = current ?? usePathname() ?? ''
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [isHovered, setIsHovered] = useState(false)
  const [stats, setStats] = useState({
    services: 0,
    rating: 0,
    growth: 0
  })

  // ✅ REMOVED: Manual auth logic - now using auth context

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true)
      }
    }
    
    if (!isMobile) {
      handleResize()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [isMobile])

  // Fetch provider stats using new API system
  const fetchStats = async () => {
    if (!user) return
    
    try {
      // Example stats fetch - adjust endpoints as needed
      const data = await get('/providers/quick-stats')
      setStats({
        services: data.total_services || 0,
        rating: data.average_rating || 0,
        growth: data.growth_percentage || 0
      })
    } catch (error) {
      console.log('[SIDEBAR] Could not fetch stats:', error)
      // Fallback to default stats
    }
  }

  useEffect(() => {
    if (user && user.role === 'provider') {
      fetchStats()
    }
  }, [user])

  const handleCollapseToggle = () => {
    const newCollapsed = !isCollapsed
    setIsCollapsed(newCollapsed)
    onCollapseChange?.(newCollapsed)
  }

  const sidebarWidth = isCollapsed && !isHovered ? 'w-16 sm:w-20' : 'w-64 sm:w-72'
  const showLabels = !isCollapsed || isHovered || isMobile

  if (isMobile) {
    return (
      <div className="w-80 max-w-[85vw] h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-gray-200 dark:border-slate-700 shadow-2xl">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white">Provider Panel</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Manage your services</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-2 w-8 h-8 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User Info for Mobile */}
        {user && (
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-sm font-bold text-white">
                  {user.username?.substring(0, 2).toUpperCase() || user.email?.substring(0, 2).toUpperCase() || 'P'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {user.username || 'Provider'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                <Badge className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-0 text-xs mt-1 shadow-sm">
                  <Crown className="w-3 h-3 mr-1" />
                  Provider
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-6 max-h-[calc(100vh-300px)]">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="px-3 mb-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/provider')
                  
                  return (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      badge={item.badge}
                      active={active}
                      showLabel={true}
                      isMobile={true}
                      onClick={onClose}
                    />
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quick Stats (Mobile) */}
          <div className="mx-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-500/20">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Quick Stats</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Services</span>
                <span className="text-gray-900 dark:text-white font-medium">{stats.services}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Rating</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {stats.rating.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Growth</span>
                <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{stats.growth}%
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <div className="border-t border-gray-200 dark:border-slate-700 p-4 space-y-1">
          {BOTTOM_NAV.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={active}
                showLabel={true}
                isMobile={true}
                onClick={onClose}
              />
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <aside 
      className={cn(
        'shrink-0 transition-all duration-300 ease-in-out h-full',
        sidebarWidth,
        'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
        'border-r border-slate-700/50 backdrop-blur-xl shadow-xl'
      )}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Desktop Header */}
      <div className="relative flex items-center justify-between p-3 sm:p-4 border-b border-slate-700/50">
        <div className={cn(
          'flex items-center space-x-3 transition-opacity duration-300',
          showLabels ? 'opacity-100' : 'opacity-0'
        )}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Crown className="w-4 h-4 text-white" />
          </div>
          {showLabels && (
            <div>
              <p className="font-semibold text-white text-sm">Provider Panel</p>
              <p className="text-xs text-slate-400">Manage services</p>
            </div>
          )}
        </div>

        <button
          onClick={handleCollapseToggle}
          className={cn(
            'hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all duration-200',
            showLabels ? 'opacity-100' : 'opacity-0'
          )}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Desktop Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 sm:py-4 px-2 sm:px-3 space-y-4 sm:space-y-6">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            {showLabels && (
              <h3 className="px-3 mb-2 sm:mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/provider')
                
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    active={active}
                    showLabel={showLabels}
                    isMobile={false}
                  />
                )
              })}
            </div>
          </div>
        ))}

        {/* Quick Stats (Desktop - when expanded) */}
        {showLabels && (
          <div className="mx-3 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium text-white">Quick Stats</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Services</span>
                <span className="text-white font-medium">{stats.services}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Rating</span>
                <span className="text-yellow-400 font-medium flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {stats.rating.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Growth</span>
                <span className="text-green-400 font-medium">+{stats.growth}%</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Desktop Bottom Navigation */}
      <div className="border-t border-slate-700/50 p-2 space-y-1">
        {BOTTOM_NAV.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={active}
              showLabel={showLabels}
              isMobile={false}
            />
          )
        })}
      </div>

      {/* Upgrade Banner (Desktop - when expanded) */}
      {showLabels && (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <div className="text-center">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-white mb-1">Upgrade to Pro</p>
            <p className="text-xs text-slate-300 mb-2">Advanced analytics</p>
            <button className="w-full px-2 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Upgrade
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

/* Navigation Item Component */
function NavItem({ 
  href, 
  icon: Icon, 
  label, 
  badge = null, 
  active = false, 
  showLabel = true,
  isMobile = false,
  onClick
}: {
  href: string
  icon: any
  label: string
  badge?: string | null
  active?: boolean
  showLabel?: boolean
  isMobile?: boolean
  onClick?: () => void
}) {
  return (
    <Link href={href} className="block" onClick={onClick}>
      <div className={cn(
        'relative group flex items-center gap-3 px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200',
        isMobile 
          ? 'hover:bg-gray-100 dark:hover:bg-slate-800/50'
          : 'hover:bg-slate-800/50 hover:shadow-lg hover:shadow-blue-500/10',
        active && (isMobile 
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 shadow-md'
          : 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/20'
        ),
        !showLabel && 'justify-center'
      )}>
        {/* Active indicator */}
        {active && (
          <div className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-8 rounded-r-full',
            isMobile 
              ? 'bg-gradient-to-b from-blue-500 to-purple-600'
              : 'bg-gradient-to-b from-blue-400 to-purple-500'
          )}></div>
        )}

        {/* Icon */}
        <div className={cn(
          'relative flex items-center justify-center transition-all duration-200',
          active 
            ? (isMobile ? 'text-blue-600 dark:text-blue-400' : 'text-blue-400') 
            : (isMobile ? 'text-gray-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400' : 'text-slate-400 group-hover:text-white')
        )}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          
          {/* Badge */}
          {badge && (
            <span className={cn(
              'absolute -top-2 -right-2 min-w-4 h-4 sm:min-w-5 sm:h-5 flex items-center justify-center text-xs font-bold rounded-full',
              badge === 'Pro' 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-1.5' 
                : 'bg-red-500 text-white'
            )}>
              {badge}
            </span>
          )}
        </div>

        {/* Label */}
        {showLabel && (
          <div className="flex-1 min-w-0">
            <span className={cn(
              'font-medium text-sm transition-colors duration-200 truncate block',
              active 
                ? (isMobile ? 'text-blue-700 dark:text-blue-300' : 'text-white') 
                : (isMobile ? 'text-gray-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-300' : 'text-slate-300 group-hover:text-white')
            )}>
              {label}
            </span>
          </div>
        )}

        {/* Hover effect */}
        <div className={cn(
          'absolute inset-0 rounded-lg sm:rounded-xl transition-opacity duration-200',
          isMobile
            ? 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-500/5 dark:to-purple-600/5 opacity-0 group-hover:opacity-100'
            : 'bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100',
          !active && 'group-hover:opacity-100'
        )}></div>
      </div>
    </Link>
  )
}

/* Hook for sidebar state management */
export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const toggle = () => setIsCollapsed(!isCollapsed)
  const collapse = () => setIsCollapsed(true)
  const expand = () => setIsCollapsed(false)
  
  return { isCollapsed, toggle, collapse, expand }
}
