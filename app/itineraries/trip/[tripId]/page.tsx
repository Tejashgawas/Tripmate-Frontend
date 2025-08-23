"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  ArrowLeft, Calendar, Loader2, Plus, Edit, Trash2, 
  CheckCircle, AlertTriangle, X, Save, Clock,
  Users, ChevronDown, ChevronUp, RefreshCw,
} from "lucide-react"

/* ───────────────── types ───────────────── */
interface Activity {
  time: string
  title: string
  description: string
  id: number
  created_at: string
}

interface Itinerary {
  id: number
  trip_id: number
  day_number: number
  title: string
  description: string
  date: string
  activities: Activity[]
  created_at: string
}

/* ───────────────── component ───────────────── */
export default function TripItinerariesPage() {
  const params = useParams()
  const tripId = params?.tripId
  const { user } = useAuth()
  const { get, put,  delete: deleteApi, loading: apiLoading, error: apiError } = useApi()

  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)

  /* in-place editing states */
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    date: "",
  })
  const [updateLoading, setUpdateLoading] = useState(false)

  /* detailed view states */
  const [expandedId, setExpandedId] = useState<number | null>(null)

  /* delete states */
  const [itineraryToDelete, setItineraryToDelete] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [deletedItineraryTitle, setDeletedItineraryTitle] = useState("")

  /* ───── fetch itineraries using useApi ───── */
  const fetchItineraries = async () => {
    if (!tripId || !user) {
      console.error("[ITINERARY] No tripId or user provided")
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      console.log(`[ITINERARY] Fetching itineraries for trip ${tripId}`)
      
      const data = await get<Itinerary[]>(`/itinerary/trip/${tripId}`)
      console.log("[ITINERARY] Fetched", data?.length || 0, "itineraries")
      setItineraries(data || [])
    } catch (error) {
      console.error("[ITINERARY] Error fetching itineraries:", error)
      // Error handling is managed by useApi hook
    } finally {
      setLoading(false)
    }
  }

  /* ───── update itinerary (in-place) using useApi ───── */
  const updateItinerary = async (id: number) => {
    try {
      setUpdateLoading(true)
      console.log(`[ITINERARY] Updating itinerary ${id} with:`, editForm)
      
      const updatedItinerary = await put(`/itinerary/${id}`, editForm)
      console.log("[ITINERARY] Update successful, updated data:", updatedItinerary)
      
      // Update the local state directly instead of refetching
      setItineraries(prevItineraries => 
        prevItineraries.map(itinerary => 
          itinerary.id === id ? { ...itinerary, ...updatedItinerary } : itinerary
        )
      )
      
      setEditingId(null)
      console.log("[ITINERARY] Local state updated successfully")
    } catch (error) {
      console.error("[ITINERARY] Error updating itinerary:", error)
      alert("Error updating itinerary. Please try again.")
    } finally {
      setUpdateLoading(false)
    }
  }

  /* ───── delete itinerary using useApi ───── */
  const deleteItinerary = async () => {
    if (!itineraryToDelete) {
      console.error("[ITINERARY] No itinerary selected for deletion")
      return
    }

    try {
      setDeleteLoading(true)
      console.log(`[ITINERARY] Deleting itinerary ${itineraryToDelete}`)
      
      await deleteApi(`/itinerary/${itineraryToDelete}`)
      console.log("[ITINERARY] Delete successful")
      
      const deletedItinerary = itineraries.find(i => i.id === itineraryToDelete)
      setDeletedItineraryTitle(deletedItinerary?.title || "Itinerary")
      
      // Remove from local state immediately
      setItineraries(prevItineraries => 
        prevItineraries.filter(itinerary => itinerary.id !== itineraryToDelete)
      )
      
      setShowDeleteConfirm(false)
      setShowDeleteSuccess(true)
      console.log("[ITINERARY] Item removed from local state")
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setShowDeleteSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("[ITINERARY] Error deleting itinerary:", error)
      alert("Error deleting itinerary. Please try again.")
    } finally {
      setDeleteLoading(false)
      setItineraryToDelete(null)
    }
  }

  /* ───── start editing ───── */
  const startEdit = (itinerary: Itinerary) => {
    console.log("[ITINERARY] Starting edit for:", itinerary)
    setEditingId(itinerary.id)
    setEditForm({
      title: itinerary.title,
      description: itinerary.description || "",
      date: itinerary.date,
    })
  }

  /* ───── toggle detailed view ───── */
  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  useEffect(() => { 
    console.log("[ITINERARY] Component mounted, tripId:", tripId)
    fetchItineraries() 
  }, [tripId, user])

  /* ───── helper functions ───── */
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })

  const fmtTime = (timeStr: string) => {
    // Handle format like "19:50:06" or "08:26:24"
    const [hours, minutes] = timeStr.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  if (!tripId) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Invalid trip ID</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header - Updated with Refresh Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <Link href="/itineraries">
              <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
                Trip Itineraries
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage and organize your trip itineraries
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Refresh Button */}
            <Button
              onClick={() => {
                console.log("[ITINERARY] Manual refresh triggered")
                fetchItineraries()
              }}
              disabled={loading}
              variant="outline"
              className="border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2"/>
              ) : (
                <RefreshCw className="h-4 w-4 mr-2"/>
              )}
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Link href={`/itineraries/create?tripId=${tripId}`}>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl">
                <Plus className="h-4 w-4 mr-2"/>
                Create Itinerary
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full animate-pulse"></div>
              <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
            </div>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground">Loading itineraries…</p>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground"/>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">No Itineraries Yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
              Start planning your trip by creating your first itinerary
            </p>
            <Link href={`/itineraries/create?tripId=${tripId}`}>
              <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2"/>
                Create First Itinerary
              </Button>
            </Link>
          </div>
        ) : (
          /* ──── ITINERARY CARDS ──── */
          <div className="space-y-4 sm:space-y-6">
            {itineraries
              .sort((a, b) => a.day_number - b.day_number) // Sort by day number
              .map(itinerary => (
              <div
                key={itinerary.id}
                className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl sm:rounded-2xl 
                         shadow-lg shadow-[#1e40af]/5 hover:shadow-xl hover:shadow-[#1e40af]/10 
                         transition-all duration-300"
              >
                {editingId === itinerary.id ? (
                  /* ──── EDIT MODE ──── */
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#1e40af] to-[#06b6d4] flex items-center justify-center text-white font-bold text-base sm:text-lg">
                        {itinerary.day_number}
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground">Editing Day {itinerary.day_number}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Title</label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="focus:border-[#1e40af] h-10 sm:h-12 rounded-lg sm:rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                          className="focus:border-[#1e40af] h-10 sm:h-12 rounded-lg sm:rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Description</label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={3}
                        className="focus:border-[#1e40af] resize-none rounded-lg sm:rounded-xl"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log("[ITINERARY] Canceling edit")
                          setEditingId(null)
                        }}
                        disabled={updateLoading}
                        className="h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => updateItinerary(itinerary.id)}
                        disabled={updateLoading}
                        className="bg-green-600 hover:bg-green-700 text-white h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl"
                      >
                        {updateLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ──── VIEW MODE ──── */
                  <div>
                    {/* Header - Clickable to expand */}
                    <div
                      className="p-4 sm:p-6 cursor-pointer hover:bg-muted/20 transition-colors rounded-xl sm:rounded-2xl"
                      onClick={() => toggleExpanded(itinerary.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#1e40af] to-[#06b6d4] flex items-center justify-center text-white font-bold text-base sm:text-lg">
                            {itinerary.day_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-1 truncate">{itinerary.title}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4"/>
                                {fmt(itinerary.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 sm:h-4 sm:w-4"/>
                                {itinerary.activities.length} activities
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 ml-2">
                          {/* Action buttons */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEdit(itinerary)
                            }}
                            className="hover:bg-[#1e40af]/10 w-8 h-8 sm:w-10 sm:h-10"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-[#1e40af]"/>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log(`[ITINERARY] Initiating delete for itinerary ${itinerary.id}`)
                              setItineraryToDelete(itinerary.id)
                              setShowDeleteConfirm(true)
                            }}
                            className="hover:bg-red-100 dark:hover:bg-red-900/20 w-8 h-8 sm:w-10 sm:h-10"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600"/>
                          </Button>

                          {/* Expand/Collapse button */}
                          <Button variant="ghost" size="icon" className="hover:bg-muted w-8 h-8 sm:w-10 sm:h-10">
                            {expandedId === itinerary.id ? 
                              <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4"/> : 
                              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4"/>
                            }
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === itinerary.id && (
                      <div className="border-t border-border/30 bg-muted/10">
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                          {/* Description */}
                          {itinerary.description && (
                            <div>
                              <h4 className="font-semibold mb-2 text-[#1e40af] text-sm sm:text-base">Description</h4>
                              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                                {itinerary.description}
                              </p>
                            </div>
                          )}

                          {/* Activities */}
                          <div>
                            <h4 className="font-semibold mb-3 sm:mb-4 text-[#1e40af] flex items-center gap-2 text-sm sm:text-base">
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5"/>
                              Daily Activities ({itinerary.activities.length})
                            </h4>
                            
                            {itinerary.activities.length === 0 ? (
                              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                                <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50"/>
                                <p className="text-sm sm:text-base">No activities planned for this day yet</p>
                              </div>
                            ) : (
                              <div className="space-y-3 sm:space-y-4">
                                {itinerary.activities
                                  .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
                                  .map((activity, index) => (
                                  <div 
                                    key={activity.id} 
                                    className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-background/80 rounded-lg border border-border/30 hover:border-[#1e40af]/30 transition-colors"
                                  >
                                    {/* Time */}
                                    <div className="flex flex-col items-center min-w-[60px] sm:min-w-[80px]">
                                      <div className="w-12 h-8 sm:w-16 sm:h-12 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] rounded-lg flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                                        {fmtTime(activity.time)}
                                      </div>
                                      {index < itinerary.activities.length - 1 && (
                                        <div className="w-0.5 h-6 sm:h-8 bg-border/50 mt-2"/>
                                      )}
                                    </div>

                                    {/* Activity Details */}
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold text-sm sm:text-base lg:text-lg mb-1">{activity.title}</h5>
                                      <p className="text-muted-foreground leading-relaxed mb-2 text-xs sm:text-sm">
                                        {activity.description}
                                      </p>
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Added: {fmt(activity.created_at)}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-4 border-t border-border/30 text-xs sm:text-sm text-muted-foreground">
                            <span>Itinerary created: {fmt(itinerary.created_at)}</span>
                            <Badge className="bg-[#1e40af]/10 text-[#1e40af] border-[#1e40af]/20">
                              Day {itinerary.day_number}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 relative shadow-2xl animate-in fade-in-0 zoom-in-95">
            <button className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => { setShowDeleteConfirm(false); setItineraryToDelete(null) }}>
              <X className="h-4 w-4"/>
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"/>
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Delete Itinerary</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Are you sure you want to delete this itinerary? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { 
                  console.log("[ITINERARY] Delete canceled")
                  setShowDeleteConfirm(false); 
                  setItineraryToDelete(null) 
                }}
                disabled={deleteLoading}
                className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteItinerary()}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 relative shadow-2xl animate-in fade-in-0 zoom-in-95">
            <button className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setShowDeleteSuccess(false)}>
              <X className="h-4 w-4"/>
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"/>
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2">Itinerary Deleted</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              <strong>{deletedItineraryTitle}</strong> has been successfully deleted.
            </p>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
