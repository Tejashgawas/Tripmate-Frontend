"use client"

import { useState, useEffect } from "react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

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
  created_by?: number // Owner ID
  user_role?: "owner" | "member" // Role indicator
}

interface TripMember {
  id: number
  trip_id: number
  user_id: number
  role: string
  joined_at: string
}

export const useTripData = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  /* ───── Token refresh ───── */
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

  /* ───── Get current user ───── */
  const getCurrentUser = async () => {
    try {
      const response = await fetch(`${BASE_URL}auth/me`, {
        credentials: "include"
      })
      if (response.ok) {
        const userData = await response.json()
        setCurrentUserId(userData.id)
        return userData.id
      }
    } catch (error) {
      console.error("[TRIPS] Error fetching current user:", error)
    }
    return null
  }

  /* ───── Fetch trips where user is OWNER ───── */
  const fetchOwnerTrips = async (retry = false): Promise<Trip[]> => {
    try {
      console.log("[TRIPS] Fetching owner trips...")
      
      const res = await fetch(`${BASE_URL}trips/view-trips?limit=50`, {
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return fetchOwnerTrips(true)
      }

      if (res.ok) {
        const data = await res.json()
        const ownerTrips = Array.isArray(data) ? data : data.trips ?? []
        
        // Add role indicator
        const tripsWithRole = ownerTrips.map((trip: Trip) => ({
          ...trip,
          user_role: "owner" as const
        }))

        console.log("[TRIPS] Owner trips fetched:", tripsWithRole.length)
        return tripsWithRole
      }
    } catch (error) {
      console.error("[TRIPS] Error fetching owner trips:", error)
    }
    return []
  }

  /* ───── Fetch trip memberships where user is MEMBER ───── */
  const fetchMemberTrips = async (userId: number, retry = false): Promise<Trip[]> => {
    try {
      console.log("[TRIPS] Fetching member trips for user:", userId)
      
      // Step 1: Get trip memberships
      const memberRes = await fetch(`${BASE_URL}trip-member/user/${userId}`, {
        credentials: "include"
      })

      if (!memberRes.ok && (memberRes.status === 401 || memberRes.status === 403) && !retry) {
        if (await refreshToken()) return fetchMemberTrips(userId, true)
      }

      if (!memberRes.ok) {
        console.log("[TRIPS] No memberships found or error:", memberRes.status)
        return []
      }

      const membershipData = await memberRes.json()
      const memberships: TripMember[] = Array.isArray(membershipData) ? membershipData : membershipData.memberships ?? []
      
      console.log("[TRIPS] Found memberships:", memberships.length)

      if (memberships.length === 0) {
        return []
      }

      // Step 2: Extract unique trip IDs
      const tripIds = [...new Set(memberships.map(m => m.trip_id))]
      console.log("[TRIPS] Member trip IDs:", tripIds)

      // Step 3: Fetch trip details for each trip ID
      const memberTrips: Trip[] = []
      
      for (const tripId of tripIds) {
        try {
          const tripRes = await fetch(`${BASE_URL}trips/${tripId}`, {
            credentials: "include"
          })

          if (tripRes.ok) {
            const tripData = await tripRes.json()
            memberTrips.push({
              ...tripData,
              user_role: "member" as const
            })
          } else {
            console.warn("[TRIPS] Failed to fetch trip details for ID:", tripId, tripRes.status)
          }
        } catch (error) {
          console.error("[TRIPS] Error fetching trip details for ID:", tripId, error)
        }
      }

      console.log("[TRIPS] Member trips fetched:", memberTrips.length)
      return memberTrips

    } catch (error) {
      console.error("[TRIPS] Error fetching member trips:", error)
      return []
    }
  }

  /* ───── Main fetch function - combines OWNER and MEMBER trips ───── */
  const fetchAllTrips = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user ID
      const userId = currentUserId || await getCurrentUser()
      if (!userId) {
        setError("Unable to identify current user")
        return
      }

      console.log("[TRIPS] Fetching all trips for user:", userId)

      // Fetch both owner and member trips concurrently
      const [ownerTrips, memberTrips] = await Promise.all([
        fetchOwnerTrips(),
        fetchMemberTrips(userId)
      ])

      // Combine trips and remove duplicates (in case user is both owner and member)
      const combinedTripsMap = new Map<number, Trip>()
      
      // Add owner trips (these take priority for role designation)
      ownerTrips.forEach(trip => {
        combinedTripsMap.set(trip.id, trip)
      })
      
      // Add member trips (only if not already added as owner)
      memberTrips.forEach(trip => {
        if (!combinedTripsMap.has(trip.id)) {
          combinedTripsMap.set(trip.id, trip)
        }
      })

      const allTrips = Array.from(combinedTripsMap.values())
      
      // Sort by creation date (newest first)
      allTrips.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      console.log("[TRIPS] Final trip count:", {
        owner: ownerTrips.length,
        member: memberTrips.length,
        total: allTrips.length,
        combined: allTrips.length
      })

      setTrips(allTrips)

    } catch (error) {
      console.error("[TRIPS] Error in fetchAllTrips:", error)
      setError("Failed to load trips")
    } finally {
      setLoading(false)
    }
  }

  /* ───── Auto-fetch on mount ───── */
  useEffect(() => {
    fetchAllTrips()
  }, [])

  return {
    trips,
    loading,
    error,
    currentUserId,
    refetch: fetchAllTrips,
    ownerTrips: trips.filter(t => t.user_role === "owner"),
    memberTrips: trips.filter(t => t.user_role === "member")
  }
}
