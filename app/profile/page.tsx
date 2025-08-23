"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, CheckCircle, ArrowLeft, User, Mail, 
  Lock, Shield, Edit, Save, AlertTriangle,
  Eye, EyeOff, UserCheck, Crown, Settings
} from "lucide-react"
import { PasswordInput } from "@/components/password-input"
import DashboardShell from "@/components/dashboard-shell"

interface UserDTO {
  id: number
  email: string
  username: string
  role: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, refreshUser } = useAuth() // ✅ NEW: Use auth context
  const { get, put, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client

  /* State */
  const [userProfile, setUserProfile] = useState<UserDTO | null>(null)
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // ✅ REMOVED: All manual authentication logic (BASE_URL, refreshToken)

  /* ───────── Fetch user profile using useApi ───────── */
  const loadProfile = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      setLoading(true)
      console.log("[PROFILE] Loading user profile")
      const data = await get<UserDTO>("/me/")
      setUserProfile(data)
      setForm({ 
        username: data.username || "", 
        email: data.email || "", 
        password: "" 
      })
    } catch (error) {
      console.error("[PROFILE] Error loading profile:", error)
      setErrorMessage("Failed to load profile")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  /* ───────── Save profile using useApi ───────── */
  const saveProfile = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      setErrorMessage("Username and email are required")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    try {
      setSaving(true)
      console.log("[PROFILE] Updating profile:", { username: form.username, email: form.email })
      
      const updateData: any = {
        username: form.username.trim(),
        email: form.email.trim()
      }
      
      // Only include password if it's provided
      if (form.password.trim()) {
        updateData.password = form.password
      }

      const data = await put<UserDTO>("/me/", updateData)
      setUserProfile(data)
      setForm({ 
        username: data.username, 
        email: data.email, 
        password: "" 
      })
      setIsEditing(false)
      setToast("Profile updated successfully!")
      setTimeout(() => setToast(""), 3000)
      
      // Refresh the user context
      if (refreshUser) {
        await refreshUser()
      }
    } catch (error) {
      console.error("[PROFILE] Error updating profile:", error)
      setErrorMessage("Failed to update profile")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    if (userProfile) {
      setForm({ 
        username: userProfile.username, 
        email: userProfile.email, 
        password: "" 
      })
    }
    setIsEditing(false)
  }

  /* ───────── Effects ───────── */
  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  /* ───────── Loading State ───────── */
  if (loading) {
    return (
      <DashboardShell>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950 p-4">
          <div className="text-center">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
            </div>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      <DashboardShell>
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
            <div className="container mx-auto max-w-xs sm:max-w-2xl">
              {/* Header */}
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
                <div className="flex items-center gap-4 sm:gap-6">
                  <Link href="/dashboard">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 w-10 h-10 sm:w-12 sm:h-12 p-2 sm:p-3"
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        My Profile
                      </h1>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                        Manage your account information
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Card */}
              <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
                {/* Profile Header */}
                {userProfile && (
                  <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                      <div className="relative">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <UserCheck className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {userProfile.username}
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-2">
                          {userProfile.email}
                        </p>
                        <div className="flex justify-center sm:justify-start">
                          <Badge className={`${
                            userProfile.role === 'admin' ? 
                            'bg-gradient-to-r from-yellow-500 to-orange-600 text-white' :
                            'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                          } border-0 shadow-md`}>
                            {userProfile.role === 'admin' && <Crown className="w-3 h-3 mr-1" />}
                            {userProfile.role}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => setIsEditing(!isEditing)}
                        variant="outline"
                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 h-10 sm:h-12"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Profile Form */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4" />
                      Username
                    </label>
                    <Input
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      disabled={!isEditing}
                      className={`h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 ${
                        isEditing ? 
                        'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400' :
                        'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      disabled={!isEditing}
                      className={`h-10 sm:h-12 text-sm sm:text-base transition-all duration-300 ${
                        isEditing ? 
                        'bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400' :
                        'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }`}
                    />
                  </div>

                  {/* Password Field */}
                  {isEditing && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        <Lock className="w-4 h-4" />
                        New Password (optional)
                      </label>
                      <PasswordInput
                        placeholder="••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="h-10 sm:h-12 bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-600 focus:border-blue-500 dark:focus:border-blue-400 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Leave blank to keep current password
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isEditing && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        onClick={cancelEdit}
                        disabled={saving}
                        variant="outline"
                        className="flex-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 h-10 sm:h-12 text-sm sm:text-base"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12 text-sm sm:text-base"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Update Profile
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Security Info Card */}
              <Card className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900/50 dark:to-blue-950/50 backdrop-blur-xl border-0 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-gray-500 to-blue-600 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                    Security Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Account ID:</p>
                    <p className="font-mono text-gray-900 dark:text-gray-100">{userProfile?.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Account Type:</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {userProfile?.role}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Success Toast */}
        {toast && (
          <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 rounded-lg shadow-lg flex items-center space-x-2 backdrop-blur-xl z-50">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <span className="text-xs sm:text-sm font-medium">{toast}</span>
          </div>
        )}

        {/* Error Toast */}
        {showError && (
          <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-3 sm:p-4 rounded-lg shadow-lg flex items-center space-x-2 backdrop-blur-xl z-50">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
            <span className="text-xs sm:text-sm font-medium text-red-700 dark:text-red-400">{errorMessage}</span>
          </div>
        )}
      </DashboardShell>
    </div>
  )
}
