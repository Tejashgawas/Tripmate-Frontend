/*  app/provider/layout.tsx
    Guard + chrome for the provider area
    ───────────────────────────────────── */
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchMe } from '@/lib/auth';
import DashboardHeader   from '@/components/dashboard-header';
import ProviderSidebar   from './Sidebar';

export default function ProviderLayout({ children }:{ children:ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [ready , setReady] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* --- role-gate -------------------------------------------------- */
  useEffect(() => {
    fetchMe()
      .then(({ role }) => {
        if (role === 'provider') {
          setReady(true);
        } else {
          router.replace(role === 'admin' ? '/admin' : '/dashboard');
        }
      })
      .catch(() => router.replace('/login'));   // not logged-in
  }, []);

  // Handle sidebar collapse state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!ready) return <Spinner />;

  /* --- chrome ----------------------------------------------------- */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Fixed sidebar */}
      <div className="fixed top-16 left-0 h-[calc(100vh-4rem)] z-30">
        <ProviderSidebar 
          current={pathname} 
          defaultCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Fixed header */}
        <div className="fixed top-0 left-0 right-0 z-40">
          <DashboardHeader />
        </div>

        {/* Main content area with responsive margin */}
        <main className="flex-1 pt-20 ml-20 lg:ml-72 transition-all duration-300 p-6 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

/* tiny full-screen spinner */
function Spinner() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
    </div>
  );
}