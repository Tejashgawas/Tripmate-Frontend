"use client"

import { useState, useEffect } from "react"
import DashboardShell from "@/components/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  MessageSquare, Plus, Star, StarOff, Trash2, Edit3, 
  Loader2, RefreshCw, Calendar, User, ChevronLeft, 
  ChevronRight, CheckCircle, AlertTriangle, X, Send,
  Sparkles, MessageCircle, TrendingUp, Award, Clock,
  CheckCheck, AlertCircle, Zap, Target, Settings,
  Heart, ThumbsUp, Flag, Filter
} from "lucide-react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

interface Feedback {
  id: number
  title: string
  description: string
  rating: number
  category: string
  user_id: number
  status: 'pending' | 'reviewed' | 'addressed'
  created_at: string
  updated_at: string
}

interface FeedbackResponse {
  total: number
  feedbacks: Feedback[]
}

const FEEDBACK_CATEGORIES = [
  { value: "UI/UX", label: "🎨 UI/UX", icon: "🎨" },
  { value: "trip planning", label: "✈️ Trip Planning", icon: "✈️" },
  { value: "expense", label: "💰 Expense Management", icon: "💰" },
  { value: "checklist management", label: "✅ Checklist Management", icon: "✅" },
  { value: "recommendations", label: "⭐ Recommendations", icon: "⭐" },
  { value: "itineraries", label: "🗺️ Itineraries", icon: "🗺️" },
  { value: "services", label: "🛠️ Services", icon: "🛠️" },
  { value: "technical", label: "⚙️ Technical Issues", icon: "⚙️" },
  { value: "others", label: "📝 Others", icon: "📝" }
]

export default function FeedbackPage() {
  // Data states
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [totalFeedbacks, setTotalFeedbacks] = useState(0)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const totalPages = Math.ceil(totalFeedbacks / limit)

  // Loading states
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Form state
  const [feedbackForm, setFeedbackForm] = useState({
    title: "",
    description: "",
    rating: 0,
    category: ""
  })

  /* ───── Token refresh ───── */
  const refreshToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST", 
        credentials: "include"
      })
      return response.ok
    } catch {
      return false
    }
  }

  /* ───── Fetch feedbacks ───── */
  const fetchFeedbacks = async (page = 1, retry = false) => {
    try {
      setLoading(true)
      const skip = (page - 1) * limit
      
      const res = await fetch(`${BASE_URL}feedback/my-feedbacks?skip=${skip}&limit=${limit}`, {
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return fetchFeedbacks(page, true)
      }

      if (res.ok) {
        const data: FeedbackResponse = await res.json()
        setFeedbacks(data.feedbacks || [])
        setTotalFeedbacks(data.total || 0)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error("[FEEDBACK] Error fetching feedbacks:", error)
      setErrorMessage("Failed to load feedbacks")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setLoading(false)
    }
  }

  /* ───── Create feedback ───── */
  const createFeedback = async (retry = false) => {
    if (!feedbackForm.title.trim() || !feedbackForm.description.trim() || 
        !feedbackForm.category || feedbackForm.rating === 0) {
      setErrorMessage("Please fill all required fields")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    try {
      setCreating(true)

      const res = await fetch(`${BASE_URL}feedback`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm)
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return createFeedback(true)
      }

      if (res.ok) {
        setShowCreateModal(false)
        setFeedbackForm({ title: "", description: "", rating: 0, category: "" })
        setSuccessMessage("Feedback submitted successfully! Thank you for helping us improve.")
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 4000)
        await fetchFeedbacks(1)
      } else {
        const errorData = await res.json().catch(() => ({}))
        setErrorMessage(errorData.detail || "Failed to submit feedback")
        setShowError(true)
        setTimeout(() => setShowError(false), 5000)
      }
    } catch (error) {
      setErrorMessage("Network error occurred")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setCreating(false)
    }
  }

  /* ───── Delete feedback ───── */
  const deleteFeedback = async (id: number, retry = false) => {
    try {
      setDeleting(id)

      const res = await fetch(`${BASE_URL}feedback/${id}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return deleteFeedback(id, true)
      }

      if (res.ok) {
        setShowDeleteModal(false)
        setDeleteId(null)
        setSuccessMessage("Feedback deleted successfully")
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 3000)
        await fetchFeedbacks(currentPage)
      } else {
        const errorData = await res.json().catch(() => ({}))
        setErrorMessage(errorData.detail || "Failed to delete feedback")
        setShowError(true)
        setTimeout(() => setShowError(false), 5000)
      }
    } catch (error) {
      setErrorMessage("Network error occurred")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setDeleting(null)
    }
  }

  /* ───── Effects ───── */
  useEffect(() => {
    fetchFeedbacks(1)
  }, [])

  /* ───── Helper functions ───── */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
     
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700'
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700'
      case 'addressed':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3" />
      case 'reviewed':
        return <AlertCircle className="w-3 h-3" />
      case 'addressed':
        return <CheckCircle className="w-3 h-3" />
      default:
        return <AlertTriangle className="w-3 h-3" />
    }
  }

  const getCategoryInfo = (category: string) => {
    const cat = FEEDBACK_CATEGORIES.find(c => c.value.toLowerCase() === category.toLowerCase())
    return cat || { icon: "📝", label: category }
  }

  const StarRating = ({ rating, onRatingChange, readonly = false }: { 
    rating: number
    onRatingChange?: (rating: number) => void
    readonly?: boolean 
  }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange?.(star)}
            className={`transition-all duration-200 ${readonly ? '' : 'hover:scale-110'}`}
          >
            {star <= rating ? (
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            )}
          </button>
        ))}
        {!readonly && (
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            {rating === 0 ? 'Select rating' : `${rating} star${rating > 1 ? 's' : ''}`}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      <DashboardShell>
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-8 p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                      Feedback Center
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                      Help us improve TripMate with your valuable feedback
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => fetchFeedbacks(currentPage)}
                    disabled={loading}
                    variant="outline"
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2"/>
                    )}
                    Refresh
                  </Button>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2"/>
                    <span className="flex items-center gap-1">
                      New Feedback <Sparkles className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalFeedbacks}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Feedback</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {feedbacks.filter(f => f.status === 'pending').length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Review</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {feedbacks.filter(f => f.status === 'reviewed').length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Under Review</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {feedbacks.filter(f => f.status === 'addressed').length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Addressed</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Feedback Table */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-2xl">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Your Feedback History
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track the status of your submitted feedback
                </p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-pulse"></div>
                    <Loader2 className="absolute inset-0 w-16 h-16 animate-spin text-white p-4"/>
                  </div>
                  <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">Loading feedback...</p>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-800 dark:to-pink-700 rounded-full flex items-center justify-center mb-6">
                    <MessageSquare className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                    No Feedback Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed max-w-md mx-auto">
                    Share your thoughts and help us make TripMate even better!
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Feedback
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Feedback
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Rating
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {feedbacks.map((feedback) => {
                          const categoryInfo = getCategoryInfo(feedback.category)
                          return (
                            <tr key={feedback.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                                    {feedback.title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                    {feedback.description}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                 
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {categoryInfo.label}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <StarRating rating={feedback.rating} readonly />
                              </td>
                              <td className="px-6 py-4">
                                <Badge className={`${getStatusColor(feedback.status)} border px-2 py-1`}>
                                  {getStatusIcon(feedback.status)}
                                  <span className="ml-1 capitalize">{feedback.status}</span>
                                </Badge>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(feedback.created_at)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <Button
                                  onClick={() => {
                                    setDeleteId(feedback.id)
                                    setShowDeleteModal(true)
                                  }}
                                  disabled={deleting === feedback.id}
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700"
                                >
                                  {deleting === feedback.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalFeedbacks)} of {totalFeedbacks} feedback entries
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => fetchFeedbacks(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                            variant="outline"
                            size="sm"
                            className="bg-white/50 dark:bg-gray-800/50"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const page = i + 1
                              return (
                                <Button
                                  key={page}
                                  onClick={() => fetchFeedbacks(page)}
                                  disabled={loading}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  className={currentPage === page ? 
                                    "bg-gradient-to-r from-purple-600 to-pink-700 text-white" : 
                                    "bg-white/50 dark:bg-gray-800/50"
                                  }
                                >
                                  {page}
                                </Button>
                              )
                            })}
                          </div>
                          
                          <Button
                            onClick={() => fetchFeedbacks(currentPage + 1)}
                            disabled={currentPage === totalPages || loading}
                            variant="outline"
                            size="sm"
                            className="bg-white/50 dark:bg-gray-800/50"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>

            {/* Create Feedback Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30"></div>
                  <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                              Submit Feedback
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">Help us improve TripMate</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setShowCreateModal(false)}
                          variant="outline"
                          size="sm"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/50 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Title *
                          </label>
                          <Input
                            value={feedbackForm.title}
                            onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                            placeholder="Brief title for your feedback"
                            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Category *
                          </label>
                          <select
                            value={feedbackForm.category}
                            onChange={(e) => setFeedbackForm({...feedbackForm, category: e.target.value})}
                            className="w-full p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                          >
                            <option value="">Select a category</option>
                            {FEEDBACK_CATEGORIES.map((category) => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Rating */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Rating *
                          </label>
                          <div className="p-4 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                            <StarRating 
                              rating={feedbackForm.rating} 
                              onRatingChange={(rating) => setFeedbackForm({...feedbackForm, rating})}
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Description *
                          </label>
                          <Textarea
                            value={feedbackForm.description}
                            onChange={(e) => setFeedbackForm({...feedbackForm, description: e.target.value})}
                            placeholder="Describe your feedback in detail..."
                            rows={4}
                            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => setShowCreateModal(false)}
                          disabled={creating}
                          variant="outline"
                          className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={createFeedback}
                          disabled={creating || !feedbackForm.title.trim() || !feedbackForm.description.trim() || !feedbackForm.category || feedbackForm.rating === 0}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {creating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2"/>
                              Submit Feedback
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur opacity-30"></div>
                  <Card className="relative w-full max-w-md shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0">
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                          <Trash2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Delete Feedback</h3>
                          <p className="text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Are you sure you want to delete this feedback? This will permanently remove it from our system.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setShowDeleteModal(false)}
                          variant="outline"
                          className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => deleteId && deleteFeedback(deleteId)}
                          disabled={deleting !== null}
                          className="flex-1 bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white"
                        >
                          {deleting !== null ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Feedback
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-white dark:bg-gray-900 border-0 rounded-2xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                        <CheckCircle className="w-8 h-8 text-white"/>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                        Success!
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{successMessage}</p>
                      <Button 
                        onClick={() => setShowSuccess(false)} 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        Awesome!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Modal */}
            {showError && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-white dark:bg-gray-900 border-0 rounded-2xl p-8 max-w-md w-full shadow-2xl backdrop-blur-xl">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-6 mx-auto shadow-lg">
                        <AlertTriangle className="w-8 h-8 text-white"/>
                      </div>
                      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-600 to-pink-700 dark:from-red-400 dark:to-pink-500 bg-clip-text text-transparent">
                        Error
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{errorMessage}</p>
                      <Button 
                        onClick={() => setShowError(false)} 
                        className="w-full bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                      >
                        Got it
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </div>
  )
}
