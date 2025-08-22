'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input }  from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';   // if you have one
import { toast } from 'sonner';                         // or shadcn’s useToast

const FIELDS = [
  { id: 'name',           label: 'Business / Name' },
  { id: 'contact_email',  label: 'Contact Email' },
  { id: 'contact_phone',  label: 'Contact Phone' },
  { id: 'location',       label: 'Location' },
  { id: 'description',    label: 'Short Description', textarea: true }
] as const;

export default function ProviderProfileSetup() {
  const router = useRouter();
  const [form, setForm] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, val: string) =>
    setForm(prev => ({ ...prev, [field]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/me/provider-profile', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    });

    if (res.ok) {
      toast.success('Profile saved 🎉');
      // Wait a second so the toast is visible, then refresh & go back
      setTimeout(() => {
        router.refresh();            // revalidate ProviderProfileBanner
        router.replace('/provider'); // back to dashboard
      }, 1000);
    } else {
      toast.error('Could not save profile, please try again.');
    }
    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-xl py-10 px-4">
      <h1 className="mb-6 text-2xl font-bold text-blue-700">
        Complete your provider profile
      </h1>

      <form className="space-y-5" onSubmit={handleSubmit}>
        {FIELDS.map(f => (
          <div key={f.id} className="space-y-1">
            <label className="text-sm font-medium">{f.label}</label>
            {f.textarea ? (
              <Textarea
                rows={4}
                required
                value={form[f.id] ?? ''}
                onChange={e => handleChange(f.id, e.target.value)}
              />
            ) : (
              <Input
                required
                value={form[f.id] ?? ''}
                onChange={e => handleChange(f.id, e.target.value)}
              />
            )}
          </div>
        ))}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </main>
  );
}
