/* ────────────────────────────────────────────────────────────────
   app/(admin)/users/page.tsx
   Admin ‣ User Analytics Dashboard
   Shows:
   • New-users count for the last N days (default 7)
   • Daily registrations table with username/email chips
   • Range selector & refresh button
────────────────────────────────────────────────────────────────── */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"

import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Users,
} from "lucide-react"

/* ─────────── Types ─────────── */
interface NewUsersRes  { days:number; total:number }
interface DailyRow     { date:string; count:number; users:{username:string; email:string}[] }
interface DailyRegRes  { days:number; registrations:DailyRow[] }

/* ═══════════════════════════════════════════════════════════════ */
export default function UserAnalyticsPage() {
  const router            = useRouter()
  const { user, loading } = useAuth()
  const { get }           = useApi()

  const [days, setDays]             = useState(7)
  const [count, setCount]           = useState<number|undefined>()
  const [rows, setRows]             = useState<DailyRow[]>([])
  const [pending, setPending]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  /* ── fetch helpers ── */
  const loadCount = async (d:number) =>
    setCount((await get<NewUsersRes>(`/admin/analytics/new-users?days=${d}`)).total)

  const loadRows  = async (d:number) =>
    setRows((await get<DailyRegRes>(`/admin/analytics/daily-registrations?days=${d}`)).registrations)

  /* ── main loader ── */
  const fetchAll = async () => {
    setRefreshing(true)
    try   { await Promise.all([loadCount(days), loadRows(days)]) }
    catch { toast.error("Failed to load analytics") }
    finally { setRefreshing(false); setPending(false) }
  }

  /* ── boot & on-range change ── */
  useEffect(() => { if (!loading) {
    /* role-check first */
    if (!user)               return router.push("/login")
    if (user.role !== "admin") return router.push("/dashboard")
    fetchAll()
  } }, [loading, user, days])

  /* ── loading guard ── */
  if (loading || pending)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    )

  /* ──────────────────────── UI ──────────────────────── */
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* header bar */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            User Analytics
          </h1>

          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={e => setDays(Number(e.currentTarget.value))}
              className="h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3"
            >
              {[3,7,14,30].map(d=>(
                <option key={d} value={d}>Last {d} days</option>
              ))}
            </select>

            <Button onClick={fetchAll} disabled={refreshing} variant="outline">
              {refreshing
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : "Refresh"}
            </Button>
          </div>
        </header>

        {/* new-users card */}
        <Card className="shadow-lg bg-white/90 dark:bg-gray-900/90">
          <CardHeader className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800/40 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-700 dark:text-green-300" />
            </div>
            <div>
              <CardTitle className="text-lg text-green-700 dark:text-green-300">
                New Users (last {days} d)
              </CardTitle>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                {count ?? 0}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* daily table */}
        <Card className="shadow-lg bg-white/90 dark:bg-gray-900/90 overflow-x-auto">
          <CardHeader>
            <CardTitle>Daily Registrations</CardTitle>
          </CardHeader>

          <CardContent className="pb-6">
            <table className="w-full text-sm">
              <thead className="bg-indigo-100 dark:bg-indigo-900">
                <tr>
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Count</th>
                  <th className="text-left py-2 px-4">Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {rows.map(r=>(
                  <tr key={r.date} className="hover:bg-indigo-50 dark:hover:bg-indigo-800/50">
                    <td className="py-3 px-4 whitespace-nowrap">{format(new Date(r.date),"PPP")}</td>
                    <td className="py-3 px-4 font-semibold">{r.count}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-2">
                        {r.users.map(u=>(
                          <span key={u.email}
                            className="text-xs bg-indigo-200 dark:bg-indigo-700 text-indigo-900 dark:text-indigo-100 rounded-full px-3 py-1">
                            {u.username} ({u.email})
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
