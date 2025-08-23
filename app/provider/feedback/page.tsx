"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
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
import { toast } from "sonner"

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

// Custom Confirmation Dialog Component
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = "Delete", 
  cancelText = "Cancel", 
  onConfirm, 
  onCancel,
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl border-0 max-w-xs sm:max-w-md w-full">
        <div className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              onClick={onCancel}
              disabled={isLoading}
              variant="outline"
              className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 h-10 sm:h-12 disabled:opacity-50"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {confirmText}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
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
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { get, post, deleteApi, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client

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
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    feedbackId: null as number | null,
    feedbackTitle: ''
  })

  // Form state
  const [feedbackForm, setFeedbackForm] = useState({
    title: "",
    description: "",
    rating: 0,
    category: ""
  })

  // ✅ REMOVED: BASE_URL, refreshToken function

  /* ───── Fetch feedbacks using new API system ───── */
  const fetchFeedbacks = async (page = 1) => {
    try {
      setLoading(true)
      const skip = (page - 1) * limit
      console.log('[FEEDBACK] Fetching feedbacks, page:', page)
      
      const data = await get<FeedbackResponse>(`/feedback/my-feedbacks?skip=${skip}&limit=${limit}`)
      setFeedbacks(data.feedbacks || [])
      setTotalFeedbacks(data.total || 0)
      setCurrentPage(page)
    } catch (error) {
      console.error("[FEEDBACK] Error fetching feedbacks:", error)
      toast.error("Failed to load feedbacks")
    } finally {
      setLoading(false)
    }
  }

  /* ───── Create feedback using new API system ───── */
  const createFeedback = async () => {
    if (!feedbackForm.title.trim() || !feedbackForm.description.trim() || 
        !feedbackForm.category || feedbackForm.rating === 0) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setCreating(true)
      console.log('[FEEDBACK] Creating feedback:', feedbackForm)

      await post("/feedback", feedbackForm)
      
      setShowCreateModal(false)
      setFeedbackForm({ title: "", description: "", rating: 0, category: "" })
      toast.success("Feedback submitted successfully! Thank you for helping us improve.")
      await fetchFeedbacks(1)
    } catch (error) {
      console.error("[FEEDBACK] Error creating feedback:", error)
      toast.error("Failed to submit feedback")
    } finally {
      setCreating(false)
    }
  }

  /* ───── Show delete confirmation ───── */
  const showDeleteConfirmation = (feedbackId: number, feedbackTitle: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Feedback',
      message: `Are you sure you want to delete "${feedbackTitle}"? This will permanently remove your feedback from our system.`,
      feedbackId,
      feedbackTitle
    })
  }

  /* ───── Delete feedback using new API system ───── */
  const confirmDeleteFeedback = async () => {
    if (!confirmDialog.feedbackId) return

    try {
      setDeleting(confirmDialog.feedbackId)
      console.log('[FEEDBACK] Deleting feedback:', confirmDialog.feedbackId)

      await deleteApi(`/feedback/${confirmDialog.feedbackId}`)
      
      setConfirmDialog({ isOpen: false, title: '', message: '', feedbackId: null, feedbackTitle: '' })
      toast.success("Feedback deleted successfully")
      await fetchFeedbacks(currentPage)
    } catch (error) {
      console.error("[FEEDBACK] Error deleting feedback:", error)
      toast.error("Failed to delete feedback")
    } finally {
      setDeleting(null)
    }
  }

  /* ───── Cancel delete confirmation ───── */
  const cancelDeleteConfirmation = () => {
    setConfirmDialog({ isOpen: false, title: '', message: '', feedbackId: null, feedbackTitle: '' })
  }

  /* ───── Effects ───── */
  useEffect(() => {
    if (user) {
      fetchFeedbacks(1)
    }
  }, [user])

  /* ───── Helper functions ───── */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
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
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 dark:text-gray-600" />
            )}
          </button>
        ))}
        {!readonly && (
          <span className="ml-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {rating === 0 ? 'Select rating' : `${rating} star${rating > 1 ? 's' : ''}`}
          </span>
        )}
      </div>
    )
  }

  return (
    
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
        <div className="relative p-4 sm:p-6">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl shadow-lg">
                    <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent">
                      Feedback Center
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                      Help us improve TripMate with your valuable feedback
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    onClick={() => fetchFeedbacks(currentPage)}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 sm:flex-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 h-10 sm:h-12"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2"/>
                    )}
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12"
                  >
                    <Plus className="w-4 h-4 mr-2"/>
                    <span className="flex items-center gap-1">
                      <span className="hidden sm:inline">New Feedback</span>
                      <span className="sm:hidden">New</span>
                      <Sparkles className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <Card className="p-3 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                    <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{totalFeedbacks}</p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Feedback</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                    <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {feedbacks.filter(f => f.status === 'pending').length}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                    <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {feedbacks.filter(f => f.status === 'reviewed').length}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Review</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-3 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {feedbacks.filter(f => f.status === 'addressed').length}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Done</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Feedback Table/Cards */}
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-2xl">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  Your Feedback History
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  Track the status of your submitted feedback
                </p>
              </div>

              {loading ? (
                <div className="flex flex-col items-center py-12 sm:py-16">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-pulse"></div>
                    <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
                  </div>
                  <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400">Loading feedback...</p>
                </div>
              ) : feedbacks.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-800 dark:to-pink-700 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <MessageSquare className="h-8 h-8 sm:h-12 sm:w-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 dark:text-gray-100">
                    No Feedback Yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed max-w-md mx-auto">
                    Share your thoughts and help us make TripMate even better!
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-4 sm:px-6"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Submit Your First Feedback
                  </Button>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden lg:block overflow-x-auto">
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
                                  onClick={() => showDeleteConfirmation(feedback.id, feedback.title)}
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

                  {/* Mobile Cards */}
                  <div className="lg:hidden p-4 space-y-4">
                    {feedbacks.map((feedback) => {
                      const categoryInfo = getCategoryInfo(feedback.category)
                      return (
                        <Card key={feedback.id} className="p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-md">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-1 line-clamp-1">
                                {feedback.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                {feedback.description}
                              </p>
                            </div>
                            <Button
                              onClick={() => showDeleteConfirmation(feedback.id, feedback.title)}
                              disabled={deleting === feedback.id}
                              variant="outline"
                              size="sm"
                              className="ml-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 w-8 h-8 p-0"
                            >
                              {deleting === feedback.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Category:</span>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {categoryInfo.label}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">Status:</span>
                              <Badge className={`${getStatusColor(feedback.status)} border px-2 py-1 mt-1 inline-flex items-center`}>
                                {getStatusIcon(feedback.status)}
                                <span className="ml-1 capitalize">{feedback.status}</span>
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                            <StarRating rating={feedback.rating} readonly />
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {formatDate(feedback.created_at)}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
                          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalFeedbacks)} of {totalFeedbacks} feedback entries
                        </p>
                        <div className="flex items-center gap-2 order-1 sm:order-2">
                          <Button
                            onClick={() => fetchFeedbacks(currentPage - 1)}
                            disabled={currentPage === 1 || loading}
                            variant="outline"
                            size="sm"
                            className="bg-white/50 dark:bg-gray-800/50 h-10 px-3"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Previous</span>
                            <span className="sm:hidden">Prev</span>
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
                                    "bg-gradient-to-r from-purple-600 to-pink-700 text-white h-10 w-10" : 
                                    "bg-white/50 dark:bg-gray-800/50 h-10 w-10"
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
                            className="bg-white/50 dark:bg-gray-800/50 h-10 px-3"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <span className="sm:hidden">Next</span>
                            <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
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
                <div className="relative w-full max-w-xs sm:max-w-2xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-3xl blur opacity-30"></div>
                  <Card className="relative max-h-[90vh] overflow-y-auto shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 rounded-xl sm:rounded-2xl">
                    <div className="p-4 sm:p-8">
                      <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl shadow-lg">
                            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                              Submit Feedback
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Help us improve TripMate</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setShowCreateModal(false)}
                          variant="outline"
                          size="sm"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/50 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 w-8 h-8 sm:w-10 sm:h-10 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4 sm:space-y-6">
                        {/* Title */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Title *
                          </label>
                          <Input
                            value={feedbackForm.title}
                            onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                            placeholder="Brief title for your feedback"
                            className="h-10 sm:h-12 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
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
                            className="w-full h-10 sm:h-12 p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm sm:text-base"
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
                          <div className="p-3 sm:p-4 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700">
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
                            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => setShowCreateModal(false)}
                          disabled={creating}
                          variant="outline"
                          className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 h-10 sm:h-12"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={createFeedback}
                          disabled={creating || !feedbackForm.title.trim() || !feedbackForm.description.trim() || !feedbackForm.category || feedbackForm.rating === 0}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12"
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

            {/* Custom Confirmation Dialog */}
            <ConfirmDialog
              isOpen={confirmDialog.isOpen}
              title={confirmDialog.title}
              message={confirmDialog.message}
              onConfirm={confirmDeleteFeedback}
              onCancel={cancelDeleteConfirmation}
              isLoading={deleting === confirmDialog.feedbackId}
              confirmText="Delete Feedback"
              cancelText="Keep Feedback"
            />
          </div>
        </div>
      </div>
   
  )
}
