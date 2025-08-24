/* -----------------------------------------------------------------
   app/(admin)/dashboard/page.tsx
   Admin Dashboard • user email, rich cards, animated roadmap
   ---------------------------------------------------------------- */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { toast } from "sonner"

import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Users,
  UserCheck,
  MapPin,
  Plane,
  MessageSquare,
  Star,
  Calendar,
  Mail,
  Edit3,
  ChevronLeft,
  ChevronRight,
  Crown,
  Loader2,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  /* roadmap icons */
  Zap,
  TrendingUp,
  BarChart3,
  Target,
  Activity,
  Brain,
} from "lucide-react"

/* ─────────── Types ─────────── */
interface Analytics {
  total_active_users: number
  total_service_providers: number
  total_services: number
  total_trips: number
}

interface Feedback {
  id: number
  title: string
  description: string
  rating: number
  category: string
  status: "pending" | "addressed" | "reviewed"
  created_at: string
  updated_at: string
  user: { username: string; email: string }
}

interface FeedbackResponse {
  total: number
  feedbacks: Feedback[]
}

/* ════════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { get, patch } = useApi()

  /* state */
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<number | null>(null)
  const [success, setSuccess] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const pageSize = 10

  /* helpers */
  const statusColor = (s: string) =>
    ({
      pending:   "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300",
      addressed: "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300",
      reviewed:  "bg-blue-100  text-blue-800  border-blue-300  dark:bg-blue-900/20  dark:text-blue-300",
    }[s] ?? "bg-gray-100 text-gray-600 border-gray-300")

  const stars = (n: number) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 sm:h-4 sm:w-4 ${
          i < n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ))

  /* data loaders */
  const loadAnalytics = async () =>
    setAnalytics(await get<Analytics>("/admin/analytics/"))

  const loadFeedbacks = async (skip = 0) =>
    setFeedbacks(await get<FeedbackResponse>(`/feedback/all?skip=${skip}&limit=${pageSize}`))

  const refreshAll = async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadAnalytics(), loadFeedbacks(page * pageSize)])
      toast.success("Data refreshed")
    } catch {
      toast.error("Refresh failed")
    } finally {
      setRefreshing(false)
    }
  }

  const changePage = (p: number) => {
    setPage(p)
    loadFeedbacks(p * pageSize)
  }

  const updateStatus = async (id: number, status: string) => {
    setUpdating(id)
    try {
      await patch(`/feedback/${id}`, { status })
      toast.success("Status updated")
      loadFeedbacks(page * pageSize)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch {
      toast.error("Update failed")
    } finally {
      setUpdating(null)
    }
  }

  /* boot */
  useEffect(() => {
    async function init() {
      if (!user) return router.push("/login")
      if (user.role !== "admin") return router.push("/dashboard")
      try {
        await Promise.all([loadAnalytics(), loadFeedbacks()])
      } catch {
        setError("Failed to load dashboard")
      } finally {
        setLoading(false)
      }
    }
    if (!authLoading) init()
  }, [authLoading, user])

  /* guards */
  if (authLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center gap-3">
        <AlertTriangle className="h-8 w-8 text-red-600" />
        <p>{error}</p>
      </div>
    )

  const totalPages = feedbacks ? Math.ceil(feedbacks.total / pageSize) : 0

  /* ───────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-xl animate-[spin_5s_linear_infinite] hover:pause">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome back, {user?.username}
            </p>
          </div>
        </div>

        <Button onClick={refreshAll} disabled={refreshing} variant="outline" className="gap-2">
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Refreshing…
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" /> Refresh Data
            </>
          )}
        </Button>
      </div>

      {/* ANALYTICS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: "Active Users", value: analytics?.total_active_users, icon: Users, grad: "from-blue-100 to-blue-50" },
          { label: "Service Providers", value: analytics?.total_service_providers, icon: UserCheck, grad: "from-green-100 to-green-50" },
          { label: "Available Services", value: analytics?.total_services, icon: MapPin, grad: "from-purple-100 to-purple-50" },
          { label: "Total Trips", value: analytics?.total_trips, icon: Plane, grad: "from-orange-100 to-orange-50" },
        ].map(({ label, value, icon: Icon, grad }) => (
          <Card
            key={label}
            className={`shadow-lg border-0 bg-gradient-to-br ${grad} dark:bg-gray-900/80 hover:shadow-xl transition`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value ?? 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FEEDBACK LIST */}
      <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <CardHeader className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <CardTitle>User Feedback</CardTitle>
            <CardDescription>{feedbacks?.total} total comments</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {feedbacks?.feedbacks.map((fb) => (
            <div key={fb.id} className="border rounded-lg p-4 hover:shadow-md transition">
              {/* header */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-semibold flex-1">{fb.title}</h3>
                <Badge className={`${statusColor(fb.status)} font-medium text-xs`}>{fb.status}</Badge>
                <div className="flex items-center">{stars(fb.rating)}</div>
                <span className="text-xs text-gray-500">({fb.rating}/5)</span>
              </div>

              {/* body */}
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{fb.description}</p>

              {/* meta */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(fb.created_at), "PP")}
                </span>
                <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800">
                  {fb.category}
                </Badge>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {fb.user.username}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {fb.user.email}
                </span>
              </div>

              {/* action */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4"
                    disabled={updating === fb.id}
                  >
                    {updating === fb.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4 mr-2" /> Update Status
                      </>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xs sm:max-w-md bg-white/95 dark:bg-gray-900/95 border-0 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle>Update feedback</DialogTitle>
                    <DialogDescription>
                      Change the status of “{fb.title}”.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => updateStatus(fb.id, "reviewed")}
                      disabled={updating === fb.id}
                    >
                      Mark Reviewed
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateStatus(fb.id, "addressed")}
                      disabled={updating === fb.id}
                    >
                      {updating === fb.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating…
                        </>
                      ) : (
                        "Mark Addressed"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {page + 1} / {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => changePage(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── FUTURE IMPROVEMENTS ROADMAP ─── */}
      <Card className="mt-10 border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-xl sm:rounded-2xl animate-[fadeIn_0.8s_ease]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <div>
              <CardTitle className="text-xl sm:text-2xl text-indigo-700 dark:text-indigo-300">
                Future Dashboard Improvements
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Upcoming features to enhance your admin experience
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* mini-card generator */}
            {[
              {
                title: "User Growth & Engagement",
                icon: TrendingUp,
                color: "blue",
                items: [
                  "Monthly / Daily active users",
                  "User retention cohorts",
                  "Average trips per user/group",
                ],
              },
              {
                title: "Provider & Service Analytics",
                icon: BarChart3,
                color: "green",
                items: [
                  "Top-performing providers",
                  "Service conversion rates",
                  "Inactive provider tracking",
                ],
              },
              {
                title: "Financial & Value Flow",
                icon: Target,
                color: "purple",
                items: [
                  "Commission / revenue tracking",
                  "Avg booking value per trip",
                  "Payment-flow analytics",
                ],
              },
              {
                title: "System Usage Metrics",
                icon: Activity,
                color: "orange",
                items: [
                  "Feature adoption rates",
                  "API latency & uptime",
                  "System health monitoring",
                ],
              },
              {
                title: "User Engagement Signals",
                icon: Users,
                color: "cyan",
                items: [
                  "Voting activity tracking",
                  "Service filtering usage",
                  "Trip re-usability rates",
                ],
              },
              {
                title: "Future AI Insights",
                icon: Brain,
                color: "pink",
                items: [
                  "Predictive recommendations",
                  "Anomaly detection alerts",
                  "Trend analysis & forecasting",
                ],
              },
            ].map(({ title, icon: Icon, color, items }) => (
              <Card
                key={title}
                className={`group bg-white/60 dark:bg-white/5 border-${color}-100 dark:border-${color}-700 overflow-hidden hover:shadow-xl transition`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 sm:h-5 sm:w-5 text-${color}-600 dark:text-${color}-400`}
                    />
                    <CardTitle
                      className={`text-base sm:text-lg text-${color}-700 dark:text-${color}-300`}
                    >
                      {title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  {items.map((it) => (
                    <div
                      key={it}
                      className="flex items-center gap-2 translate-x-0 group-hover:translate-x-1 transition"
                    >
                      <div
                        className={`w-2 h-2 bg-${color}-400 rounded-full group-hover:scale-110 transition`}
                      />
                      {it}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* success dialog */}
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent className="max-w-xs bg-white/95 dark:bg-gray-900/95 border-0 shadow-xl">
          <DialogHeader className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center animate-scaleIn">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Success!</DialogTitle>
              <DialogDescription>Status updated.</DialogDescription>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  )
}
