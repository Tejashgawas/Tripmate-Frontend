"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Receipt, Edit, Trash2, Users, DollarSign, Calendar,
  CheckCircle, Clock, XCircle, User, CreditCard, 
  Save, X, Loader2, MapPin, Tag, Lock, Calculator,
  AlertCircle, Crown, Sparkles, ArrowRight
} from "lucide-react"

import { Expense, ExpenseCategory, ExpenseStatus, ExpenseSplit } from "@/types/expense-interfaces"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

interface ExpenseComponentProps {
  expense: Expense
  tripId: number
  onUpdate: (message: string, expenseId?: number, isError?: boolean) => void
  currentUserId?: number
}

export default function ExpenseComponent({ expense, tripId, onUpdate, currentUserId }: ExpenseComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showManualSplitModal, setShowManualSplitModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [currentUserIdState, setCurrentUserIdState] = useState<number | null>(currentUserId || null)
  
  // ✅ NEW: Add loading state for user fetch
  const [loadingUser, setLoadingUser] = useState(!currentUserId) // Only load if not provided as prop
  
  // Payment marking state
  const [markingPaid, setMarkingPaid] = useState(false)

  const [editForm, setEditForm] = useState({
    title: expense?.title || "",
    description: expense?.description || "",
    amount: expense?.amount || 0,
    currency: expense?.currency || "INR",
    category: expense?.category || ExpenseCategory.OTHER,
    expense_date: expense?.expense_date ? new Date(expense.expense_date).toISOString().split('T')[0] : ""
  })

  const [splits, setSplits] = useState<ExpenseSplit[]>(expense?.splits || [])
  const [manualSplits, setManualSplits] = useState<{user_id: number, amount: number, notes: string}[]>([])

  // Get current user's split information
  const currentUserSplit = splits.find(split => split.user_id === currentUserIdState)
  const userOwesAmount = currentUserSplit?.amount || 0
  const hasUserPaid = currentUserSplit?.is_paid || false
  const isExpenseOwner = expense?.paid_by === currentUserIdState

  // ✅ FIXED: Proper user fetching logic
  useEffect(() => {
    const getCurrentUser = async () => {
      // Only fetch if we don't have a user ID yet
      if (currentUserIdState) {
        setLoadingUser(false)
        return
      }
      
      try {
        setLoadingUser(true)
        console.log("[EXPENSE] Fetching current user...")
        
        const response = await fetch(`${BASE_URL}me/`, {
          credentials: "include"
        })
        
        if (response.ok) {
          const userData = await response.json()
          console.log("[EXPENSE] Current user fetched:", userData)
          setCurrentUserIdState(userData.id)
        } else {
          console.error("[EXPENSE] Failed to fetch user:", response.status)
        }
      } catch (error) {
        console.error("[EXPENSE] Error fetching current user:", error)
      } finally {
        setLoadingUser(false)
      }
    }

    getCurrentUser()
  }, [currentUserIdState]) // Depend on currentUserIdState

  // Update form when expense prop changes
  useEffect(() => {
    setEditForm({
      title: expense?.title || "",
      description: expense?.description || "",
      amount: expense?.amount || 0,
      currency: expense?.currency || "INR", 
      category: expense?.category || ExpenseCategory.OTHER,
      expense_date: expense?.expense_date ? new Date(expense.expense_date).toISOString().split('T')[0] : ""
    })
    setSplits(expense?.splits || [])
    
    if (expense?.splits) {
      setManualSplits(expense.splits.map(split => ({
        user_id: split.user_id,
        amount: split.amount,
        notes: split.notes || ""
      })))
    }
  }, [expense?.id])

  // ✅ Debug logging - now with loading state
  console.log("ExpenseComponent Debug:", {
    currentUserIdState,
    loadingUser,
    currentUserSplit: !!currentUserSplit,
    userOwesAmount,
    hasUserPaid,
    splits: splits.length,
    expenseId: expense?.id
  })

  /* ───── Update expense ───── */
  const updateExpense = async (retry = false) => {
    if (!expense?.id) {
      onUpdate("Invalid expense - no ID found", expense?.id, true)
      return
    }

    try {
      setUpdating(true)
      
      const res = await fetch(`${BASE_URL}expenses/${expense.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return updateExpense(true)
      }

      if (res.ok) {
        setIsEditing(false)
        onUpdate("Expense updated successfully!", expense.id)
      } else {
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || "Only the payer can update this expense", expense.id, true)
        } catch {
          if (res.status === 403) {
            onUpdate("Only the payer can update this expense", expense.id, true)
          } else {
            onUpdate(`Failed to update expense: ${res.status}`, expense.id, true)
          }
        }
      }
    } catch (error) {
      onUpdate("Network error while updating expense", expense.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── Delete expense ───── */
  const deleteExpense = async (retry = false) => {
    if (!expense?.id) {
      onUpdate("Invalid expense - no ID found", expense?.id, true)
      return
    }

    try {
      setUpdating(true)
      
      const res = await fetch(`${BASE_URL}expenses/${expense.id}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return deleteExpense(true)
      }

      if (res.ok || res.status === 204) {
        setShowDeleteConfirm(false)
        onUpdate("Expense deleted successfully!", expense.id)
      } else {
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || "Only the payer can delete this expense", expense.id, true)
        } catch {
          if (res.status === 403) {
            onUpdate("Only the payer can delete this expense", expense.id, true)
          } else {
            onUpdate(`Failed to delete expense: ${res.status}`, expense.id, true)
          }
        }
      }
    } catch (error) {
      onUpdate("Network error while deleting expense", expense.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── Mark payment function ───── */
  const markMyPayment = async () => {
    if (!currentUserSplit || !expense?.id || !currentUserIdState) {
      onUpdate("Unable to find your payment information", expense.id, true)
      return
    }

    try {
      setMarkingPaid(true)
      
      console.log("[PAYMENT] Marking payment:", {
        expenseId: expense.id,
        userId: currentUserIdState,
        amount: userOwesAmount,
        splitId: currentUserSplit.id
      })

      const res = await fetch(`${BASE_URL}expenses/${expense.id}/splits/${currentUserIdState}/pay`, {
        method: "POST",
        credentials: "include"
      })

      if (res.ok) {
        onUpdate(`Payment of ${formatCurrency(userOwesAmount)} marked successfully!`, expense.id)
      } else {
        try {
          const errorData = await res.json()
          console.error("Payment error:", errorData)
          onUpdate(errorData.detail || "Failed to mark payment", expense.id, true)
        } catch {
          if (res.status === 403) {
            onUpdate("You can only mark your own payments", expense.id, true)
          } else {
            onUpdate(`Failed to mark payment: ${res.status}`, expense.id, true)
          }
        }
      }
    } catch (error) {
      console.error("Payment network error:", error)
      onUpdate("Network error while marking payment", expense.id, true)
    } finally {
      setMarkingPaid(false)
    }
  }

  /* ───── Mark split as paid ───── */
  const markSplitPaid = async (userId: number, retry = false) => {
    if (!expense?.id) {
      onUpdate("Invalid expense - no ID found", expense.id, true)
      return
    }

    try {
      const res = await fetch(`${BASE_URL}expenses/${expense.id}/splits/${userId}/pay`, {
        method: "POST",
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return markSplitPaid(userId, true)
      }

      if (res.ok) {
        onUpdate("Payment marked successfully!", expense.id)
      } else {
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || "You can only mark your own splits as paid", expense.id, true)
        } catch {
          if (res.status === 403) {
            onUpdate("You can only mark your own splits as paid", expense.id, true)
          } else {
            onUpdate(`Failed to mark payment: ${res.status}`, expense.id, true)
          }
        }
      }
    } catch (error) {
      onUpdate("Network error while marking payment", expense.id, true)
    }
  }

  /* ───── Update manual splits ───── */
  const updateManualSplits = async (retry = false) => {
    if (!expense?.id) {
      onUpdate("Invalid expense - no ID found", expense.id, true)
      return
    }

    const totalSplits = manualSplits.reduce((sum, split) => sum + split.amount, 0)
    if (Math.abs(totalSplits - expense.amount) > 0.01) {
      onUpdate(`Split amounts must equal expense amount. Expected: ${expense.amount}, Got: ${totalSplits}`, expense.id, true)
      return
    }

    try {
      setUpdating(true)
      
      const res = await fetch(`${BASE_URL}expenses/${expense.id}/splits`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualSplits)
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return updateManualSplits(true)
      }

      if (res.ok) {
        setShowManualSplitModal(false)
        onUpdate("Expense splits updated successfully!", expense.id)
      } else {
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || "Only the payer can update expense splits", expense.id, true)
        } catch {
          if (res.status === 403) {
            onUpdate("Only the payer can update expense splits", expense.id, true)
          } else if (res.status === 405) {
            onUpdate("Manual split updates not supported. Please contact support.", expense.id, true)
          } else if (res.status === 400) {
            onUpdate("Invalid split amounts - splits must equal expense total", expense.id, true)
          } else if (res.status === 500) {
            onUpdate("Server error updating splits. Please try again.", expense.id, true)
          } else {
            onUpdate(`Failed to update splits: ${res.status}`, expense.id, true)
          }
        }
      }
    } catch (error) {
      onUpdate("Network error while updating splits", expense.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── Token refresh ───── */
  const refreshToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST", credentials: "include"
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  /* ───── Helper functions ───── */
  const categoryColor = (category: ExpenseCategory) => ({
    accommodation: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    transportation: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    food: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
    activities: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700",
    shopping: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700",
    emergency: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    other: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700"
  }[category] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700")

  const statusColor = (status: ExpenseStatus) => ({
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
    approved: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
    rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
    settled: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
  }[status] || "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700")

  const statusIcon = (status: ExpenseStatus) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      settled: <Receipt className="w-4 h-4" />
    }
    return icons[status] || <Clock className="w-4 h-4" />
  }

  const categoryIcon = (category: ExpenseCategory) => {
    const icons = {
      accommodation: "🏠",
      transportation: "🚗",
      food: "🍽️",
      activities: "🎯",
      shopping: "🛍️",
      emergency: "🚨",
      other: "📝"
    }
    return icons[category] || "📝"
  }

  const formatCurrency = (amount: number, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric"
      })
    } catch {
      return "Invalid date"
    }
  }

  const isCurrentUserSplit = (split: ExpenseSplit) => {
    return currentUserIdState && split.user_id === currentUserIdState
  }

  if (!expense) {
    return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Expense data not available</div>
  }

  // ✅ Show loading state while fetching user
  if (loadingUser) {
    return (
      <Card className="relative overflow-hidden border shadow-lg border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700">
        <div className="p-6 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading user information...</span>
          </div>
        </div>
      </Card>
    )
  }

  const paidMembers = splits.filter(s => s.is_paid).length
  const totalMembers = splits.length

  return (
    <>
      <Card className="relative overflow-hidden border hover:shadow-lg transition-all duration-300 shadow-lg opacity-100 border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700">
        {isEditing ? (
          /* ──── EDIT MODE ──── */
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold text-[#1e40af] dark:text-blue-400 mb-4">
              <Edit className="w-5 h-5" />
              Editing Expense
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title *</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                placeholder="Expense title"
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Expense description"
                rows={3}
                className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Amount</label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Currency</label>
                <select
                  value={editForm.currency}
                  onChange={(e) => setEditForm({...editForm, currency: e.target.value})}
                  className="w-full p-2 border rounded-md bg-background dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value as ExpenseCategory})}
                  className="w-full p-2 border rounded-md bg-background dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value={ExpenseCategory.ACCOMMODATION}>Accommodation</option>
                  <option value={ExpenseCategory.TRANSPORTATION}>Transportation</option>
                  <option value={ExpenseCategory.FOOD}>Food</option>
                  <option value={ExpenseCategory.ACTIVITIES}>Activities</option>
                  <option value={ExpenseCategory.SHOPPING}>Shopping</option>
                  <option value={ExpenseCategory.EMERGENCY}>Emergency</option>
                  <option value={ExpenseCategory.OTHER}>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date</label>
                <Input
                  type="date"
                  value={editForm.expense_date}
                  onChange={(e) => setEditForm({...editForm, expense_date: e.target.value})}
                  className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setEditForm({
                    title: expense.title || "",
                    description: expense.description || "",
                    amount: expense.amount || 0,
                    currency: expense.currency || "INR",
                    category: expense.category || ExpenseCategory.OTHER,
                    expense_date: expense.expense_date ? new Date(expense.expense_date).toISOString().split('T')[0] : ""
                  })
                }}
                disabled={updating}
                variant="outline"
                className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={updateExpense}
                disabled={updating || !editForm.title.trim()}
                className="flex-1 bg-gradient-to-r from-[#06b6d4] to-[#1e40af] hover:from-[#06b6d4]/90 hover:to-[#1e40af]/90 text-white"
              >
                {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          /* ──── VIEW MODE ──── */
          <>
            {/* Header Section */}
            <div className="p-6 pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{categoryIcon(expense.category)}</span>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{expense.title}</h3>
                    {isExpenseOwner && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700 text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Owner
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={`${categoryColor(expense.category)} border`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                    </Badge>
                    <Badge className={`${statusColor(expense.status)} border`}>
                      {statusIcon(expense.status)}
                      <span className="ml-1">{expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}</span>
                    </Badge>
                  </div>

                  {expense.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{expense.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(expense.expense_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>Paid by {expense.payer_name || `User ${expense.paid_by}`}</span>
                      {currentUserIdState === expense.paid_by && (
                        <span className="text-[#1e40af] dark:text-blue-400 font-medium">(You)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-[#06b6d4]/10 border-[#06b6d4]/20 dark:border-cyan-700 dark:hover:bg-cyan-900/20"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Amount Display */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#1e40af] dark:text-blue-400">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">total expense</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowSplitModal(true)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-[#1e40af]/10 border-[#1e40af]/20 dark:border-blue-700 dark:hover:bg-blue-900/20"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    View Splits
                  </Button>
                  <Button
                    onClick={() => setShowManualSplitModal(true)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-[#06b6d4]/10 border-[#06b6d4]/20 dark:border-cyan-700 dark:hover:bg-cyan-900/20"
                  >
                    <Calculator className="w-4 h-4 mr-1" />
                    Manual Split
                  </Button>
                </div>
              </div>
            </div>

            {/* ✅ PROMINENT PAYMENT STATUS SECTION - Now shows when user is loaded */}
            {currentUserIdState && currentUserSplit && (
              <div className={`mx-6 mb-6 p-5 rounded-xl border-2 shadow-lg transition-all duration-300 ${
                hasUserPaid 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-400 dark:border-green-600' 
                  : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-red-400 dark:border-red-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full shadow-md ${
                      hasUserPaid 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}>
                      {hasUserPaid ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-white animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold text-xl ${
                        hasUserPaid 
                          ? 'text-green-700 dark:text-green-300' 
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {hasUserPaid ? '✅ Payment Completed!' : '🔴 Payment Required'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-lg ${
                          hasUserPaid 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          Your share: <span className="font-bold text-2xl">{formatCurrency(userOwesAmount)}</span>
                        </p>
                        {hasUserPaid && <Badge className="bg-green-200 text-green-800 text-xs">PAID</Badge>}
                      </div>
                    </div>
                  </div>
                  
                  {/* BIG PROMINENT PAYMENT BUTTON */}
                  {!hasUserPaid ? (
                    <Button
                      onClick={markMyPayment}
                      disabled={markingPaid}
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-8 py-4 text-lg font-bold"
                    >
                      {markingPaid ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          Marking Paid...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-6 h-6 mr-3" />
                          Mark as Paid
                          <Sparkles className="w-5 h-5 ml-3 animate-pulse" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3 px-6 py-3 bg-green-100 dark:bg-green-900/50 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-md">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div className="text-center">
                        <div className="font-bold text-green-700 dark:text-green-300 text-lg">PAID</div>
                        <div className="text-sm text-green-600 dark:text-green-400">All settled!</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Split Summary Section */}
            {splits.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/20 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#06b6d4] dark:text-cyan-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Split among {splits.length} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 dark:text-green-400 font-medium">{paidMembers} paid</span>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">{totalMembers - paidMembers} pending</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-[#06b6d4] to-[#1e40af] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${totalMembers > 0 ? (paidMembers / totalMembers) * 100 : 0}%` }}
                  ></div>
                </div>

                {/* Member Split Preview */}
                <div className="grid grid-cols-2 gap-2">
                  {splits.slice(0, 4).map((split) => (
                    <div 
                      key={split.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-sm border transition-all duration-200 ${
                        split.is_paid 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                          : isCurrentUserSplit(split)
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                      }`}
                    >
                      <span className="font-medium truncate dark:text-gray-100">
                        {split.user_name || `User ${split.user_id}`}
                        {isCurrentUserSplit(split) && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">(You)</span>
                        )}
                      </span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-semibold dark:text-gray-100">
                          {formatCurrency(split.amount)}
                        </span>
                        {split.is_paid ? (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                    </div>
                  ))}
                  {splits.length > 4 && (
                    <div className="col-span-2 text-center text-sm text-gray-500 dark:text-gray-400 py-2">
                      +{splits.length - 4} more members
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Receipt Section */}
            {expense.receipt_url && (
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/20">
                <a 
                  href={expense.receipt_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-[#1e40af] dark:text-blue-400 hover:text-[#06b6d4] dark:hover:text-cyan-400 transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  <span className="text-sm font-medium">View Receipt</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </a>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Split Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto dark:bg-gray-900">
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold dark:text-gray-100">Expense Splits</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(expense.amount)} split among {splits.length} members
                  </p>
                </div>
                <Button 
                  onClick={() => setShowSplitModal(false)}
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {splits.map((split) => (
                  <div 
                    key={split.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      split.is_paid 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                        : isCurrentUserSplit(split)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                          split.is_paid 
                            ? 'bg-green-500' 
                            : isCurrentUserSplit(split)
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}>
                          {(split.user_name || `User ${split.user_id}`).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium dark:text-gray-100">
                            {split.user_name || `User ${split.user_id}`}
                            {isCurrentUserSplit(split) && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">(You)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(split.amount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {split.is_paid ? (
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => markSplitPaid(split.user_id)}
                            size="sm"
                            className="bg-gradient-to-r from-[#1e40af] to-[#06b6d4] hover:from-[#1e40af]/90 hover:to-[#06b6d4]/90 text-white"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {split.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-13">
                        Note: {split.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Manual Split Modal - keeping same as before */}
      {showManualSplitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto dark:bg-gray-900">
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold dark:text-gray-100">Manual Split Configuration</h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Expense Total: {formatCurrency(expense.amount)}
                    </span>
                    <span className={`font-medium ${
                      Math.abs(manualSplits.reduce((sum, split) => sum + split.amount, 0) - expense.amount) < 0.01 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      Split Total: {formatCurrency(manualSplits.reduce((sum, split) => sum + split.amount, 0))}
                    </span>
                    {Math.abs(manualSplits.reduce((sum, split) => sum + split.amount, 0) - expense.amount) < 0.01 && (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>
                </div>
                <Button 
                  onClick={() => setShowManualSplitModal(false)}
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {manualSplits.map((split, index) => {
                  const user = splits.find(s => s.user_id === split.user_id)
                  const isCurrentUser = currentUserIdState === split.user_id
                  return (
                    <div key={split.user_id} className={`p-4 border rounded-lg transition-colors ${
                      isCurrentUser 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' 
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-600'
                    }`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          isCurrentUser ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          {(user?.user_name || `User ${split.user_id}`).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium dark:text-gray-100">
                          {user?.user_name || `User ${split.user_id}`}
                          {isCurrentUser && <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">(You)</span>}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Amount *</label>
                          <Input
                            type="number"
                            value={split.amount}
                            onChange={(e) => {
                              const newSplits = [...manualSplits]
                              newSplits[index].amount = parseFloat(e.target.value) || 0
                              setManualSplits(newSplits)
                            }}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="focus:ring-2 focus:ring-[#1e40af]/20 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notes</label>
                          <Input
                            value={split.notes}
                            onChange={(e) => {
                              const newSplits = [...manualSplits]
                              newSplits[index].notes = e.target.value
                              setManualSplits(newSplits)
                            }}
                            placeholder="Optional notes"
                            className="focus:ring-2 focus:ring-[#1e40af]/20 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => {
                            const equalAmount = expense.amount / manualSplits.length
                            const newSplits = [...manualSplits]
                            newSplits[index].amount = Math.round(equalAmount * 100) / 100
                            setManualSplits(newSplits)
                          }}
                        >
                          Equal Split
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                          onClick={() => {
                            const newSplits = [...manualSplits]
                            newSplits[index].amount = 0
                            setManualSplits(newSplits)
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={`mt-4 p-3 rounded-lg border ${
                Math.abs(manualSplits.reduce((sum, split) => sum + split.amount, 0) - expense.amount) < 0.01
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300'
              }`}>
                <div className="flex items-center justify-between text-sm">
                  <span>Balance Check:</span>
                  <span className="font-medium">
                    {Math.abs(manualSplits.reduce((sum, split) => sum + split.amount, 0) - expense.amount) < 0.01 
                      ? '✓ Balanced' 
                      : `${manualSplits.reduce((sum, split) => sum + split.amount, 0) > expense.amount ? '+' : ''}${formatCurrency(manualSplits.reduce((sum, split) => sum + split.amount, 0) - expense.amount)} difference`
                    }
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => setShowManualSplitModal(false)}
                  disabled={updating}
                  variant="outline"
                  className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={updateManualSplits}
                  disabled={updating || Math.abs(manualSplits.reduce((sum, split) => sum + split.amount, 0) - expense.amount) >= 0.01}
                  className="flex-1 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] text-white disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Update Splits
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 dark:bg-gray-900">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Delete Expense</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{expense?.title || 'this expense'}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={updating}
                  variant="outline"
                  className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={deleteExpense}
                  disabled={updating}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Delete Expense
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
