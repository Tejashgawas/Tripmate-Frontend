"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, CheckCircle, ArrowLeft, User, Mail, Crown, 
  Shield, Save, AlertTriangle, Eye, EyeOff, Sparkles,
  Calendar, Hash, UserCircle
} from "lucide-react"
import { PasswordInput } from "@/components/password-input"
import { toast } from "sonner"

// ✅ REMOVED: BASE_URL constant

interface UserDTO {
  id: number
  email: string
  username: string
  role: string
}

interface FormData {
  username: string
  email: string
  password: string
}

export default function AdminProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading, refreshUser } = useAuth() // ✅ NEW: Use auth context
  const { get, put, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client

  const [profile, setProfile] = useState<UserDTO | null>(null)
  const [form, setForm] = useState<FormData>({ username: "", email: "", password: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // ✅ REMOVED: refreshToken helper and manual fetch functions

  // ✅ UPDATED: Load profile using new API system
  const loadProfile = async () => {
    // Check if user is authenticated and is admin
    if (!user) {
      router.push('/login')
      return
    }
    
    if (user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('[ADMIN-PROFILE] Loading profile')
      
      const data = await get<UserDTO>('/me/')
      setProfile(data)
      setForm({ username: data.username, email: data.email, password: "" })
    } catch (error) {
      console.error('[ADMIN-PROFILE] Error loading profile:', error)
      setError('Failed to load profile data')
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  // ✅ UPDATED: Save profile using new API system
  const saveProfile = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      toast.error('Username and email are required')
      return
    }

    setSaving(true)
    try {
      console.log('[ADMIN-PROFILE] Saving profile:', form)
      
      const data = await put<UserDTO>('/me/', form)
      
      setProfile(data)
      setForm({ username: data.username, email: data.email, password: "" })
      
      // Refresh user context if available
      if (refreshUser) {
        await refreshUser()
      }
      
      toast.success('Profile updated successfully! 🎉')
    } catch (error) {
      console.error('[ADMIN-PROFILE] Error saving profile:', error)
      toast.error('Failed to update profile')
      setError('Could not update profile')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadProfile()
    }
  }, [user, authLoading])

  // ✅ ENHANCED: Loading screen
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-400/20 to-yellow-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Loading Admin Profile
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Preparing your account settings...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ✅ NEW: Error state
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-950 dark:via-gray-900 dark:to-orange-950 p-4">
        <div className="max-w-xs sm:max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
            Profile Error
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Button 
            onClick={loadProfile}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-400/10 to-yellow-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-xs sm:max-w-4xl mx-auto">
        
        {/* ✅ ENHANCED: Header Section with mobile responsiveness */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/admin">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 w-10 h-10 p-0"
              >
                <ArrowLeft className="h-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Admin Profile
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Manage your account settings and preferences
                </p>
              </div>
            </div>
          </div>
          {profile && (
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 shadow-md">
              <Crown className="w-3 h-3 mr-1" />
              {profile.role}
            </Badge>
          )}
        </div>

        {/* ✅ ENHANCED: Profile Form Card with mobile responsiveness */}
        <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900 dark:text-gray-100">Profile Settings</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Update your personal information and security settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8 space-y-6">
            {/* Username Field */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <UserCircle className="w-4 h-4" />
                Username *
              </label>
              <Input
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                Email Address *
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2 sm:space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Shield className="w-4 h-4" />
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave blank to keep current password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-10 sm:h-12 pr-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Only fill this field if you want to change your password
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-400 text-sm sm:text-base">Error updating profile</p>
                  <p className="text-red-700 dark:text-red-300 text-xs sm:text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex flex-col sm:flex-row justify-end pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={saveProfile}
                disabled={saving || !form.username.trim() || !form.email.trim()}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-600 to-orange-700 hover:from-yellow-700 hover:to-orange-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12 px-6 sm:px-8"
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
          </CardContent>
        </Card>

        {/* ✅ ENHANCED: User Info Card with mobile responsiveness */}
        {profile && (
          <Card className="border-0 shadow-xl bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 rounded-xl sm:rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                  <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg sm:text-xl text-yellow-700 dark:text-yellow-300">Account Information</CardTitle>
                  <CardDescription className="text-sm sm:text-base text-yellow-600 dark:text-yellow-400">
                    Your current account details
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <Hash className="w-4 h-4" />
                    <span>User ID</span>
                  </div>
                  <p className="font-semibold text-base sm:text-lg text-yellow-800 dark:text-yellow-200">#{profile.id}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <Crown className="w-4 h-4" />
                    <span>Account Role</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 shadow-sm">
                      <Crown className="w-3 h-3 mr-1" />
                      {profile.role}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <UserCircle className="w-4 h-4" />
                    <span>Username</span>
                  </div>
                  <p className="font-semibold text-base sm:text-lg text-yellow-800 dark:text-yellow-200">{profile.username}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-semibold text-base sm:text-lg text-yellow-800 dark:text-yellow-200 break-all">{profile.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ✅ ENHANCED: Admin Tips Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-xl sm:rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg sm:text-xl text-blue-700 dark:text-blue-300">Admin Security Tips</CardTitle>
                <CardDescription className="text-sm sm:text-base text-blue-600 dark:text-blue-400">
                  Best practices for admin account security
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">Use a Strong Password</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">Include uppercase, lowercase, numbers, and symbols</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">Regular Password Updates</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">Change your password every 90 days for better security</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 text-sm sm:text-base">Monitor Admin Activity</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">Regularly review your account activity and access logs</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
