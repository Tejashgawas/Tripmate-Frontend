"use client";

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import {
  Search, MapPin, CalendarDays, Mail, Edit, Trash2,
  ChevronLeft, ChevronRight, Loader2, AlertTriangle,
  CheckCircle, X, Users, Crown, UserCheck, DollarSign,
  Sparkles, Calendar, Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

/* ───────────────── interfaces ───────────────── */
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

/* color helper */
const tripTypeColor = (t: string) =>
  ({
    leisure:    "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 dark:from-blue-800/30 dark:to-blue-700/30 dark:text-blue-300 border-blue-300 dark:border-blue-600",
    adventure:  "bg-gradient-to-br from-orange-100 to-orange-200 text-orange-800 dark:from-orange-800/30 dark:to-orange-700/30 dark:text-orange-300 border-orange-300 dark:border-orange-600",
    workation:  "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 dark:from-purple-800/30 dark:to-purple-700/30 dark:text-purple-300 border-purple-300 dark:border-purple-600",
    pilgrimage: "bg-gradient-to-br from-green-100 to-green-200 text-green-800 dark:from-green-800/30 dark:to-green-700/30 dark:text-green-300 border-green-300 dark:border-green-600",
    cultural:   "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-800 dark:from-pink-800/30 dark:to-pink-700/30 dark:text-pink-300 border-pink-300 dark:border-pink-600",
    other:      "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/30 dark:to-gray-700/30 dark:text-gray-300 border-gray-300 dark:border-gray-600",
  }[t] ?? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 dark:from-gray-800/30 dark:to-gray-700/30 dark:text-gray-300 border-gray-300 dark:border-gray-600")

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })

const calculateDuration = (startDate: string, endDate: string) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return `${diffDays} day${diffDays > 1 ? 's' : ''}`
}

/* ───────────────── component ───────────────── */
export default function TripsPage() {
  /* hooks */
  const { user } = useAuth()
  const { get, put, delete: deleteApi, post, loading: apiLoading, error: apiError } = useApi()

  /* state */
  const [tripMemberships, setTripMemberships] = useState<TripMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [search, setSearch] = useState("")
  const [searching, setSearching] = useState(false)
  const [allTrips, setAllTrips] = useState<TripMembership[]>([]) // Store original trips for search

  const [editing, setEditing] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    title: "", location: "", start_date: "", end_date: "",
    budget: 0, trip_type: "leisure",
  })

  /* modals / toasts */
  const [updatedTitle, setUpdatedTitle] = useState("")
  const [showUpdate, setShowUpdate] = useState(false)

  const [toDelete, setToDelete] = useState<number | null>(null)
  const [showConfirmDel, setShowConfirmDel] = useState(false)
  const [showDelSuccess, setShowDelSuccess] = useState(false)

  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ trip_id: 0, invitee_email: "" })
  const [invLoading, setInvLoading] = useState(false)
  const [invitedMail, setInvitedMail] = useState("")
  const [showInvSuccess, setShowInvSuccess] = useState(false)

  /* ───── Fetch trips using useApi hook ───── */
  const fetchTrips = async () => {
    if (!user?.id) {
      console.log("[TRIPS] No user ID available")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("[TRIPS] Fetching trips for user:", user.id)

      const data = await get<{ trips: TripMembership[] }>(`/trip-member/users/${user.id}/trips`)
      const memberships = data.trips || []
      
      console.log("[TRIPS] Fetched memberships:", {
        total: memberships.length,
        owned: memberships.filter(m => m.role === "owner").length,
        member: memberships.filter(m => m.role === "member").length
      })

      setTripMemberships(memberships)
      setAllTrips(memberships) // Store original for search
    } catch (error) {
      console.error("[TRIPS] Error fetching trips:", error)
      // Error handling is already managed by useApi hook
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    fetchTrips()
  }, [user])

  /* search */
  const handleSearch = async () => {
    if (!search.trim()) {
      setTripMemberships(allTrips)
      return
    }
    
    setSearching(true)
    try {
      const filtered = allTrips.filter(membership => {
        const searchLower = search.toLowerCase()
        return (
          (membership.trip.trip_code?.toLowerCase() || '').includes(searchLower) ||
          (membership.trip.title?.toLowerCase() || '').includes(searchLower) ||
          (membership.trip.location?.toLowerCase() || '').includes(searchLower)
        )
      })
      setTripMemberships(filtered)
    } finally { 
      setSearching(false) 
    }
  }

  /* ───── Enhanced update trip with useApi ───── */
  const updateTrip = async (id: number) => {
    try {
      setUpdating(true)
      console.log("[UPDATE] Updating trip:", { id, data: editForm })
      
      await put(`/trips/update-trip/${id}`, editForm)
      
      console.log("[UPDATE] Trip updated successfully")
      setEditing(null)
      setUpdatedTitle(editForm.title)
      setShowUpdate(true)
      
      // Refresh the trips data
      await fetchTrips()
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setShowUpdate(false)
      }, 3000)
      
    } catch (error) {
      console.error("[UPDATE] Error updating trip:", error)
      alert("Error updating trip. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  /* ───── Enhanced delete function with useApi ───── */
  const deleteTrip = async () => {
    if (!toDelete) {
      console.error("[DELETE] No trip ID to delete")
      return
    }

    try {
      setUpdating(true)
      console.log("[DELETE] Deleting trip:", toDelete)
      
      await deleteApi(`/trips/delete-trip/${toDelete}`)
      
      console.log("[DELETE] Trip deleted successfully:", toDelete)
      
      // Close modal and reset state
      setShowConfirmDel(false)
      setToDelete(null)
      setShowDelSuccess(true)
      
      // Refresh the trips data immediately
      await fetchTrips()
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setShowDelSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error("[DELETE] Exception during delete:", error)
      alert("Failed to delete trip. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  /* invite */
  const sendInvite = async () => {
    if (!inviteForm.invitee_email.trim()) return alert("Enter an email")
    
    try {
      setInvLoading(true)
      
      await post(`/trip-invite/`, inviteForm)
      
      setInvitedMail(inviteForm.invitee_email)
      setShowInvite(false)
      setShowInvSuccess(true)
      setInviteForm({ trip_id: 0, invitee_email: "" })
      
      setTimeout(() => {
        setShowInvSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error("[INVITE] Send invite failed:", error)
      alert("Send invite failed")
    } finally { 
      setInvLoading(false) 
    }
  }

  // Calculate stats
  const ownerTrips = tripMemberships.filter(m => m.role === "owner")
  const memberTrips = tripMemberships.filter(m => m.role === "member")

  /* ───────────────── render ───────────────── */
  return (
    <DashboardShell>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-[#1e40af] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
            My Adventures
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Discover, manage, and relive your incredible journeys - both the ones you lead and the ones you're part of
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
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 font-medium">Total Adventures</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-purple-600 dark:text-purple-400">{tripMemberships.length}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Enhanced Controls */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 items-center justify-center mb-8 sm:mb-12">
          <div className="relative w-full sm:flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"/>
            <Input
              placeholder="Search adventures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-10 sm:pl-12 h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm focus:bg-white dark:focus:bg-gray-900 transition-all"
            />
          </div>
          <Button
           onClick={handleSearch} disabled={searching}
           className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#1e40af] to-[#06b6d4] hover:from-[#1e40af]/90 hover:to-[#06b6d4]/90 shadow-lg hover:shadow-xl transition-all"
           >
            {searching ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin"/> : <Search className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
          {search && (
            <Button 
              variant="outline" 
              className="w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl border-2"
              onClick={() => {setSearch(""); setTripMemberships(allTrips)}}
            >
              Clear
            </Button>
          )}
          
          {/* Role-based buttons */}
          {ownerTrips.length > 0 && (
            <Link href="/send-invites">
              <Button className="w-full sm:w-auto h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>View Invites
              </Button>
            </Link>
          )}
          
          <Link href="/create-trip">
            <Button className="w-full sm:w-auto h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all font-semibold">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>Create Adventure
            </Button>
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full animate-pulse"></div>
              <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
            </div>
            <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-muted-foreground">Loading your adventures...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && tripMemberships.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                <MapPin className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground"/>
              </div>
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white"/>
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">No Adventures Yet</h3>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto px-4">
              {search ? "No trips match your search criteria" : "Ready to embark on your first adventure? Create a trip or join one!"}
            </p>
            <Link href="/create-trip">
              <Button className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl bg-gradient-to-r from-[#1e40af] to-[#06b6d4] hover:from-[#1e40af]/90 hover:to-[#06b6d4]/90 text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3"/>Start Your Adventure
              </Button>
            </Link>
          </div>
        )}

        {/* Enhanced Trip Cards */}
        {!loading && tripMemberships.length > 0 && (
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

                    {editing === trip.id ? (
                      <div className="relative z-20 p-6 sm:p-8 space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                          <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-[#1e40af]" />
                          <h3 className="text-lg sm:text-xl font-bold">Editing Adventure</h3>
                        </div>
                        
                        <Input 
                          value={editForm.title} 
                          onChange={(e) => setEditForm({...editForm,title:e.target.value})} 
                          placeholder="Adventure Title"
                          className="h-10 sm:h-12 rounded-lg sm:rounded-xl"
                        />
                        <Input 
                          value={editForm.location} 
                          onChange={(e) => setEditForm({...editForm,location:e.target.value})} 
                          placeholder="Destination"
                          className="h-10 sm:h-12 rounded-lg sm:rounded-xl"
                        />
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <Input 
                            type="date" 
                            value={editForm.start_date} 
                            onChange={(e) => setEditForm({...editForm,start_date:e.target.value})}
                            className="h-10 sm:h-12 rounded-lg sm:rounded-xl"
                          />
                          <Input 
                            type="date" 
                            value={editForm.end_date} 
                            onChange={(e) => setEditForm({...editForm,end_date:e.target.value})}
                            className="h-10 sm:h-12 rounded-lg sm:rounded-xl"
                          />
                        </div>
                        <Input 
                          type="number" 
                          value={editForm.budget}
                          onChange={(e) => setEditForm({...editForm,budget:parseInt(e.target.value)||0})}
                          placeholder="Budget (₹)"
                          className="h-10 sm:h-12 rounded-lg sm:rounded-xl"
                        />
                        <select 
                          value={editForm.trip_type} 
                          onChange={(e) => setEditForm({...editForm,trip_type:e.target.value})}
                          className="w-full h-10 sm:h-12 px-3 sm:px-4 border rounded-lg sm:rounded-xl bg-background"
                        >
                          {["leisure","adventure","workation","pilgrimage","cultural","other"].map(o=>(
                            <option key={o} value={o}>{o[0].toUpperCase()+o.slice(1)}</option>
                          ))}
                        </select>
                        
                        <div className="flex gap-3 sm:gap-4 pt-4">
                          <Button 
                            className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-sm sm:text-base" 
                            onClick={() => updateTrip(trip.id)}
                            disabled={updating}
                          >
                            {updating ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin"/> : <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>}
                            Save
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl text-sm sm:text-base" 
                            onClick={() => setEditing(null)}
                            disabled={updating}
                          >
                            <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative z-20 p-6 sm:p-8">
                        {/* Owner Controls - Vertical Stack */}
                        {isOwner && (
                          <div className="absolute top-4 sm:top-6 right-4 sm:right-6 flex flex-col items-center gap-1 sm:gap-2 z-30 mt-12 sm:mt-14">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-md border border-gray-200/50 dark:border-gray-700/50"
                              onClick={() => {
                                setEditing(trip.id);
                                setEditForm({
                                  title:trip.title,location:trip.location,start_date:trip.start_date,end_date:trip.end_date,
                                  budget:trip.budget,trip_type:trip.trip_type
                                })
                              }}
                            >
                              <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]"/>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 shadow-md border border-gray-200/50 dark:border-gray-700/50"
                              onClick={() => {setToDelete(trip.id);setShowConfirmDel(true)}}
                            >
                              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-500"/>
                            </Button>
                          </div>
                        )}

                        {/* Header */}
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
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400"/>
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

                          {/* Action Buttons */}
                          <div className="space-y-2 sm:space-y-3 pt-3 sm:pt-4">
                            {isOwner && (
                              <Button
                                className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#1e40af] to-[#06b6d4] hover:from-[#1e40af]/90 hover:to-[#06b6d4]/90 shadow-lg font-semibold transition-all text-sm sm:text-base"
                                onClick={() => {setInviteForm({trip_id:trip.id,invitee_email:""});setShowInvite(true)}}
                              >
                                <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>Invite Travelers
                              </Button>
                            )}

                            <Link href={`/trips/${trip.id}/members`}>
                              <Button
                                variant="outline"
                                className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl border-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 font-semibold transition-all text-sm sm:text-base"
                              >
                                <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>View Fellow Travelers
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SUCCESS NOTIFICATIONS */}
      {/* Enhanced Update Success Modal */}
      {showUpdate && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white"/>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 dark:text-green-200">Trip Updated!</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  "{updatedTitle}" has been updated successfully.
                </p>
              </div>
              <button 
                onClick={() => setShowUpdate(false)}
                className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 p-1 rounded-full hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            <div className="mt-3 h-1 bg-green-200 dark:bg-green-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-[shrink_3s_linear_forwards]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Success Modal */}
      {showDelSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white"/>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-red-800 dark:text-red-200">Trip Deleted!</h4>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Your trip has been permanently deleted.
                </p>
              </div>
              <button 
                onClick={() => setShowDelSuccess(false)}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            <div className="mt-3 h-1 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full animate-[shrink_3s_linear_forwards]"></div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showConfirmDel && (
        <Modal
          onClose={() => {setShowConfirmDel(false);setToDelete(null)}}
          actions={
            <>
              <Button 
                variant="outline" 
                onClick={() => {setShowConfirmDel(false);setToDelete(null)}} 
                className="flex-1"
                disabled={updating}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 flex-1" 
                onClick={deleteTrip}
                disabled={updating}
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                Delete Trip
              </Button>
            </>
          }
        >
          <ModalIcon warning/>
          <h3 className="font-bold text-xl sm:text-2xl">Delete Adventure</h3>
          <p className="text-muted-foreground mt-3">
            Are you sure you want to delete this trip? This action cannot be undone and will remove all associated data.
          </p>
        </Modal>
      )}

      {showInvite && (
        <Modal
          onClose={() => {setShowInvite(false);setInviteForm({trip_id:0,invitee_email:""})}}
          actions={
            <>
              <Button variant="outline" disabled={invLoading} onClick={() => {setShowInvite(false);setInviteForm({trip_id:0,invitee_email:""})}} className="flex-1">
                Cancel
              </Button>
              <Button disabled={invLoading} onClick={sendInvite} className="bg-gradient-to-r from-[#1e40af] to-[#06b6d4] flex-1">
                {invLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Mail className="h-4 w-4 mr-2"/>}
                Send Invite
              </Button>
            </>
          }
        >
          <ModalIcon info/>
          <h3 className="font-bold text-xl sm:text-2xl">Invite Fellow Travelers</h3>
          <p className="text-muted-foreground mt-3">Enter the email address to invite someone to this adventure.</p>
          <Input 
            className="mt-4 sm:mt-6 h-10 sm:h-12 rounded-lg sm:rounded-xl" 
            type="email" 
            placeholder="Enter email address"
            value={inviteForm.invitee_email}
            onChange={(e) => setInviteForm({...inviteForm,invitee_email:e.target.value})}
          />
        </Modal>
      )}

      {showInvSuccess && (
        <Modal onClose={() => setShowInvSuccess(false)}>
          <ModalIcon success/>
          <h3 className="font-bold text-xl sm:text-2xl">Invite Sent!</h3>
          <p className="text-muted-foreground mt-3">
            Trip invitation has been sent to <strong>{invitedMail}</strong>
          </p>
        </Modal>
      )}
    </DashboardShell>
  )
}

/* ───────────────── Enhanced Modal Components ───────────────── */
function Modal({
  children,
  onClose,
  actions,
}: {
  children: React.ReactNode
  onClose: () => void
  actions?: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-sm sm:max-w-md w-full mx-4 relative shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        <button className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={onClose}>
          <X className="h-4 w-4 sm:h-5 sm:w-5"/>
        </button>
        {children}
        {actions && <div className="mt-6 sm:mt-8 flex gap-3 sm:gap-4">{actions}</div>}
      </div>
    </div>
  )
}

function ModalIcon({ success, warning, info }:{success?:boolean; warning?:boolean; info?:boolean}) {
  const baseClass = "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg"
  
  if (success) return (
    <div className={`${baseClass} bg-gradient-to-br from-emerald-400 to-teal-500`}>
      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
    </div>
  )
  if (warning) return (
    <div className={`${baseClass} bg-gradient-to-br from-red-400 to-rose-500`}>
      <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
    </div>
  )
  return (
    <div className={`${baseClass} bg-gradient-to-br from-[#1e40af] to-[#06b6d4]`}>
      <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
    </div>
  )
}
