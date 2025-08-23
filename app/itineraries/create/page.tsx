"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  ArrowLeft, Calendar, Loader2, Save, CheckCircle, Plus,
  Trash2, Clock, X, MapPin, AlertTriangle, ChevronDown, ChevronUp,
} from "lucide-react"

/* ───────────────── types ───────────────── */
interface Activity {
  time: string
  title: string
  description: string
}

interface DayItinerary {
  day_number: number
  title: string
  description: string
  date: string
  activities: Activity[]
}

/* ───────────────── Simple Time Picker Component ───────────────── */
interface TimePickerProps {
  value: string // 24-hour format
  onChange: (time24h: string) => void
  className?: string
}

const TimePicker = ({ value, onChange, className = "" }: TimePickerProps) => {
  // Convert 24h to 12h for display
  const get12HourTime = () => {
    if (!value) return { hour: "12", minute: "00", ampm: "AM" }
    
    const [hours, minutes] = value.split(':')
    let hour24 = parseInt(hours)
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    let hour12 = hour24 % 12
    hour12 = hour12 ? hour12 : 12
    
    return {
      hour: hour12.toString().padStart(2, '0'),
      minute: minutes || '00',
      ampm
    }
  }

  const currentTime = get12HourTime()

  const handleTimeChange = (newHour: string, newMinute: string, newAmpm: string) => {
    let hour24 = parseInt(newHour)
    if (newHour === '12') hour24 = 0
    if (newAmpm === 'PM') hour24 += 12
    
    const time24 = `${hour24.toString().padStart(2, '0')}:${newMinute}:00`
    onChange(time24)
  }

  return (
    <div className={`flex gap-1 ${className}`}>
      <select
        value={currentTime.hour}
        onChange={(e) => handleTimeChange(e.target.value, currentTime.minute, currentTime.ampm)}
        className="flex-1 p-2 border rounded-md bg-background focus:border-[#1e40af] text-sm"
      >
        {Array.from({ length: 12 }, (_, i) => {
          const hour = i + 1
          return (
            <option key={hour} value={hour.toString().padStart(2, '0')}>
              {hour.toString().padStart(2, '0')}
            </option>
          )
        })}
      </select>

      <span className="flex items-center px-1 text-muted-foreground font-bold">:</span>

      <select
        value={currentTime.minute}
        onChange={(e) => handleTimeChange(currentTime.hour, e.target.value, currentTime.ampm)}
        className="flex-1 p-2 border rounded-md bg-background focus:border-[#1e40af] text-sm"
      >
        {Array.from({ length: 12 }, (_, i) => {
          const min = (i * 5).toString().padStart(2, '0')
          return (
            <option key={min} value={min}>
              {min}
            </option>
          )
        })}
      </select>

      <select
        value={currentTime.ampm}
        onChange={(e) => handleTimeChange(currentTime.hour, currentTime.minute, e.target.value)}
        className="p-2 border rounded-md bg-background focus:border-[#1e40af] min-w-[60px] text-sm"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}

// Wrap your big component in a Suspense-safe child
function CreateItineraryContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tripId = searchParams?.get("tripId")
  const { user } = useAuth()
  const { post, loading: apiLoading, error: apiError } = useApi()

  const [days, setDays] = useState<DayItinerary[]>([
    {
      day_number: 1,
      title: "",
      description: "",
      date: "",
      activities: []
    }
  ])

  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Add expanded day state - initially first day is expanded
  const [expandedDayIndex, setExpandedDayIndex] = useState<number>(0)

  /* ───── add new day ───── */
  const addNewDay = () => {
    const existingNumbers = days.map(d => d.day_number)
    const newDayNumber = Math.max(...existingNumbers, 0) + 1
    
    const newDays = [...days, {
      day_number: newDayNumber,
      title: "",
      description: "",
      date: "",
      activities: []
    }]
    
    setDays(newDays)
    // Expand the newly added day
    setExpandedDayIndex(newDays.length - 1)
  }

  /* ───── remove day ───── */
  const removeDay = (dayIndex: number) => {
    if (days.length > 1) {
      const newDays = days.filter((_, index) => index !== dayIndex)
      setDays(newDays)
      
      // Adjust expanded index if necessary
      if (expandedDayIndex >= newDays.length) {
        setExpandedDayIndex(newDays.length - 1)
      } else if (expandedDayIndex === dayIndex) {
        setExpandedDayIndex(Math.max(0, dayIndex - 1))
      } else if (expandedDayIndex > dayIndex) {
        setExpandedDayIndex(expandedDayIndex - 1)
      }
    }
  }

  /* ───── toggle day expansion ───── */
  const toggleDayExpansion = (dayIndex: number) => {
    setExpandedDayIndex(expandedDayIndex === dayIndex ? -1 : dayIndex)
  }

  /* ───── update day field ───── */
  const updateDay = (dayIndex: number, field: keyof Omit<DayItinerary, 'activities'>, value: string | number) => {
    const updatedDays = [...days]
    
    // Special handling for day_number to ensure it's a positive integer
    if (field === 'day_number') {
      const numValue = parseInt(value as string) || 1
      updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: Math.max(1, numValue) }
    } else {
      updatedDays[dayIndex] = { ...updatedDays[dayIndex], [field]: value }
    }
    
    setDays(updatedDays)
  }

  /* ───── check for duplicate day numbers ───── */
  const getDuplicateDayNumbers = () => {
    const dayNumbers = days.map(d => d.day_number)
    const duplicates = dayNumbers.filter((num, index) => dayNumbers.indexOf(num) !== index)
    return [...new Set(duplicates)]
  }

  /* ───── add activity to day ───── */
  const addActivity = (dayIndex: number) => {
    const updatedDays = [...days]
    updatedDays[dayIndex].activities.push({
      time: "",
      title: "",
      description: ""
    })
    setDays(updatedDays)
  }

  /* ───── remove activity from day ───── */
  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const updatedDays = [...days]
    updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter((_, index) => index !== activityIndex)
    setDays(updatedDays)
  }

  /* ───── update activity ───── */
  const updateActivity = (dayIndex: number, activityIndex: number, field: keyof Activity, value: string) => {
    const updatedDays = [...days]
    updatedDays[dayIndex].activities[activityIndex] = {
      ...updatedDays[dayIndex].activities[activityIndex],
      [field]: value
    }
    setDays(updatedDays)
  }

  /* ───── create itineraries using useApi ───── */
  const createItineraries = async () => {
    if (!tripId || !user) return alert("Trip ID is required")

    // Check for duplicate day numbers
    const duplicates = getDuplicateDayNumbers()
    if (duplicates.length > 0) {
      return alert(`Duplicate day numbers found: ${duplicates.join(', ')}. Please use unique day numbers.`)
    }

    // Validation
    for (const day of days) {
      if (!day.title.trim()) return alert(`Day ${day.day_number} title is required`)
      if (!day.date) return alert(`Day ${day.day_number} date is required`)
      if (day.day_number < 1) return alert(`Day numbers must be positive. Day ${day.day_number} is invalid.`)
      
      for (const activity of day.activities) {
        if (!activity.title.trim()) return alert(`All activities in Day ${day.day_number} must have titles`)
      }
    }

    try {
      setSaving(true)

      // Send all days in one request
      const payload = days.map(day => ({
        trip_id: parseInt(tripId),
        day_number: day.day_number,
        title: day.title,
        description: day.description,
        date: day.date,
        activities: day.activities.filter(activity => activity.title.trim()) // Only include activities with titles
      }))

      console.log("[CREATE-ITINERARY] Sending payload:", payload)

      // Send each day as a separate API call (since the endpoint expects individual days)
      const promises = payload.map(dayData => post('/itinerary/', dayData))

      await Promise.all(promises)
      
      console.log("[CREATE-ITINERARY] All itineraries created successfully")
      setShowSuccess(true)
      
      setTimeout(() => {
        router.push(`/itineraries/trip/${tripId}`)
      }, 2000)
    } catch (error) {
      console.error("[CREATE-ITINERARY] Error creating itineraries:", error)
      alert("Error creating itineraries. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!tripId) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Trip ID is required to create an itinerary</p>
            <Link href="/itineraries">
              <Button>Back to Itineraries</Button>
            </Link>
          </div>
        </div>
      </DashboardShell>
    )
  }

  // Check for duplicates to show warning
  const duplicates = getDuplicateDayNumbers()

  return (
    <DashboardShell>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <Link href={`/itineraries/trip/${tripId}`}>
              <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]"/>
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
                Create Itinerary
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Plan your trip day by day with detailed activities
              </p>
            </div>
          </div>
        </div>

        {/* Duplicate Warning */}
        {duplicates.length > 0 && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-3 flex-shrink-0"/>
              <span className="text-red-800 dark:text-red-200 text-sm sm:text-base">
                Duplicate day numbers found: {duplicates.join(', ')}. Please use unique day numbers.
              </span>
            </div>
          </div>
        )}

        {/* Days */}
        <div className="space-y-4 sm:space-y-6">
          {days.map((day, dayIndex) => {
            const isExpanded = expandedDayIndex === dayIndex
            const isDuplicate = duplicates.includes(day.day_number)
            
            return (
              <Card 
                key={dayIndex} 
                className={`bg-background/80 backdrop-blur-sm border shadow-lg shadow-[#1e40af]/5 transition-all duration-300 rounded-xl sm:rounded-2xl ${
                  isDuplicate 
                    ? 'border-red-300 dark:border-red-700' 
                    : isExpanded 
                      ? 'border-[#1e40af]/50' 
                      : 'border-border/50'
                } ${isExpanded ? 'shadow-xl shadow-[#1e40af]/15' : ''}`}
              >
                {/* Day Header - Always visible and clickable */}
                <div 
                  className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-muted/20 transition-colors rounded-xl sm:rounded-2xl"
                  onClick={() => toggleDayExpansion(dayIndex)}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg transition-colors ${
                      isDuplicate 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : isExpanded
                          ? 'bg-gradient-to-r from-[#1e40af] to-[#06b6d4]'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}>
                      {day.day_number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`text-lg sm:text-xl font-semibold transition-colors truncate ${
                        isExpanded ? 'text-[#1e40af]' : 'text-foreground'
                      }`}>
                        {day.title || `Day ${day.day_number}`}
                      </h2>
                      {!isExpanded && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                          {day.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3"/>
                              {new Date(day.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3"/>
                            {day.activities.length} activities
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 ml-2">
                    {days.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeDay(dayIndex)
                        }}
                        className="hover:bg-red-100 dark:hover:bg-red-900/20 w-8 h-8 sm:w-10 sm:h-10"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600"/>
                      </Button>
                    )}
                    
                    <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"/>
                    </div>
                  </div>
                </div>

                {/* Day Content - Expandable */}
                <div className={`transition-all duration-300 overflow-hidden ${
                  isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-border/30">
                    {/* Day Details */}
                    <div className="space-y-4 sm:space-y-6 mb-6 mt-4 sm:mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Day Number Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">
                            Day Number <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={day.day_number}
                            onChange={(e) => updateDay(dayIndex, 'day_number', e.target.value)}
                            className={`focus:border-[#1e40af] h-10 sm:h-12 rounded-lg sm:rounded-xl ${
                              isDuplicate ? 'border-red-300 dark:border-red-700' : ''
                            }`}
                          />
                        </div>

                        {/* Day Title Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">
                            Day Title <span className="text-red-500">*</span>
                          </label>
                          <Input
                            placeholder={`e.g., Day ${day.day_number}: City Exploration`}
                            value={day.title}
                            onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                            className="focus:border-[#1e40af] h-10 sm:h-12 rounded-lg sm:rounded-xl"
                          />
                        </div>

                        {/* Date Field */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="date"
                            value={day.date}
                            onChange={(e) => updateDay(dayIndex, 'date', e.target.value)}
                            className="focus:border-[#1e40af] h-10 sm:h-12 rounded-lg sm:rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Description</label>
                        <Textarea
                          placeholder="Describe the overall plan for this day..."
                          rows={3}
                          value={day.description}
                          onChange={(e) => updateDay(dayIndex, 'description', e.target.value)}
                          className="focus:border-[#1e40af] resize-none rounded-lg sm:rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Activities Section */}
                    <div className="border-t border-border/30 pt-4 sm:pt-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]"/>
                          Activities ({day.activities.length})
                        </h3>
                        <Button
                          onClick={() => addActivity(dayIndex)}
                          size="sm"
                          className="w-full sm:w-auto bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white h-8 sm:h-10 px-3 sm:px-4 rounded-lg sm:rounded-xl"
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2"/>
                          Add Activity
                        </Button>
                      </div>

                      {day.activities.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 text-muted-foreground">
                          <Clock className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50"/>
                          <p className="text-sm sm:text-base">No activities added yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          {day.activities.map((activity, activityIndex) => (
                            <div 
                              key={activityIndex}
                              className="bg-muted/20 rounded-lg p-3 sm:p-4 border border-border/30"
                            >
                              <div className="flex items-start justify-between mb-3 sm:mb-4">
                                <h4 className="font-medium text-xs sm:text-sm text-muted-foreground">
                                  Activity {activityIndex + 1}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeActivity(dayIndex, activityIndex)}
                                  className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-red-100 dark:hover:bg-red-900/20"
                                >
                                  <X className="h-3 w-3 sm:h-4 sm:w-4 text-red-600"/>
                                </Button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-medium">Time</label>
                                  <TimePicker
                                    value={activity.time}
                                    onChange={(time24h) => updateActivity(dayIndex, activityIndex, 'time', time24h)}
                                  />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                  <label className="block text-sm font-medium">
                                    Activity Title <span className="text-red-500">*</span>
                                  </label>
                                  <Input
                                    placeholder="e.g., Visit Museum, Lunch at Restaurant"
                                    value={activity.title}
                                    onChange={(e) => updateActivity(dayIndex, activityIndex, 'title', e.target.value)}
                                    className="focus:border-[#1e40af] h-10 sm:h-12 rounded-lg sm:rounded-xl"
                                  />
                                </div>
                              </div>

                              <div className="mt-4 space-y-2">
                                <label className="block text-sm font-medium">Description</label>
                                <Textarea
                                  placeholder="Describe this activity in detail..."
                                  rows={2}
                                  value={activity.description}
                                  onChange={(e) => updateActivity(dayIndex, activityIndex, 'description', e.target.value)}
                                  className="focus:border-[#1e40af] resize-none rounded-lg sm:rounded-xl"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}

          {/* Add New Day Button */}
          <div className="flex justify-center">
            <Button
              onClick={addNewDay}
              variant="outline"
              className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af]/10 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2"/>
              Add Another Day
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-border/30">
          <Link href={`/itineraries/trip/${tripId}`}>
            <Button variant="outline" disabled={saving} className="w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl">
              Cancel
            </Button>
          </Link>
          <Button
            onClick={() => createItineraries()}
            disabled={saving || duplicates.length > 0}
            className="w-full sm:w-auto bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
            Create Itinerary ({days.length} {days.length === 1 ? 'day' : 'days'})
          </Button>
        </div>

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"/>
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-center">Itinerary Created!</h3>
              <p className="text-sm sm:text-base text-muted-foreground text-center">
                Your {days.length}-day itinerary has been created successfully. Redirecting...
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

/* ───────────────── component ───────────────── */
// Default export wraps the above with Suspense
export default function CreateItineraryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full animate-pulse"></div>
          <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
        </div>
      </div>
    }>
      <CreateItineraryContent />
    </Suspense>
  )
}
