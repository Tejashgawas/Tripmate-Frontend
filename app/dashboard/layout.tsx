// app/dashboard/layout.tsx
'use client';                     // required—uses hooks

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then(({ role }) => {
        if (role !== 'general') {
          router.replace(
            role === 'provider' ? '/provider'
            : role === 'admin'   ? '/admin'
            : '/'
          );
        } else {
          setLoading(false);
        }
      })
      .catch(() => router.replace('/login'));
  }, []);

  if (loading) return <p className="p-10">Loading…</p>;
  return <>{children}</>;
}
