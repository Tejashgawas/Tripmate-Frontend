/*  components/ProviderProfileBanner.tsx
    Warns provider when profile is incomplete
    ───────────────────────────────────────── */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { BASE_URL, fetchWithRetry } from '@/lib/auth';

const REQUIRED_FIELDS = [
  'name',
  'contact_email',
  'contact_phone',
  'location',
  'description'
] as const;

export default function ProviderProfileBanner() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  /* fetch provider profile once */
  useEffect(() => {
    fetchWithRetry(`${BASE_URL}me/get-provider`, { credentials: 'include' })
      .then(r => r.json())
      .then(profile => {
        const incomplete = REQUIRED_FIELDS.some(f => !profile?.[f]);
        setShow(incomplete);
      })
      .catch(() => setShow(false));          // swallow errors
  }, []);

  if (!show) return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-300 bg-amber-100/90 px-6 py-4 text-amber-900 shadow-sm animate-pulse">
      <p className="font-semibold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        Finish setting up your provider profile to unlock all features.
      </p>

      <button
        className="mt-3 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition"
        onClick={() => router.push('/provider/setup-profile')}
      >
        Complete profile
      </button>
    </div>
  );
}
