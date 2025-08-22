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

const BASE_URL = "https://tripmate-39hm.onrender.com/"

interface UserDTO {
  id: number
  email: string
  username: string
  role: string
}

export default function AdminProfilePage() {
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
      setToast("Profile updated successfully!")
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
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e40af]" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10">
              <ArrowLeft className="h-5 w-5 text-[#1e40af]" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1e40af] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
              Admin Profile
            </h1>
            <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
          </div>
        </div>
        {user && (
          <Badge className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white">
            {user.role}
          </Badge>
        )}
      </div>

      {/* Profile Form Card */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur max-w-2xl">
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <Input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af]"
              placeholder="Enter your username"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af]"
              placeholder="Enter your email address"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <PasswordInput
              placeholder="Leave blank to keep current password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="border-gray-200 focus:border-[#1e40af] focus:ring-[#1e40af]"
            />
            <p className="text-xs text-muted-foreground">
              Only fill this field if you want to change your password
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => saveProfile()}
              disabled={saving}
              className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 px-8"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {saving ? "Updating..." : "Update Profile"}
            </Button>
          </div>
        </div>
      </Card>

      {/* User Info Card */}
      {user && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 max-w-2xl">
          <div className="p-6">
            <h3 className="font-semibold text-lg text-[#1e40af] mb-4">Account Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <p className="font-medium">#{user.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Account Role:</span>
                <p className="font-medium">{user.role}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Username:</span>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Success Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-white border border-green-200 p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">{toast}</span>
        </div>
      )}
    </div>
  )
}