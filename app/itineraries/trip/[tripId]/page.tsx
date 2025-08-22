"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"

import { Button } from "@/components/ui/button"
import { Badge }  from "@/components/ui/badge"
import { Input }  from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  ArrowLeft, Calendar, Loader2, Plus, Edit, Trash2, 
  CheckCircle, AlertTriangle, X, Save, Clock,
  Users, ChevronDown, ChevronUp,RefreshCw,
} from "lucide-react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

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

  const [itineraries, setItineraries] = useState<Itinerary[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

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

  /* ───── token refresh ───── */
  const refreshToken = async () => {
    console.log("[ITINERARY] Attempting token refresh...")
    setRefreshing(true)
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST", credentials: "include"
      })
      console.log("[ITINERARY] Token refresh response:", response.status, response.ok)
      return response.ok
    } catch (error) {
      console.error("[ITINERARY] Token refresh error:", error)
      return false
    } finally {
      setRefreshing(false)
    }
  }

  /* ───── fetch itineraries ───── */
  const fetchItineraries = async (retry = false) => {
    if (!tripId) {
      console.error("[ITINERARY] No tripId provided")
      return
    }
    
    try {
      setLoading(true)
      console.log(`[ITINERARY] Fetching itineraries for trip ${tripId}`)
      
      const res = await fetch(`${BASE_URL}itinerary/trip/${tripId}`, {
        credentials: "include"
      })

      console.log(`[ITINERARY] Fetch response:`, res.status, res.ok)

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        console.log("[ITINERARY] Auth failed, refreshing token...")
        if (await refreshToken()) return fetchItineraries(true)
        console.error("[ITINERARY] Token refresh failed")
        return
      }

      if (res.ok) {
        const data: Itinerary[] = await res.json()
        console.log("[ITINERARY] Fetched",data.length)
        setItineraries(data)
      } else {
        const errorText = await res.text()
        console.error(`[ITINERARY] Failed to fetch itineraries: ${res.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("[ITINERARY] Error fetching itineraries:", error)
    } finally {
      setLoading(false)
    }
  }

  /* ───── update itinerary (in-place) ───── */
  const updateItinerary = async (id: number, retry = false) => {
    try {
      setUpdateLoading(true)
      console.log(`[ITINERARY] Updating itinerary ${id} with:`, editForm)

        const cacheBuster = `?_t=${Date.now()}`
      
      
    const res = await fetch(`${BASE_URL}itinerary/${id}${cacheBuster}`, {
      method: "PUT",
      credentials: "include",
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate", // Bypass cache
        "Pragma": "no-cache", // HTTP/1.0 compatibility
        "Expires": "0" // Proxy compatibility
      },
      body: JSON.stringify(editForm)
    })
      console.log(`[ITINERARY] Update response:`, res.status, res.ok)

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        console.log("[ITINERARY] Auth failed during update, refreshing token...")
        if (await refreshToken()) return updateItinerary(id, true)
        console.error("[ITINERARY] Token refresh failed during update")
        return
      }

      if (res.ok) {
        const updatedItinerary = await res.json()
        console.log("[ITINERARY] Update successful, updated data:", updatedItinerary)
        
        // Update the local state directly instead of refetching
        setItineraries(prevItineraries => 
          prevItineraries.map(itinerary => 
            itinerary.id === id ? { ...itinerary, ...updatedItinerary } : itinerary
          )
        )
        
        setEditingId(null)
        console.log("[ITINERARY] Local state updated successfully")
      } else {
        const errorText = await res.text()
        console.error(`[ITINERARY] Update failed: ${res.status} - ${errorText}`)
        alert("Failed to update itinerary")
      }
    } catch (error) {
      console.error("[ITINERARY] Error updating itinerary:", error)
      alert("Error updating itinerary")
    } finally {
      setUpdateLoading(false)
    }
  }

  /* ───── delete itinerary ───── */
  const deleteItinerary = async (retry = false) => {
    if (!itineraryToDelete) {
      console.error("[ITINERARY] No itinerary selected for deletion")
      return
    }

    try {
      setDeleteLoading(true)
      console.log(`[ITINERARY] Deleting itinerary ${itineraryToDelete}`)
      
      const res = await fetch(`${BASE_URL}itinerary/${itineraryToDelete}`, {
        method: "DELETE",
        credentials: "include"
      })

      console.log(`[ITINERARY] Delete response:`, res.status, res.ok)

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        console.log("[ITINERARY] Auth failed during delete, refreshing token...")
        if (await refreshToken()) return deleteItinerary(true)
        console.error("[ITINERARY] Token refresh failed during delete")
        return
      }

      // Handle 204 No Content response (successful delete)
      if (res.ok || res.status === 204) {
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
      } else {
        const errorText = await res.text()
        console.error(`[ITINERARY] Delete failed: ${res.status} - ${errorText}`)
        alert("Failed to delete itinerary")
      }
    } catch (error) {
      console.error("[ITINERARY] Error deleting itinerary:", error)
      alert("Error deleting itinerary")
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
  }, [tripId])

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
      <div className="container mx-auto px-6 py-8">
      {/* Header - Updated with Refresh Button */}
                    <div className="flex items-center gap-4 mb-8">
                    <Link href="/itineraries">
                        <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10">
                        <ArrowLeft className="h-5 w-5 text-[#1e40af]" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
                        Trip Itineraries
                        </h1>
                        <p className="text-muted-foreground">
                        Manage and organize your trip itineraries
                        </p>
                    </div>

                    {/* Refresh Button */}
                    <Button
                        onClick={() => {
                        console.log("[ITINERARY] Manual refresh triggered")
                        fetchItineraries()
                        }}
                        disabled={loading || refreshing}
                        variant="outline"
                        className="border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10"
                    >
                        {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                        ) : (
                        <RefreshCw className="h-4 w-4 mr-2"/>
                        )}
                        Refresh
                    </Button>

                    <Link href={`/itineraries/create?tripId=${tripId}`}>
                        <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white">
                        <Plus className="h-4 w-4 mr-2"/>
                        Create Itinerary
                        </Button>
                    </Link>
                    </div>

       

        {/* Refreshing banner */}
        {refreshing && (
          <div className="mb-6 p-4 bg-[#1e40af]/10 border border-[#1e40af]/20 rounded-lg flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-[#1e40af] mr-3"/>
            <span className="text-[#1e40af]">Refreshing authentication…</span>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#1e40af] mb-4"/>
            <p className="text-muted-foreground">Loading itineraries…</p>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
            <h3 className="text-xl font-semibold mb-2">No Itineraries Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start planning your trip by creating your first itinerary
            </p>
            <Link href={`/itineraries/create?tripId=${tripId}`}>
              <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white">
                <Plus className="h-4 w-4 mr-2"/>
                Create First Itinerary
              </Button>
            </Link>
          </div>
        ) : (
          /* ──── ITINERARY CARDS ──── */
          <div className="space-y-4">
            {itineraries
              .sort((a, b) => a.day_number - b.day_number) // Sort by day number
              .map(itinerary => (
              <div
                key={itinerary.id}
                className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl 
                         shadow-lg shadow-[#1e40af]/5 hover:shadow-xl hover:shadow-[#1e40af]/10 
                         transition-all duration-300"
              >
                {editingId === itinerary.id ? (
                  /* ──── EDIT MODE ──── */
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1e40af] to-[#06b6d4] flex items-center justify-center text-white font-bold text-lg">
                        {itinerary.day_number}
                      </div>
                      <h3 className="text-xl font-semibold text-muted-foreground">Editing Day {itinerary.day_number}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Title</label>
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                          className="focus:border-[#1e40af]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Date</label>
                        <Input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                          className="focus:border-[#1e40af]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Description</label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                        rows={3}
                        className="focus:border-[#1e40af] resize-none"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          console.log("[ITINERARY] Canceling edit")
                          setEditingId(null)
                        }}
                        disabled={updateLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => updateItinerary(itinerary.id)}
                        disabled={updateLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
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
                      className="p-6 cursor-pointer hover:bg-muted/20 transition-colors"
                      onClick={() => toggleExpanded(itinerary.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#1e40af] to-[#06b6d4] flex items-center justify-center text-white font-bold text-lg">
                            {itinerary.day_number}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-1">{itinerary.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4"/>
                                {fmt(itinerary.date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4"/>
                                {itinerary.activities.length} activities
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Action buttons */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEdit(itinerary)
                            }}
                            className="hover:bg-[#1e40af]/10"
                          >
                            <Edit className="h-4 w-4 text-[#1e40af]"/>
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
                            className="hover:bg-red-100 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 text-red-600"/>
                          </Button>

                          {/* Expand/Collapse button */}
                          <Button variant="ghost" size="icon" className="hover:bg-muted">
                            {expandedId === itinerary.id ? 
                              <ChevronUp className="h-4 w-4"/> : 
                              <ChevronDown className="h-4 w-4"/>
                            }
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedId === itinerary.id && (
                      <div className="border-t border-border/30 bg-muted/10">
                        <div className="p-6 space-y-6">
                          {/* Description */}
                          {itinerary.description && (
                            <div>
                              <h4 className="font-semibold mb-2 text-[#1e40af]">Description</h4>
                              <p className="text-muted-foreground leading-relaxed">
                                {itinerary.description}
                              </p>
                            </div>
                          )}

                          {/* Activities */}
                          <div>
                            <h4 className="font-semibold mb-4 text-[#1e40af] flex items-center gap-2">
                              <Clock className="h-5 w-5"/>
                              Daily Activities ({itinerary.activities.length})
                            </h4>
                            
                            {itinerary.activities.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50"/>
                                <p>No activities planned for this day yet</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {itinerary.activities
                                  .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time
                                  .map((activity, index) => (
                                  <div 
                                    key={activity.id} 
                                    className="flex gap-4 p-4 bg-background/80 rounded-lg border border-border/30 hover:border-[#1e40af]/30 transition-colors"
                                  >
                                    {/* Time */}
                                    <div className="flex flex-col items-center min-w-[80px]">
                                      <div className="w-16 h-12 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                                        {fmtTime(activity.time)}
                                      </div>
                                      {index < itinerary.activities.length - 1 && (
                                        <div className="w-0.5 h-8 bg-border/50 mt-2"/>
                                      )}
                                    </div>

                                    {/* Activity Details */}
                                    <div className="flex-1">
                                      <h5 className="font-semibold text-lg mb-1">{activity.title}</h5>
                                      <p className="text-muted-foreground leading-relaxed mb-2">
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
                          <div className="flex justify-between items-center pt-4 border-t border-border/30 text-sm text-muted-foreground">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl p-6 max-w-md w-full relative shadow-2xl">
            <button className="absolute top-3 right-3" onClick={() => { setShowDeleteConfirm(false); setItineraryToDelete(null) }}>
              <X className="h-4 w-4"/>
            </button>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600"/>
            </div>
            <h3 className="font-semibold text-lg mb-2">Delete Itinerary</h3>
            <p className="text-muted-foreground mb-6">
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
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteItinerary()}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                Delete Itinerary
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl p-6 max-w-md w-full relative shadow-2xl">
            <button className="absolute top-3 right-3" onClick={() => setShowDeleteSuccess(false)}>
              <X className="h-4 w-4"/>
            </button>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-600"/>
            </div>
            <h3 className="font-semibold text-lg mb-2">Itinerary Deleted</h3>
            <p className="text-muted-foreground">
              <strong>{deletedItineraryTitle}</strong> has been successfully deleted.
            </p>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
