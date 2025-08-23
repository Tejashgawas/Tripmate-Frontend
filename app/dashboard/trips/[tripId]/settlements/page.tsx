"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import DashboardShell from "@/components/dashboard-shell"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, Plus, Users, DollarSign, CheckCircle, Clock,
  AlertTriangle, CreditCard, Send, Loader2, RefreshCw,
  HandCoins, Receipt, Calendar, User, Sparkles, Crown,
  TrendingUp, ArrowRight, Bell, CheckCheck, X, UserCheck
} from "lucide-react"

interface Settlement {
  from_user_id: number
  from_user_name: string
  to_user_id: number
  to_user_name: string
  amount: string
  currency: string
}

interface PendingSettlement {
  id: number
  trip_id: number
  from_user_id: number
  from_user_name: string
  to_user_id: number
  to_user_name: string
  amount: string
  currency: string
  settlement_date: string
  notes: string
  is_confirmed: boolean
}

interface TripMember {
  id: number
  username: string
  email: string
}

export default function SettlementsPage() {
  const params = useParams()
  const tripId = params?.tripId as string
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { get, post, put, loading: apiLoading, error: apiError } = useApi() // ✅ NEW: Use API client

  // Data states
  const [suggestedSettlements, setSuggestedSettlements] = useState<Settlement[]>([])
  const [pendingSettlements, setPendingSettlements] = useState<PendingSettlement[]>([])
  const [userSettlements, setUserSettlements] = useState<PendingSettlement[]>([])
  const [tripMembers, setTripMembers] = useState<TripMember[]>([])

  // Loading states
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Form state
  const [settlementForm, setSettlementForm] = useState({
    to_user_id: 0,
    amount: 0,
    currency: "INR",
    notes: ""
  })

  // ✅ REMOVED: All manual authentication logic (refreshToken, getCurrentUser)

  /* ───── Fetch suggested settlements using useApi ───── */
  const fetchSuggestedSettlements = async () => {
    try {
      console.log(`[SETTLEMENTS] Fetching suggested settlements for trip ${tripId}`)
      const data = await get<Settlement[]>(`/expenses/trips/${tripId}/settlements`)
      setSuggestedSettlements(Array.isArray(data) ? data : [])
      console.log("[SETTLEMENTS] Suggested settlements loaded:", data)
    } catch (error) {
      console.error("[SETTLEMENTS] Error fetching suggested settlements:", error)
    }
  }

  /* ───── Fetch pending settlements using useApi ───── */
  const fetchPendingSettlements = async () => {
    try {
      console.log("[SETTLEMENTS] Fetching pending settlements")
      const data = await get<PendingSettlement[]>("/expenses/to/pending")
      setPendingSettlements(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[SETTLEMENTS] Error fetching pending settlements:", error)
    }
  }

  /* ───── Fetch user's initiated settlements using useApi ───── */
  const fetchUserSettlements = async () => {
    try {
      console.log("[SETTLEMENTS] Fetching user settlements")
      const data = await get<PendingSettlement[]>("/expenses/from/settlement")
      setUserSettlements(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("[SETTLEMENTS] Error fetching user settlements:", error)
    }
  }

  /* ───── Fetch trip members using useApi ───── */
  const fetchTripMembers = async () => {
    try {
      console.log(`[SETTLEMENTS] Fetching trip members for trip ${tripId}`)
      const data = await get<any>(`/trip-member/trip/${tripId}`)
      const members = data?.members || data || []
      const users = Array.isArray(members) ? members.map((m: any) => m?.user || m).filter(Boolean) : []
      setTripMembers(users)
    } catch (error) {
      console.error("[SETTLEMENTS] Error fetching trip members:", error)
    }
  }

  /* ───── Enhanced: Create settlement with suggestion removal using useApi ───── */
  const createSettlement = async () => {
    if (!settlementForm.to_user_id || settlementForm.amount <= 0 || !user) {
      setErrorMessage("Please fill in all required fields and ensure you are logged in.")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    try {
      setCreating(true)
      console.log("[SETTLEMENTS] Creating settlement:", settlementForm)

      await post(`/expenses/trips/${tripId}/settlements`, settlementForm)

      // Hide the suggestion after successful creation
      setSuggestedSettlements(prevSettlements => 
        prevSettlements.filter(s => 
          !(s.from_user_id === user.id && s.to_user_id === settlementForm.to_user_id)
        )
      )

      setShowCreateModal(false)
      setSettlementForm({ to_user_id: 0, amount: 0, currency: "INR", notes: "" })
      setSuccessMessage("Settlement created successfully!")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      await fetchAllData()
    } catch (error) {
      console.error("[SETTLEMENTS] Error creating settlement:", error)
      setErrorMessage("Failed to create settlement. Please try again.")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setCreating(false)
    }
  }

  /* ───── Confirm settlement using useApi ───── */
  const confirmSettlement = async (settlementId: number) => {
    if (!user) {
      setErrorMessage("Please login to confirm settlements.")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
      return
    }

    try {
      setConfirming(settlementId)
      console.log(`[SETTLEMENTS] Confirming settlement ${settlementId}`)

      await put(`/expenses/settlements/${settlementId}/confirm`, {})

      setSuccessMessage("Settlement confirmed successfully!")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      await fetchAllData()
    } catch (error) {
      console.error("[SETTLEMENTS] Error confirming settlement:", error)
      setErrorMessage("Failed to confirm settlement. Please try again.")
      setShowError(true)
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setConfirming(null)
    }
  }

  /* ───── Fetch all data ───── */
  const fetchAllData = async () => {
    if (!user) return
    
    setLoading(true)
    await Promise.all([
      fetchSuggestedSettlements(),
      fetchPendingSettlements(),
      fetchUserSettlements(),
      fetchTripMembers()
    ])
    setLoading(false)
  }

  /* ───── Effects ───── */
  useEffect(() => {
    if (tripId && user) {
      fetchAllData()
    }
  }, [tripId, user])

  /* ───── Helper functions ───── */
  const formatCurrency = (amount: string, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency
    }).format(parseFloat(amount))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    })
  }

  // Enhanced: Better settlement categorization
  const userOwedSettlements = suggestedSettlements.filter(s => s.from_user_id === user?.id)
  const userOwedBySettlements = suggestedSettlements.filter(s => s.to_user_id === user?.id)
  const othersOwedSettlements = suggestedSettlements.filter(s => 
    s.from_user_id !== user?.id && s.to_user_id !== user?.id
  )

  if (!tripId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-red-950 dark:via-gray-900 dark:to-red-950 p-4">
        <div className="text-center p-6 sm:p-8 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-red-200 dark:border-red-800 shadow-2xl max-w-md w-full">
          <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4 animate-pulse" />
          <p className="text-lg sm:text-xl font-semibold text-red-700 dark:text-red-300">Invalid trip ID</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-950 dark:via-blue-950 dark:to-green-950">
      <DashboardShell>
        <div className="relative">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-400/20 to-green-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8">
            {/* Enhanced Header */}
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-6">
                  <Link href={`/dashboard/trips/${tripId}/expenses`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 w-10 h-10 sm:w-auto sm:h-auto p-2 sm:px-4 sm:py-2"
                    >
                      <ArrowLeft className="w-4 h-4 sm:mr-2"/>
                      <span className="hidden sm:inline">Back to Expenses</span>
                    </Button>
                  </Link>
                  <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 dark:from-green-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
                      <HandCoins className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 animate-bounce" />
                      Trip Settlements
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-medium">
                      Settle up with your trip members
                      {user && (
                        <span className="ml-2 text-blue-600 dark:text-blue-400">
                          • Hi, {user.username || user.email}!
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    onClick={fetchAllData}
                    disabled={loading}
                    variant="outline"
                    className="w-full sm:w-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/50 h-10 sm:h-12 text-sm sm:text-base"
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
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 mr-2"/>
                    <span className="flex items-center gap-1">
                      New Settlement <Sparkles className="w-4 h-4" />
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Pending Settlements Alert */}
            {pendingSettlements.length > 0 && (
              <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border-2 border-orange-300 dark:border-orange-700 shadow-xl">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-orange-500 rounded-lg sm:rounded-xl shadow-lg">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-orange-700 dark:text-orange-300 mb-1 sm:mb-2">
                      Action Required: {pendingSettlements.length} Settlement{pendingSettlements.length > 1 ? 's' : ''} Awaiting Confirmation
                    </h3>
                    <p className="text-sm sm:text-base text-orange-600 dark:text-orange-400">
                      You have settlements waiting for your confirmation. Review and confirm them below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center py-16 sm:py-20">
                <div className="relative">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full animate-pulse"></div>
                  <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
                </div>
                <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-muted-foreground">Loading settlements...</p>
              </div>
            ) : (
              <div className="space-y-6 sm:space-y-8">
                {/* USER'S SETTLEMENTS THEY NEED TO MAKE */}
                {userOwedSettlements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 bg-clip-text text-transparent">
                        💸 You Owe Money - Action Required
                      </h2>
                      <Badge className="bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700 animate-pulse text-xs sm:text-sm">
                        {userOwedSettlements.length} debt{userOwedSettlements.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      {userOwedSettlements.map((settlement, index) => (
                        <Card key={index} className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 border-2 border-red-300 dark:border-red-700 shadow-xl hover:shadow-2xl transition-all duration-500">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                              <div className="relative">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center">
                                  <UserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                                  <span className="text-white text-xs font-bold">!</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-lg sm:text-2xl font-bold text-red-700 dark:text-red-300 mb-1 sm:mb-2">
                                  🚨 YOU OWE {settlement.to_user_name.toUpperCase()}
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(settlement.amount, settlement.currency)}
                                </p>
                                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">
                                  Time to settle up! Click "Settle Now" to create payment.
                                </p>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => {
                                setSettlementForm({
                                  to_user_id: settlement.to_user_id,
                                  amount: parseFloat(settlement.amount),
                                  currency: settlement.currency,
                                  notes: "Settlement for trip expenses"
                                })
                                setShowCreateModal(true)
                              }}
                              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold h-12 sm:h-auto"
                            >
                              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                              Settle Now
                              <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* SETTLEMENTS WHERE SOMEONE OWES YOU */}
                {userOwedBySettlements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                        💰 Someone Owes You Money
                      </h2>
                      <Badge className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700 text-xs sm:text-sm">
                        {userOwedBySettlements.length} owed to you
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      {userOwedBySettlements.map((settlement, index) => (
                        <Card key={index} className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-2 border-green-300 dark:border-green-700 shadow-xl hover:shadow-2xl transition-all duration-500">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                              <div className="relative">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                  <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                  <span className="text-white text-xs font-bold">💰</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-lg sm:text-2xl font-bold text-green-700 dark:text-green-300 mb-1 sm:mb-2">
                                  💰 {settlement.from_user_name.toUpperCase()} OWES YOU
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(settlement.amount, settlement.currency)}
                                </p>
                                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-1">
                                  Waiting for {settlement.from_user_name} to settle up with you.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-xs sm:text-sm font-medium">Awaiting their payment</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* OTHER PEOPLE'S SETTLEMENTS */}
                {othersOwedSettlements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        Other Suggested Settlements
                      </h2>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700 text-xs sm:text-sm">
                        {othersOwedSettlements.length} other{othersOwedSettlements.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      {othersOwedSettlements.map((settlement, index) => (
                        <Card key={index} className="p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                  <span className="text-blue-600 dark:text-blue-400">{settlement.from_user_name}</span>
                                  <span className="text-gray-500 mx-2">owes</span>
                                  <span className="text-green-600 dark:text-green-400">{settlement.to_user_name}</span>
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(settlement.amount, settlement.currency)}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  This settlement involves other trip members
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                              <span className="text-xs sm:text-sm">Waiting for action</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Settlements (to confirm) */}
                {pendingSettlements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                        Pending Confirmations
                      </h2>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700 text-xs sm:text-sm">
                        {pendingSettlements.length} pending
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      {pendingSettlements.map((settlement) => (
                        <Card key={settlement.id} className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 border-2 border-orange-300 dark:border-orange-700 shadow-xl">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                                <HandCoins className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">
                                  <span className="text-orange-600 dark:text-orange-400">{settlement.from_user_name}</span>
                                  <span className="text-gray-500 mx-2">wants to settle</span>
                                  <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                                    {formatCurrency(settlement.amount, settlement.currency)}
                                  </span>
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {formatDate(settlement.settlement_date)}
                                  </span>
                                  {settlement.notes && (
                                    <span className="flex items-center gap-1">
                                      <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
                                      {settlement.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => confirmSettlement(settlement.id)}
                              disabled={confirming === settlement.id}
                              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
                            >
                              {confirming === settlement.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Confirming...
                                </>
                              ) : (
                                <>
                                  <CheckCheck className="w-4 h-4 mr-2" />
                                  Confirm Settlement
                                </>
                              )}
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* User's Initiated Settlements */}
                {userSettlements.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-4 sm:mb-6">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                        Your Settlements
                      </h2>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700 text-xs sm:text-sm">
                        {userSettlements.length} sent
                      </Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      {userSettlements.map((settlement) => (
                        <Card key={settlement.id} className="p-4 sm:p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3 sm:gap-4 flex-1">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm sm:text-base">
                                  <span className="text-gray-500">To:</span>
                                  <span className="text-purple-600 dark:text-purple-400 ml-2">{settlement.to_user_name}</span>
                                  <span className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400 ml-4">
                                    {formatCurrency(settlement.amount, settlement.currency)}
                                  </span>
                                </p>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                    {formatDate(settlement.settlement_date)}
                                  </span>
                                  {settlement.notes && (
                                    <span className="flex items-center gap-1">
                                      <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
                                      {settlement.notes}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${
                                settlement.is_confirmed 
                                  ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700' 
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700'
                              }`}>
                                {settlement.is_confirmed ? (
                                  <><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</>
                                ) : (
                                  <><Clock className="w-3 h-3 mr-1" /> Pending</>
                                )}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!loading && suggestedSettlements.length === 0 && pendingSettlements.length === 0 && userSettlements.length === 0 && (
                  <Card className="p-8 sm:p-12 text-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-0 shadow-xl">
                    <div className="max-w-md mx-auto">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-green-100 to-blue-200 dark:from-green-800 dark:to-blue-700 rounded-full flex items-center justify-center">
                          <HandCoins className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white"/>
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent">
                        All Settled Up!
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        No pending settlements found. Everyone's expenses are balanced for this trip!
                      </p>
                      <Button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12 px-6 sm:px-8"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Manual Settlement
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Create Settlement Modal */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl sm:rounded-3xl blur opacity-30"></div>
                  <Card className="relative w-full max-w-xs sm:max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-0 rounded-xl sm:rounded-2xl">
                    <div className="p-6 sm:p-8">
                      <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg">
                            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                              Create Settlement
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Settle up with a trip member</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setShowCreateModal(false)}
                          variant="outline"
                          size="sm"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/50 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 w-8 h-8 sm:w-10 sm:h-10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-4 sm:space-y-6">
                        {/* Member Selection */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Settle with *
                          </label>
                          <select
                            value={settlementForm.to_user_id}
                            onChange={(e) => setSettlementForm({...settlementForm, to_user_id: parseInt(e.target.value)})}
                            className="w-full p-2 sm:p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                          >
                            <option value={0}>Select a trip member</option>
                            {tripMembers.filter(member => member.id !== user?.id).map((member) => (
                              <option key={member.id} value={member.id}>
                                {member.username || member.email || `User ${member.id}`}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Amount & Currency */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Amount *
                            </label>
                            <Input
                              type="number"
                              value={settlementForm.amount}
                              onChange={(e) => setSettlementForm({...settlementForm, amount: parseFloat(e.target.value) || 0})}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 h-10 sm:h-12"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Currency
                            </label>
                            <select
                              value={settlementForm.currency}
                              onChange={(e) => setSettlementForm({...settlementForm, currency: e.target.value})}
                              className="w-full p-2 sm:p-3 border rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 h-10 sm:h-12 text-sm sm:text-base"
                            >
                              <option value="INR">🇮🇳 INR</option>
                              <option value="USD">🇺🇸 USD</option>
                              <option value="EUR">🇪🇺 EUR</option>
                            </select>
                          </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Notes (Optional)
                          </label>
                          <Textarea
                            value={settlementForm.notes}
                            onChange={(e) => setSettlementForm({...settlementForm, notes: e.target.value})}
                            placeholder="Add a note about this settlement"
                            rows={3}
                            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={() => setShowCreateModal(false)}
                          disabled={creating}
                          variant="outline"
                          className="flex-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 h-10 sm:h-12"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={createSettlement}
                          disabled={creating || !settlementForm.to_user_id || settlementForm.amount <= 0}
                          className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none h-10 sm:h-12"
                        >
                          {creating ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2"/>
                              Create Settlement
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
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-white dark:bg-gray-900 border-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-xs sm:max-w-md w-full shadow-2xl backdrop-blur-xl">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-400 dark:to-emerald-500 bg-clip-text text-transparent">
                        Success!
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">{successMessage}</p>
                      <Button 
                        onClick={() => setShowSuccess(false)} 
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12"
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
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-30"></div>
                  <div className="relative bg-white dark:bg-gray-900 border-0 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-xs sm:max-w-md w-full shadow-2xl backdrop-blur-xl">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg">
                        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-white"/>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-red-600 to-pink-700 dark:from-red-400 dark:to-pink-500 bg-clip-text text-transparent">
                        Error
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">{errorMessage}</p>
                      <Button 
                        onClick={() => setShowError(false)} 
                        className="w-full bg-gradient-to-r from-red-600 to-pink-700 hover:from-red-700 hover:to-pink-800 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 h-10 sm:h-12"
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
