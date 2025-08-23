"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

import {
  ArrowLeft, DollarSign, Users, TrendingUp, TrendingDown,
  PieChart, BarChart3, CreditCard, AlertCircle, CheckCircle,
  Clock, XCircle, Receipt, Banknote, UserCheck, UserX,
  Download, RefreshCw, Calendar, Target, Wallet, 
  ArrowUpCircle, ArrowDownCircle, Percent, Sparkles,
  Star, Crown, Zap, Award, Eye, EyeOff
} from "lucide-react"

import { 
  TripExpenseSummary, UserBalance, SettlementSummary, 
  ExpenseCategory, ExpenseStatus 
} from "@/types/expense-interfaces"

export default function ExpenseDashboardPage() {
  const params = useParams()
  const tripId = params?.tripId
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { get, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client
  
  const [summary, setSummary] = useState<TripExpenseSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showBalanceDetails, setShowBalanceDetails] = useState(true)

  // ✅ REMOVED: All manual authentication logic (refreshToken function)

  /* ───── Fetch summary data using useApi ───── */
  const fetchSummary = async () => {
    if (!tripId || !user) return

    try {
      setRefreshing(true)
      console.log(`[DASHBOARD] Fetching summary for trip ${tripId}`)
      const data = await get<TripExpenseSummary>(`/expenses/trips/${tripId}/summary`)
      setSummary(data)
      console.log("[DASHBOARD] Summary loaded:", data)
    } catch (error) {
      console.error("[DASHBOARD] Error fetching summary:", error)
      // Error handling managed by useApi
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [tripId, user])

  /* ───── Helper functions ───── */
  const formatCurrency = (amount: number | string, currency = "INR") => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency
    }).format(numAmount)
  }

  const categoryColor = (category: string) => ({
    accommodation: "from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500",
    transportation: "from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500", 
    food: "from-orange-500 to-red-600 dark:from-orange-400 dark:to-red-500",
    activities: "from-purple-500 to-pink-600 dark:from-purple-400 dark:to-pink-500",
    shopping: "from-pink-500 to-rose-600 dark:from-pink-400 dark:to-rose-500",
    emergency: "from-red-500 to-rose-600 dark:from-red-400 dark:to-rose-500",
    other: "from-gray-500 to-slate-600 dark:from-gray-400 dark:to-slate-500"
  }[category] || "from-gray-500 to-slate-600 dark:from-gray-400 dark:to-slate-500")

  const categoryIcon = (category: string) => {
    const icons = {
      accommodation: "🏠",
      transportation: "🚗",
      food: "🍽️", 
      activities: "🎯",
      shopping: "🛍️",
      emergency: "🚨",
      other: "📝"
    }
    return icons[category as keyof typeof icons] || "📝"
  }

  const calculateSettlementPercentage = (settlementAmount: number | string, userTotalOwed: number | string) => {
    const settlement = typeof settlementAmount === 'string' ? parseFloat(settlementAmount) : settlementAmount
    const totalOwed = typeof userTotalOwed === 'string' ? parseFloat(userTotalOwed) : userTotalOwed
    
    if (totalOwed === 0) return 0
    return Math.round((settlement / totalOwed) * 100)
  }

  if (!tripId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-red-950 dark:via-gray-900 dark:to-red-950 p-4">
        <div className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-red-200 dark:border-red-800 shadow-2xl max-w-md w-full">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-lg sm:text-xl font-semibold text-red-700 dark:text-red-300">Invalid trip ID</p>
        </div>
      </div>
    )
  }

  /* Dashboard Loading State */
  if (loading) {
    return (
      <DashboardShell>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-blue-200 dark:border-blue-800 shadow-2xl max-w-md w-full">
            <div className="w-6 h-6 border-2 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!summary) {
    return (
      <DashboardShell>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-red-200 dark:border-red-800 shadow-2xl max-w-md w-full">
            <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4 animate-pulse" />
            <p className="text-base sm:text-lg font-medium text-red-700 dark:text-red-300 mb-6">Failed to load dashboard data</p>
            <Button 
              onClick={fetchSummary} 
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-6 sm:px-8"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      <DashboardShell>
        <div className="relative">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
          </div>

          <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
            {/* Enhanced Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl gap-4">
              <div className="flex items-center gap-4 sm:gap-6">
                <Link href={`/dashboard/trips/${tripId}/expenses`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 w-10 h-10 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2"
                  >
                    <ArrowLeft className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Back to Expenses</span>
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 animate-pulse" />
                    Financial Dashboard
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">Advanced expense analytics & insights</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button 
                  onClick={() => setShowBalanceDetails(!showBalanceDetails)}
                  variant="outline"
                  className="w-full sm:w-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:shadow-lg transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                >
                  {showBalanceDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showBalanceDetails ? 'Hide Details' : 'Show Details'}
                </Button>
                <Button 
                  onClick={fetchSummary}
                  variant="outline"
                  disabled={refreshing}
                  className="w-full sm:w-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-cyan-200 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 hover:shadow-lg transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                >
                  {refreshing ? (
                    <div className="w-4 h-4 border-2 border-cyan-300 dark:border-cyan-700 border-t-cyan-600 dark:border-t-cyan-400 rounded-full animate-spin mr-2"></div>
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Link href={`/dashboard/trips/${tripId}/settlements`}>
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="flex items-center gap-1">
                      Settle Up <Crown className="w-4 h-4" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Enhanced Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Total Expenses Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
                        <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 animate-pulse" />
                    </div>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">Total Expenses</p>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
                      {formatCurrency(summary.total_expenses)}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Total Settled Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl shadow-lg">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 animate-bounce" />
                    </div>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-semibold mb-2">Total Settled</p>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                      {formatCurrency(summary.total_settled)}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Total Pending Card */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg sm:rounded-xl shadow-lg">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 animate-pulse" />
                    </div>
                    <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 font-semibold mb-2">Total Pending</p>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-700 dark:from-orange-400 dark:to-red-500 bg-clip-text text-transparent">
                      {formatCurrency(summary.total_pending)}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Active Members Card */}
              <div className="group relative sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                <Card className="relative p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full -mr-8 -mt-8 sm:-mr-10 sm:-mt-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl shadow-lg">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <Star className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 animate-spin" style={{animationDuration: '3s'}} />
                    </div>
                    <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2">Active Members</p>
                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-700 dark:from-purple-400 dark:to-pink-500 bg-clip-text text-transparent">
                      {summary.user_balances.length}
                    </p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Enhanced Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* Expenses by Category */}
              <Card className="p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Expenses by Category
                  </h3>
                </div>
                
                {Object.keys(summary.expenses_by_category).length > 0 ? (
                  <div className="space-y-3 sm:space-y-4">
                    {Object.entries(summary.expenses_by_category)
                      .sort(([,a], [,b]) => parseFloat(b.toString()) - parseFloat(a.toString()))
                      .map(([category, amount]) => {
                        const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
                        const totalExpensesNum = typeof summary.total_expenses === 'string' ? parseFloat(summary.total_expenses) : summary.total_expenses
                        const percentage = totalExpensesNum > 0 ? (amountNum / totalExpensesNum) * 100 : 0
                        return (
                          <div key={category} className="group space-y-2 sm:space-y-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300">{categoryIcon(category)}</span>
                                <span className="font-semibold capitalize text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                                  {category.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                                  {formatCurrency(amountNum)}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-2">
                                  ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                              <div
                                className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${categoryColor(category)} transition-all duration-1000 group-hover:scale-105 transform origin-left`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <PieChart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600 animate-pulse" />
                    <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No expense data available</p>
                  </div>
                )}
              </Card>

              {/* Expenses by Status - Filter out rejected */}
              <Card className="p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Expenses by Status
                  </h3>
                </div>
                
                {(() => {
                  const filteredStatuses = Object.entries(summary.expenses_by_status)
                    .filter(([status]) => status !== 'rejected')
                  
                  return filteredStatuses.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {filteredStatuses.map(([status, amount]) => {
                        const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount
                        const totalExpensesNum = typeof summary.total_expenses === 'string' ? parseFloat(summary.total_expenses) : summary.total_expenses
                        const percentage = totalExpensesNum > 0 ? (amountNum / totalExpensesNum) * 100 : 0
                        const statusColors = {
                          pending: "from-yellow-500 to-orange-600 dark:from-yellow-400 dark:to-orange-500",
                          approved: "from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500", 
                          settled: "from-blue-600 to-indigo-700 dark:from-blue-500 dark:to-indigo-600"
                        }
                        const statusIcons = {
                          pending: <Clock className="w-3 h-3 sm:w-4 sm:h-4" />,
                          approved: <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
                          settled: <Banknote className="w-3 h-3 sm:w-4 sm:h-4" />
                        }
                        
                        return (
                          <div key={status} className="group space-y-2 sm:space-y-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`p-1.5 sm:p-2 bg-gradient-to-r ${statusColors[status as keyof typeof statusColors]} rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                                  {statusIcons[status as keyof typeof statusIcons]}
                                </div>
                                <span className="font-semibold capitalize text-gray-800 dark:text-gray-200 text-sm sm:text-base">{status}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                                  {formatCurrency(amountNum)}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-2">
                                  ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
                              <div
                                className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${statusColors[status as keyof typeof statusColors]} transition-all duration-1000 group-hover:scale-105 transform origin-left`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600 animate-pulse" />
                      <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No status data available</p>
                    </div>
                  )
                })()}
              </Card>
            </div>

            {/* Enhanced User Balances - Clear Financial Overview */}
            <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Member Financial Overview
                  </h3>
                </div>
              </div>
              
              {summary.user_balances.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {summary.user_balances
                    .sort((a, b) => parseFloat(b.remaining_owed) - parseFloat(a.remaining_owed))
                    .map((balance, index) => {
                      const totalPaid = typeof balance.total_paid === 'string' ? parseFloat(balance.total_paid) : balance.total_paid
                      const totalOwed = typeof balance.total_owed === 'string' ? parseFloat(balance.total_owed) : balance.total_owed
                      const alreadyPaidOwed = typeof balance.already_paid_owed === 'string' ? parseFloat(balance.already_paid_owed) : balance.already_paid_owed
                      const remainingOwed = typeof balance.remaining_owed === 'string' ? parseFloat(balance.remaining_owed) : balance.remaining_owed
                      
                      const owedPercentagePaid = totalOwed > 0 ? (alreadyPaidOwed / totalOwed) * 100 : 0

                      return (
                        <div 
                          key={balance.user_id} 
                          className="group relative"
                          style={{animationDelay: `${index * 100}ms`}}
                        >
                          <div className={`absolute inset-0 rounded-xl sm:rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300 ${
                            remainingOwed > 0 
                              ? 'bg-gradient-to-r from-red-500 to-pink-600' 
                              : remainingOwed === 0 && totalOwed > 0
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                              : 'bg-gradient-to-r from-gray-500 to-slate-600'
                          }`}></div>
                          
                          <Card className={`relative p-4 sm:p-6 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden ${
                            remainingOwed > 0 
                              ? 'bg-gradient-to-br from-red-50/90 to-red-100/90 dark:from-red-950/90 dark:to-red-900/90' 
                              : remainingOwed === 0 && totalOwed > 0
                              ? 'bg-gradient-to-br from-green-50/90 to-green-100/90 dark:from-green-950/90 dark:to-green-900/90'
                              : 'bg-gradient-to-br from-gray-50/90 to-gray-100/90 dark:from-gray-950/90 dark:to-gray-900/90'
                          }`}>
                            
                            {/* User Header */}
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                              <div className={`p-2 sm:p-3 rounded-full shadow-lg ${
                                remainingOwed > 0 
                                  ? 'bg-gradient-to-br from-red-500 to-red-600' 
                                  : remainingOwed === 0 && totalOwed > 0
                                  ? 'bg-gradient-to-br from-green-500 to-green-600'
                                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
                              }`}>
                                <div className="w-6 h-6 sm:w-8 sm:h-8 text-white font-bold text-sm sm:text-lg flex items-center justify-center">
                                  {(balance.user_name || `User ${balance.user_id}`).charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-100 truncate">
                                  {balance.user_name || `User ${balance.user_id}`}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{balance.user_email}</p>
                              </div>
                            </div>

                            {/* Section 1: Total Paid */}
                            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Trip Expenses Paid</p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">Total paid for this trip</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-300">
                                    {formatCurrency(totalPaid)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Section 2: Total Owes */}
                            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-orange-50 dark:bg-orange-950/50 rounded-lg sm:rounded-xl border border-orange-200 dark:border-orange-800">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 sm:p-2 bg-orange-500 rounded-lg">
                                    <Receipt className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">Total Share</p>
                                    <p className="text-xs text-orange-600 dark:text-orange-400">What this user owes for trip</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg sm:text-xl font-bold text-orange-700 dark:text-orange-300">
                                    {formatCurrency(totalOwed)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Section 3: Paid from Owes + Progress */}
                            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-950/50 rounded-lg sm:rounded-xl border border-green-200 dark:border-green-800">
                              <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg">
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Paid from Share</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">Amount settled from what owed</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-base sm:text-lg font-bold text-green-700 dark:text-green-300">
                                    {formatCurrency(alreadyPaidOwed)}
                                  </p>
                                </div>
                              </div>
                              
                              {/* Payment Progress Bar */}
                              {totalOwed > 0 && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                                    <span>Settlement Progress</span>
                                    <span className="font-semibold">{owedPercentagePaid.toFixed(0)}%</span>
                                  </div>
                                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 sm:h-3 overflow-hidden">
                                    <div
                                      className="h-2 sm:h-3 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-2000 transform origin-left group-hover:scale-105"
                                      style={{ 
                                        width: `${owedPercentagePaid}%`,
                                        animationDelay: `${index * 200}ms`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Section 4: Remaining to Settle */}
                            <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${
                              remainingOwed > 0 
                                ? 'bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-700' 
                                : 'bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-700'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1.5 sm:p-2 rounded-lg ${
                                    remainingOwed > 0 ? 'bg-red-500' : 'bg-green-500'
                                  }`}>
                                    {remainingOwed > 0 ? (
                                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                    )}
                                  </div>
                                  <div>
                                    <p className={`text-xs sm:text-sm font-bold ${
                                      remainingOwed > 0 
                                        ? 'text-red-700 dark:text-red-300' 
                                        : 'text-green-700 dark:text-green-300'
                                    }`}>
                                      {remainingOwed > 0 ? 'Still Owes' : 'Fully Settled'}
                                    </p>
                                    <p className={`text-xs ${
                                      remainingOwed > 0 
                                        ? 'text-red-600 dark:text-red-400' 
                                        : 'text-green-600 dark:text-green-400'
                                    }`}>
                                      {remainingOwed > 0 ? 'Remaining to settle' : 'All dues cleared'}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`text-xl sm:text-2xl font-bold ${
                                    remainingOwed > 0 
                                      ? 'text-red-700 dark:text-red-300' 
                                      : 'text-green-700 dark:text-green-300'
                                  }`}>
                                    {remainingOwed > 0 ? formatCurrency(remainingOwed) : '✅'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="mt-3 sm:mt-4">
                              <Badge className={`w-full justify-center text-center py-2 sm:py-3 font-bold text-xs sm:text-sm ${
                                remainingOwed > 0 
                                  ? 'bg-red-200 text-red-800 border-red-400 dark:bg-red-900/50 dark:text-red-300 dark:border-red-600' 
                                  : remainingOwed === 0 && totalOwed > 0
                                  ? 'bg-green-200 text-green-800 border-green-400 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600'
                                  : 'bg-gray-200 text-gray-800 border-gray-400 dark:bg-gray-900/50 dark:text-gray-300 dark:border-gray-600'
                              }`}>
                                {remainingOwed > 0 
                                  ? '🔴 Needs to Pay' 
                                  : remainingOwed === 0 && totalOwed > 0
                                  ? '🟢 Fully Settled'
                                  : '⚪ No Expenses'
                                }
                              </Badge>
                            </div>
                          </Card>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600 animate-pulse" />
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">No balance data available</p>
                </div>
              )}
            </Card>

            {/* Enhanced Settlement Suggestions */}
            {summary.settlements_needed.length > 0 && (
              <Card className="p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    💡 Smart Settlement Suggestions
                  </h3>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {summary.settlements_needed.map((settlement, index) => {
                    const fromUser = summary.user_balances.find(u => u.user_id === settlement.from_user_id)
                    const settlementAmount = typeof settlement.amount === 'string' ? parseFloat(settlement.amount) : settlement.amount
                    const userTotalOwed = fromUser ? (typeof fromUser.total_owed === 'string' ? parseFloat(fromUser.total_owed) : fromUser.total_owed) : 0
                    const percentage = calculateSettlementPercentage(settlementAmount, userTotalOwed)

                    return (
                      <div 
                        key={index} 
                        className="group relative"
                        style={{animationDelay: `${index * 150}ms`}}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                        
                        <div className="relative p-4 sm:p-6 bg-gradient-to-br from-blue-50/90 to-purple-50/90 dark:from-blue-950/90 dark:to-purple-950/90 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-blue-200/50 dark:border-blue-800/50 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-500">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-3">
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-base sm:text-lg">
                                  <span className="text-blue-600 dark:text-blue-400">
                                    {settlement.from_user_name || `User ${settlement.from_user_id}`}
                                  </span>
                                  <span className="mx-2 text-gray-400">→</span>
                                  <span className="text-purple-600 dark:text-purple-400">
                                    {settlement.to_user_name || `User ${settlement.to_user_id}`}
                                  </span>
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-1">
                                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Recommended payment</p>
                                  {percentage > 0 && (
                                    <Badge className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700 text-xs w-fit">
                                      <Percent className="w-3 h-3 mr-1" />
                                      {percentage}% of owed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right sm:text-left">
                              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                {formatCurrency(settlementAmount)}
                              </p>
                            </div>
                          </div>

                          {/* Enhanced Settlement Description */}
                          <div className="p-3 sm:p-4 bg-white/60 dark:bg-black/30 rounded-lg sm:rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                              💰 <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {settlement.from_user_name || `User ${settlement.from_user_id}`}
                              </span>
                              {' should pay '}
                              <span className="font-bold text-purple-600 dark:text-purple-400">
                                {formatCurrency(settlementAmount)}
                              </span>
                              {percentage > 0 && (
                                <span>
                                  {' (representing '}{percentage}{'% of their total trip expenses)'}
                                </span>
                              )}
                              {' to '}
                              <span className="font-semibold text-purple-600 dark:text-purple-400">
                                {settlement.to_user_name || `User ${settlement.to_user_id}`}
                              </span>
                              {' to achieve optimal balance settlement. 🎯'}
                            </p>
                            
                            {/* Progress indicator */}
                            <div className="mt-2 sm:mt-3 flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-2000"
                                  style={{ 
                                    width: `${Math.min(percentage, 100)}%`,
                                    animationDelay: `${index * 200}ms`
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                {percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-6 sm:mt-8 text-center">
                  <Link href={`/dashboard/trips/${tripId}/settlements`}>
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold h-12 sm:h-auto">
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                      <span className="flex items-center gap-2">
                        Proceed to Settlements <Sparkles className="w-4 h-4" />
                      </span>
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>
        </div>
      </DashboardShell>
    </div>
  )
}
