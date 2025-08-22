"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import DashboardShell from "@/components/dashboard-shell"

import { Button } from "@/components/ui/button"
import { Card   } from "@/components/ui/card"
import { Badge  } from "@/components/ui/badge"

import {
  Loader2, ArrowLeft, Users, Mail,
  MapPin as MapPinIcon, CheckCircle, XCircle, X,
} from "lucide-react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

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
  const [invites, setInvites]       = useState<Invite[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [acceptLoading,  setAcceptLoading]  = useState(false)
  const [declineLoading, setDeclineLoading] = useState(false)

  const [toast, setToast] = useState<"accepted"|"declined"|"">("")

  /* ───────── token refresh ───────── */
  const refreshToken = async () => {
    setRefreshing(true)
    const ok = (await fetch(`${BASE_URL}auth/refresh`, {
      method: "POST", credentials: "include",
    })).ok
    setRefreshing(false)
    return ok
  }

  /* ───────── fetch invites ───────── */
  const fetchInvites = async (retry = false) => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE_URL}trip-invite/view-invites`, {
        credentials: "include",
      })
      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return fetchInvites(true)
      }
      if (res.ok) setInvites(await res.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchInvites() }, [])

  /* ───────── accept / decline ───────── */
  const acceptInvite = async (code: string, retry = false) => {
    try {
      setAcceptLoading(true)
      const res = await fetch(`${BASE_URL}trip-invite/accept-invite?invite_code=${code}`, {
        method: "GET", credentials: "include",
      })
      if (!res.ok && (res.status===401||res.status===403) && !retry) {
        if (await refreshToken()) return acceptInvite(code, true)
      }
      if (res.ok) {
        setToast("accepted")
        fetchInvites()
      } else alert("Failed to accept invite")
    } finally { setAcceptLoading(false) }
  }

  const declineInvite = async (code: string, retry = false) => {
    try {
      setDeclineLoading(true)
      const url = `${BASE_URL}trip-invite/trip/invite/decline?invite_code=${encodeURIComponent(code)}`
      const res = await fetch(url, { method:"GET", credentials:"include" })
      if (!res.ok && (res.status===401||res.status===403) && !retry) {
        if (await refreshToken()) return declineInvite(code, true)
      }
      if (res.ok) {
        setToast("declined")
        fetchInvites()
      } else alert("Failed to decline invite")
    } finally { setDeclineLoading(false) }
  }

  /* ───────── helpers ───────── */
  const statusColor = (s: string) => ({
    pending  : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    accepted : "bg-green-500/10 text-green-600  border-green-500/20",
    declined : "bg-red-500/10   text-red-600    border-red-500/20",
  }[(s || '').toLowerCase()] ?? "bg-gray-500/10 text-gray-600 border-gray-500/20")

  /* ───────── UI ───────── */
  return (
    <DashboardShell>
      {/* particles (kept) */}
      <Particles />

      {/* page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
            Trip Invites
          </h1>
          <p className="text-muted-foreground">
            Manage your trip invitations and join exciting adventures
          </p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2"/> Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* refreshing banner */}
      {refreshing && (
        <Banner>Refreshing authentication…</Banner>
      )}

      {/* list / empty / loading */}
      {loading ? (
        <Centered>
          <Loader2 className="h-8 w-8 animate-spin text-[#1e40af]"/>
          <span className="ml-3 text-muted-foreground">Loading invites…</span>
        </Centered>
      ) : invites.length === 0 ? (
        <Card className="p-12 text-center bg-background/80 backdrop-blur-sm border border-border/50">
          <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
          <h3 className="text-xl font-semibold mb-2">No Invites Yet</h3>
          <p className="text-muted-foreground mb-6">
            You don&rsquo;t have any trip invites at the moment.
          </p>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white">
              Explore Trips
            </Button>
          </Link>
        </Card>
      ) : (
        /* ──── TABLE LAYOUT (replaced cards) ──── */
        <div className="w-full overflow-x-auto rounded-xl border border-border/40">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Trip Title</th>
                <th className="px-4 py-3 font-semibold">Invited By</th>
                <th className="px-4 py-3 font-semibold">Sent To</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Invite Code</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="[&>*:nth-child(even)]:bg-muted/10">
              {invites.map(inv => (
                <tr key={inv.id} className="whitespace-nowrap">
                  {/* Trip Title */}
                  <td className="px-4 py-4 font-medium">{inv.trip_title}</td>

                  {/* Invited By */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground"/>
                      <span>{inv.inviter_username}</span>
                    </div>
                  </td>

                  {/* Sent To */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground"/>
                      <span>{inv.invitee_email}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <Badge className={`${statusColor(inv.status)} border`}>
                      {inv.status[0].toUpperCase()+inv.status.slice(1)}
                    </Badge>
                  </td>

                  {/* Invite Code */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground"/>
                      <span className="font-mono text-[#1e40af]">{inv.invite_code}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    {inv.status.toLowerCase() === "pending" ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={acceptLoading||declineLoading}
                          onClick={()=>acceptInvite(inv.invite_code)}
                        >
                          {acceptLoading && <Loader2 className="h-4 w-4 animate-spin mr-1"/>}
                          Accept
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          disabled={declineLoading||acceptLoading}
                          onClick={()=>declineInvite(inv.invite_code)}
                        >
                          {declineLoading && <Loader2 className="h-4 w-4 animate-spin mr-1"/>}
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
        </div>
      )}

      {/* toasts */}
      {toast && (
        <Toast
          color={toast==="accepted" ? "green" : "red"}
          icon={toast==="accepted" ? CheckCircle : XCircle}
          text={`Invite ${toast} successfully!`}
          onClose={()=>setToast("")}
        />
      )}
    </DashboardShell>
  )
}

/* ───────── small helpers ───────── */
function Centered({children}:{children:React.ReactNode}) {
  return <div className="flex items-center justify-center py-20">{children}</div>
}

function Banner({children}:{children:React.ReactNode}) {
  return (
    <div className="mb-6 p-4 bg-[#1e40af]/10 border border-[#1e40af]/20 rounded-lg flex items-center">
      <Loader2 className="h-4 w-4 animate-spin text-[#1e40af] mr-3"/>{children}
    </div>
  )
}

function Toast({color,icon:Icon,text,onClose}:
  {color:"green"|"red";icon:any;text:string;onClose:()=>void}) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-background border border-border/50 rounded-lg p-4 shadow-2xl flex items-center space-x-3 max-w-sm">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                         ${color==="green"?"bg-green-100 dark:bg-green-900/30":"bg-red-100 dark:bg-red-900/30"}`}>
          <Icon className={`w-4 h-4 ${color==="green"?"text-green-600":"text-red-600"}`}/>
        </div>
        <p className="font-medium text-sm flex-1">{text}</p>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="h-3 w-3"/>
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
      ].map((d,i)=>(
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
