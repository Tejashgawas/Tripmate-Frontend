"use client"

export enum ExpenseCategory {
  ACCOMMODATION = "accommodation",
  TRANSPORTATION = "transportation", 
  FOOD = "food",
  ACTIVITIES = "activities",
  SHOPPING = "shopping",
  EMERGENCY = "emergency",
  OTHER = "other"
}

export enum ExpenseStatus {
  PENDING = "pending",
  APPROVED = "approved", 
  REJECTED = "rejected",
  SETTLED = "settled"
}

export interface User {
  id: number
  username?: string
  email?: string
}

export interface ExpenseMember {
  id: number
  expense_id: number
  user_id: number
  is_included: boolean
  created_at: string
  user_name?: string
  user_email?: string
}

export interface ExpenseSplit {
  id: number
  expense_id: number
  user_id: number
  amount: number
  is_paid: boolean
  paid_at?: string
  notes?: string
  user_name?: string
  user_email?: string
}

export interface Expense {
  id: number
  trip_id: number
  title: string
  description?: string
  amount: number
  currency: string
  category: ExpenseCategory
  status: ExpenseStatus
  expense_date: string
  paid_by: number
  created_at: string
  updated_at: string
  receipt_url?: string
  is_split_equally: boolean
  payer_name?: string
  payer_email?: string
  members: ExpenseMember[]
  splits: ExpenseSplit[]
}

export interface UserBalance {
  user_id: number
  user_name?: string
  user_email?: string
  total_paid: number
  total_owed: number
  net_balance: number
}

export interface SettlementSummary {
  from_user_id: number
  from_user_name?: string
  to_user_id: number
  to_user_name?: string
  amount: number
  currency: string
}

export interface ExpenseSettlement {
  id: number
  trip_id: number
  from_user_id: number
  to_user_id: number
  amount: number
  currency: string
  settlement_date: string
  notes?: string
  is_confirmed: boolean
  from_user_name?: string
  to_user_name?: string
}

export interface TripExpenseSummary {
  trip_id: number
  total_expenses: number
  total_settled: number
  total_pending: number
  currency: string
  user_balances: UserBalance[]
  settlements_needed: SettlementSummary[]
  expenses_by_category: Record<string, number>
  expenses_by_status: Record<string, number>
}
