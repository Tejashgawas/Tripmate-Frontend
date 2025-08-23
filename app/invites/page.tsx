"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2, ArrowLeft, Users, Mail,
  MapPin as MapPinIcon, CheckCircle, XCircle, X,
} from "lucide-react"

/* ───────────────── types ───────────────── */
interface Invite {
  id: number
  trip_id: number
  inviter_id: number
  invitee_email: string
  status: string
  invite_code: string
  trip_code: string
  trip_title: string
  inviter_username: string
}

/* ───────────────── component ───────────────── */
export default function InvitesPage() {
  const { user } = useAuth()
  const { get, loading: apiLoading, error: apiError } = useApi()

  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [declineLoading, setDeclineLoading] = useState(false)
  const [toast, setToast] = useState<"accepted"|"declined"|"">("")

  /* ───────── fetch invites using useApi ───────── */
  const fetchInvites = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      console.log("[INVITES] Fetching invites...")
      
      const data = await get<Invite[]>("/trip-invite/view-invites")
      setInvites(data || [])
      
      console.log(`[INVITES] Loaded ${data?.length || 0} invites`)
    } catch (error) {
      console.error("[INVITES] Error fetching invites:", error)
      // Error handling is managed by useApi hook
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    fetchInvites() 
  }, [user])

  /* ───────── accept / decline using useApi ───────── */
  const acceptInvite = async (code: string) => {
    try {
      setAcceptLoading(true)
      console.log(`[INVITES] Accepting invite: ${code}`)
      
      await get(`/trip-invite/accept-invite?invite_code=${code}`)
      
      console.log(`[INVITES] Invite accepted successfully: ${code}`)
      setToast("accepted")
      await fetchInvites()
      
      // Auto-dismiss toast after 3 seconds
      setTimeout(() => setToast(""), 3000)
    } catch (error) {
      console.error("[INVITES] Error accepting invite:", error)
      alert("Failed to accept invite. Please try again.")
    } finally { 
      setAcceptLoading(false) 
    }
  }

  const declineInvite = async (code: string) => {
    try {
      setDeclineLoading(true)
      console.log(`[INVITES] Declining invite: ${code}`)
      
      await get(`/trip-invite/trip/invite/decline?invite_code=${encodeURIComponent(code)}`)
      
      console.log(`[INVITES] Invite declined successfully: ${code}`)
      setToast("declined")
      await fetchInvites()
      
      // Auto-dismiss toast after 3 seconds
      setTimeout(() => setToast(""), 3000)
    } catch (error) {
      console.error("[INVITES] Error declining invite:", error)
      alert("Failed to decline invite. Please try again.")
    } finally { 
      setDeclineLoading(false) 
    }
  }

  /* ───────── helpers ───────── */
  const statusColor = (s: string) => ({
    pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    accepted: "bg-green-500/10 text-green-600 border-green-500/20",
    declined: "bg-red-500/10 text-red-600 border-red-500/20",
  }[(s || '').toLowerCase()] ?? "bg-gray-500/10 text-gray-600 border-gray-500/20")

  /* ───────── UI ───────── */
  return (
    <DashboardShell>
      {/* particles (kept) */}
      <Particles />

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
              Trip Invites
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Manage your trip invitations and join exciting adventures
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2"/> Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* list / empty / loading */}
        {loading ? (
          <div className="flex flex-col items-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full animate-pulse"></div>
              <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
            </div>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground">Loading invites…</p>
          </div>
        ) : invites.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl sm:rounded-3xl shadow-lg">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground"/>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">No Invites Yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
              You don't have any trip invites at the moment.
            </p>
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl">
                Explore Trips
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-4">
              {invites.map(inv => (
                <Card key={inv.id} className="p-4 bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-sm">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base truncate">{inv.trip_title}</h3>
                        <p className="text-sm text-muted-foreground">Trip Code: {inv.trip_code}</p>
                      </div>
                      <Badge className={`${statusColor(inv.status)} border text-xs ml-2 flex-shrink-0`}>
                        {inv.status[0].toUpperCase()+inv.status.slice(1)}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                        <span className="text-muted-foreground">Invited by:</span>
                        <span className="font-medium">{inv.inviter_username}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                        <span className="text-muted-foreground">Sent to:</span>
                        <span className="font-medium truncate">{inv.invitee_email}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-muted-foreground flex-shrink-0"/>
                        <span className="text-muted-foreground">Code:</span>
                        <span className="font-mono text-[#1e40af] font-medium">{inv.invite_code}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {inv.status.toLowerCase() === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                          disabled={acceptLoading || declineLoading}
                          onClick={() => acceptInvite(inv.invite_code)}
                        >
                          {acceptLoading && <Loader2 className="h-3 w-3 animate-spin mr-1"/>}
                          Accept
                        </Button>
                        <Button
                          size="sm" 
                          variant="outline"
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50 h-8 text-xs"
                          disabled={declineLoading || acceptLoading}
                          onClick={() => declineInvite(inv.invite_code)}
                        >
                          {declineLoading && <Loader2 className="h-3 w-3 animate-spin mr-1"/>}
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block w-full overflow-x-auto rounded-xl sm:rounded-2xl border border-border/40 bg-background/80 backdrop-blur-sm shadow-lg">
              <table className="min-w-full w-full text-sm">
                <thead className="bg-muted/20">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Trip Title</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Invited By</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Sent To</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Status</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Invite Code</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody className="[&>*:nth-child(even)]:bg-muted/10">
                  {invites.map(inv => (
                    <tr key={inv.id} className="border-b border-border/30 last:border-0 hover:bg-muted/5 transition-colors">
                      {/* Trip Title */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium">{inv.trip_title}</td>

                      {/* Invited By */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground"/>
                          <span>{inv.inviter_username}</span>
                        </div>
                      </td>

                      {/* Sent To */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground"/>
                          <span className="truncate max-w-[200px]">{inv.invitee_email}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <Badge className={`${statusColor(inv.status)} border`}>
                          {inv.status[0].toUpperCase()+inv.status.slice(1)}
                        </Badge>
                      </td>

                      {/* Invite Code */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-muted-foreground"/>
                          <span className="font-mono text-[#1e40af] font-medium">{inv.invite_code}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        {inv.status.toLowerCase() === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                              disabled={acceptLoading || declineLoading}
                              onClick={() => acceptInvite(inv.invite_code)}
                            >
                              {acceptLoading && <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1"/>}
                              Accept
                            </Button>
                            <Button
                              size="sm" 
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm"
                              disabled={declineLoading || acceptLoading}
                              onClick={() => declineInvite(inv.invite_code)}
                            >
                              {declineLoading && <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1"/>}
                              Decline
                            </Button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-muted/10 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  Total invites: <strong className="text-foreground">{invites.length}</strong>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* toasts */}
      {toast && (
        <Toast
          color={toast === "accepted" ? "green" : "red"}
          icon={toast === "accepted" ? CheckCircle : XCircle}
          text={`Invite ${toast} successfully!`}
          onClose={() => setToast("")}
        />
      )}
    </DashboardShell>
  )
}

/* ───────── Enhanced Toast Component ───────── */
function Toast({color, icon: Icon, text, onClose}: {
  color: "green"|"red";
  icon: any;
  text: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-background border border-border/50 rounded-xl p-4 shadow-2xl flex items-center space-x-3 max-w-xs sm:max-w-sm backdrop-blur-sm">
        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                         ${color === "green" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${color === "green" ? "text-green-600" : "text-red-600"}`}/>
        </div>
        <p className="font-medium text-xs sm:text-sm flex-1">{text}</p>
        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-8 sm:w-8" onClick={onClose}>
          <X className="h-3 w-3 sm:h-4 sm:w-4"/>
        </Button>
      </div>
    </div>
  )
}

/* decorative dots */
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[
        {top:"5rem",  left:"2.5rem", size:"0.5rem",  color:"#1e40af/30"},
        {top:"10rem", right:"5rem",  size:"0.25rem", color:"#06b6d4/40", delay:"1000"},
        {top:"15rem", left:"25%",    size:"0.375rem",color:"#3b82f6/30", delay:"2000"},
        {bottom:"10rem",right:"33%", size:"0.5rem",  color:"#1e40af/20", delay:"3000"},
        {bottom:"15rem",left:"50%",  size:"0.25rem", color:"#06b6d4/30", delay:"4000"},
      ].map((d,i) => (
        <div key={i}
          style={{
            position:"absolute",
            width:d.size, height:d.size, borderRadius:"9999px",
            backgroundColor:`rgb(${d.color.replace("/"," / ")})`,
            top:d.top, bottom:d.bottom, left:d.left, right:d.right,
            animation:`pulseDot 6s ease-in-out infinite`,
            animationDelay:d.delay?`${d.delay}ms`:"0ms"
          }}
        />
      ))}
    </div>
  )
}
