"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"

import DashboardShell from "@/components/dashboard-shell"

import { Button } from "@/components/ui/button"
import { Card   } from "@/components/ui/card"
import { Badge  } from "@/components/ui/badge"

import {
  Loader2, ArrowLeft, RefreshCw, Send,
  Clock, CheckCircle, XCircle, Copy,
} from "lucide-react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

/* ───────────────── types ───────────────── */
interface SentInvite {
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
export default function SentInvitesPage() {
  /* state */
  const [invites, setInvites] = useState<SentInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [mounted, setMounted]   = useState(false)

  /* helpers */
  const refreshToken = async () => {
    setRefreshing(true)
    const ok = (await fetch(`${BASE_URL}auth/refresh`, {
      method: "POST", credentials: "include",
    })).ok
    setRefreshing(false)
    return ok
  }

  const fetchInvites = async (retry = false) => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE_URL}trip-invite/sent-invites`, {
        credentials: "include",
      })
      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return fetchInvites(true)
      }
      if (res.ok) setInvites(await res.json())
    } finally { setLoading(false) }
  }

  useEffect(() => { setMounted(true); fetchInvites() }, [])
  if (!mounted) return null

  /* status helpers */
  const statusColor = (s: string) => ({
    pending  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    accepted : "bg-green-100  text-green-800  dark:bg-green-900  dark:text-green-300",
    declined : "bg-red-100    text-red-800    dark:bg-red-900    dark:text-red-300",
    expired  : "bg-gray-100   text-gray-800   dark:bg-gray-900   dark:text-gray-300",
  }[s.toLowerCase()] ?? "bg-yellow-100 text-yellow-800")

  const statusIcon = (s: string) =>
    ({ pending: Clock, accepted: CheckCircle, declined: XCircle }[s.toLowerCase()] ?? Clock)

  /* UI */
  return (
    <DashboardShell>
      {/* page header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/trips">
            <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10">
              <ArrowLeft className="h-5 w-5 text-[#1e40af]" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
              Sent Invites
            </h1>
            <p className="text-muted-foreground">
              Track all the trip invitations you&rsquo;ve sent to others
            </p>
          </div>
        </div>

        <Button
          onClick={() => fetchInvites()}
          disabled={loading || refreshing}
          variant="outline"
          className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af]/10"
        >
          {loading || refreshing
            ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
            : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* body */}
      {loading || refreshing ? (
        <div className="flex flex-col items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#1e40af] mb-4"/>
          <p className="text-muted-foreground">
            {refreshing ? "Refreshing authentication…" : "Loading sent invites…"}
          </p>
        </div>
      ) : invites.length === 0 ? (
        <div className="text-center py-20">
          <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4"/>
          <h3 className="text-xl font-semibold mb-2">No invites sent</h3>
          <p className="text-muted-foreground mb-6">
            You haven&rsquo;t sent any trip invitations yet
          </p>
          <Link href="/trips">
            <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90">
              Go to Trips
            </Button>
          </Link>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-xl border border-border/40">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-muted/20">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Trip Title</th>
                <th className="px-4 py-3 font-semibold">Invited&nbsp;To</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Trip Code</th>
                <th className="px-4 py-3 font-semibold">Invite Code</th>
              </tr>
            </thead>

            <tbody className="[&>*:nth-child(even)]:bg-muted/10">
              {invites.map(inv => (
                <tr key={inv.id} className="whitespace-nowrap">
                  <td className="px-4 py-4 font-medium">{inv.trip_title}</td>
                  <td className="px-4 py-4">{inv.invitee_email}</td>
                  <td className="px-4 py-4">
                    <Badge className={statusColor(inv.status)}>
                      <div className="flex items-center gap-1">
                         {React.createElement(statusIcon(inv.status), { className: "h-4 w-4" })}

                        <span>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span>
                      </div>
                    </Badge>
                  </td>

                  {/* Trip code with copy */}
                  <td className="px-4 py-4">
                    <CodeCopy value={inv.trip_code} color="#1e40af"/>
                  </td>

                  {/* Invite code with copy */}
                  <td className="px-4 py-4">
                    <CodeCopy value={inv.invite_code} color="#06b6d4"/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}

/* small helper for code + copy button */
function CodeCopy({ value, color }: { value: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono" style={{ color }}>{value}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigator.clipboard.writeText(value)}
        className="h-6 w-6 hover:bg-muted"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  )
}
