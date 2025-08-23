'use client';
import { Analytics } from "@vercel/analytics/next"
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="general">
      <Analytics/>
      {children}
    </ProtectedRoute>
  );
}
