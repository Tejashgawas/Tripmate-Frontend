"use client"

import { useState, useEffect } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  MapPin, Users, Star, TrendingUp, Loader2, RefreshCw,
  Plus, CheckCircle, Clock, AlertTriangle, X, Send,
  Sparkles, ThumbsUp, Award, Settings, Target,
  Hotel, Bus, Car, Package, Vote, UserCheck,
  Calendar, DollarSign, Utensils, Activity, Zap,
  Globe, Heart, Shield, Crown, ChevronDown, ChevronUp,
  Phone, MapPinIcon
} from "lucide-react"
import React from "react"

/* ───── INTERFACES TO MATCH YOUR STRUCTURE ───── */
interface Creator {
  id: number
  username: string
}

interface Trip {
  id: number
  title: string
  start_date: string
  end_date: string
  location: string
  budget: number
  trip_type: string
  trip_code: string
  created_at: string
  creator: Creator
}

interface TripMembership {
  trip: Trip
  role: "owner" | "member"
  joined_at: string
}

interface TripMember {
  id: number
  username: string
  email: string
}

interface Preference {
  id: number
  trip_id: number
  user_id: number
  budget: number
  accommodation_type: string
  food_preferences: string
  activity_interests: string
  pace: string
  user?: { username: string, email: string }
}

interface RecommendedService {
  id: number
  title: string
  type: string
  price?: number
  rating?: number
  provider: {
    id: number
    name: string
    contact_phone: string
  }
  location?: string
  is_available?: boolean
  features?: any
}

interface RecommendationResponse {
  hotels: RecommendedService[]
  buses: RecommendedService[]
  rentals: RecommendedService[]
  packages: RecommendedService[]
}

interface PersistedOption {
  service_id: number
  rank: number
  votes: number
  service: RecommendedService
}

interface PersistedRecommendation {
  trip_id: number
  service_type: string
  options: PersistedOption[]
}

interface SelectedService {
  id: number
  trip_id: number
  service_id: number
  selected_on: string
  custom_notes: string
  service: RecommendedService
}

const ACCOMMODATION_TYPES = [
  { value: "hotel", label: "🏨 Hotel", icon: "🏨" },
  { value: "hostel", label: "🏠 Hostel", icon: "🏠" },
  { value: "resort", label: "🏖️ Resort", icon: "🏖️" },
  { value: "apartment", label: "🏢 Apartment", icon: "🏢" },
  { value: "guesthouse", label: "🏡 Guesthouse", icon: "🏡" }
]

const FOOD_PREFERENCES = [
  { value: "any", label: "🍽️ Any", icon: "🍽️" },
  { value: "vegetarian", label: "🥬 Vegetarian", icon: "🥬" },
  { value: "vegan", label: "🌱 Vegan", icon: "🌱" },
  { value: "halal", label: "🥙 Halal", icon: "🥙" },
  { value: "gluten-free", label: "🌾 Gluten-Free", icon: "🌾" }
]

const ACTIVITY_INTERESTS = [
  { value: "sightseeing", label: "🏛️ Sightseeing" },
  { value: "adventure sports", label: "🏔️ Adventure Sports" },
  { value: "relaxation", label: "🧘 Relaxation" },
  { value: "hiking", label: "🥾 Hiking" },
  { value: "nightlife", label: "🌙 Nightlife" },
  { value: "cultural", label: "🎭 Cultural" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "food tours", label: "🍜 Food Tours" }
]

const PACE_OPTIONS = [
  { value: "slow", label: "🐢 Slow & Relaxed", icon: "🐢" },
  { value: "moderate", label: "🚶 Moderate", icon: "🚶" },
  { value: "fast", label: "🏃 Fast-Paced", icon: "🏃" }
]

const SERVICE_TYPES = [
  { key: 'hotels', label: 'Hotels', icon: Hotel, color: 'from-blue-500 to-blue-600' },
  { key: 'buses', label: 'Transportation', icon: Bus, color: 'from-green-500 to-green-600' },
  { key: 'rentals', label: 'Rentals', icon: Car, color: 'from-purple-500 to-purple-600' },
  { key: 'packages', label: 'Packages', icon: Package, color: 'from-orange-500 to-orange-600' }
]

const PERSISTED_SERVICE_TYPES = [
  'hotel', 'bus', 'rental', 'package', 'guide', 'restaurant', 'car_rental', 'lodge'
]

const getServiceTypeIcon = (type: string) => {
  switch(type.toLowerCase()) {
    case 'hotel': return Hotel
    case 'bus': return Bus
    case 'rental':
    case 'car_rental': return Car
    case 'package': return Package
    case 'restaurant': return Utensils
    case 'guide': return Users
    case 'lodge': return Hotel
    default: return Package
  }
}

export default function RecommendationsPage() {
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { get, post, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client

  // Core data states
  const [tripMemberships, setTripMemberships] = useState<TripMembership[]>([])
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null)
  const [selectedTripMembership, setSelectedTripMembership] = useState<TripMembership | null>(null)
  const [tripMembers, setTripMembers] = useState<TripMember[]>([])
  const [preferences, setPreferences] = useState<Preference[]>([])
  const [userPreference, setUserPreference] = useState<Preference | null>(null)

  // Recommendation states
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null)
  const [persistedRecommendations, setPersistedRecommendations] = useState<PersistedRecommendation[]>([])
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([])
  const [activeServiceType, setActiveServiceType] = useState<string>('hotels')

  // Loading states
  const [loading, setLoading] = useState(true)
  const [loadingPreferences, setLoadingPreferences] = useState(false)
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [loadingPersisted, setLoadingPersisted] = useState(false)
  const [submittingPreference, setSubmittingPreference] = useState(false)
  const [voting, setVoting] = useState<number | null>(null)
  const [confirming, setConfirming] = useState<number | null>(null)

  // Modal states
  const [showPreferenceModal, setShowPreferenceModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmService, setConfirmService] = useState<RecommendedService | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Form states
  const [preferenceForm, setPreferenceForm] = useState({
    budget: 0,
    accommodation_type: "",
    food_preferences: "",
    activity_interests: "",
    pace: ""
  })

  const [confirmForm, setConfirmForm] = useState({
    service_type: "",
    service_id: 0,
    notes: ""
  })

  /* ───── Fetch trips using useApi ───── */
  const fetchTrips = async () => {
    if (!user) return

    try {
      setLoading(true)
      console.log("[RECOMMENDATIONS] Fetching trips for user:", user.id)

      const data = await get<any>(`/trip-member/users/${user.id}/trips`)
      console.log("[RECOMMENDATIONS] Raw API response:", data)

      const memberships: TripMembership[] = data.trips || []
      
      console.log("[RECOMMENDATIONS] Parsed memberships:", {
        total: memberships.length,
        owned: memberships.filter(m => m.role === "owner").length,
        member: memberships.filter(m => m.role === "member").length
      })

      setTripMemberships(memberships)
    } catch (error) {
      console.error("[RECOMMENDATIONS] Error fetching trips:", error)
    } finally { 
      setLoading(false) 
    }
  }

  /* ───── Fetch trip members using useApi ───── */
  const fetchTripMembers = async (tripId: number) => {
    try {
      console.log(`[RECOMMENDATIONS] Fetching trip members for trip ${tripId}`)
      const data = await get<any>(`/trip-member/trip/${tripId}`)
      const members = data?.members || data || []
      const users = Array.isArray(members) ? members.map((m: any) => m?.user || m).filter(Boolean) : []
      setTripMembers(users)
    } catch (error) {
      console.error("[RECOMMENDATIONS] Error fetching trip members:", error)
    }
  }

  /* ───── Fetch trip preferences using useApi ───── */
  const fetchTripPreferences = async (tripId: number) => {
    try {
      setLoadingPreferences(true)
      console.log(`[RECOMMENDATIONS] Fetching preferences for trip ${tripId}`)
      const data = await get<Preference[]>(`/trip-member-preference/trips/${tripId}/preferences`)
      const prefs = Array.isArray(data) ? data : []
      setPreferences(prefs)

      // Check if current user has submitted preference
      const userPref = prefs.find((p: Preference) => p.user_id === user?.id)
      setUserPreference(userPref || null)
    } catch (error) {
      console.error("[RECOMMENDATIONS] Error fetching preferences:", error)
    } finally {
      setLoadingPreferences(false)
    }
  }

  /* ───── Submit preference using useApi ───── */
  const submitPreference = async () => {
    if (!selectedTripId || !preferenceForm.accommodation_type || !preferenceForm.food_preferences || 
        !preferenceForm.activity_interests || !preferenceForm.pace || preferenceForm.budget <= 0) {
      setErrorMessage("Please fill all required fields")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    try {
      setSubmittingPreference(true)
      console.log("[RECOMMENDATIONS] Submitting preference:", preferenceForm)

      const newPreference = await post(`/trip-member-preference/trips/${selectedTripId}/preferences`, preferenceForm)
      setUserPreference(newPreference)
      setShowPreferenceModal(false)
      setPreferenceForm({ budget: 0, accommodation_type: "", food_preferences: "", activity_interests: "", pace: "" })
      setSuccessMessage("Preferences submitted successfully!")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      await fetchTripPreferences(selectedTripId)
    } catch (error) {
      console.error("[RECOMMENDATIONS] Error submitting preference:", error)
      setErrorMessage("Failed to submit preferences")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setSubmittingPreference(false)
    }
  }

  /* ───── Fetch recommendations using useApi ───── */
  const fetchRecommendations = async (tripId: number) => {
    try {
      setLoadingRecommendations(true)
      console.log(`[RECOMMENDATIONS] Fetching recommendations for trip ${tripId}`)
      const data = await get<RecommendationResponse>(`/recommendations/trips/${tripId}`)
      setRecommendations(data)
      // Fetch persisted recommendations after getting initial recommendations
      await fetchPersistedRecommendations(tripId)
    } catch (error) {
      console.error("[RECOMMENDATIONS] Error fetching recommendations:", error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  /* ───── Fetch persisted recommendations per service type using useApi ───── */
  const fetchPersistedRecommendations = async (tripId: number) => {
    try {
      setLoadingPersisted(true)
      const persistedData: PersistedRecommendation[] = []

      // Fetch for each service type separately
      for (const serviceType of PERSISTED_SERVICE_TYPES) {
        try {
          console.log(`[RECOMMENDATIONS] Fetching persisted ${serviceType} for trip ${tripId}`)
          const data = await get<PersistedRecommendation>(`/recommendations/trips/${tripId}/persisted?service_type=${serviceType}`)
          // Only add if has options
          if (data && data.options && data.options.length > 0) {
            persistedData.push(data)
          }
        } catch (error) {
          console.error(`[RECOMMENDATIONS] Error fetching persisted ${serviceType}:`, error)
          // Continue with other service types
        }
      }

      console.log("[RECOMMENDATIONS] Persisted data:", persistedData)
      setPersistedRecommendations(persistedData)
    } catch (error) {
      console.error("[RECOMMENDATIONS] Error fetching persisted recommendations:", error)
    } finally {
      setLoadingPersisted(false)
    }
  }

  /* ───── Vote on service using useApi ───── */
  const voteOnService = async (serviceType: string, serviceId: number) => {
    try {
      setVoting(serviceId)
      console.log(`[RECOMMENDATIONS] Voting on service ${serviceId} of type ${serviceType}`)

      await post(`/recommendations/trips/${selectedTripId}/vote`, { 
        service_type: serviceType, 
        service_id: serviceId 
      })

      setSuccessMessage("Vote submitted successfully!")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      // Refresh persisted recommendations to get updated votes
      await fetchPersistedRecommendations(selectedTripId!)
    } catch (error) {
      console.error("[RECOMMENDATIONS] Error voting on service:", error)
      setErrorMessage("Failed to submit vote")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setVoting(null)
    }
  }

  /* ───── Confirm service using useApi ───── */
  const confirmServiceSelection = async () => {
    try {
      setConfirming(confirmForm.service_id)
      console.log("[RECOMMENDATIONS] Confirming service:", confirmForm)

      await post(`/recommendations/trips/${selectedTripId}/confirm`, confirmForm)

      setShowConfirmModal(false)
      setConfirmForm({ service_type: "", service_id: 0, notes: "" })
      setConfirmService(null)
      setSuccessMessage("Service confirmed successfully!")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      // Refresh both selected services and persisted recommendations
      await fetchSelectedServices(selectedTripId!)
      await fetchPersistedRecommendations(selectedTripId!)
    } catch (error) {
      console.error("[RECOMMENDATIONS] Error confirming service:", error)
      setErrorMessage("Failed to confirm service")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setConfirming(null)
    }
  }

  /* ───── Fetch selected services using useApi ───── */
  const fetchSelectedServices = async (tripId: number) => {
    try {
      console.log(`[RECOMMENDATIONS] Fetching selected services for trip ${tripId}`)
      const data = await get<SelectedService[]>(`/recommendations/${tripId}/services/selected`)
      setSelectedServices(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[RECOMMENDATIONS] Error fetching selected services:", error)
    }
  }

  /* ───── Refresh all data ───── */
  const refreshAllData = async () => {
    if (!selectedTripId) return

    try {
      console.log("[RECOMMENDATIONS] Refreshing all data for trip:", selectedTripId)
      
      // Refresh preferences
      await fetchTripPreferences(selectedTripId)
      
      // Refresh persisted recommendations if we have recommendations
      if (recommendations || persistedRecommendations.length > 0) {
        await fetchPersistedRecommendations(selectedTripId)
      }
      
      // Refresh selected services
      await fetchSelectedServices(selectedTripId)

      setSuccessMessage("Data refreshed successfully!")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    } catch (error) {
      setErrorMessage("Failed to refresh data")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    }
  }

  /* ───── Effects ───── */
  useEffect(() => {
    if (user) {
      fetchTrips()
    }
  }, [user])

  useEffect(() => {
    if (selectedTripId && user) {
      const membership = tripMemberships.find(m => m.trip.id === selectedTripId)
      setSelectedTripMembership(membership || null)
      fetchTripMembers(selectedTripId)
      fetchTripPreferences(selectedTripId)
      fetchSelectedServices(selectedTripId)
      // Also fetch persisted recommendations if available
      fetchPersistedRecommendations(selectedTripId)
    }
  }, [selectedTripId, user, tripMemberships])

  /* ───── Helper functions ───── */
  const formatCurrency = (amount: number) => {
    if (!amount) return "Contact for price"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const allMembersHavePreferences = () => {
    if (tripMembers.length === 0 || preferences.length === 0) return false
    return tripMembers.every(member => 
      preferences.some(pref => pref.user_id === member.id)
    )
  }

  const getServiceIcon = (serviceType: string) => {
    const service = SERVICE_TYPES.find(s => s.key === serviceType)
    return service ? service.icon : Package
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  const renderFeatures = (features: any) => {
    if (!features) return "No features listed"
    if (Array.isArray(features)) {
      return features.join(", ")
    }
    if (typeof features === 'object') {
      return JSON.stringify(features)
    }
    return features.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-blue-950 p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full animate-pulse"></div>
            <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
          </div>
          <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400">Loading recommendations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-blue-950">
      <DashboardShell>
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
            {/* Header */}
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 dark:from-purple-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                      Smart Recommendations
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                      Get personalized recommendations based on your group preferences
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    onClick={refreshAllData}
                    disabled={!selectedTripId}
                    variant="outline"
                    className="flex-1 sm:flex-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    <RefreshCw className="w-4 h-4 mr-2"/>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>

            {/* Trip Selection */}
            <Card className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                  Select Trip for Recommendations
                </h2>
              </div>
              
              <select
                value={selectedTripId || ""}
                onChange={(e) => setSelectedTripId(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full p-2 sm:p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
              >
                <option value="">Choose a trip...</option>
                {tripMemberships.map((membership) => (
                  <option key={membership.trip.id} value={membership.trip.id}>
                    🌟 {membership.trip.title} • {membership.trip.location} • {formatDate(membership.trip.start_date)} 
                    {membership.role === "owner" ? " (Owner)" : " (Member)"}
                  </option>
                ))}
              </select>

              {selectedTripMembership && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-blue-700 dark:text-blue-300 text-sm sm:text-base">{selectedTripMembership.trip.title}</h3>
                      <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                        {selectedTripMembership.trip.location} • {formatDate(selectedTripMembership.trip.start_date)} to {formatDate(selectedTripMembership.trip.end_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 text-xs">
                        {selectedTripMembership.role}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 text-xs">
                        {formatCurrency(selectedTripMembership.trip.budget)}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {selectedTripId && (
              <>
                {/* User Preference Section */}
                <Card className="mb-6 sm:mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                  <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                            Your Preferences
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {userPreference ? "Preferences submitted" : "Submit your preferences to get recommendations"}
                          </p>
                        </div>
                      </div>

                      {!userPreference && (
                        <Button
                          onClick={() => setShowPreferenceModal(true)}
                          className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                        >
                          <Plus className="w-4 h-4 mr-2"/>
                          Add Preferences
                        </Button>
                      )}
                    </div>
                  </div>

                  {userPreference ? (
                    <div className="p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                            <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Budget</span>
                          </div>
                          <p className="font-bold text-green-800 dark:text-green-200 text-sm sm:text-base">{formatCurrency(userPreference.budget)}</p>
                        </div>

                        <div className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Hotel className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                            <span className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Stay</span>
                          </div>
                          <p className="font-bold text-blue-800 dark:text-blue-200 capitalize text-sm sm:text-base">{userPreference.accommodation_type}</p>
                        </div>

                        <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 rounded-lg border border-orange-200 dark:border-orange-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Utensils className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                            <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">Food</span>
                          </div>
                          <p className="font-bold text-orange-800 dark:text-orange-200 capitalize text-sm sm:text-base">{userPreference.food_preferences}</p>
                        </div>

                        <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-lg border border-purple-200 dark:border-purple-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                            <span className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Activities</span>
                          </div>
                          <p className="font-bold text-purple-800 dark:text-purple-200 capitalize text-sm sm:text-base">{userPreference.activity_interests}</p>
                        </div>

                        <div className="p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                            <span className="text-xs sm:text-sm font-medium text-yellow-700 dark:text-yellow-300">Pace</span>
                          </div>
                          <p className="font-bold text-yellow-800 dark:text-yellow-200 capitalize text-sm sm:text-base">{userPreference.pace}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800 dark:to-emerald-700 rounded-full flex items-center justify-center mb-4">
                        <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        Please submit your preferences to help us recommend the best services for your trip
                      </p>
                    </div>
                  )}
                </Card>

                {/* All Member Preferences */}
                {preferences.length > 0 && (
                  <Card className="mb-6 sm:mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                            Group Preferences ({preferences.length}/{tripMembers.length})
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {allMembersHavePreferences() ? 
                              "All members have submitted preferences!" : 
                              "Waiting for some members to submit their preferences"
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="grid gap-3 sm:gap-4">
                        {preferences.map((pref) => {
                          const member = tripMembers.find(m => m.id === pref.user_id)
                          const isCurrentUser = pref.user_id === user?.id
                          
                          return (
                            <div 
                              key={pref.id} 
                              className={`p-3 sm:p-4 rounded-lg border ${
                                isCurrentUser ? 
                                'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-200 dark:border-purple-700' :
                                'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                                  isCurrentUser ? 'bg-purple-500' : 'bg-gray-500'
                                }`}>
                                  <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                    {member?.username || member?.email || 'Unknown User'}
                                    {isCurrentUser && <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">You</Badge>}
                                  </h4>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 text-xs sm:text-sm">
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                                  <p className="font-semibold">{formatCurrency(pref.budget)}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Stay:</span>
                                  <p className="font-semibold capitalize">{pref.accommodation_type}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Food:</span>
                                  <p className="font-semibold capitalize">{pref.food_preferences}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Activities:</span>
                                  <p className="font-semibold capitalize">{pref.activity_interests}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Pace:</span>
                                  <p className="font-semibold capitalize">{pref.pace}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Get Recommendations Button */}
                {allMembersHavePreferences() && !recommendations && (
                  <Card className="mb-6 sm:mb-8 p-4 sm:p-6 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border border-blue-200 dark:border-blue-700">
                    <div className="max-w-md mx-auto">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                        Ready for Recommendations!
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                        All team members have submitted their preferences. Get personalized recommendations now!
                      </p>
                      <Button
                        onClick={() => fetchRecommendations(selectedTripId)}
                        disabled={loadingRecommendations}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-6 sm:px-8"
                      >
                        {loadingRecommendations ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Getting Recommendations...
                          </>
                        ) : (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            Get Smart Recommendations
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Recommendations Display */}
                {recommendations && (
                  <Card className="mb-6 sm:mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                          Initial Recommendations
                        </h2>
                      </div>
                    </div>

                    {/* Service Type Tabs */}
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap gap-2">
                        {SERVICE_TYPES.map((serviceType) => {
                          const count = (recommendations as any)[serviceType.key]?.length || 0
                          const IconComponent = serviceType.icon
                          
                          return (
                            <Button
                              key={serviceType.key}
                              onClick={() => setActiveServiceType(serviceType.key)}
                              variant={activeServiceType === serviceType.key ? "default" : "outline"}
                              className={
                                activeServiceType === serviceType.key
                                  ? `bg-gradient-to-r ${serviceType.color} text-white text-xs sm:text-sm h-10 sm:h-12`
                                  : "bg-white/50 dark:bg-gray-800/50 text-xs sm:text-sm h-10 sm:h-12"
                              }
                            >
                              <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span className="hidden sm:inline">{serviceType.label}</span>
                              <span className="sm:hidden">{serviceType.label.split(' ')[0]}</span>
                              <Badge className="ml-1 sm:ml-2 bg-white/20 text-white text-xs">
                                {count}
                              </Badge>
                            </Button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Service Listings */}
                    <div className="p-4 sm:p-6">
                      {(recommendations as any)[activeServiceType]?.length > 0 ? (
                        <div className="grid gap-4">
                          {(recommendations as any)[activeServiceType].map((service: RecommendedService) => (
                            <div key={service.id} className="p-4 sm:p-6 border rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                              <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                                      {service.title}
                                    </h4>
                                    {service.rating && (
                                      <div className="flex items-center gap-1">
                                        {renderStars(service.rating)}
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">
                                          ({service.rating})
                                        </span>
                                      </div>
                                    )}
                                    {service.is_available ? (
                                      <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                                    ) : (
                                      <Badge className="bg-red-100 text-red-800 text-xs">Not Available</Badge>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm mb-3">
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Provider:</span>
                                      <p className="font-semibold">{service.provider.name}</p>
                                      <p className="text-xs text-gray-400">{service.provider.contact_phone}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                      <p className="font-semibold">{service.location || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Price:</span>
                                      <p className="font-semibold text-green-600">
                                        {formatCurrency(service.price)}
                                      </p>
                                    </div>
                                  </div>

                                  {service.features && (
                                    <div className="mt-3">
                                      <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Features:</span>
                                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
                                        {renderFeatures(service.features)}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                                  <Button
                                    onClick={() => voteOnService(activeServiceType, service.id)}
                                    disabled={voting === service.id}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 lg:flex-none hover:bg-blue-50 dark:hover:bg-blue-900/20 h-10 text-xs sm:text-sm"
                                  >
                                    {voting === service.id ? (
                                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                    ) : (
                                      <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                  </Button>

                                  <Button
                                    onClick={() => {
                                      setConfirmService(service)
                                      setConfirmForm({
                                        service_type: activeServiceType,
                                        service_id: service.id,
                                        notes: ""
                                      })
                                      setShowConfirmModal(true)
                                    }}
                                    size="sm"
                                    className="flex-1 lg:flex-none bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white h-10 text-xs sm:text-sm"
                                  >
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    Select
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mb-4">
                            {React.createElement(getServiceIcon(activeServiceType), { className: "h-6 w-6 sm:h-8 sm:w-8 text-gray-500" })}
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                            No {activeServiceType} recommendations available
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Enhanced Persisted Recommendations with Voting */}
                {persistedRecommendations.length > 0 && (
                  <Card className="mb-6 sm:mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                          <Vote className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                          Community Voting Results
                        </h2>
                        <Badge className="bg-indigo-100 text-indigo-800 text-xs sm:text-sm">
                          {persistedRecommendations.length} Categories
                        </Badge>
                      </div>
                    </div>

                    {loadingPersisted && (
                      <div className="p-4 sm:p-6 text-center">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-4" />
                        <p className="text-sm sm:text-base">Loading voting results...</p>
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      {persistedRecommendations.map((category) => {
                        const IconComponent = getServiceTypeIcon(category.service_type)
                        return (
                          <div key={category.service_type} className="mb-6 sm:mb-8 last:mb-0">
                            <div className="flex items-center gap-3 mb-3 sm:mb-4">
                              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                              <h3 className="text-lg sm:text-xl font-bold capitalize text-gray-900 dark:text-gray-100">
                                {category.service_type.replace('_', ' ')} Recommendations
                              </h3>
                              <Badge className="bg-indigo-100 text-indigo-800 text-xs sm:text-sm">
                                {category.options.length} Options
                              </Badge>
                            </div>

                            <div className="grid gap-3 sm:gap-4">
                              {category.options
                                .sort((a, b) => b.votes - a.votes)
                                .map((option, index) => (
                                  <div key={option.service_id} className="p-4 sm:p-6 border rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border-indigo-200 dark:border-indigo-700 hover:shadow-lg transition-all duration-300">
                                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                                      <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                          <div className="flex items-center gap-2">
                                            <Badge className={`text-xs sm:text-sm ${
                                              index === 0 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                              index === 1 ? 'bg-gray-100 text-gray-800 border-gray-300' :
                                              index === 2 ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                              'bg-indigo-100 text-indigo-800 border-indigo-300'
                                            }`}>
                                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`} Rank {option.rank}
                                            </Badge>
                                            <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 px-2 sm:px-3 py-1 rounded-full">
                                              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                                              <span className="font-bold text-indigo-600 text-sm sm:text-base">{option.votes}</span>
                                              <span className="text-xs sm:text-sm text-gray-500">votes</span>
                                            </div>
                                          </div>
                                        </div>

                                        <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                          {option.service.title}
                                        </h4>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm mb-3">
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">Provider:</span>
                                            <p className="font-semibold">{option.service.provider.name}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                              <Phone className="w-3 h-3" />
                                              {option.service.provider.contact_phone}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                            <p className="font-semibold flex items-center gap-1">
                                              <MapPinIcon className="w-3 h-3" />
                                              {option.service.location || 'Not specified'}
                                            </p>
                                          </div>
                                          <div>
                                            <span className="text-gray-500 dark:text-gray-400">Price:</span>
                                            <p className="font-semibold text-green-600">
                                              {formatCurrency(option.service.price)}
                                            </p>
                                          </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                                          {option.service.rating && (
                                            <div className="flex items-center gap-1">
                                              {renderStars(option.service.rating)}
                                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">
                                                ({option.service.rating})
                                              </span>
                                            </div>
                                          )}
                                          {option.service.is_available ? (
                                            <Badge className="bg-green-100 text-green-800 text-xs">Available</Badge>
                                          ) : (
                                            <Badge className="bg-red-100 text-red-800 text-xs">Not Available</Badge>
                                          )}
                                        </div>

                                        {option.service.features && (
                                          <div className="mt-3">
                                            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">Features:</span>
                                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
                                              {renderFeatures(option.service.features)}
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-auto">
                                        <Button
                                          onClick={() => voteOnService(category.service_type, option.service_id)}
                                          disabled={voting === option.service_id}
                                          variant="outline"
                                          size="sm"
                                          className="flex-1 lg:flex-none hover:bg-indigo-50 dark:hover:bg-indigo-900/20 h-10 text-xs sm:text-sm"
                                        >
                                          {voting === option.service_id ? (
                                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                          ) : (
                                            <>
                                              <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                              Vote
                                            </>
                                          )}
                                        </Button>

                                        <Button
                                          onClick={() => {
                                            setConfirmService(option.service)
                                            setConfirmForm({
                                              service_type: category.service_type,
                                              service_id: option.service_id,
                                              notes: ""
                                            })
                                            setShowConfirmModal(true)
                                          }}
                                          size="sm"
                                          className="flex-1 lg:flex-none bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white h-10 text-xs sm:text-sm"
                                        >
                                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                          Confirm
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                )}

                {/* Enhanced Selected Services */}
                {selectedServices.length > 0 && (
                  <Card className="mb-6 sm:mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                          <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                          Your Confirmed Services
                        </h2>
                        <Badge className="bg-green-100 text-green-800 text-xs sm:text-sm">
                          {selectedServices.length} Selected
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      <div className="grid gap-4 sm:gap-6">
                        {selectedServices.map((selection) => {
                          const IconComponent = getServiceTypeIcon(selection.service.type)
                          return (
                            <div key={selection.id} className="p-4 sm:p-6 border rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-700 shadow-lg">
                              <div className="flex items-start gap-3 sm:gap-4">
                                <div className="p-2 sm:p-3 bg-green-500 rounded-lg sm:rounded-xl shadow-md">
                                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                                      {selection.service.title}
                                    </h4>
                                    <Badge className="bg-green-100 text-green-800 border-green-300 text-xs w-fit">
                                      ✅ Confirmed
                                    </Badge>
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 capitalize text-xs w-fit">
                                      {selection.service.type}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm mb-4">
                                    <div className="space-y-2">
                                      <div>
                                        <span className="text-gray-500 dark:text-gray-400">Provider:</span>
                                        <p className="font-semibold">{selection.service.provider.name}</p>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Phone className="w-3 h-3" />
                                        {selection.service.provider.contact_phone}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Location:</span>
                                      <p className="font-semibold flex items-center gap-1">
                                        <MapPinIcon className="w-3 h-3" />
                                        {selection.service.location || 'Not specified'}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 dark:text-gray-400">Price:</span>
                                      <p className="font-semibold text-green-600 text-base sm:text-lg">
                                        {formatCurrency(selection.service.price)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                                    {selection.service.rating && (
                                      <div className="flex items-center gap-1">
                                        {renderStars(selection.service.rating)}
                                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">
                                          ({selection.service.rating})
                                        </span>
                                      </div>
                                    )}
                                    {selection.service.is_available ? (
                                      <Badge className="bg-green-100 text-green-800 text-xs w-fit">Available</Badge>
                                    ) : (
                                      <Badge className="bg-red-100 text-red-800 text-xs w-fit">Not Available</Badge>
                                    )}
                                    <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      Selected on {formatDateTime(selection.selected_on)}
                                    </div>
                                  </div>

                                  {selection.service.features && (
                                    <div className="mb-4">
                                      <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">Features:</span>
                                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1 bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                        {renderFeatures(selection.service.features)}
                                      </p>
                                    </div>
                                  )}

                                  {selection.custom_notes && (
                                    <div className="p-3 sm:p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-green-200 dark:border-green-700">
                                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Your Notes:</span>
                                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1 font-medium">
                                        {selection.custom_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Preference Modal */}
            {showPreferenceModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl sm:rounded-3xl blur opacity-30"></div>
                  <Card className="relative w-full max-w-xs sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 rounded-xl sm:rounded-2xl">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg">
                            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                              Submit Your Preferences
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Help us recommend the best services for you</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setShowPreferenceModal(false)}
                          variant="outline"
                          size="sm"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/50 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 w-8 h-8 sm:w-10 sm:h-10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4 sm:space-y-6">
                        {/* Budget */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Budget (INR) *
                          </label>
                          <Input
                            type="number"
                            value={preferenceForm.budget}
                            onChange={(e) => setPreferenceForm({...preferenceForm, budget: parseFloat(e.target.value) || 0})}
                            placeholder="Enter your budget in INR"
                            min="0"
                            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 h-10 sm:h-12"
                          />
                        </div>

                        {/* Accommodation Type */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Accommodation Type *
                          </label>
                          <select
                            value={preferenceForm.accommodation_type}
                            onChange={(e) => setPreferenceForm({...preferenceForm, accommodation_type: e.target.value})}
                            className="w-full p-2 sm:p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                          >
                            <option value="">Select accommodation type</option>
                            {ACCOMMODATION_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Food Preferences */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Food Preferences *
                          </label>
                          <select
                            value={preferenceForm.food_preferences}
                            onChange={(e) => setPreferenceForm({...preferenceForm, food_preferences: e.target.value})}
                            className="w-full p-2 sm:p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                          >
                            <option value="">Select food preference</option>
                            {FOOD_PREFERENCES.map((pref) => (
                              <option key={pref.value} value={pref.value}>
                                {pref.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Activity Interests */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Activity Interests *
                          </label>
                          <select
                            value={preferenceForm.activity_interests}
                            onChange={(e) => setPreferenceForm({...preferenceForm, activity_interests: e.target.value})}
                            className="w-full p-2 sm:p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                          >
                            <option value="">Select activity interests</option>
                            {ACTIVITY_INTERESTS.map((activity) => (
                              <option key={activity.value} value={activity.value}>
                                {activity.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Pace */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Travel Pace *
                          </label>
                          <select
                            value={preferenceForm.pace}
                            onChange={(e) => setPreferenceForm({...preferenceForm, pace: e.target.value})}
                            className="w-full p-2 sm:p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                          >
                            <option value="">Select travel pace</option>
                            {PACE_OPTIONS.map((pace) => (
                              <option key={pace.value} value={pace.value}>
                                {pace.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => setShowPreferenceModal(false)}
                          disabled={submittingPreference}
                          variant="outline"
                          className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 h-10 sm:h-12"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={submitPreference}
                          disabled={submittingPreference || !preferenceForm.accommodation_type || !preferenceForm.food_preferences || !preferenceForm.activity_interests || !preferenceForm.pace || preferenceForm.budget <= 0}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12"
                        >
                          {submittingPreference ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2"/>
                              Submit Preferences
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Confirm Service Modal */}
            {showConfirmModal && confirmService && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl sm:rounded-2xl blur opacity-30"></div>
                  <Card className="relative w-full max-w-xs sm:max-w-md shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 rounded-xl sm:rounded-2xl">
                    <div className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">Confirm Service Selection</h3>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Add this service to your trip</p>
                        </div>
                      </div>

                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">
                          {confirmService.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          by {confirmService.provider.name}
                        </p>
                        {confirmService.price && (
                          <p className="text-xs sm:text-sm font-semibold text-green-600">
                            {formatCurrency(confirmService.price)}
                          </p>
                        )}
                      </div>

                      <div className="mb-4 sm:mb-6">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Notes (Optional)
                        </label>
                        <Textarea
                          value={confirmForm.notes}
                          onChange={(e) => setConfirmForm({...confirmForm, notes: e.target.value})}
                          placeholder="Add any notes about this selection..."
                          rows={3}
                          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 text-sm"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowConfirmModal(false)}
                          variant="outline"
                          className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 h-10 sm:h-12 text-sm sm:text-base"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={confirmServiceSelection}
                          disabled={confirming !== null}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white h-10 sm:h-12 text-sm sm:text-base"
                        >
                          {confirming !== null ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirm Selection
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-white dark:bg-gray-900 border-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-xs sm:max-w-md w-full shadow-2xl backdrop-blur-xl">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                        Success!
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">{successMessage}</p>
                      <Button 
                        onClick={() => setShowSuccess(false)} 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12"
                      >
                        Awesome!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Modal */}
            {showError && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-white dark:bg-gray-900 border-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-xs sm:max-w-md w-full shadow-2xl backdrop-blur-xl">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg">
                        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-red-600 to-pink-700 dark:from-red-400 dark:to-pink-500 bg-clip-text text-transparent">
                        Error
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">{errorMessage}</p>
                      <Button 
                        onClick={() => setShowError(false)} 
                        className="w-full bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12"
                      >
                        Got it
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </div>
  )
}
