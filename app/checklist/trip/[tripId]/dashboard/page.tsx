"use client";

import DashboardShell from "@/components/dashboard-shell"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import {
  ArrowLeft, BarChart3, CheckSquare, Loader2, TrendingUp,
  Users, Clock, AlertTriangle, CheckCircle, Target,
  Calendar, PieChart, Activity, RefreshCw, X,
} from "lucide-react"

interface CategoryData {
  completed: number
  pending: number
}

interface PriorityData {
  completed: number
  pending: number
}

interface ProgressData {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_percentage: number
  tasks_by_category: {
    [category: string]: CategoryData
  }
  tasks_by_priority: {
    [priority: string]: PriorityData
  }
}

interface SummaryTaskItem {
  id: number
  title: string
  category: string
  priority: string
  due_date: string
  is_completed: boolean
  assigned_count: number
  completed_count: number
}

export default function ChecklistDashboardPage() {
  const params = useParams()
  const tripId = params?.tripId
  const { user } = useAuth()
  const { get, loading: apiLoading, error: apiError } = useApi()

  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [summaryData, setSummaryData] = useState<SummaryTaskItem[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /* ───── fetch progress data using useApi ───── */
  const fetchProgress = async () => {
    if (!tripId || !user) return
    
    try {
      console.log(`[DASHBOARD] Fetching progress for trip ${tripId}`)
      const data = await get<ProgressData>(`/trips/${tripId}/checklist/progress`)
      setProgressData(data || null)
      console.log(`[DASHBOARD] Loaded progress data`)
    } catch (error) {
      console.error("[DASHBOARD] Error fetching progress:", error)
      setError("Failed to load progress data")
    }
  }

  /* ───── fetch summary data using useApi ───── */
  const fetchSummary = async () => {
    if (!tripId || !user) return
    
    try {
      console.log(`[DASHBOARD] Fetching summary for trip ${tripId}`)
      const data = await get<SummaryTaskItem[]>(`/trips/${tripId}/checklist/summary`)
      setSummaryData(Array.isArray(data) ? data : null)
      console.log(`[DASHBOARD] Loaded ${Array.isArray(data) ? data.length : 0} summary items`)
    } catch (error) {
      console.error("[DASHBOARD] Error fetching summary:", error)
      setError("Failed to load summary data")
    }
  }

  /* ───── fetch all data ───── */
  const fetchAllData = async () => {
    try {
      setLoading(true)
      setError(null)
      await Promise.all([fetchProgress(), fetchSummary()])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [tripId, user])

  /* ───── helper functions ───── */
  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { 
        year: "numeric", month: "short", day: "numeric"
      })
    } catch {
      return "Invalid date"
    }
  }

  const getCategoryColor = (category: string) => ({
    documents: "#3b82f6",
    activities: "#8b5cf6", 
    food: "#ec4899",
    accommodation: "#6366f1",
    transport: "#06b6d4",
    shopping: "#10b981",
    packing: "#f59e0b",
    other: "#6b7280"
  }[category.toLowerCase()] || "#6b7280")

  const getPriorityColor = (priority: string) => ({
    low: "#10b981",
    medium: "#f59e0b",
    high: "#f97316", 
    urgent: "#ef4444"
  }[priority.toLowerCase()] || "#6b7280")

  // Safe object entries helper
  const safeObjectEntries = (obj: any): [string, any][] => {
    if (!obj || typeof obj !== 'object') return []
    try {
      return Object.entries(obj)
    } catch {
      return []
    }
  }

  /* ───── calculate summary statistics ───── */
  const getSummaryStats = () => {
    if (!summaryData || !Array.isArray(summaryData)) return null

    const stats = {
      totalTasks: summaryData.length,
      completedTasks: summaryData.filter(task => task.is_completed).length,
      pendingTasks: summaryData.filter(task => !task.is_completed).length,
      urgentTasks: summaryData.filter(task => task.priority.toLowerCase() === 'urgent').length,
      overdueTasks: summaryData.filter(task => {
        if (!task.due_date) return false
        return new Date(task.due_date) < new Date() && !task.is_completed
      }).length
    }

    return stats
  }

  const summaryStats = getSummaryStats()

  if (!tripId) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Invalid trip ID</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <Link href={`/checklist/trip/${tripId}`}>
              <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
                Checklist Dashboard
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Track your trip preparation progress and insights
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={fetchAllData}
              disabled={loading}
              variant="outline"
              className="w-full sm:w-auto border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2"/>
              ) : (
                <RefreshCw className="h-4 w-4 mr-2"/>
              )}
              Refresh
            </Button>
            <Link href={`/checklist/trip/${tripId}`}>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl">
                <CheckSquare className="h-4 w-4 mr-2"/>
                View Tasks
              </Button>
            </Link>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg sm:rounded-xl">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-3 flex-shrink-0"/>
              <span className="text-red-800 dark:text-red-200 text-sm sm:text-base flex-1">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800 w-8 h-8 sm:w-10 sm:h-10"
              >
                <X className="h-4 w-4"/>
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full animate-pulse"></div>
              <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
            </div>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground">Loading dashboard data…</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Progress Overview */}
            {progressData && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {/* Total Tasks */}
                <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm font-medium">Total Tasks</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-900 dark:text-blue-100">{progressData.total_tasks}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"/>
                    </div>
                  </div>
                </Card>

                {/* Completed Tasks */}
                <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium">Completed</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 dark:text-green-100">{progressData.completed_tasks}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"/>
                    </div>
                  </div>
                </Card>

                {/* Pending Tasks */}
                <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-orange-700 dark:text-orange-300 text-xs sm:text-sm font-medium">Pending</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900 dark:text-orange-100">{progressData.pending_tasks}</p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"/>
                    </div>
                  </div>
                </Card>

                {/* Completion Percentage */}
                <Card className="p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 rounded-lg sm:rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-medium">Progress</p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-900 dark:text-purple-100">
                        {Math.round(progressData.completion_percentage)}%
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"/>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Progress Bar */}
            {progressData && (
              <Card className="p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h3 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]"/>
                    Overall Progress
                  </h3>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {progressData.completed_tasks} of {progressData.total_tasks} tasks completed
                  </span>
                </div>
                <div className="space-y-2">
                  <Progress 
                    value={progressData.completion_percentage} 
                    className="h-2 sm:h-3"
                  />
                  <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>0%</span>
                    <span className="font-semibold text-[#1e40af]">
                      {Math.round(progressData.completion_percentage)}%
                    </span>
                    <span>100%</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Category & Priority Breakdown */}
            {progressData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Category Breakdown */}
                <Card className="p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                    <PieChart className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]"/>
                    Tasks by Category
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {safeObjectEntries(progressData.tasks_by_category).length > 0 ? (
                      safeObjectEntries(progressData.tasks_by_category).map(([category, data]) => {
                        const total = data.completed + data.pending
                        return (
                          <div key={category}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                                  style={{ backgroundColor: getCategoryColor(category) }}
                                />
                                <span className="text-xs sm:text-sm font-medium capitalize">{category}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {data.completed}/{total}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Progress 
                                value={total > 0 ? (data.completed / total) * 100 : 0} 
                                className="flex-1 h-1.5 sm:h-2"
                              />
                              <span className="text-xs text-muted-foreground min-w-[35px] sm:min-w-[40px]">
                                {total > 0 ? Math.round((data.completed / total) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <PieChart className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50"/>
                        <p className="text-sm sm:text-base">No category data available</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Priority Breakdown */}
                <Card className="p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]"/>
                    Tasks by Priority
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {safeObjectEntries(progressData.tasks_by_priority).length > 0 ? (
                      safeObjectEntries(progressData.tasks_by_priority).map(([priority, data]) => {
                        const total = data.completed + data.pending
                        return (
                          <div key={priority}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" 
                                  style={{ backgroundColor: getPriorityColor(priority) }}
                                />
                                <span className="text-xs sm:text-sm font-medium capitalize">{priority}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {data.completed}/{total}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Progress 
                                value={total > 0 ? (data.completed / total) * 100 : 0} 
                                className="flex-1 h-1.5 sm:h-2"
                              />
                              <span className="text-xs text-muted-foreground min-w-[35px] sm:min-w-[40px]">
                                {total > 0 ? Math.round((data.completed / total) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50"/>
                        <p className="text-sm sm:text-base">No priority data available</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* Task Summary & Additional Stats */}
            {summaryData && summaryStats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Additional Statistics */}
                <Card className="p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]"/>
                    Task Insights
                  </h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="text-xl sm:text-2xl font-bold text-red-900 dark:text-red-100">{summaryStats.urgentTasks}</div>
                      <div className="text-xs sm:text-sm text-red-700 dark:text-red-300">Urgent Tasks</div>
                    </div>
                    <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="text-xl sm:text-2xl font-bold text-yellow-900 dark:text-yellow-100">{summaryStats.overdueTasks}</div>
                      <div className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300">Overdue</div>
                    </div>
                  </div>
                </Card>

                {/* Upcoming Tasks */}
                <Card className="p-4 sm:p-6 rounded-xl sm:rounded-2xl">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]"/>
                    Upcoming Tasks
                  </h3>
                  <div className="space-y-3">
                    {summaryData
                      .filter(task => !task.is_completed && task.due_date)
                      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
                      .slice(0, 5)
                      .map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate">{task.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Due: {fmt(task.due_date)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: getPriorityColor(task.priority) }}
                            />
                            <span className="text-xs capitalize">{task.priority}</span>
                          </div>
                        </div>
                      ))}
                    {summaryData.filter(task => !task.is_completed && task.due_date).length === 0 && (
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50"/>
                        <p className="text-sm sm:text-base">No upcoming tasks with due dates</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* No Data State */}
            {!progressData && !summaryData && !loading && (
              <div className="text-center py-16 sm:py-20">
                <div className="relative inline-block mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground"/>
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">No Data Available</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
                  Create some tasks first to see analytics and progress tracking.
                </p>
                <Link href={`/checklist/trip/${tripId}`}>
                  <Button className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl">
                    <CheckSquare className="h-4 w-4 mr-2"/>
                    Add Tasks
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
