"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, ArrowLeft } from "lucide-react"
import { PasswordInput } from "@/components/password-input"
import DashboardShell from "@/components/dashboard-shell"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

interface UserDTO {
  id: number
  email: string
  username: string
  role: string
}

export default function ProfilePage() {
  const router = useRouter()

  /* state */
  const [user, setUser] = useState<UserDTO | null>(null)
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState("")

  /* ───────── helper: refresh token ───────── */
  const refreshToken = async () => {
    const res = await fetch(`${BASE_URL}auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
    return res.ok
  }

  /* ───────── fetch user (with retry) ───────── */
  const loadProfile = async (retry = false) => {
    try {
      const res = await fetch(`${BASE_URL}me/`, {
        method: "GET",
        credentials: "include",
      })
      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return loadProfile(true)
        throw new Error("Auth failed")
      }
      if (!res.ok) throw new Error("Failed to load profile")
      const data: UserDTO = await res.json()
      setUser(data)
      setForm({ username: data.username, email: data.email, password: "" })
    } catch (err) {
      console.error(err)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [])

  /* ───────── save profile (with retry) ───────── */
  const saveProfile = async (retry = false) => {
    setSaving(true)
    try {
      const res = await fetch(`${BASE_URL}me/`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return saveProfile(true)
        throw new Error("Auth failed")
      }
      if (!res.ok) throw new Error("Update failed")
      const data: UserDTO = await res.json()
      setUser(data)
      setForm({ username: data.username, email: data.email, password: "" })
      setToast("Profile updated")
      setTimeout(() => setToast(""), 3000)
    } catch (err) {
      console.error(err)
      alert("Could not update profile")
    } finally {
      setSaving(false)
    }
  }

  /* ───────── UI ───────── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading profile…
      </div>
    )
  }

  return (
    <DashboardShell>
      <div className="container mx-auto max-w-xl py-10">
        {/* header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10">
              <ArrowLeft className="h-5 w-5 text-[#1e40af]" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
            My Profile
          </h1>
        </div>

        <Card className="p-6 space-y-5">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Username</label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Email</label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">New Password (optional)</label>
            <PasswordInput
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => saveProfile()}
              disabled={saving}
              className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6]"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Update Profile
            </Button>
          </div>
        </Card>

        {user && (
          <div className="mt-6 flex items-center space-x-2">
            <span className="text-muted-foreground text-sm">Role:</span>
            <Badge>{user.role}</Badge>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 right-6 bg-background border p-4 rounded-lg shadow flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm">{toast}</span>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
