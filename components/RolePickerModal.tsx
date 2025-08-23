"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, Store, Loader2, CheckCircle, Sparkles, 
  MapPin, Package, Crown, AlertTriangle, X 
} from "lucide-react"

export default function RolePickerModal({
  onClose
}: { onClose: () => void }) {
  const router = useRouter()
  const { user, refreshUser } = useAuth() // ✅ NEW: Use auth context
  const { put, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client
  const [submitting, setSubmitting] = useState<false | "general" | "provider">(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ✅ REMOVED: chooseRole import and manual API handling

  const handlePick = async (role: "general" | "provider") => {
    try {
      setSubmitting(role)
      setError(null)
      console.log(`[ROLE-PICKER] Selecting role: ${role}`)

      // Update user role using the new API system
      await put("/me/", { role })

      // Refresh user context to get updated role
      if (refreshUser) {
        await refreshUser()
      }

      setSuccess(true)
      
      // Show success state briefly then navigate
      setTimeout(() => {
        onClose() // Close modal on success
        router.replace(role === "general" ? "/dashboard" : "/provider") // Navigate to appropriate dashboard
      }, 1500)

    } catch (err) {
      console.error("[ROLE-PICKER] Error selecting role:", err)
      setError(err instanceof Error ? err.message : "Failed to save role, please retry")
      setSubmitting(false)
    }
  }

  const getRoleDetails = (role: "general" | "provider") => {
    if (role === "general") {
      return {
        icon: <Users className="h-6 h-6 sm:h-8 sm:w-8" />,
        title: "I'm a Traveler",
        description: "Plan trips, manage expenses, and explore recommendations",
        color: "from-blue-500 to-cyan-600",
        hoverColor: "hover:from-blue-600 hover:to-cyan-700",
        bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50",
        borderColor: "border-blue-200 dark:border-blue-700",
        features: ["Create and manage trips", "Track expenses", "Get AI recommendations", "Share itineraries"]
      }
    } else {
      return {
        icon: <Store className="h-6 h-6 sm:h-8 sm:w-8" />,
        title: "I'm a Service Provider",
        description: "Offer travel services, manage bookings, and grow your business",
        color: "from-purple-500 to-indigo-600",
        hoverColor: "hover:from-purple-600 hover:to-indigo-700",
        bgColor: "from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50",
        borderColor: "border-purple-200 dark:border-purple-700",
        features: ["List your services", "Manage bookings", "Connect with travelers", "Grow your business"]
      }
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-green-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <Card className="relative w-full max-w-xs sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl p-6 sm:p-8 text-center rounded-xl sm:rounded-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
            Welcome to TripMate!
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Your account has been set up successfully. Redirecting you now...
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <Card className="relative w-full max-w-xs sm:max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 text-center border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-950">
          <div className="flex items-center justify-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Account Type
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Tell us how you'll be using TripMate so we can personalize your experience.
          </p>
          <Badge className="mt-3 sm:mt-4 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-700">
            One-time setup
          </Badge>
        </div>

        {/* Role Options */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {(["general", "provider"] as const).map((role) => {
              const details = getRoleDetails(role)
              const isLoading = submitting === role

              return (
                <div
                  key={role}
                  className={`relative p-4 sm:p-6 border-2 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer bg-gradient-to-br ${details.bgColor} ${details.borderColor} hover:border-opacity-70 group ${
                    isLoading ? 'scale-95 opacity-70' : ''
                  }`}
                  onClick={() => !submitting && handlePick(role)}
                >
                  {/* Icon & Title */}
                  <div className="text-center mb-4 sm:mb-6">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${details.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                      isLoading ? 'animate-pulse' : 'group-hover:scale-110'
                    }`}>
                      {isLoading ? (
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-spin" />
                      ) : (
                        <div className="text-white">{details.icon}</div>
                      )}
                    </div>
                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {details.title}
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {details.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                    {details.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button
                    disabled={!!submitting}
                    className={`w-full bg-gradient-to-r ${details.color} ${details.hoverColor} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12 text-sm sm:text-base`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!submitting) handlePick(role)
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        Choose {role === "general" ? "Traveler" : "Provider"}
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center">
                      <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg p-3 shadow-lg">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 sm:mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm sm:text-base font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Don't worry, you can always change this later in your account settings.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
