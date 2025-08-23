"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import {
  X, Sparkles, Loader2, CheckCircle, Calendar,
  Clock, MapPin, AlertTriangle, Wand2, 
  ChevronRight, Star, Target
} from "lucide-react"

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
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { post, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client

  const [aiPreview, setAiPreview] = useState<AIPreviewDay[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ REMOVED: BASE_URL constant and refreshToken function

  /* ───── Calculate trip duration ───── */
  const calculateDays = () => {
    const start = new Date(trip.start_date)
    const end = new Date(trip.end_date)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /* ───── Generate AI preview using useApi ───── */
  const generateAIPreview = async () => {
    if (!user) return

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

      const data = await post<AIPreviewResponse>(`/itinerary/ai-preview/${trip.id}`, requestData)
      console.log("[AI] Preview data:", data)
      setAiPreview(data.preview)
    } catch (error) {
      console.error("[AI] Error generating preview:", error)
      setError(error instanceof Error ? error.message : "Failed to generate AI plan")
    } finally {
      setLoading(false)
    }
  }

  /* ───── Confirm AI plan using useApi ───── */
  const confirmAIPlan = async () => {
    if (!aiPreview || !user) return

    try {
      setConfirming(true)
      setError(null)
      console.log(`[AI] Confirming plan for trip ${trip.id}`)

      // Send the preview data as array (not wrapped in preview object)
      const confirmData = aiPreview
      console.log("[AI] Confirm data:", confirmData)

      await post(`/itinerary/plan/ai-confirm/${trip.id}`, confirmData)
      
      console.log("[AI] Plan confirmed successfully")
      setConfirmed(true)
      
      setTimeout(() => {
        onClose()
        setAiPreview(null)
        setConfirmed(false)
        onSuccess?.() // Call success callback to refresh parent data
      }, 2000)
    } catch (error) {
      console.error("[AI] Error confirming plan:", error)
      setError(error instanceof Error ? error.message : "Failed to confirm AI plan")
    } finally {
      setConfirming(false)
    }
  }

  /* ───── Start generation when modal opens ───── */
  useEffect(() => {
    if (isOpen && !aiPreview && !loading && user) {
      generateAIPreview()
    }
  }, [isOpen, user])

  /* ───── Helper functions ───── */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 rounded-xl sm:rounded-2xl max-w-xs sm:max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Trip Planner
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                {trip.title} • {trip.location}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5"/>
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600"/>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">Failed to Generate Plan</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center max-w-md mb-4 px-4">{error}</p>
              <Button 
                onClick={() => generateAIPreview()} 
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-6 sm:px-8"
              >
                <Sparkles className="h-4 w-4 mr-2"/>
                Try Again
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <div className="relative mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-pulse"></div>
                <Loader2 className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 animate-spin text-white p-4 sm:p-5"/>
                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 text-purple-400 animate-pulse"/>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">Creating Your Perfect Itinerary</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center max-w-md px-4 leading-relaxed">
                Our AI is analyzing your trip details and generating personalized recommendations...
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-purple-600 dark:text-purple-400">
                <Wand2 className="w-4 h-4 animate-pulse" />
                <span>Powered by AI</span>
              </div>
            </div>
          ) : confirmed ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600"/>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-center">Plan Confirmed!</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center px-4">
                Your AI-generated itinerary has been saved successfully.
              </p>
            </div>
          ) : aiPreview ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Plan Overview */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-purple-200 dark:border-purple-700">
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 h-5 sm:h-6 sm:w-6 text-purple-600"/>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI-Generated Itinerary
                  </span>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600"/>
                    <span className="text-xs sm:text-sm font-medium">{aiPreview.length} Days</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                    <MapPin className="h-4 w-4 text-purple-600"/>
                    <span className="text-xs sm:text-sm font-medium truncate">{trip.location}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                    <Target className="h-4 w-4 text-purple-600"/>
                    <span className="text-xs sm:text-sm font-medium">AI Optimized</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start p-2 sm:p-3">
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-700 text-xs">
                      {fmt(trip.start_date)} - {fmt(trip.end_date)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Daily Plans */}
              <div className="space-y-3 sm:space-y-4">
                {aiPreview
                  .sort((a, b) => a.day_number - b.day_number)
                  .map((day, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-4 sm:p-6 bg-white/50 dark:bg-gray-900/50 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                      <h4 className="text-base sm:text-xl font-semibold flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-md">
                          {day.day_number}
                        </div>
                        <span className="text-gray-900 dark:text-gray-100">{day.title}</span>
                      </h4>
                      <Badge variant="outline" className="w-fit text-xs sm:text-sm">{fmt(day.date)}</Badge>
                    </div>

                    {day.description && (
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed px-2 sm:px-0">
                        {day.description}
                      </p>
                    )}

                    {day.activities.length > 0 && (
                      <div className="space-y-2 sm:space-y-3">
                        <h5 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 text-sm sm:text-base">
                          <Clock className="h-4 w-4"/>
                          Activities ({day.activities.length})
                        </h5>
                        <div className="space-y-2 sm:space-y-3">
                          {day.activities.map((activity, actIndex) => (
                            <div key={actIndex} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors">
                              <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 min-w-[80px] sm:min-w-[100px]">
                                {activity.time && (
                                  <>
                                    <Clock className="h-3 h-3 sm:h-4 sm:w-4"/>
                                    <span className="font-mono">{fmtTime(activity.time)}</span>
                                  </>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 mb-1">
                                  {activity.title}
                                </p>
                                {activity.description && (
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {activity.description}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 self-start sm:self-center mt-1 sm:mt-0" />
                            </div>
                          ))}
                        </div>
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
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={confirming}
              className="w-full sm:w-auto h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={() => confirmAIPlan()}
              disabled={confirming}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12 text-sm sm:text-base"
            >
              {confirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                  Confirming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2"/>
                  Confirm & Save Plan
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
