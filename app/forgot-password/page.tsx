"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/password-input"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

type Step = "email" | "otp" | "reset"

export default function ForgotPasswordPage() {
  const router = useRouter()

  /* ───────── state ───────── */
  const [step, setStep]               = useState<Step>("email")
  const [email, setEmail]             = useState("")
  const [otp, setOtp]                 = useState("")
  const [newPwd, setNewPwd]           = useState("")
  const [resetToken, setResetToken]   = useState("")

  /* loading / feedback */
  const [busy, setBusy]               = useState(false)
  const [error, setError]             = useState("")
  const [toast, setToast]             = useState("")

  /* otp timer + tries */
  const [secondsLeft, setSecondsLeft] = useState(0)        // 0 = no timer
  const [triesLeft, setTriesLeft]     = useState(3)
  const timerRef = useRef<NodeJS.Timeout>()

  /* ───────── utilities ───────── */
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

  /* ───────── actions ───────── */
  const sendEmail = async () => {
    setBusy(true); setError("")
    try {
      const res = await fetch(`${BASE_URL}auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error(await res.text())
      showTempToast("OTP sent if the email exists")
      setStep("otp")
      setOtp("")
      setTriesLeft(3)
      startTimer()
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally { setBusy(false) }
  }

  const verifyOtp = async () => {
    if (!otp) return
    setBusy(true); setError("")
    try {
      const res = await fetch(`${BASE_URL}auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, otp }),
      })
      if (!res.ok) {
        setTriesLeft(t => t - 1)
        throw new Error(await res.text() || "Invalid OTP")
      }
      const { reset_token } = await res.json()
      setResetToken(reset_token)
      setStep("reset")
      clearInterval(timerRef.current!)
    } catch (e:any) {
      setError(e.message)
    } finally { setBusy(false) }
  }

  const resendOtp = () => {
    sendEmail()
  }

  const resetPassword = async () => {
    if (!newPwd) return
    setBusy(true); setError("")
    try {
      const res = await fetch(`${BASE_URL}auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reset_token: resetToken, new_password: newPwd }),
      })
      if (!res.ok) throw new Error(await res.text())
      showTempToast("Password reset successful")
      setTimeout(() => router.push("/login"), 2000)
    } catch (e:any) {
      setError(e.message)
    } finally { setBusy(false) }
  }

  /* ───────── ui helpers ───────── */
  const formatTime = (s: number) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`

  /* ───────── render ───────── */
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {step === "email" && "Forgot password"}
            {step === "otp"    && "Enter OTP"}
            {step === "reset"  && "Set new password"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === "email" && (
            <>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
              />
              <Button disabled={!email || busy} onClick={sendEmail} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                Send OTP
              </Button>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="space-y-2">
                <label className="text-sm">Email</label>
                <Input value={email} disabled />
              </div>

              <Input
                placeholder="Enter OTP"
                value={otp}
                onChange={(e)=>setOtp(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <Button
                  disabled={!otp || busy || triesLeft<=0}
                  onClick={verifyOtp}
                  className="flex-1 mr-2"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                  Verify
                </Button>

                <Button
                  variant="outline"
                  disabled={secondsLeft > 0}
                  onClick={resendOtp}
                >
                  Resend OTP
                </Button>
              </div>

              <div className="text-xs text-muted-foreground flex justify-between">
                <span>{triesLeft} attempts left</span>
                <span>{secondsLeft>0 && `Resend in ${formatTime(secondsLeft)}`}</span>
              </div>
            </>
          )}

          {step === "reset" && (
            <>
              <PasswordInput
                placeholder="New password"
                value={newPwd}
                onChange={(e)=>setNewPwd(e.target.value)}
              />
              <Button disabled={!newPwd || busy} onClick={resetPassword} className="w-full">
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Reset Password
              </Button>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1"/> {error}
            </p>
          )}
        </CardContent>
      </Card>

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-background border p-4 rounded-lg shadow flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-600"/>
          <span className="text-sm">{toast}</span>
        </div>
      )}
    </div>
  )
}
