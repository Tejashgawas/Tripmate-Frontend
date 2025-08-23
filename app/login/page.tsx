"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft, Eye, EyeOff, Users, MapPin, CheckCircle, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RolePickerModal from "@/components/RolePickerModal"
import { useAuth } from "@/contexts/AuthContext"
import AuthGuard from "@/components/auth/AuthGuard"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user, loading: authLoading } = useAuth()
  const new_user = searchParams.get("new_user")

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)

  /* ── role redirection ─────────────────── */
  const redirectByRole = (role: string) => {
    switch (role) {
      case "general":
        router.push("/dashboard")
        break
      case "provider":
        router.push("/provider")
        break
      case "admin":
        router.push("/admin")
        break
      default:
        router.push("/")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const role = await login({
        email: formData.email,
        password: formData.password
      })
      
      setShowSuccessToast(true)
      setTimeout(() => {
        setShowSuccessToast(false)
        redirectByRole(role)
      }, 1000)
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}auth/google/login`
  }

  /* ── handle role modal close ─────────────── */
  const handleRoleModalClose = () => {
    setShowRoleModal(false)
    // Clean up the URL parameter after role selection
    const url = new URL(window.location.href)
    url.searchParams.delete("new_user")
    window.history.replaceState({}, "", url.toString())
  }

  // Handle OAuth callback tokens
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('access_token')
    const refreshToken = urlParams.get('refresh_token')

    if (accessToken && refreshToken) {
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      
      // Clean URL
      const url = new URL(window.location.href)
      url.searchParams.delete('access_token')
      url.searchParams.delete('refresh_token')
      window.history.replaceState({}, '', url.toString())
      
      // Reload to trigger auth context initialization
      window.location.reload()
    }
  }, [])

  /* ── new user onboarding ─────────────── */
  useEffect(() => {
    if (!authLoading && user) {
      const isNewUser = new_user === "True"
      
      // Priority 1: New Google user - show role picker
      if (isNewUser && user.auth_type === "google") {
        console.log("Showing role picker for new Google user")
        setShowRoleModal(true)
        return
      }
      
      // Priority 2: Existing user with role - redirect
      console.log("Redirecting existing user with role:", user.role)
      redirectByRole(user.role)
    }
  }, [authLoading, user, new_user])

  /* ── render ─────────────── */
  return (
    <AuthGuard requireAuth={false} fallback={<div>Redirecting to dashboard...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-[#1e40af]/5 via-background to-[#06b6d4]/5 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Success toast */}
        {showSuccessToast && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top-2 duration-300">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 flex items-center space-x-3 min-w-[300px]">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                Login Successful
              </span>
              <button
                onClick={() => setShowSuccessToast(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-0 left-0 h-1 bg-green-500 rounded-b-lg animate-pulse w-full" />
            </div>
          </div>
        )}

        {/* Role Picker Modal */}
        {showRoleModal && (
          <RolePickerModal onClose={handleRoleModalClose} />
        )}

        {/* particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 particle-blue rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* header */}
        <header className="absolute top-0 left-0 right-0 z-50 p-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Link href="/" className="flex items-center space-x-2 group">
              <ArrowLeft className="h-5 w-5 text-[#1e40af] group-hover:translate-x-[-4px] transition-transform duration-300" />
              <span className="font-sans text-2xl font-black tracking-tight bg-gradient-to-r from-[#1e40af] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
                TripMate
              </span>
            </Link>
          </div>
        </header>

        {/* form card - hide when role modal is shown */}
        <div className={`w-full max-w-md relative z-10 transition-opacity duration-300 ${showRoleModal ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <Card className="backdrop-blur-sm bg-background/80 border-2 hover:border-[#1e40af]/20 transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center space-x-2 mb-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-[#1e40af]/10 to-[#06b6d4]/10">
                  <Users className="h-8 w-8 text-[#1e40af]" />
                </div>
                <div className="p-3 rounded-full bg-gradient-to-r from-[#06b6d4]/10 to-[#1e40af]/10">
                  <MapPin className="h-8 w-8 text-[#06b6d4]" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-lg">
                Sign in to continue your travel adventures
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full h-12 border-2 hover:border-[#1e40af]/20 transition-all duration-300 hover:shadow-lg relative overflow-hidden group bg-transparent"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1e40af]/5 to-[#06b6d4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="flex items-center justify-center space-x-3 relative z-10">
                    {/* google svg */}
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="font-medium">Continue with Google</span>
                  </div>
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-12 border-2 focus:border-[#1e40af] transition-colors duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="h-12 border-2 focus:border-[#1e40af] transition-colors duration-300 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !formData.email || !formData.password}
                  className="w-full h-12 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 text-white font-semibold relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <span className="relative z-10">
                    {isLoading ? "Signing In..." : "Sign In"}
                  </span>
                </Button>

                <div className="text-center">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#1e40af] hover:text-[#1e40af]/80 font-medium transition-colors duration-300 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>

                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Link
                      href="/signup"
                      className="text-[#1e40af] hover:text-[#1e40af]/80 font-medium transition-colors duration-300 hover:underline"
                    >
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}

/* ── wrapper with suspense ─────────── */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading login...</div>}>
      <LoginContent />
    </Suspense>
  )
}
