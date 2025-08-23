"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, EyeOff, Users, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApi } from "@/hooks/useApi"
import AuthGuard from "@/components/auth/AuthGuard"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

function SignUpContent() {
  const router = useRouter()
  const { post, loading: apiLoading, error } = useApi()

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Submitting form data:", formData)

      await post('/auth/register', formData)

      console.log("Registration successful")
      alert("Registration successful! Redirecting to login...")
      router.push("/login")
    } catch (error) {
      console.error("Registration failed:", error)
      alert(`Registration failed: ${error instanceof Error ? error.message : "Please try again."}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      console.log("Attempting Google signup...")
      window.location.href = `${BASE_URL}auth/google/login`
    } catch (error) {
      console.error("Google signup error:", error)
      alert("Google signup failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e40af]/5 via-background to-[#06b6d4]/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background particles */}
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

      {/* Header */}
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

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
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
              Join TripMate
            </CardTitle>
            <CardDescription className="text-lg">Start planning amazing group adventures today</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Button
                type="button"
                onClick={handleGoogleSignup}
                variant="outline"
                className="w-full h-12 border-2 hover:border-[#1e40af]/20 transition-all duration-300 hover:shadow-lg relative overflow-hidden group bg-transparent"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e40af]/5 to-[#06b6d4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="flex items-center justify-center space-x-3 relative z-10">
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
                  <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
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

              {/* Username field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                  className="h-12 border-2 focus:border-[#1e40af] transition-colors duration-300"
                />
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
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

              {/* Role dropdown */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium">
                  Account Type
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="h-12 border-2 focus:border-[#1e40af] transition-colors duration-300">
                    <SelectValue placeholder="Select your account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-[#1e40af]" />
                        <div>
                          <div className="font-medium">General User</div>
                          <div className="text-xs text-muted-foreground">Plan trips with friends</div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="provider">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-[#06b6d4]" />
                        <div>
                          <div className="font-medium">Service Provider</div>
                          <div className="text-xs text-muted-foreground">Offer travel services</div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                disabled={isLoading || !formData.email || !formData.username || !formData.password || !formData.role}
                className="w-full h-12 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 text-white font-semibold relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <span className="relative z-10">{isLoading ? "Creating Account..." : "Create Account"}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/20 to-[#1e40af]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>

              {/* Login link */}
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#1e40af] hover:text-[#1e40af]/80 font-medium transition-colors duration-300 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <AuthGuard requireAuth={false} fallback={<div>Redirecting to dashboard...</div>}>
      <SignUpContent />
    </AuthGuard>
  )
}
