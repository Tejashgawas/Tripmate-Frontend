"use client"

import { useState, useEffect } from 'react'
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
  Brain
} from 'lucide-react'
import { format } from 'date-fns'

const BASE_URL = "https://tripmate-39hm.onrender.com"

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
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const [updating, setUpdating] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const itemsPerPage = 10

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${BASE_URL}/admin/analytics/`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchFeedbacks = async (skip = 0) => {
    try {
      const response = await fetch(`${BASE_URL}/feedback/all?skip=${skip}&limit=${itemsPerPage}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setFeedbacks(data)
      }
    } catch (error) {
      console.error('Error fetching feedbacks:', error)
    }
  }

  const updateFeedbackStatus = async (feedbackId: number, status: string) => {
    setUpdating(feedbackId)
    try {
      const response = await fetch(`${BASE_URL}/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      })
      
      if (response.ok) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 2000)
        await fetchFeedbacks(currentPage * itemsPerPage)
      }
    } catch (error) {
      console.error('Error updating feedback:', error)
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchAnalytics(), fetchFeedbacks(0)])
      setLoading(false)
    }
    loadData()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchFeedbacks(page * itemsPerPage)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'addressed': return 'bg-green-100 text-green-800 border-green-200'
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-white/50 rounded-xl"></div>
          ))}
        </div>
        <div className="h-96 bg-white/50 rounded-xl"></div>
      </div>
    )
  }

  const totalPages = feedbacks ? Math.ceil(feedbacks.total / itemsPerPage) : 0

  return (
    <div className="space-y-8">
      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Success!</DialogTitle>
            <DialogDescription>
              Feedback status has been updated successfully.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1e40af] via-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
          TripMate Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Monitor your platform's performance and user feedback</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Active Users</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-800">{analytics?.total_active_users || 0}</div>
            <p className="text-xs text-blue-600 mt-1">Total registered users</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Service Providers</CardTitle>
            <UserCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-800">{analytics?.total_service_providers || 0}</div>
            <p className="text-xs text-green-600 mt-1">Active providers</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Total Services</CardTitle>
            <MapPin className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-800">{analytics?.total_services || 0}</div>
            <p className="text-xs text-purple-600 mt-1">Available services</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100/50 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total Trips</CardTitle>
            <Plane className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-800">{analytics?.total_trips || 0}</div>
            <p className="text-xs text-orange-600 mt-1">Trips created</p>
          </CardContent>
        </Card>
      </div>

      {/* User Feedback Section */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#1e40af]" />
            <CardTitle className="text-2xl text-[#1e40af]">User Feedback</CardTitle>
          </div>
          <CardDescription>
            Manage and respond to user feedback ({feedbacks?.total || 0} total)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedbacks?.feedbacks.map((feedback) => (
            <div key={feedback.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-lg">{feedback.title}</h3>
                    <Badge className={`${getStatusColor(feedback.status)} font-medium`}>
                      {feedback.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getRatingStars(feedback.rating)}
                      <span className="text-sm text-muted-foreground ml-1">({feedback.rating}/5)</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">{feedback.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(feedback.created_at), 'MMM dd, yyyy')}
                    </span>
                    <Badge variant="outline" className="bg-slate-50">
                      {feedback.category}
                    </Badge>
                    <span>User ID: {feedback.user_id}</span>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="hover:bg-[#1e40af] hover:text-white transition-colors"
                      disabled={updating === feedback.id}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Feedback Status</DialogTitle>
                      <DialogDescription>
                        Change the status of feedback: "{feedback.title}"
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <Button 
                          onClick={() => updateFeedbackStatus(feedback.id, 'reviewed')}
                          variant="outline"
                          className="border-blue-200 hover:bg-blue-50"
                          disabled={updating === feedback.id}
                        >
                          Mark as Reviewed
                        </Button>
                        <Button 
                          onClick={() => updateFeedbackStatus(feedback.id, 'addressed')}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={updating === feedback.id}
                        >
                          Mark as Addressed
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage + 1} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Future Roadmap Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-indigo-600" />
            <CardTitle className="text-2xl text-indigo-700">Future Dashboard Improvements</CardTitle>
          </div>
          <CardDescription>Upcoming features to enhance your admin experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* User Growth & Engagement */}
            <Card className="bg-white/60 border-blue-100">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg text-blue-700">User Growth & Engagement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
            <Card className="bg-white/60 border-green-100">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <CardTitle className="text-lg text-green-700">Provider & Service Analytics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
            <Card className="bg-white/60 border-purple-100">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-lg text-purple-700">Financial & Value Flow</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
            <Card className="bg-white/60 border-orange-100">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <CardTitle className="text-lg text-orange-700">System Usage Metrics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
            <Card className="bg-white/60 border-cyan-100">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-600" />
                  <CardTitle className="text-lg text-cyan-700">User Engagement Signals</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
            <Card className="bg-white/60 border-pink-100">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-pink-600" />
                  <CardTitle className="text-lg text-pink-700">Future AI Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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
  )
}