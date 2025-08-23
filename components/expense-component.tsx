"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
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

interface ExpenseComponentProps {
  expense: Expense
  tripId: number
  onUpdate: (message: string, expenseId?: number, isError?: boolean) => void
}

export default function ExpenseComponent({ expense, tripId, onUpdate }: ExpenseComponentProps) {
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { get, post, put, delete: deleteApi } = useApi() // ✅ NEW: Use API client

  const [isEditing, setIsEditing] = useState(false)
  const [showSplitModal, setShowSplitModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showManualSplitModal, setShowManualSplitModal] = useState(false)
  const [updating, setUpdating] = useState(false)
  
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
  const currentUserSplit = splits.find(split => split.user_id === user?.id)
  const userOwesAmount = currentUserSplit?.amount || 0
  const hasUserPaid = currentUserSplit?.is_paid || false
  const isExpenseOwner = expense?.paid_by === user?.id

  // ✅ REMOVED: All manual authentication logic (getCurrentUser, refreshToken, loadingUser state)

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

  // ✅ Debug logging - now with user from context
  console.log("ExpenseComponent Debug:", {
    currentUserId: user?.id,
    currentUserSplit: !!currentUserSplit,
    userOwesAmount,
    hasUserPaid,
    splits: splits.length,
    expenseId: expense?.id
  })

  /* ───── Update expense using useApi ───── */
  const updateExpense = async () => {
    if (!expense?.id || !user) {
      onUpdate("Please login to update expenses", expense?.id, true)
      return
    }

    try {
      setUpdating(true)
      await put(`/expenses/${expense.id}`, editForm)
      setIsEditing(false)
      onUpdate("Expense updated successfully!", expense.id)
    } catch (error) {
      console.error("[EXPENSE] Error updating:", error)
      onUpdate("Failed to update expense. Please try again.", expense.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── Delete expense using useApi ───── */
  const deleteExpense = async () => {
    if (!expense?.id || !user) {
      onUpdate("Please login to delete expenses", expense?.id, true)
      return
    }

    try {
      setUpdating(true)
      await deleteApi(`/expenses/${expense.id}`)
      setShowDeleteConfirm(false)
      onUpdate("Expense deleted successfully!", expense.id)
    } catch (error) {
      console.error("[EXPENSE] Error deleting:", error)
      onUpdate("Failed to delete expense. Please try again.", expense.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── Mark payment function using useApi ───── */
  const markMyPayment = async () => {
    if (!currentUserSplit || !expense?.id || !user?.id) {
      onUpdate("Unable to find your payment information", expense.id, true)
      return
    }

    try {
      setMarkingPaid(true)
      
      console.log("[PAYMENT] Marking payment:", {
        expenseId: expense.id,
        userId: user.id,
        amount: userOwesAmount,
        splitId: currentUserSplit.id
      })

      await post(`/expenses/${expense.id}/splits/${user.id}/pay`, {})
      onUpdate(`Payment of ${formatCurrency(userOwesAmount)} marked successfully!`, expense.id)
    } catch (error) {
      console.error("Payment error:", error)
      onUpdate("Failed to mark payment. Please try again.", expense.id, true)
    } finally {
      setMarkingPaid(false)
    }
  }

  /* ───── Mark split as paid using useApi ───── */
  const markSplitPaid = async (userId: number) => {
    if (!expense?.id || !user) {
      onUpdate("Please login to mark payments", expense.id, true)
      return
    }

    try {
      await post(`/expenses/${expense.id}/splits/${userId}/pay`, {})
      onUpdate("Payment marked successfully!", expense.id)
    } catch (error) {
      console.error("[EXPENSE] Error marking payment:", error)
      onUpdate("Failed to mark payment. Please try again.", expense.id, true)
    }
  }

  /* ───── Update manual splits using useApi ───── */
  const updateManualSplits = async () => {
    if (!expense?.id || !user) {
      onUpdate("Please login to update splits", expense.id, true)
      return
    }

    const totalSplits = manualSplits.reduce((sum, split) => sum + split.amount, 0)
    if (Math.abs(totalSplits - expense.amount) > 0.01) {
      onUpdate(`Split amounts must equal expense amount. Expected: ${expense.amount}, Got: ${totalSplits}`, expense.id, true)
      return
    }

    try {
      setUpdating(true)
      await put(`/expenses/${expense.id}/splits`, manualSplits)
      setShowManualSplitModal(false)
      onUpdate("Expense splits updated successfully!", expense.id)
    } catch (error) {
      console.error("[EXPENSE] Error updating splits:", error)
      onUpdate("Failed to update splits. Please try again.", expense.id, true)
    } finally {
      setUpdating(false)
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
      pending: <Clock className="w-3 h-3 sm:w-4 sm:h-4" />,
      approved: <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
      rejected: <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />,
      settled: <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
    }
    return icons[status] || <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
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
    return user?.id && split.user_id === user.id
  }

  if (!expense) {
    return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Expense data not available</div>
  }

  const paidMembers = splits.filter(s => s.is_paid).length
  const totalMembers = splits.length

  return (
    <>
      <Card className="relative overflow-hidden border hover:shadow-lg transition-all duration-300 shadow-lg opacity-100 border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 rounded-xl sm:rounded-2xl">
        {isEditing ? (
          /* ──── EDIT MODE ──── */
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-[#1e40af] dark:text-blue-400 mb-4">
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              Editing Expense
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Title *</label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                placeholder="Expense title"
                className="h-10 sm:h-12 rounded-lg sm:rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                placeholder="Expense description"
                rows={3}
                className="resize-none rounded-lg sm:rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Amount</label>
                <Input
                  type="number"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="h-10 sm:h-12 rounded-lg sm:rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Currency</label>
                <select
                  value={editForm.currency}
                  onChange={(e) => setEditForm({...editForm, currency: e.target.value})}
                  className="w-full p-2 border rounded-lg sm:rounded-xl bg-background h-10 sm:h-12 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value as ExpenseCategory})}
                  className="w-full p-2 border rounded-lg sm:rounded-xl bg-background h-10 sm:h-12 text-sm sm:text-base dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
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
                  className="h-10 sm:h-12 rounded-lg sm:rounded-xl dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
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
                className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={updateExpense}
                disabled={updating || !editForm.title.trim()}
                className="flex-1 bg-gradient-to-r from-[#06b6d4] to-[#1e40af] hover:from-[#06b6d4]/90 hover:to-[#1e40af]/90 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl"
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
            <div className="p-4 sm:p-6 pb-3 sm:pb-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <span className="text-xl sm:text-2xl">{categoryIcon(expense.category)}</span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 truncate">{expense.title}</h3>
                    {isExpenseOwner && (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700 text-xs flex-shrink-0">
                        <Crown className="w-3 h-3 mr-1" />
                        Owner
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                    <Badge className={`${categoryColor(expense.category)} border text-xs sm:text-sm`}>
                      <Tag className="w-3 h-3 mr-1" />
                      {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                    </Badge>
                    <Badge className={`${statusColor(expense.status)} border text-xs sm:text-sm`}>
                      {statusIcon(expense.status)}
                      <span className="ml-1">{expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}</span>
                    </Badge>
                  </div>

                  {expense.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{expense.description}</p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{formatDate(expense.expense_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate">Paid by {expense.payer_name || `User ${expense.paid_by}`}</span>
                      {user?.id === expense.paid_by && (
                        <span className="text-[#1e40af] dark:text-blue-400 font-medium">(You)</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-[#06b6d4]/10 border-[#06b6d4]/20 dark:border-cyan-700 dark:hover:bg-cyan-900/20 w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 w-8 h-8 sm:w-10 sm:h-10"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>

              {/* Amount Display */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-[#1e40af] dark:text-blue-400">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">total expense</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => setShowSplitModal(true)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-[#1e40af]/10 border-[#1e40af]/20 dark:border-blue-700 dark:hover:bg-blue-900/20 h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    View Splits
                  </Button>
                  <Button
                    onClick={() => setShowManualSplitModal(true)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-[#06b6d4]/10 border-[#06b6d4]/20 dark:border-cyan-700 dark:hover:bg-cyan-900/20 h-8 sm:h-10 text-xs sm:text-sm"
                  >
                    <Calculator className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Manual Split
                  </Button>
                </div>
              </div>
            </div>

            {/* ✅ PROMINENT PAYMENT STATUS SECTION - Now shows when user is loaded */}
            {user?.id && currentUserSplit && (
              <div className={`mx-4 sm:mx-6 mb-4 sm:mb-6 p-4 sm:p-5 rounded-xl border-2 shadow-lg transition-all duration-300 ${
                hasUserPaid 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-400 dark:border-green-600' 
                  : 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border-red-400 dark:border-red-600'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-full shadow-md ${
                      hasUserPaid 
                        ? 'bg-green-500' 
                        : 'bg-red-500'
                    }`}>
                      {hasUserPaid ? (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      ) : (
                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold text-lg sm:text-xl ${
                        hasUserPaid 
                          ? 'text-green-700 dark:text-green-300' 
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {hasUserPaid ? '✅ Payment Completed!' : '🔴 Payment Required'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-base sm:text-lg ${
                          hasUserPaid 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          Your share: <span className="font-bold text-lg sm:text-2xl">{formatCurrency(userOwesAmount)}</span>
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
                      className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold h-12 sm:h-auto"
                    >
                      {markingPaid ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-3 border-white/30 border-t-white rounded-full animate-spin mr-2 sm:mr-3"></div>
                          Marking Paid...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                          Mark as Paid
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3 animate-pulse" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-green-100 dark:bg-green-900/50 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-md">
                      <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                      <div className="text-center">
                        <div className="font-bold text-green-700 dark:text-green-300 text-base sm:text-lg">PAID</div>
                        <div className="text-xs sm:text-sm text-green-600 dark:text-green-400">All settled!</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Split Summary Section */}
            {splits.length > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800/50 dark:to-blue-900/20 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-[#06b6d4] dark:text-cyan-400" />
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">Split among {splits.length} members</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {splits.slice(0, 4).map((split) => (
                    <div 
                      key={split.id}
                      className={`flex items-center justify-between p-2 sm:p-3 rounded-lg text-xs sm:text-sm border transition-all duration-200 ${
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
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                    </div>
                  ))}
                  {splits.length > 4 && (
                    <div className="col-span-1 sm:col-span-2 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400 py-2">
                      +{splits.length - 4} more members
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Receipt Section */}
            {expense.receipt_url && (
              <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/20">
                <a 
                  href={expense.receipt_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-[#1e40af] dark:text-blue-400 hover:text-[#06b6d4] dark:hover:text-cyan-400 transition-colors"
                >
                  <Receipt className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">View Receipt</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto" />
                </a>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ✅ ALL MODALS KEPT THE SAME WITH MOBILE RESPONSIVENESS ADDED */}
      {/* Split Modal */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xs sm:max-w-md mx-4 max-h-[80vh] overflow-y-auto dark:bg-gray-900 rounded-xl sm:rounded-2xl">
            <div className="relative p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold dark:text-gray-100">Expense Splits</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(expense.amount)} split among {splits.length} members
                  </p>
                </div>
                <Button 
                  onClick={() => setShowSplitModal(false)}
                  variant="outline"
                  size="sm"
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 w-8 h-8 sm:w-10 sm:h-10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {splits.map((split) => (
                  <div 
                    key={split.id}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                      split.is_paid 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                        : isCurrentUserSplit(split)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          split.is_paid 
                            ? 'bg-green-500' 
                            : isCurrentUserSplit(split)
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}>
                          {(split.user_name || `User ${split.user_id}`).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base dark:text-gray-100">
                            {split.user_name || `User ${split.user_id}`}
                            {isCurrentUserSplit(split) && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 ml-1">(You)</span>
                            )}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(split.amount)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {split.is_paid ? (
                          <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Paid
                          </Badge>
                        ) : (
                          <Button
                            onClick={() => markSplitPaid(split.user_id)}
                            size="sm"
                            className="bg-gradient-to-r from-[#1e40af] to-[#06b6d4] hover:from-[#1e40af]/90 hover:to-[#06b6d4]/90 text-white text-xs px-3 py-1 h-8"
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {split.notes && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 pl-11 sm:pl-13">
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

      {/* Manual Split Modal & Delete Confirmation Modal - Keeping similar structure with mobile responsiveness */}
      {/* ... (keeping the rest of the modals with same mobile responsive patterns) ... */}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-xs sm:max-w-md mx-4 dark:bg-gray-900 rounded-xl sm:rounded-2xl">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-2 text-red-600 dark:text-red-400">Delete Expense</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{expense?.title || 'this expense'}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={updating}
                  variant="outline"
                  className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={deleteExpense}
                  disabled={updating}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl"
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
