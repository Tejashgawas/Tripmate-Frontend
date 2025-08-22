"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import ExpenseComponent from "@/components/expense-component"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import {
  ArrowLeft, Plus, Search, Filter, BarChart3, Users,
  DollarSign, Calendar, Settings, X, Save, Loader2,
  Receipt, TrendingUp, CreditCard, CheckCircle, Clock,
  AlertTriangle, Sparkles, Star, Crown, Zap, Award,
  Eye, EyeOff, FilterX, FileText, Target
} from "lucide-react"

import { 
  Expense, ExpenseCategory, ExpenseStatus, User 
} from "@/types/expense-interfaces"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

export default function TripExpensesPage() {
  const params = useParams()
  const tripId = params?.tripId
  const theme = 'light'

  const [refreshKey, setRefreshKey] = useState(0)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  /* Modal states */
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [errorTitle, setErrorTitle] = useState("Error")

  /* Filter states */
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"all" | ExpenseCategory>("all")
  const [statusFilter, setStatusFilter] = useState<"all" | ExpenseStatus>("all")
  const [paidByFilter, setPaidByFilter] = useState<"all" | "me">("all")
  const [showFilters, setShowFilters] = useState(false)

  /* Add expense form */
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    description: "",
    amount: 0,
    currency: "INR",
    category: ExpenseCategory.OTHER,
    expense_date: new Date().toISOString().split('T')[0],
    member_ids: [] as number[],
    is_split_equally: true
  })

  const [saving, setSaving] = useState(false)
  const [tripMembers, setTripMembers] = useState<User[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  /* ───── Token refresh ───── */
  const refreshToken = async () => {
    setRefreshing(true)
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST", credentials: "include"
      })
      return response.ok
    } finally {
      setRefreshing(false)
    }
  }

  /* ───── Get current user ───── */
  const getCurrentUser = async () => {
    try {
      const response = await fetch(`${BASE_URL}auth/me`, {
        credentials: "include"
      })
      if (response.ok) {
        const userData = await response.json()
        setCurrentUserId(userData.id)
      }
    } catch (error) {
      console.error("[EXPENSES] Error fetching current user:", error)
    }
  }

  /* ───── Fetch expenses ───── */
  const fetchExpenses = async (retry = false) => {
    if (!tripId) return

    try {
      if (!expenses.length) setLoading(true)

      const params = new URLSearchParams()
      if (categoryFilter !== "all") params.set("category", categoryFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)

      const res = await fetch(`${BASE_URL}expenses/trips/${tripId}?${params}`, {
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return fetchExpenses(true)
      }

      if (res.ok) {
        const data = await res.json()
        const newExpenses = Array.isArray(data) ? data : data.expenses || []
        setExpenses(newExpenses)
        setRefreshKey(prev => prev + 1)
        console.log(`[EXPENSES] Loaded ${newExpenses.length} expenses`)
      }
    } catch (error) {
      console.error("[EXPENSES] Error fetching:", error)
    } finally {
      setLoading(false)
    }
  }

  /* ───── Fetch trip members ───── */
  const fetchTripMembers = async (retry = false) => {
    if (!tripId) return

    try {
      const res = await fetch(`${BASE_URL}trip-member/trip/${tripId}`, {
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return fetchTripMembers(true)
      }

      if (res.ok) {
        const data = await res.json()
        const members = data?.members || data || []
        const users = Array.isArray(members) ? members.map((m: any) => m?.user || m).filter(Boolean) : []
        setTripMembers(users)
        setExpenseForm(prev => ({
          ...prev,
          member_ids: users.map((u: User) => u.id)
        }))
      }
    } catch (error) {
      console.error("[EXPENSES] Error fetching members:", error)
    }
  }

  /* ───── Add expense - ENHANCED ERROR HANDLING ───── */
  const addExpense = async (retry = false) => {
    if (!tripId || !expenseForm.title.trim()) return

    try {
      setSaving(true)
      
      const expenseDate = expenseForm.expense_date
      const payload = {
        ...expenseForm,
        expense_date: expenseDate + "T00:00:00"
      }
      
      const res = await fetch(`${BASE_URL}expenses/trips/${tripId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return addExpense(true)
      }

      if (res.ok) {
        setShowAddExpense(false)
        setExpenseForm({
          title: "",
          description: "",
          amount: 0,
          currency: "INR",
          category: ExpenseCategory.OTHER,
          expense_date: new Date().toISOString().split('T')[0],
          member_ids: tripMembers.map(u => u.id),
          is_split_equally: true
        })
        setSuccessMessage("Expense added successfully!")
        setShowSuccess(true)
        
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)
        
        await fetchExpenses()
      } else {
        try {
          const errorData = await res.json()
          setErrorTitle("Failed to Add Expense")
          setErrorMessage(errorData.detail || `Server error: ${res.status}`)
          setShowError(true)
        } catch {
          const errorText = await res.text()
          setErrorTitle("Failed to Add Expense")
          setErrorMessage(errorText || `Server error: ${res.status}`)
          setShowError(true)
        }
      }
    } catch (error) {
      setErrorTitle("Network Error")
      setErrorMessage("Unable to connect to server. Please check your connection and try again.")
      setShowError(true)
    } finally {
      setSaving(false)
    }
  }

  /* ───── Enhanced Expense updated callback ───── */
  const handleExpenseUpdate = async (message: string, expenseId?: number, isError: boolean = false) => {
    if (isError) {
      setErrorTitle("Expense Operation Failed")
      setErrorMessage(message)
      setShowError(true)
    } else {
      setSuccessMessage(message)
      setShowSuccess(true)
      await fetchExpenses()
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }
  }

  /* ───── Effects ───── */
  useEffect(() => { 
    fetchExpenses()
    fetchTripMembers()
    getCurrentUser()
  }, [tripId])

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchExpenses(), 500)
    return () => clearTimeout(timeoutId)
  }, [searchQuery, categoryFilter, statusFilter])

  /* ───── Filter expenses ───── */
  const filteredExpenses = expenses.filter(expense => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      (expense.title?.toLowerCase() || '').includes(searchLower) ||
      (expense.description?.toLowerCase() || '').includes(searchLower)
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  /* ───── Helper functions ───── */
  const formatCurrency = (amount: number, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency
    }).format(amount)
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setStatusFilter("all")
  }

  const hasActiveFilters = searchQuery || categoryFilter !== "all" || statusFilter !== "all"

  if (!tripId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-red-950 dark:via-gray-900 dark:to-red-950">
        <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-red-200 dark:border-red-800 shadow-2xl">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-xl font-semibold text-red-700 dark:text-red-300">Invalid trip ID</p>
        </div>
      </div>
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

          <div className="relative z-10">
            {/* Enhanced Header */}
            <div className="mb-8 p-6 rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <Link href={`/expenses`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Trips
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                      <Receipt className="w-8 h-8 text-blue-500 animate-pulse" />
                      Trip Expenses
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">Track and split your travel expenses</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Link href={`/dashboard/trips/${tripId}/expense-dashboard`}>
                    <Button 
                      variant="outline" 
                      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-cyan-200 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 hover:shadow-lg transition-all duration-300"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href={`/dashboard/trips/${tripId}/settlements`}>
                    <Button 
                      variant="outline" 
                      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:shadow-lg transition-all duration-300"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Settlements
                    </Button>
                  </Link>
                  <Button
                    onClick={() => {
                      fetchTripMembers()
                      setShowAddExpense(true)
                    }}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    <span className="flex items-center gap-1">
                      Add Expense <Sparkles className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Enhanced Summary Cards */}
            {expenses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Expenses Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <Card className="relative p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                          <Receipt className="w-6 h-6 text-white" />
                        </div>
                        <FileText className="w-5 h-5 text-blue-500 animate-pulse" />
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2">Total Expenses</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-500 bg-clip-text text-transparent">
                        {expenses.length}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Approved Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <Card className="relative p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <Award className="w-5 h-5 text-green-500 animate-bounce" />
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold mb-2">Approved</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                        {expenses.filter(e => e.status === ExpenseStatus.APPROVED).length}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Pending Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
                  <Card className="relative p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-yellow-600/20 rounded-full -mr-10 -mt-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl shadow-lg">
                          <Clock className="w-6 h-6 text-white" />
                        </div>
                        <Zap className="w-5 h-5 text-orange-500 animate-pulse" />
                      </div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-semibold mb-2">Pending</p>
                      <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-700 dark:from-orange-400 dark:to-yellow-500 bg-clip-text text-transparent">
                        {expenses.filter(e => e.status === ExpenseStatus.PENDING).length}
                      </p>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Enhanced Filters */}
            <Card className="p-6 mb-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <Search className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Smart Filters
                  </h3>
                  {hasActiveFilters && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700">
                      <Target className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  size="sm"
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300"
                >
                  {showFilters ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      placeholder="Search expenses..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as any)}
                    className="px-3 py-2 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  >
                    <option value="all">All Categories</option>
                    <option value={ExpenseCategory.ACCOMMODATION}>🏠 Accommodation</option>
                    <option value={ExpenseCategory.TRANSPORTATION}>🚗 Transportation</option>
                    <option value={ExpenseCategory.FOOD}>🍽️ Food</option>
                    <option value={ExpenseCategory.ACTIVITIES}>🎯 Activities</option>
                    <option value={ExpenseCategory.SHOPPING}>🛍️ Shopping</option>
                    <option value={ExpenseCategory.EMERGENCY}>🚨 Emergency</option>
                    <option value={ExpenseCategory.OTHER}>📝 Other</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  >
                    <option value="all">All Statuses</option>
                    <option value={ExpenseStatus.PENDING}>⏳ Pending</option>
                    <option value={ExpenseStatus.APPROVED}>✅ Approved</option>
                    <option value={ExpenseStatus.REJECTED}>❌ Rejected</option>
                    <option value={ExpenseStatus.SETTLED}>💰 Settled</option>
                  </select>

                  {/* Clear Filters */}
                  <Button
                    onClick={clearAllFilters}
                    variant="outline"
                    disabled={!hasActiveFilters}
                    className="flex items-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-red-200 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <FilterX className="w-4 h-4" />
                    Clear All
                  </Button>
                </div>
              )}
            </Card>

            {/* ✅ MINIMAL LOADING - Enhanced Expenses List */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="w-6 h-6 border-2 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading expenses...</p>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <Card className="p-12 text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                  <div className="max-w-md mx-auto">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                        <DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white"/>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                      No Expenses Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {expenses.length === 0
                        ? "Start tracking your trip expenses by adding your first one and keep your budget on track!"
                        : "No expenses match your current filters. Try adjusting your search criteria."
                      }
                    </p>
                    <Button
                      onClick={() => {
                        if (hasActiveFilters) {
                          clearAllFilters()
                        } else {
                          setShowAddExpense(true)
                        }
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                      {hasActiveFilters ? (
                        <>
                          <FilterX className="w-4 h-4 mr-2" />
                          Clear Filters
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add First Expense
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  {filteredExpenses.map((expense, index) => (
                    <div 
                      key={`${expense.id}-${refreshKey}`}
                      style={{animationDelay: `${index * 100}ms`}}
                      className="animate-in slide-in-from-bottom duration-500"
                    >
                      <ExpenseComponent
                        expense={expense}
                        tripId={parseInt(tripId as string)}
                        onUpdate={handleExpenseUpdate}
                        currentUserId={currentUserId || undefined}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Enhanced Add Expense Modal */}
            {showAddExpense && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-30"></div>
                  <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0">
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                            <Plus className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                              Add New Expense
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">Track your spending effortlessly</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setShowAddExpense(false)}
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
                            value={expenseForm.title}
                            onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                            placeholder="Enter expense title"
                            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Description
                          </label>
                          <Textarea
                            value={expenseForm.description}
                            onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                            placeholder="Add expense details"
                            rows={3}
                            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                          />
                        </div>

                        {/* Amount & Currency */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Amount *
                            </label>
                            <Input
                              type="number"
                              value={expenseForm.amount}
                              onChange={(e) => setExpenseForm({...expenseForm, amount: parseFloat(e.target.value) || 0})}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Currency
                            </label>
                            <select
                              value={expenseForm.currency}
                              onChange={(e) => setExpenseForm({...expenseForm, currency: e.target.value})}
                              className="w-full p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                            >
                              <option value="INR">🇮🇳 INR</option>
                              <option value="USD">🇺🇸 USD</option>
                              <option value="EUR">🇪🇺 EUR</option>
                            </select>
                          </div>
                        </div>

                        {/* Category & Date */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Category
                            </label>
                            <select
                              value={expenseForm.category}
                              onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value as ExpenseCategory})}
                              className="w-full p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                            >
                              <option value={ExpenseCategory.ACCOMMODATION}>🏠 Accommodation</option>
                              <option value={ExpenseCategory.TRANSPORTATION}>🚗 Transportation</option>
                              <option value={ExpenseCategory.FOOD}>🍽️ Food</option>
                              <option value={ExpenseCategory.ACTIVITIES}>🎯 Activities</option>
                              <option value={ExpenseCategory.SHOPPING}>🛍️ Shopping</option>
                              <option value={ExpenseCategory.EMERGENCY}>🚨 Emergency</option>
                              <option value={ExpenseCategory.OTHER}>📝 Other</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Date
                            </label>
                            <Input
                              type="date"
                              value={expenseForm.expense_date}
                              onChange={(e) => setExpenseForm({...expenseForm, expense_date: e.target.value})}
                              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                            />
                          </div>
                        </div>

                        {/* Split Type */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Split Type
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                              <input
                                type="radio"
                                checked={expenseForm.is_split_equally}
                                onChange={() => setExpenseForm({...expenseForm, is_split_equally: true})}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium">Split Equally</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer">
                              <input
                                type="radio"
                                checked={!expenseForm.is_split_equally}
                                onChange={() => setExpenseForm({...expenseForm, is_split_equally: false})}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="font-medium">Manual Split</span>
                            </label>
                          </div>
                        </div>

                        {/* Members Selection */}
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Split Among Members
                          </label>
                          <div className="space-y-2 max-h-40 overflow-y-auto p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                            {tripMembers.map((member) => (
                              <label key={member.id} className="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-gray-700/50 rounded-lg transition-colors cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={expenseForm.member_ids.includes(member.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setExpenseForm({
                                        ...expenseForm,
                                        member_ids: [...expenseForm.member_ids, member.id]
                                      })
                                    } else {
                                      setExpenseForm({
                                        ...expenseForm,
                                        member_ids: expenseForm.member_ids.filter(id => id !== member.id)
                                      })
                                    }
                                  }}
                                  className="text-blue-600 focus:ring-blue-500"
                                />
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {(member.username || member.email || `User ${member.id}`).charAt(0).toUpperCase()}
                                </div>
                                <span className="font-medium">{member.username || member.email || `User ${member.id}`}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ✅ MINIMAL LOADING - Actions */}
                      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => setShowAddExpense(false)}
                          disabled={saving}
                          variant="outline"
                          className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={addExpense}
                          disabled={saving || !expenseForm.title.trim() || expenseForm.amount <= 0 || expenseForm.member_ids.length === 0}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                              Adding...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Add Expense
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Enhanced Success Modal */}
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

            {/* Enhanced Error Modal */}
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
                        {errorTitle}
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
