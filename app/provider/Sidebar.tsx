/*  app/provider/Sidebar.tsx
    Role-specific navigation for providers with modern styling
    ──────────────────────────────────────────────────────── */
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
] as const;

const BOTTOM_NAV = [
  { href: '/provider/settings', icon: Settings, label: 'Settings' },
  { href: '/provider/help', icon: HelpCircle, label: 'Help & Support' },
] as const;

interface ProviderSidebarProps {
  defaultCollapsed?: boolean;
}

interface ProviderSidebarProps {
  defaultCollapsed?: boolean;
  current?: string; // Add current prop to match your existing interface
}

export default function ProviderSidebar({ defaultCollapsed = false, current }: ProviderSidebarProps) {
  const pathname = current ?? usePathname() ?? '';
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = isCollapsed && !isHovered ? 'w-20' : 'w-72';
  const showLabels = !isCollapsed || isHovered;

  return (
    <aside 
      className={cn(
        'shrink-0 transition-all duration-300 ease-in-out h-full',
        sidebarWidth,
        'bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900',
        'border-r border-slate-700/50 backdrop-blur-xl'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Compact Header - No profile section since it's in the main header */}
      <div className="relative flex items-center justify-between p-4 border-b border-slate-700/50">
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
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            'hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all duration-200',
            showLabels ? 'opacity-100' : 'opacity-0'
          )}
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={section.title}>
            {showLabels && (
              <h3 className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/provider');
                
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    badge={item.badge}
                    active={active}
                    showLabel={showLabels}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Quick Stats (when expanded) */}
        {showLabels && (
          <div className="mx-3 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span className="text-xs font-medium text-white">Quick Stats</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Services</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Rating</span>
                <span className="text-yellow-400 font-medium">4.8★</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">This Month</span>
                <span className="text-green-400 font-medium">+23%</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-slate-700/50 p-2 space-y-1">
        {BOTTOM_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={active}
              showLabel={showLabels}
            />
          );
        })}
      </div>

      {/* Upgrade Banner (when expanded) - Smaller version */}
      {showLabels && (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
          <div className="text-center">
            <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
            <p className="text-xs font-medium text-white mb-1">Upgrade to Pro</p>
            <p className="text-xs text-slate-300 mb-2">Advanced analytics</p>
            <button className="w-full px-2 py-1.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-lg">
              Upgrade
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

/* Navigation Item Component */
function NavItem({ 
  href, 
  icon: Icon, 
  label, 
  badge = null, 
  active = false, 
  showLabel = true 
}: {
  href: string;
  icon: any;
  label: string;
  badge?: string | null;
  active?: boolean;
  showLabel?: boolean;
}) {
  return (
    <Link href={href} className="block">
      <div className={cn(
        'relative group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
        'hover:bg-slate-800/50 hover:shadow-lg hover:shadow-blue-500/10',
        active && 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/20',
        !showLabel && 'justify-center'
      )}>
        {/* Active indicator */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"></div>
        )}

        {/* Icon */}
        <div className={cn(
          'relative flex items-center justify-center transition-all duration-200',
          active ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'
        )}>
          <Icon className="w-5 h-5" />
          
          {/* Badge */}
          {badge && (
            <span className={cn(
              'absolute -top-2 -right-2 min-w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full',
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
              active ? 'text-white' : 'text-slate-300 group-hover:text-white'
            )}>
              {label}
            </span>
          </div>
        )}

        {/* Hover effect */}
        <div className={cn(
          'absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
          !active && 'group-hover:opacity-100'
        )}></div>
      </div>
    </Link>
  );
}

/* Hook for sidebar state management */
export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggle = () => setIsCollapsed(!isCollapsed);
  const collapse = () => setIsCollapsed(true);
  const expand = () => setIsCollapsed(false);
  
  return { isCollapsed, toggle, collapse, expand };
}