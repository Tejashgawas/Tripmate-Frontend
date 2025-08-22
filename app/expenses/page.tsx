"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  IndianRupee, MapPin, Plus, Eye, BarChart3, Loader2,
  CalendarDays, ArrowRight, Users, Clock, RefreshCw,
  DollarSign, CreditCard, Receipt, TrendingUp, Calculator,
  Crown, UserCheck, Sparkles, Calendar, Star
} from "lucide-react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

/* ───────────────── interfaces ───────────────── */
interface Creator {
  id: number
  username: string
}

interface Trip {
  id: number
  title: string
  location: string
  start_date: string
  end_date: string
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

export default function ExpensePage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [tripMemberships, setTripMemberships] = useState<TripMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  /* ───── token refresh ───── */
  const refreshToken = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST", credentials: "include"
      })
      return response.ok
    } finally {
      setRefreshing(false)
    }
  }

  /* ───── Get current user from GET /me ───── */
  const getCurrentUser = async () => {
    try {
      console.log("[EXPENSES] Fetching current user from /me endpoint...")
      const response = await fetch(`${BASE_URL}me/`, {
        credentials: "include"
      })
      if (response.ok) {
        const userData = await response.json()
        console.log("[EXPENSES] Current user data:", userData)
        setCurrentUserId(userData.id)
        return userData.id
      } else {
        console.error("[EXPENSES] Failed to fetch current user:", response.status)
      }
    } catch (error) {
      console.error("[EXPENSES] Error fetching current user:", error)
    }
    return null
  }

  /* ───── fetch trips using NEW ENDPOINT ───── */
  const fetchTrips = async (retry = false) => {
    try {
      setLoading(true)

      // Get current user ID from /me endpoint
      const userId = currentUserId || await getCurrentUser()
      if (!userId) {
        console.error("[EXPENSES] Cannot fetch trips - no user ID")
        return
      }

      console.log("[EXPENSES] Fetching trips for user:", userId)

      // Use new endpoint with user ID
      const res = await fetch(`${BASE_URL}trip-member/users/${userId}/trips`, {
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return fetchTrips(true)
      }

      if (res.ok) {
        const data = await res.json()
        console.log("[EXPENSES] Raw API response:", data)

        const memberships: TripMembership[] = data.trips || []
        
        console.log("[EXPENSES] Parsed memberships:", {
          total: memberships.length,
          owned: memberships.filter(m => m.role === "owner").length,
          member: memberships.filter(m => m.role === "member").length
        })

        setTripMemberships(memberships)
      } else {
        console.error("[EXPENSES] Failed to fetch trips:", res.status)
      }
    } catch (error) {
      console.error("[EXPENSES] Error fetching trips:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrips() }, [])

  /* ───── helper functions ───── */
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })

  const tripTypeColor = (t: string) =>
    ({
      leisure:    "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-blue-300 border-blue-300 dark:border-blue-600",
      adventure:  "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-orange-300 border-orange-300 dark:border-orange-600",
      workation:  "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 dark:from-purple-800/30 dark:to-purple-700/30 dark:text-purple-300 border-purple-300 dark:border-purple-600",
      pilgrimage: "bg-gradient-to-br from-green-100 to-green-200 text-green-800 dark:from-green-800/30 dark:to-green-700/30 dark:text-green-300 border-green-300 dark:border-green-600",
      cultural:   "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-800 dark:from-pink-800/30 dark:to-pink-700/30 dark:text-pink-300 border-pink-300 dark:border-pink-600",
      other:      "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/30 dark:to-gray-700/30 dark:text-gray-300 border-gray-300 dark:border-gray-600",
    }[t] ?? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/30 dark:to-gray-700/30 dark:text-gray-300 border-gray-300 dark:border-gray-600")

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`
  }

  // Calculate stats
  const ownerTrips = tripMemberships.filter(m => m.role === "owner")
  const memberTrips = tripMemberships.filter(m => m.role === "member")

  return (
    <DashboardShell>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-[#1e40af] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
            Expense Tracker
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Track and split your travel expenses effortlessly. Monitor spending, settle payments, and stay within budget for all your trips.
          </p>
          <div className="flex justify-center mt-6">
            <div className="h-1 w-24 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full"></div>
          </div>
        </div>

        {/* Enhanced Summary Stats */}
        {tripMemberships.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] rounded-xl sm:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Card className="relative p-6 sm:p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-blue-200/50 dark:border-blue-800/50 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-[#1e40af] to-[#3b82f6] rounded-xl sm:rounded-2xl shadow-lg">
                    <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 font-medium">Trips I Own</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e40af] dark:text-blue-400">{ownerTrips.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Card className="relative p-6 sm:p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-green-200/50 dark:border-green-800/50 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg">
                    <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 font-medium">Member of</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 dark:text-green-400">{memberTrips.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <Card className="relative p-6 sm:p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-purple-200/50 dark:border-purple-800/50 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg">
                    <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 font-medium">Total Expenses</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400">{tripMemberships.length}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => fetchTrips()}
            disabled={loading || refreshing}
            variant="outline"
            className="h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10"
          >
            {loading || refreshing ? (
              <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2"/>
            ) : (
              <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
            )}
            Refresh
          </Button>
        </div>

        {/* refreshing banner */}
        {refreshing && (
          <div className="mb-6 p-4 bg-[#1e40af]/10 border border-[#1e40af]/20 rounded-lg flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-[#1e40af] mr-3"/>
            <span className="text-[#1e40af]">Refreshing authentication…</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full animate-pulse"></div>
              <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
            </div>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-muted-foreground">Loading your expense trackers…</p>
          </div>
        ) : tripMemberships.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 sm:py-20">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                <IndianRupee className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground"/>
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white"/>
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">No Trips Found</h3>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto px-4">
              You need to create trips first before tracking expenses. Start your journey by creating your first trip!
            </p>
            <Link href="/create-trip">
              <Button className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-[#1e40af] to-[#06b6d4] hover:from-[#1e40af]/90 hover:to-[#06b6d4]/90 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3"/>
                Create Your First Trip
              </Button>
            </Link>
          </div>
        ) : (
          /* Enhanced Trip Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {tripMemberships.map((membership) => {
              const trip = membership.trip
              const isOwner = membership.role === "owner"
              const duration = calculateDuration(trip.start_date, trip.end_date)
              
              return (
                <div key={trip.id} className="group">
                  <Card className="relative overflow-hidden bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.01]">
                    {/* Role Badge */}
                    <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-30">
                      {isOwner ? (
                        <Badge className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white border-0 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm">
                          <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Owner
                        </Badge>
                      ) : (
                        <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm">
                          <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Member
                        </Badge>
                      )}
                    </div>

                    <div className="relative z-20 p-6 sm:p-8">
                      {/* Trip Header */}
                      <div className="mb-4 sm:mb-6 pr-16 sm:pr-20">
                        <h3 className="text-lg sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-white group-hover:text-[#1e40af] dark:group-hover:text-blue-400 transition-colors">
                          {trip.title}
                        </h3>
                        
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-[#06b6d4] flex-shrink-0"/>
                            <span className="font-medium truncate">{trip.location}</span>
                          </div>
                          
                          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 text-[#06b6d4] flex-shrink-0"/>
                            <span className="truncate">{fmt(trip.start_date)} → {fmt(trip.end_date)}</span>
                            <Badge variant="secondary" className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 flex-shrink-0">
                              {duration}
                            </Badge>
                          </div>

                          <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-yellow-500 flex-shrink-0"/>
                            Created by <span className="font-semibold text-[#1e40af] dark:text-blue-400 ml-1 truncate">{trip.creator.username}</span>
                          </div>
                        </div>
                      </div>

                      {/* Trip Details */}
                      <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center justify-between gap-3">
                          <Badge className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full border font-medium text-xs sm:text-sm flex-shrink-0 ${tripTypeColor(trip.trip_type)}`}>
                            {trip.trip_type.charAt(0).toUpperCase() + trip.trip_type.slice(1)}
                          </Badge>
                          <div className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-full flex-shrink-0">
                            <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm">
                              ₹{trip.budget.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Trip Code</span>
                            <span className="font-mono font-bold text-[#1e40af] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
                              {trip.trip_code}
                            </span>
                          </div>
                        </div>

                        {/* Expense Stats Preview */}
                        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#1e40af]/5 via-transparent to-[#06b6d4]/5 rounded-lg border border-[#06b6d4]/20">
                          <div className="flex items-center gap-2 text-sm text-[#1e40af]">
                            <Calculator className="h-4 w-4"/>
                            <span className="font-medium">Budget Tracking Available</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
                          {/* Track Expenses */}
                          <Link href={`/dashboard/trips/${trip.id}/expenses`}>
                            <Button 
                              className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 shadow-lg font-semibold transition-all text-sm sm:text-base"
                            >
                              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                              Track Expenses
                            </Button>
                          </Link>

                          {/* Expense Dashboard */}
                          <Link href={`/dashboard/trips/${trip.id}/expense-dashboard`}>
                            <Button 
                              variant="outline"
                              className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10 font-semibold transition-all text-sm sm:text-base"
                            >
                              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                              Dashboard
                              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-auto"/>
                            </Button>
                          </Link>

                          {/* Settlements */}
                          <Link href={`/dashboard/trips/${trip.id}/settlements`}>
                            <Button 
                              variant="outline"
                              className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af]/10 font-semibold transition-all text-sm sm:text-base"
                            >
                              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                              Settle Up
                              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-auto"/>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e40af]/5 via-transparent to-[#06b6d4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"/>
                  </Card>
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Actions Footer */}
        {tripMemberships.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border/30">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Ready to track expenses for your next trip?</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/create-trip">
                  <Button variant="outline" className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af]/10">
                    <Plus className="h-4 w-4 mr-2"/>
                    Create New Trip
                  </Button>
                </Link>
                <Link href="/trips">
                  <Button variant="outline" className="border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10">
                    <MapPin className="h-4 w-4 mr-2"/>
                    Manage Trips
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
