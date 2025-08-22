"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Users, Loader2, UserMinus,
  AlertTriangle, CheckCircle, X,
} from "lucide-react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

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

  const [members, setMembers] = useState<TripMember[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [deletedMemberName, setDeletedMemberName] = useState("")

  // Token refresh
  const refreshToken = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST",
        credentials: "include",
      })
      return response.ok
    } catch {
      return false
    } finally {
      setRefreshing(false)
    }
  }

  // Fetch members
  const fetchMembers = async (retry = false) => {
    if (!tripId) return
    
    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}trip-member/trip/${tripId}`, {
        credentials: "include",
      })

      if (!response.ok && (response.status === 401 || response.status === 403) && !retry) {
        if (await refreshToken()) return fetchMembers(true)
      }

      if (response.ok) {
        const data: MembersResponse = await response.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error("Error fetching members:", error)
    } finally {
      setLoading(false)
    }
  }

  // Delete member
  const deleteMember = async (retry = false) => {
    if (!memberToDelete) return

    try {
      setDeleteLoading(true)
      const response = await fetch(`${BASE_URL}trip-member/${memberToDelete}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok && (response.status === 401 || response.status === 403) && !retry) {
        if (await refreshToken()) return deleteMember(true)
      }

      if (response.ok) {
        const deletedMember = members.find(m => m.id === memberToDelete)
        setDeletedMemberName(deletedMember?.user.username || "Member")
        setShowDeleteConfirm(false)
        setShowDeleteSuccess(true)
        fetchMembers()
      } else {
        alert("Failed to remove member")
      }
    } catch (error) {
      console.error("Error deleting member:", error)
      alert("Error removing member")
    } finally {
      setDeleteLoading(false)
      setMemberToDelete(null)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [tripId])

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
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/trips">
            <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10">
              <ArrowLeft className="h-5 w-5 text-[#1e40af]" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
              Trip Members
            </h1>
            <p className="text-muted-foreground">
              Manage members for this trip adventure
            </p>
          </div>
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
            <p className="text-muted-foreground">Loading members…</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
            <h3 className="text-xl font-semibold mb-2">No Members Yet</h3>
            <p className="text-muted-foreground mb-6">
              This trip doesn't have any members yet. Start by inviting people!
            </p>
            <Link href="/trips">
              <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white">
                Back to Trips
              </Button>
            </Link>
          </div>
        ) : (
          <div className="w-full overflow-x-auto rounded-xl border border-border/40 bg-background/80 backdrop-blur-sm">
            <table className="min-w-[700px] w-full text-sm">
              <thead className="bg-muted/20">
                <tr className="text-left text-muted-foreground">
                  <th className="px-6 py-4 font-semibold">Member</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Joined At</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="[&>*:nth-child(even)]:bg-muted/10">
                {members.map(member => (
                  <tr key={member.id} className="border-b border-border/30 last:border-0 hover:bg-muted/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1e40af] to-[#06b6d4] flex items-center justify-center text-white font-semibold">
                          {member.user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{member.user.username}</p>
                          <p className="text-xs text-muted-foreground">ID: {member.user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{member.user.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={roleColor(member.role)}>
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(member.joined_at)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-100 dark:hover:bg-red-900/20"
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

            <div className="px-6 py-4 bg-muted/10 border-t border-border/30">
              <p className="text-sm text-muted-foreground">
                Total members: <strong className="text-foreground">{members.length}</strong>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl p-6 max-w-md w-full relative shadow-2xl animate-in fade-in-0 zoom-in-95">
            <button className="absolute top-3 right-3" onClick={() => { setShowDeleteConfirm(false); setMemberToDelete(null) }}>
              <X className="h-4 w-4" />
            </button>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Remove Member</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to remove this member from the trip?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteConfirm(false); setMemberToDelete(null) }}
                disabled={deleteLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteMember()}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Remove Member
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl p-6 max-w-md w-full relative shadow-2xl animate-in fade-in-0 zoom-in-95">
            <button className="absolute top-3 right-3" onClick={() => setShowDeleteSuccess(false)}>
              <X className="h-4 w-4" />
            </button>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Member Removed</h3>
            <p className="text-muted-foreground">
              <strong>{deletedMemberName}</strong> has been successfully removed from the trip.
            </p>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
