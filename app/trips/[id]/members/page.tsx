"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Users, Loader2, UserMinus,
  AlertTriangle, CheckCircle, X,
} from "lucide-react"

interface TripMember {
  id: number
  trip_id: number
  user_id: number
  user: {
    id: number
    username: string
    email: string
  }
  role: string
  joined_at: string
}

interface MembersResponse {
  members: TripMember[]
}

export default function TripMembersPage() {
  const params = useParams()
  const tripId = params?.id
  const { user } = useAuth()
  const { get, delete:deleteApi, loading: apiLoading, error: apiError } = useApi()

  const [members, setMembers] = useState<TripMember[]>([])
  const [loading, setLoading] = useState(true)
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [deletedMemberName, setDeletedMemberName] = useState("")

  // Fetch members using useApi hook
  const fetchMembers = async () => {
    if (!tripId || !user) return
    
    try {
      setLoading(true)
      console.log(`[MEMBERS] Fetching members for trip: ${tripId}`)
      
      const data = await get<MembersResponse>(`/trip-member/trip/${tripId}`)
      setMembers(data.members || [])
      
      console.log(`[MEMBERS] Loaded ${data.members?.length || 0} members`)
    } catch (error) {
      console.error("[MEMBERS] Error fetching members:", error)
      // Error handling is managed by useApi hook
    } finally {
      setLoading(false)
    }
  }

  // Delete member using useApi hook
  const deleteMember = async () => {
    if (!memberToDelete) return

    try {
      setDeleteLoading(true)
      console.log(`[MEMBERS] Deleting member: ${memberToDelete}`)
      
      const deletedMember = members.find(m => m.id === memberToDelete)
      
      await deleteApi(`/trip-member/${memberToDelete}`)
      
      console.log(`[MEMBERS] Member deleted successfully: ${memberToDelete}`)
      
      setDeletedMemberName(deletedMember?.user.username || "Member")
      setShowDeleteConfirm(false)
      setShowDeleteSuccess(true)
      
      // Refresh members list
      await fetchMembers()
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => {
        setShowDeleteSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error("[MEMBERS] Error deleting member:", error)
      alert("Error removing member. Please try again.")
    } finally {
      setDeleteLoading(false)
      setMemberToDelete(null)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [tripId, user])

  // Helper functions
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    })

  const roleColor = (role: string | undefined) => ({
    admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    member: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    moderator: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    owner: "bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-orange-300",
  }[(role || '').toLowerCase()] ?? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300")

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
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Link href="/trips">
            <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
              Trip Members
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage members for this trip adventure
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full animate-pulse"></div>
              <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
            </div>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground">Loading members…</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground"/>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">No Members Yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto px-4">
              This trip doesn't have any members yet. Start by inviting people!
            </p>
            <Link href="/trips">
              <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl">
                Back to Trips
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              {members.map(member => (
                <div key={member.id} className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1e40af] to-[#06b6d4] flex items-center justify-center text-white font-semibold text-sm">
                        {member.user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.user.username}</p>
                        <p className="text-xs text-muted-foreground">ID: {member.user.id}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-100 dark:hover:bg-red-900/20 w-8 h-8"
                      onClick={() => {
                        setMemberToDelete(member.id)
                        setShowDeleteConfirm(true)
                      }}
                    >
                      <UserMinus className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <span className="text-xs font-medium truncate ml-2">{member.user.email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Role</span>
                      <Badge className={`text-xs ${roleColor(member.role)}`}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Joined</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(member.joined_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block w-full overflow-x-auto rounded-xl sm:rounded-2xl border border-border/40 bg-background/80 backdrop-blur-sm shadow-lg">
              <table className="min-w-full w-full text-sm">
                <thead className="bg-muted/20">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Member</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Email</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Role</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Joined At</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="[&>*:nth-child(even)]:bg-muted/10">
                  {members.map(member => (
                    <tr key={member.id} className="border-b border-border/30 last:border-0 hover:bg-muted/5 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-[#1e40af] to-[#06b6d4] flex items-center justify-center text-white font-semibold text-sm">
                            {member.user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm sm:text-base">{member.user.username}</p>
                            <p className="text-xs text-muted-foreground">ID: {member.user.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className="text-sm">{member.user.email}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <Badge className={roleColor(member.role)}>
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(member.joined_at)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-red-100 dark:hover:bg-red-900/20 w-8 h-8 sm:w-10 sm:h-10"
                          onClick={() => {
                            setMemberToDelete(member.id)
                            setShowDeleteConfirm(true)
                          }}
                        >
                          <UserMinus className="h-4 w-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-muted/10 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  Total members: <strong className="text-foreground">{members.length}</strong>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 relative shadow-2xl animate-in fade-in-0 zoom-in-95">
            <button 
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
              onClick={() => { setShowDeleteConfirm(false); setMemberToDelete(null) }}
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            
            <h3 className="font-semibold text-lg sm:text-xl mb-2">Remove Member</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Are you sure you want to remove this member from the trip?
            </p>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteConfirm(false); setMemberToDelete(null) }}
                disabled={deleteLoading}
                className="flex-1 h-10 sm:h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={deleteMember}
                disabled={deleteLoading}
                className="flex-1 h-10 sm:h-12 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 relative shadow-2xl animate-in fade-in-0 zoom-in-95">
            <button 
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
              onClick={() => setShowDeleteSuccess(false)}
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            
            <h3 className="font-semibold text-lg sm:text-xl mb-2">Member Removed</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              <strong>{deletedMemberName}</strong> has been successfully removed from the trip.
            </p>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
