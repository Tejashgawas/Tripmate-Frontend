"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Loader2, ArrowLeft, RefreshCw, Send,
  Clock, CheckCircle, XCircle, Copy, Check,
} from "lucide-react"

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
  const { user } = useAuth()
  const { get, loading: apiLoading, error: apiError } = useApi()

  const [invites, setInvites] = useState<SentInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string>("")

  const fetchInvites = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      console.log("[SENT-INVITES] Fetching sent invites...")
      
      const data = await get<SentInvite[]>("/trip-invite/sent-invites")
      setInvites(data || [])
      
      console.log(`[SENT-INVITES] Loaded ${data?.length || 0} sent invites`)
    } catch (error) {
      console.error("[SENT-INVITES] Error fetching sent invites:", error)
      // Error handling is managed by useApi hook
    } finally { 
      setLoading(false) 
    }
  }

  useEffect(() => { 
    setMounted(true)
    fetchInvites() 
  }, [user])

  if (!mounted) return null

  /* status helpers */
  const statusColor = (s: string) => ({
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300",
    accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300",
    declined: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300",
    expired: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 border-gray-300",
  }[s.toLowerCase()] ?? "bg-yellow-100 text-yellow-800 border-yellow-300")

  const statusIcon = (s: string) =>
    ({ pending: Clock, accepted: CheckCircle, declined: XCircle }[s.toLowerCase()] ?? Clock)

  /* UI */
  return (
    <DashboardShell>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/trips">
              <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
                Sent Invites
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track all the trip invitations you've sent to others
              </p>
            </div>
          </div>

          <Button
            onClick={() => fetchInvites()}
            disabled={loading}
            variant="outline"
            className="border-[#1e40af] text-[#1e40af] hover:bg-[#1e40af]/10 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl"
          >
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin mr-2" />
              : <RefreshCw className="h-4 w-4 mr-2" />}
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* body */}
        {loading ? (
          <div className="flex flex-col items-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full animate-pulse"></div>
              <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
            </div>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground">Loading sent invites…</p>
          </div>
        ) : invites.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl sm:rounded-3xl shadow-lg">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                <Send className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground"/>
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">No invites sent</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
              You haven't sent any trip invitations yet
            </p>
            <Link href="/trips">
              <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] hover:from-[#1e40af]/90 hover:to-[#3b82f6]/90 h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl">
                Go to Trips
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
                        <p className="text-sm text-muted-foreground truncate">{inv.invitee_email}</p>
                      </div>
                      <Badge className={`${statusColor(inv.status)} border text-xs ml-2 flex-shrink-0`}>
                        <div className="flex items-center gap-1">
                          {React.createElement(statusIcon(inv.status), { className: "h-3 w-3" })}
                          <span>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span>
                        </div>
                      </Badge>
                    </div>

                    {/* Codes */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Trip Code:</span>
                        <CodeCopy value={inv.trip_code} color="#1e40af" size="sm" copiedCode={copiedCode} setCopiedCode={setCopiedCode}/>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Invite Code:</span>
                        <CodeCopy value={inv.invite_code} color="#06b6d4" size="sm" copiedCode={copiedCode} setCopiedCode={setCopiedCode}/>
                      </div>
                    </div>
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
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Invited To</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Status</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Trip Code</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Invite Code</th>
                  </tr>
                </thead>

                <tbody className="[&>*:nth-child(even)]:bg-muted/10">
                  {invites.map(inv => (
                    <tr key={inv.id} className="border-b border-border/30 last:border-0 hover:bg-muted/5 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium">{inv.trip_title}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className="truncate max-w-[200px] block">{inv.invitee_email}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <Badge className={statusColor(inv.status)}>
                          <div className="flex items-center gap-1">
                            {React.createElement(statusIcon(inv.status), { className: "h-4 w-4" })}
                            <span>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span>
                          </div>
                        </Badge>
                      </td>

                      {/* Trip code with copy */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <CodeCopy value={inv.trip_code} color="#1e40af" size="md" copiedCode={copiedCode} setCopiedCode={setCopiedCode}/>
                      </td>

                      {/* Invite code with copy */}
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <CodeCopy value={inv.invite_code} color="#06b6d4" size="md" copiedCode={copiedCode} setCopiedCode={setCopiedCode}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Table Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-muted/10 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  Total sent invites: <strong className="text-foreground">{invites.length}</strong>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardShell>
  )
}

/* Enhanced helper for code + copy button with feedback */
function CodeCopy({ 
  value, 
  color, 
  size = "md", 
  copiedCode, 
  setCopiedCode 
}: { 
  value: string; 
  color: string; 
  size?: "sm" | "md";
  copiedCode: string;
  setCopiedCode: (code: string) => void;
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedCode(value)
      
      // Clear the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCode("")
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const isCopied = copiedCode === value
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4"
  const buttonSize = size === "sm" ? "h-6 w-6" : "h-8 w-8"
  const textSize = size === "sm" ? "text-xs" : "text-sm"

  return (
    <div className="flex items-center gap-2">
      <span 
        className={`font-mono font-medium ${textSize}`} 
        style={{ color }}
      >
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        className={`${buttonSize} hover:bg-muted transition-all duration-200 ${
          isCopied ? 'bg-green-100 dark:bg-green-900/30' : ''
        }`}
        title={isCopied ? "Copied!" : "Copy to clipboard"}
      >
        {isCopied ? (
          <Check className={`${iconSize} text-green-600`} />
        ) : (
          <Copy className={iconSize} />
        )}
      </Button>
    </div>
  )
}
