'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ 
  children, 
  fallback = null, 
  requireAuth = true 
}: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>;
  }

  if (!requireAuth && isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
