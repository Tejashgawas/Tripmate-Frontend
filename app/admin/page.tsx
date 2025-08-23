"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useApi } from '@/hooks/useApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Users, 
  UserCheck, 
  MapPin, 
  Plane, 
  MessageSquare, 
  Star, 
  Calendar, 
  Edit3,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Activity,
  BarChart3,
  Zap,
  Target,
  Brain,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Crown,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

// ✅ REMOVED: BASE_URL constant

interface Analytics {
  total_active_users: number
  total_service_providers: number
  total_services: number
  total_trips: number
}

interface Feedback {
  title: string
  description: string
  rating: number
  category: string
  id: number
  user_id: number
  status: 'pending' | 'addressed' | 'reviewed'
  created_at: string
  updated_at: string
}

interface FeedbackResponse {
  total: number
  feedbacks: Feedback[]
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth() // ✅ NEW: Use auth context
  const { get, put, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client
  
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [updating, setUpdating] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const itemsPerPage = 10

  // ✅ UPDATED: Fetch analytics using new API system
  const fetchAnalytics = async () => {
    try {
      console.log('[ADMIN-DASHBOARD] Fetching analytics')
      const data = await get<Analytics>('/admin/analytics/')
      setAnalytics(data)
    } catch (error) {
      console.error('[ADMIN-DASHBOARD] Error fetching analytics:', error)
      setError('Failed to load analytics data')
    }
  }

  // ✅ UPDATED: Fetch feedbacks using new API system
  const fetchFeedbacks = async (skip = 0) => {
    try {
      console.log('[ADMIN-DASHBOARD] Fetching feedbacks, skip:', skip)
      const data = await get<FeedbackResponse>(`/feedback/all?skip=${skip}&limit=${itemsPerPage}`)
      setFeedbacks(data)
    } catch (error) {
      console.error('[ADMIN-DASHBOARD] Error fetching feedbacks:', error)
      setError('Failed to load feedback data')
    }
  }

  // ✅ UPDATED: Update feedback status using new API system
  const updateFeedbackStatus = async (feedbackId: number, status: string) => {
    setUpdating(feedbackId)
    try {
      console.log('[ADMIN-DASHBOARD] Updating feedback status:', feedbackId, status)
      
      await put(`/feedback/${feedbackId}`, { status })
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
      toast.success('Feedback status updated successfully!')
      
      await fetchFeedbacks(currentPage * itemsPerPage)
    } catch (error) {
      console.error('[ADMIN-DASHBOARD] Error updating feedback:', error)
      toast.error('Failed to update feedback status')
      setError('Failed to update feedback status')
    } finally {
      setUpdating(null)
    }
  }

  // ✅ NEW: Refresh data handler
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([fetchAnalytics(), fetchFeedbacks(currentPage * itemsPerPage)])
      toast.success('Data refreshed successfully!')
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setRefreshing(false)
    }
  }

  // ✅ ENHANCED: Load data with authentication check
  useEffect(() => {
    const loadData = async () => {
      // Check if user is authenticated and is admin
      if (!user) {
        router.push('/login')
        return
      }
      
      if (user.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      setLoading(true)
      setError(null)
      
      try {
        await Promise.all([fetchAnalytics(), fetchFeedbacks(0)])
      } catch (error) {
        console.error('[ADMIN-DASHBOARD] Error loading data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      loadData()
    }
  }, [user, authLoading, router])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchFeedbacks(page * itemsPerPage)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-700'
      case 'addressed': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700'
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700'
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/20 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 h-3 sm:h-4 sm:w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  // ✅ NEW: Loading screen
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              Loading Admin Dashboard
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Preparing analytics and system data...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ✅ NEW: Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-red-950 dark:via-gray-900 dark:to-orange-950 p-4">
        <div className="max-w-xs sm:max-w-md mx-auto text-center py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
            Dashboard Error
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            Reload Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const totalPages = feedbacks ? Math.ceil(feedbacks.total / itemsPerPage) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 space-y-6 sm:space-y-8">
        {/* Success Dialog */}
        <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
          <DialogContent className="max-w-xs sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-xl">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-green-600 dark:text-green-400 text-lg">Success!</DialogTitle>
                  <DialogDescription className="text-sm">
                    Feedback status has been updated successfully.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* ✅ ENHANCED: Welcome Section with refresh */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Welcome back, {user?.username || 'Administrator'}
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Monitor your platform's performance and user feedback</p>
          
          {/* ✅ NEW: Refresh button */}
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Data
              </>
            )}
          </Button>
        </div>

        {/* ✅ ENHANCED: Mobile-responsive Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Users</CardTitle>
              <Users className="h-4 h-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-blue-800 dark:text-blue-200">{analytics?.total_active_users || 0}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Total registered users</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Service Providers</CardTitle>
              <UserCheck className="h-4 h-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-green-200">{analytics?.total_service_providers || 0}</div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">Active providers</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Services</CardTitle>
              <MapPin className="h-4 h-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-purple-800 dark:text-purple-200">{analytics?.total_services || 0}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Available services</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Trips</CardTitle>
              <Plane className="h-4 h-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-orange-800 dark:text-orange-200">{analytics?.total_trips || 0}</div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Trips created</p>
            </CardContent>
          </Card>
        </div>

        {/* ✅ ENHANCED: User Feedback Section with mobile responsiveness */}
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-xl sm:rounded-2xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <CardTitle className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400">User Feedback</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Manage and respond to user feedback ({feedbacks?.total || 0} total)
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbacks?.feedbacks.map((feedback) => (
              <div key={feedback.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white/70 dark:bg-gray-800/50">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100 line-clamp-2">{feedback.title}</h3>
                      <Badge className={`${getStatusColor(feedback.status)} font-medium text-xs`}>
                        {feedback.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getRatingStars(feedback.rating)}
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-1">({feedback.rating}/5)</span>
                      </div>
                    </div>
                    
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{feedback.description}</p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 h-3 sm:h-4 sm:w-4" />
                        {format(new Date(feedback.created_at), 'MMM dd, yyyy')}
                      </span>
                      <Badge variant="outline" className="bg-slate-50 dark:bg-slate-800 text-xs">
                        {feedback.category}
                      </Badge>
                      <span className="text-xs">User ID: {feedback.user_id}</span>
                    </div>
                  </div>
                  
                  {/* ✅ ENHANCED: Mobile-responsive action button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full sm:w-auto hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors h-9"
                        disabled={updating === feedback.id}
                      >
                        {updating === feedback.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Edit3 className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">Update Status</span>
                            <span className="sm:hidden">Update</span>
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xs sm:max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-xl">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">Update Feedback Status</DialogTitle>
                        <DialogDescription className="text-sm">
                          Change the status of feedback: "<span className="font-medium">{feedback.title}</span>"
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3">
                          <Button 
                            onClick={() => updateFeedbackStatus(feedback.id, 'reviewed')}
                            variant="outline"
                            className="border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-10"
                            disabled={updating === feedback.id}
                          >
                            Mark as Reviewed
                          </Button>
                          <Button 
                            onClick={() => updateFeedbackStatus(feedback.id, 'addressed')}
                            className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 h-10"
                            disabled={updating === feedback.id}
                          >
                            {updating === feedback.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              'Mark as Addressed'
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}

            {/* ✅ ENHANCED: Mobile-responsive Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                  Page {currentPage + 1} of {totalPages}
                </p>
                <div className="flex gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm h-9"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm h-9"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ ENHANCED: Future Roadmap Section with mobile responsiveness */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 rounded-xl sm:rounded-2xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <CardTitle className="text-xl sm:text-2xl text-indigo-700 dark:text-indigo-300">Future Dashboard Improvements</CardTitle>
                <CardDescription className="text-sm sm:text-base">Upcoming features to enhance your admin experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* User Growth & Engagement */}
              <Card className="bg-white/60 dark:bg-white/5 border-blue-100 dark:border-blue-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 h-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                    <CardTitle className="text-base sm:text-lg text-blue-700 dark:text-blue-300">User Growth & Engagement</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Monthly/Daily Active Users ratio
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    User retention cohorts
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Average trips per user/group
                  </div>
                </CardContent>
              </Card>

              {/* Provider Analytics */}
              <Card className="bg-white/60 dark:bg-white/5 border-green-100 dark:border-green-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 h-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                    <CardTitle className="text-base sm:text-lg text-green-700 dark:text-green-300">Provider & Service Analytics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Top-performing providers/services
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Service conversion rates
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Inactive provider tracking
                  </div>
                </CardContent>
              </Card>

              {/* Financial Metrics */}
              <Card className="bg-white/60 dark:bg-white/5 border-purple-100 dark:border-purple-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 h-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                    <CardTitle className="text-base sm:text-lg text-purple-700 dark:text-purple-300">Financial & Value Flow</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Commission/Revenue tracking
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Average booking value per trip
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Payment flow analytics
                  </div>
                </CardContent>
              </Card>

              {/* System Usage */}
              <Card className="bg-white/60 dark:bg-white/5 border-orange-100 dark:border-orange-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 h-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                    <CardTitle className="text-base sm:text-lg text-orange-700 dark:text-orange-300">System Usage Metrics</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    Feature adoption rates
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    API latency & uptime graphs
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    System health monitoring
                  </div>
                </CardContent>
              </Card>

              {/* Engagement Signals */}
              <Card className="bg-white/60 dark:bg-white/5 border-cyan-100 dark:border-cyan-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 h-4 sm:h-5 sm:w-5 text-cyan-600 dark:text-cyan-400" />
                    <CardTitle className="text-base sm:text-lg text-cyan-700 dark:text-cyan-300">User Engagement Signals</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Voting activity tracking
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Service filtering usage
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                    Trip reusability rates
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights */}
              <Card className="bg-white/60 dark:bg-white/5 border-pink-100 dark:border-pink-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 h-4 sm:h-5 sm:w-5 text-pink-600 dark:text-pink-400" />
                    <CardTitle className="text-base sm:text-lg text-pink-700 dark:text-pink-300">Future AI Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    Predictive recommendations
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    Anomaly detection alerts
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    Trend analysis & forecasting
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
