"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useApi } from "@/hooks/useApi"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, CheckCircle, AlertCircle, Mail, 
  Shield, Lock, ArrowLeft, Timer, RefreshCw 
} from "lucide-react"

type Step = "email" | "otp" | "reset"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { post, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client

  /* ───────── State ───────── */
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [resetToken, setResetToken] = useState("")

  /* Loading / Feedback */
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [toast, setToast] = useState("")

  /* OTP Timer + Tries */
  const [secondsLeft, setSecondsLeft] = useState(0)        // 0 = no timer
  const [triesLeft, setTriesLeft] = useState(3)
  const timerRef = useRef<NodeJS.Timeout>()

  /* ───────── Utilities ───────── */
  const startTimer = () => {
    setSecondsLeft(300)               // 5 min
    timerRef.current && clearInterval(timerRef.current)
    timerRef.current = setInterval(() => setSecondsLeft(s => {
      if (s <= 1) { clearInterval(timerRef.current!); return 0 }
      return s - 1
    }), 1000)
  }

  const showTempToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(""), 3000)
  }

  /* ───────── Actions using useApi ───────── */
  const sendEmail = async () => {
    if (!email.trim()) {
      setError("Please enter your email address")
      return
    }

    setBusy(true)
    setError("")
    try {
      console.log("[FORGOT-PASSWORD] Sending email to:", email)
      await post("/auth/forgot-password", { email })
      
      showTempToast("OTP sent if the email exists")
      setStep("otp")
      setOtp("")
      setTriesLeft(3)
      startTimer()
    } catch (e: any) {
      console.error("[FORGOT-PASSWORD] Error sending email:", e)
      setError(e.message || "Something went wrong")
    } finally { 
      setBusy(false) 
    }
  }

  const verifyOtp = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP")
      return
    }

    setBusy(true)
    setError("")
    try {
      console.log("[FORGOT-PASSWORD] Verifying OTP for:", email)
      const response = await post("/auth/verify-otp", { email, otp })
      
      setResetToken(response.reset_token)
      setStep("reset")
      clearInterval(timerRef.current!)
      showTempToast("OTP verified successfully!")
    } catch (e: any) {
      console.error("[FORGOT-PASSWORD] Error verifying OTP:", e)
      setTriesLeft(t => Math.max(0, t - 1))
      setError(e.message || "Invalid OTP")
    } finally { 
      setBusy(false) 
    }
  }

  const resendOtp = () => {
    sendEmail()
  }

  const resetPassword = async () => {
    if (!newPwd.trim()) {
      setError("Please enter your new password")
      return
    }
    if (newPwd.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setBusy(true)
    setError("")
    try {
      console.log("[FORGOT-PASSWORD] Resetting password")
      await post("/auth/reset-password", { 
        reset_token: resetToken, 
        new_password: newPwd 
      })
      
      showTempToast("Password reset successful!")
      setTimeout(() => router.push("/login"), 2000)
    } catch (e: any) {
      console.error("[FORGOT-PASSWORD] Error resetting password:", e)
      setError(e.message || "Failed to reset password")
    } finally { 
      setBusy(false) 
    }
  }

  /* ───────── UI Helpers ───────── */
  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`

  const getStepIcon = () => {
    switch (step) {
      case "email": return <Mail className="w-6 h-6 sm:w-8 sm:h-8" />
      case "otp": return <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
      case "reset": return <Lock className="w-6 h-6 sm:w-8 sm:h-8" />
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case "email": return "Forgot Password"
      case "otp": return "Enter Verification Code"
      case "reset": return "Set New Password"
    }
  }

  const getStepDescription = () => {
    switch (step) {
      case "email": return "Enter your email address and we'll send you a verification code"
      case "otp": return "Enter the 6-digit code sent to your email"
      case "reset": return "Create a new password for your account"
    }
  }

  /* ───────── Cleanup timer ───────── */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  /* ───────── Render ───────── */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <Card className="relative w-full max-w-xs sm:max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-2xl">
        <CardHeader className="text-center pb-6 sm:pb-8">
          {/* Step Indicator */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {["email", "otp", "reset"].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
                    step === stepName ? 'bg-blue-600 text-white' :
                    ["email", "otp", "reset"].indexOf(step) > index ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {["email", "otp", "reset"].indexOf(step) > index ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 2 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-2 ${
                      ["email", "otp", "reset"].indexOf(step) > index ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Icon */}
          <div className="flex justify-center mb-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
              {getStepIcon()}
              <span className="text-white">{getStepIcon()}</span>
            </div>
          </div>

          <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            {getStepTitle()}
          </CardTitle>
          
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            {getStepDescription()}
          </p>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {step === "email" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && sendEmail()}
                />
              </div>
              <Button 
                disabled={!email.trim() || busy} 
                onClick={sendEmail} 
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Mail className="h-4 w-4 mr-2" />}
                Send Verification Code
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <Input 
                  value={email} 
                  disabled 
                  className="h-10 sm:h-12 bg-gray-100 dark:bg-gray-800 text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Verification Code
                </label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-center text-lg sm:text-xl tracking-widest font-mono"
                  maxLength={6}
                  onKeyPress={(e) => e.key === 'Enter' && verifyOtp()}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  disabled={!otp.trim() || busy || triesLeft <= 0}
                  onClick={verifyOtp}
                  className="flex-1 h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Shield className="h-4 w-4 mr-2" />}
                  Verify Code
                </Button>

                <Button
                  variant="outline"
                  disabled={secondsLeft > 0 || busy}
                  onClick={resendOtp}
                  className="flex-1 sm:flex-none h-10 sm:h-12 border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm sm:text-base"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resend
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1 sm:space-y-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{triesLeft} attempts remaining</span>
                </div>
                {secondsLeft > 0 && (
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Timer className="w-4 h-4" />
                    <span>Resend in {formatTime(secondsLeft)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <PasswordInput
                  placeholder="Enter new password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === 'Enter' && resetPassword()}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              <Button 
                disabled={!newPwd.trim() || busy} 
                onClick={resetPassword} 
                className="w-full h-10 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-4 w-4 mr-2" />}
                Reset Password
              </Button>
            </>
          )}

          {error && (
            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" /> 
                {error}
              </p>
            </div>
          )}

          {/* Back to Login */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => router.push("/login")}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 text-sm sm:text-base"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-3 sm:p-4 rounded-lg shadow-lg flex items-center space-x-2 backdrop-blur-xl z-50">
          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600"/>
          <span className="text-xs sm:text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  )
}
