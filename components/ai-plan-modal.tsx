"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge }  from "@/components/ui/badge"
import {
  X, Sparkles, Loader2, CheckCircle, Calendar,
  Clock, MapPin, AlertTriangle,
} from "lucide-react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

interface Trip {
  id: number
  title: string
  location: string
  start_date: string
  end_date: string
  budget: number
}

interface Activity {
  time: string
  title: string
  description: string
  id?: number
  created_at?: string
}

interface AIPreviewDay {
  day_number: number
  title: string
  description: string
  date: string
  activities: Activity[]
}

interface AIPreviewResponse {
  preview: AIPreviewDay[]
}

interface AIPlanModalProps {
  isOpen: boolean
  onClose: () => void
  trip: Trip
  onSuccess?: () => void
}

export default function AIPlanModal({ isOpen, onClose, trip, onSuccess }: AIPlanModalProps) {
  const [aiPreview, setAiPreview] = useState<AIPreviewDay[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* ───── token refresh ───── */
  const refreshToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST", credentials: "include"
      })
      return response.ok
    } catch {
      return false
    }
  }

  /* ───── calculate trip duration ───── */
  const calculateDays = () => {
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /* ───── generate AI preview ───── */
  const generateAIPreview = async (retry = false) => {
    try {
      setLoading(true)
      setError(null)
      console.log(`[AI] Generating preview for trip ${trip.id}`)

      const requestData = {
        location: trip.location,
        days: calculateDays(),
        start_date: trip.start_date
      }

      console.log("[AI] Request data:", requestData)

      const res = await fetch(`${BASE_URL}itinerary/ai-preview/${trip.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      })

      console.log(`[AI] Preview response:`, res.status, res.ok)

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        console.log("[AI] Auth failed, refreshing token...")
        if (await refreshToken()) return generateAIPreview(true)
      }

      if (res.ok) {
        const data: AIPreviewResponse = await res.json()
        console.log("[AI] Preview data:", data)
        setAiPreview(data.preview)
      } else {
        const errorText = await res.text()
        throw new Error(`Failed to generate AI preview: ${res.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("[AI] Error generating preview:", error)
      setError(error instanceof Error ? error.message : "Failed to generate AI plan")
    } finally {
      setLoading(false)
    }
  }

  /* ───── confirm AI plan ───── */
  const confirmAIPlan = async (retry = false) => {
    if (!aiPreview) return

    try {
      setConfirming(true)
      setError(null)
      console.log(`[AI] Confirming plan for trip ${trip.id}`)

      // Send the preview data as array (not wrapped in preview object)
      const confirmData = aiPreview

      console.log("[AI] Confirm data:", confirmData)

      const res = await fetch(`${BASE_URL}itinerary/plan/ai-confirm/${trip.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmData)
      })

      console.log(`[AI] Confirm response:`, res.status, res.ok)

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        console.log("[AI] Auth failed during confirm, refreshing token...")
        if (await refreshToken()) return confirmAIPlan(true)
      }

      if (res.ok || res.status === 201) {
        console.log("[AI] Plan confirmed successfully")
        setConfirmed(true)
        
        setTimeout(() => {
          onClose()
          setAiPreview(null)
          setConfirmed(false)
          onSuccess?.() // Call success callback to refresh parent data
        }, 2000)
      } else {
        const errorText = await res.text()
        throw new Error(`Failed to confirm AI plan: ${res.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("[AI] Error confirming plan:", error)
      setError(error instanceof Error ? error.message : "Failed to confirm AI plan")
    } finally {
      setConfirming(false)
    }
  }

  /* ───── start generation when modal opens ───── */
  useState(() => {
    if (isOpen && !aiPreview && !loading) {
      generateAIPreview()
    }
  })

  /* ───── helper functions ───── */
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })

  const fmtTime = (timeStr: string) => {
    if (!timeStr) return ""
    const [hours, minutes] = timeStr.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="bg-background border border-border/50 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#9333ea] to-[#c084fc] rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white"/>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#9333ea] to-[#c084fc] bg-clip-text text-transparent">
                AI Trip Planner
              </h2>
              <p className="text-sm text-muted-foreground">{trip.title} • {trip.location}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5"/>
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600"/>
              </div>
              <h3 className="text-xl font-semibold mb-2">Failed to Generate Plan</h3>
              <p className="text-muted-foreground text-center max-w-md mb-4">{error}</p>
              <Button onClick={() => generateAIPreview()} className="bg-[#9333ea] hover:bg-[#9333ea]/90">
                <Sparkles className="h-4 w-4 mr-2"/>
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <Loader2 className="h-12 w-12 animate-spin text-[#9333ea]"/>
                <Sparkles className="h-6 w-6 absolute -top-1 -right-1 text-[#c084fc] animate-pulse"/>
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-2">Creating Your Perfect Itinerary</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Our AI is analyzing your trip details and generating personalized recommendations...
              </p>
            </div>
          ) : confirmed ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600"/>
              </div>
              <h3 className="text-xl font-semibold mb-2">Plan Confirmed!</h3>
              <p className="text-muted-foreground">Your AI-generated itinerary has been saved successfully.</p>
            </div>
          ) : aiPreview ? (
            <div className="space-y-6">
              {/* Plan Overview */}
              <div className="bg-gradient-to-r from-[#9333ea]/10 to-[#c084fc]/10 rounded-lg p-6 border border-[#9333ea]/20">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-[#9333ea]"/>
                  AI-Generated Itinerary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#9333ea]"/>
                    <span className="text-sm">{aiPreview.length} Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#9333ea]"/>
                    <span className="text-sm">{trip.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#9333ea]"/>
                    <span className="text-sm">AI Optimized</span>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-[#9333ea]/10 text-[#9333ea] border-[#9333ea]/20">
                      {fmt(trip.start_date)} - {fmt(trip.end_date)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Daily Plans */}
              <div className="space-y-4">
                {aiPreview
                  .sort((a, b) => a.day_number - b.day_number)
                  .map((day, index) => (
                  <div key={index} className="border border-border/50 rounded-lg p-6 bg-background/50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#1e40af] rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {day.day_number}
                        </div>
                        {day.title}
                      </h4>
                      <Badge variant="outline">{fmt(day.date)}</Badge>
                    </div>

                    {day.description && (
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {day.description}
                      </p>
                    )}

                    {day.activities.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-semibold text-[#1e40af] flex items-center gap-2">
                          <Clock className="h-4 w-4"/>
                          Activities ({day.activities.length})
                        </h5>
                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center gap-2 min-w-[80px]">
                              {activity.time && (
                                <>
                                  <Clock className="h-4 w-4 text-muted-foreground"/>
                                  <span className="text-sm font-mono">{fmtTime(activity.time)}</span>
                                </>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{activity.title}</p>
                              {activity.description && (
                                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Actions */}
        {aiPreview && !confirmed && !error && (
          <div className="flex justify-end gap-3 p-6 border-t border-border/30">
            <Button variant="outline" onClick={onClose} disabled={confirming}>
              Cancel
            </Button>
            <Button
              onClick={() => confirmAIPlan()}
              disabled={confirming}
              className="bg-gradient-to-r from-[#9333ea] to-[#c084fc] text-white"
            >
              {confirming ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <CheckCircle className="h-4 w-4 mr-2"/>}
              Confirm & Save Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
