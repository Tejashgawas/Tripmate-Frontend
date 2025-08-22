/* components/dashboard-header.tsx
   Header that works without any theme context
   ─────────────────────────────────────────── */
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Package, MapPin } from 'lucide-react';

import { fetchMe } from '@/lib/auth';
import AvatarMenu from '@/components/avatar-menu';
import { Button } from '@/components/ui/button';

type Role = 'general' | 'provider' | 'admin';

/* -------------------------------------------------- */
export default function DashboardHeader() {
  const [role, setRole] = useState<Role | null>(null);   // null = still loading

  useEffect(() => {
    fetchMe()
      .then(({ role }) => setRole(role as Role))
      .catch(() => setRole('general'));                  // safe fallback
  }, []);

  /* bare bar while role loads */
  if (role === null)
    return <header className="sticky top-0 h-16 w-full bg-white/90 backdrop-blur shadow-sm" />;

  /* links depend on role */
  const home = role === 'provider' ? '/provider' : role === 'admin' ? '/admin' : '/dashboard';

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-white/90 backdrop-blur shadow-sm border-b border-slate-200/50">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* brand */}
        <Link
          href={home}
          className="text-xl font-extrabold tracking-tight text-blue-600 hover:opacity-80 transition-opacity duration-200"
        >
          TripMate
        </Link>

        {/* right-side controls */}
        <div className="flex items-center gap-4">
          {/* Role-specific action buttons */}
          {role === 'provider' && (
            <Link href="/provider/create-service">
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-4 py-2"
              >
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Create Service</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
          )}

          {role === 'general' && (
            <Link href="/create-trip">
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 px-4 py-2"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Create Trip</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
          )}

          {/* Admin gets no action button or could have a different one */}
          {role === 'admin' && (
            <Link href="/admin/overview">
              <Button 
                size="sm" 
                variant="outline"
                className="border-slate-300 hover:bg-slate-50 transition-all duration-200 flex items-center gap-2 px-4 py-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Panel</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            </Link>
          )}

          <AvatarMenu />
        </div>
      </div>
    </header>
  );
}