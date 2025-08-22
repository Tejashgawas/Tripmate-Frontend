"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card }   from "@/components/ui/card"
import { Input }  from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge }  from "@/components/ui/badge"

import {
  Check, Edit, Trash2, UserPlus, X, Save, Loader2,
  Users, Calendar, AlertTriangle, CheckCircle,
} from "lucide-react"

const BASE_URL = "https://tripmate-39hm.onrender.com/"

enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent"
}

enum TaskCategory {
  DOCUMENTS = "documents",
  ACTIVITIES = "activities",
  FOOD = "food",
  ACCOMMODATION = "accommodation",
  TRANSPORT = "transport",
  SHOPPING = "shopping",
  OTHER = "other"
}

interface User {
  id: number
  username?: string
  email?: string
}

// ✅ NEW: Interface for current user from /me/ endpoint
interface CurrentUser {
  id: number
  email: string
  username: string
  role: string
}

interface TaskCompletion {
  id: number
  task_id: number
  completed_by: number
  completed_at: string
  notes?: string
  user_name?: string
}

interface TaskAssignment {
  id: number
  task_id: number
  assigned_to: number
  assigned_by: number
  assigned_at: string
  notes?: string
  assigned_user_name?: string
  assigner_name?: string
}

interface Task {
  id: number
  trip_id: number
  title: string
  description?: string
  priority: TaskPriority
  category: TaskCategory
  is_completed: boolean
  created_at: string
  updated_at: string
  creator_name?: string
  created_by?: number
  due_date?: string
  assignments?: TaskAssignment[]
  completions?: TaskCompletion[]
}

// ✅ UPDATED: Added isError parameter to interface
interface TaskComponentProps {
  task: Task
  tripId: number
  onUpdate: (message: string, taskId?: number, isError?: boolean) => void
}

export default function TaskComponent({ task, tripId, onUpdate }: TaskComponentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [displayCompleted, setDisplayCompleted] = useState(false)
  
  const [editForm, setEditForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || TaskPriority.MEDIUM,
    category: task?.category || TaskCategory.OTHER,
  })
  
  const [tripMembers, setTripMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  // Safe accessors with fallbacks
  const taskAssignments = task?.assignments || []
  const taskCompletions = task?.completions || []

  // Permission calculations
  const isAssignedTask = taskAssignments.length > 0
  const isUnassignedTask = taskAssignments.length === 0
  
  // Check if current user is assigned to this task
  const isCurrentUserAssigned = currentUser && isAssignedTask && taskAssignments.some(
    assignment => assignment.assigned_to === currentUser.id
  )

  // Checkbox permission logic
  const canToggleCompletion = isUnassignedTask || isCurrentUserAssigned

  /* ───── token refresh ───── */
  const refreshToken = async () => {
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST", credentials: "include"
      })
      return response.ok
    } catch {
      return false
    }
  }

  // ✅ REMOVED: showAuthError function - now using onUpdate with error flag

  // Fetch current user with token refresh support
  const fetchCurrentUser = async (retry = false) => {
    try {
      const res = await fetch(`${BASE_URL}me/`, {
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return fetchCurrentUser(true)
      }

      if (res.ok) {
        const user: CurrentUser = await res.json()
        setCurrentUser(user)
        console.log("[TASK] Current user loaded:", {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        })
      } else {
        console.error("[TASK] Failed to fetch current user:", res.status)
      }
    } catch (error) {
      console.error("[TASK] Error fetching current user:", error)
    }
  }

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  // Update display completion when task or user changes
  useEffect(() => {
    const newDisplayCompleted = isAssignedTask 
      ? task.is_completed  // For assigned tasks, use backend is_completed flag
      : (taskCompletions.length > 0 || task.is_completed)  // For unassigned, use completion records
    
    setDisplayCompleted(newDisplayCompleted)
    console.log(`[TASK ${task?.id}] Display completed updated:`, {
      currentUserId: currentUser?.id,
      currentUsername: currentUser?.username,
      isAssignedTask,
      taskIsCompleted: task.is_completed,
      completionsCount: taskCompletions.length,
      displayCompleted: newDisplayCompleted,
      canToggle: canToggleCompletion,
      isUserAssigned: isCurrentUserAssigned
    })
  }, [task?.id, task?.is_completed, taskCompletions.length, isAssignedTask, canToggleCompletion, currentUser])

  // Update edit form when task prop changes
  useEffect(() => {
    setEditForm({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || TaskPriority.MEDIUM,
      category: task?.category || TaskCategory.OTHER,
    })
  }, [task?.id, task?.title, task?.description, task?.priority, task?.category])

  /* ───── toggle task completion ───── */
  const toggleCompletion = async (retry = false) => {
    if (!task?.id) return
    
    // Check permission before attempting
    if (!canToggleCompletion) {
      console.log(`[TASK] Cannot toggle - user ${currentUser?.username} (${currentUser?.id}) not authorized`)
      if (isAssignedTask) {
        // ✅ FIXED: Use onUpdate with error flag instead of alert
        onUpdate("You don't have permission to complete this assigned task (only assigned members can complete)", task.id, true)
      }
      return
    }
    
    try {
      setUpdating(true)
      
      console.log(`[TASK] User ${currentUser?.username} (${currentUser?.id}) toggling completion for task ${task.id}`)
      console.log(`[TASK] Can toggle: ${canToggleCompletion}, Display completed: ${displayCompleted}`)
      
      if (displayCompleted) {
        console.log(`[TASK] Task appears completed, calling DELETE to uncomplete`)
        const res = await fetch(`${BASE_URL}trips/${tripId}/checklist/${task.id}/complete`, {
          method: "DELETE",
          credentials: "include"
        })

        if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
          if (await refreshToken()) return toggleCompletion(true)
        }

        if (res.ok || res.status === 204) {
          console.log(`[TASK] Successfully uncompleted task ${task.id}`)
          // Optimistic update for unassigned tasks
          if (isUnassignedTask) setDisplayCompleted(false)
          onUpdate("Task marked as pending", task.id)
        } else if (res.status === 403) {
          // ✅ FIXED: Parse backend error message
          try {
            const errorData = await res.json()
            onUpdate(errorData.detail || "You don't have permission to uncomplete this task", task.id, true)
          } catch {
            onUpdate("You don't have permission to uncomplete this task", task.id, true)
          }
        } else {
          // ✅ FIXED: Parse backend error message
          try {
            const errorData = await res.json()
            onUpdate(errorData.detail || `Failed to uncomplete task: ${res.status}`, task.id, true)
          } catch {
            onUpdate(`Failed to uncomplete task: ${res.status}`, task.id, true)
          }
        }
      } else {
        console.log(`[TASK] Task appears not completed, calling POST to complete`)
        const res = await fetch(`${BASE_URL}trips/${tripId}/checklist/${task.id}/complete`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes: "Task completed"
          })
        })

        if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
          if (await refreshToken()) return toggleCompletion(true)
        }

        if (res.ok || res.status === 201) {
          console.log(`[TASK] Successfully completed task ${task.id}`)
          // Optimistic update for unassigned tasks
          if (isUnassignedTask) setDisplayCompleted(true)
          onUpdate("Task completed!", task.id)
        } else if (res.status === 403) {
          // ✅ FIXED: Parse backend error message
          try {
            const errorData = await res.json()
            onUpdate(errorData.detail || "You don't have permission to complete this task", task.id, true)
          } catch {
            onUpdate("You don't have permission to complete this task", task.id, true)
          }
        } else {
          // ✅ FIXED: Parse backend error message
          try {
            const errorData = await res.json()
            onUpdate(errorData.detail || `Failed to complete task: ${res.status}`, task.id, true)
          } catch {
            if (res.status === 400) {
              console.log("[TASK] Task already completed, syncing frontend state")
              if (isUnassignedTask) setDisplayCompleted(true)
              onUpdate("Task state synchronized", task.id)
            } else {
              onUpdate(`Failed to complete task: ${res.status}`, task.id, true)
            }
          }
        }
      }
    } catch (error) {
      console.error("[TASK] Error toggling completion:", error)
      // ✅ FIXED: Use onUpdate with error flag instead of alert
      onUpdate("Network error while updating task", task.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── update task ───── */
  const updateTask = async (retry = false) => {
    if (!task?.id) return
    
    try {
      setUpdating(true)
      const res = await fetch(`${BASE_URL}trips/${tripId}/checklist/${task.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return updateTask(true)
      }

      if (res.ok) {
        setIsEditing(false)
        onUpdate("Task updated successfully!")
      } else if (res.status === 403) {
        // ✅ FIXED: Parse backend error message
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || "Only the creator can update this task", task.id, true)
        } catch {
          onUpdate("Only the creator can update this task", task.id, true)
        }
      } else {
        // ✅ FIXED: Parse backend error message
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || `Failed to update task: ${res.status}`, task.id, true)
        } catch {
          onUpdate(`Failed to update task: ${res.status}`, task.id, true)
        }
      }
    } catch (error) {
      console.error("[TASK] Error updating task:", error)
      // ✅ FIXED: Use onUpdate with error flag instead of alert
      onUpdate("Network error while updating task", task.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── delete task ───── */
  const deleteTask = async (retry = false) => {
    if (!task?.id) return
    
    try {
      setUpdating(true)
      const res = await fetch(`${BASE_URL}trips/${tripId}/checklist/${task.id}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return deleteTask(true)
      }

      if (res.ok || res.status === 204) {
        setShowDeleteConfirm(false)
        onUpdate("Task deleted successfully!")
      } else if (res.status === 403) {
        // ✅ FIXED: Parse backend error message
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || "Only the creator can delete this task", task.id, true)
        } catch {
          onUpdate("Only the creator can delete this task", task.id, true)
        }
      } else {
        // ✅ FIXED: Parse backend error message
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || `Failed to delete task: ${res.status}`, task.id, true)
        } catch {
          onUpdate(`Failed to delete task: ${res.status}`, task.id, true)
        }
      }
    } catch (error) {
      console.error("[TASK] Error deleting task:", error)
      // ✅ FIXED: Use onUpdate with error flag instead of alert
      onUpdate("Network error while deleting task", task.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── fetch trip members ───── */
  const fetchTripMembers = async (retry = false) => {
    try {
      setLoading(true)
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
        console.log(`[TASK] Loaded ${users.length} trip members`)
      }
    } catch (error) {
      console.error("[TASK] Error fetching trip members:", error)
    } finally {
      setLoading(false)
    }
  }

  /* ───── assign user to task ───── */
  const assignUser = async (userId: number, retry = false) => {
    if (!task?.id || !userId) return
    
    try {
      const requestData = { assigned_to: userId }
      const res = await fetch(`${BASE_URL}trips/${tripId}/checklist/${task.id}/assign`, {
        method: "POST",
        credentials: "include",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestData)
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return assignUser(userId, true)
      }

      if (res.ok || res.status === 201) {
        setShowAssignModal(false)
        onUpdate("User assigned successfully!")
      } else if (res.status === 403) {
        // ✅ FIXED: Parse backend error message
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || "You don't have permission to assign users to this task", task.id, true)
        } catch {
          onUpdate("You don't have permission to assign users to this task", task.id, true)
        }
      } else {
        // ✅ FIXED: Parse backend error message
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || `Failed to assign user: ${res.status}`, task.id, true)
        } catch {
          onUpdate(`Failed to assign user: ${res.status}`, task.id, true)
        }
      }
    } catch (error) {
      console.error("[TASK] Error assigning user:", error)
      // ✅ FIXED: Use onUpdate with error flag instead of alert
      onUpdate("Network error while assigning user", task.id, true)
    }
  }

  /* ───── unassign user from task ───── */
  const unassignUser = async (userId: number, retry = false) => {
    if (!task?.id || !userId) return
    
    try {
      const res = await fetch(`${BASE_URL}trips/${tripId}/checklist/${task.id}/assign/${userId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        if (await refreshToken()) return unassignUser(userId, true)
      }

      if (res.ok || res.status === 204) {
        onUpdate("User unassigned successfully!")
      } else if (res.status === 403) {
        // ✅ FIXED: Parse backend error message
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || "Not authorized to remove this assignment", task.id, true)
        } catch {
          onUpdate("Not authorized to remove this assignment", task.id, true)
        }
      } else {
        // ✅ FIXED: Parse backend error message
        try {
          const errorData = await res.json()
          onUpdate(errorData.detail || `Failed to unassign user: ${res.status}`, task.id, true)
        } catch {
          onUpdate(`Failed to unassign user: ${res.status}`, task.id, true)
        }
      }
    } catch (error) {
      console.error("[TASK] Error unassigning user:", error)
      // ✅ FIXED: Use onUpdate with error flag instead of alert
      onUpdate("Network error while unassigning user", task.id, true)
    }
  }

  /* ───── helper functions ───── */
  const priorityColor = (priority: TaskPriority) => ({
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }[priority] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300")

  const categoryColor = (category: TaskCategory) => ({
    documents: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    activities: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    food: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    accommodation: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    transport: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    shopping: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  }[category] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300")

  const fmt = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { 
        year: "numeric", month: "short", day: "numeric"
      })
    } catch {
      return "Invalid date"
    }
  }

  // Early return if task is not available
  if (!task) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2"/>
          <p>Task data not available</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className={`p-6 transition-all duration-300 ${
        displayCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-background/80 backdrop-blur-sm border-border/50'
      } ${isEditing ? 'shadow-xl shadow-[#1e40af]/15 border-[#1e40af]/50' : 'hover:shadow-lg'}`}>
        
        {isEditing ? (
          /* ──── EDIT MODE ──── */
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#1e40af] flex items-center justify-center">
                <Edit className="w-4 h-4 text-white"/>
              </div>
              <h3 className="text-lg font-semibold text-[#1e40af]">Editing Task</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Task description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value as TaskPriority})}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value={TaskPriority.LOW}>Low</option>
                    <option value={TaskPriority.MEDIUM}>Medium</option>
                    <option value={TaskPriority.HIGH}>High</option>
                    <option value={TaskPriority.URGENT}>Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value as TaskCategory})}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value={TaskCategory.DOCUMENTS}>Documents</option>
                    <option value={TaskCategory.ACTIVITIES}>Activities</option>
                    <option value={TaskCategory.FOOD}>Food</option>
                    <option value={TaskCategory.ACCOMMODATION}>Accommodation</option>
                    <option value={TaskCategory.TRANSPORT}>Transport</option>
                    <option value={TaskCategory.SHOPPING}>Shopping</option>
                    <option value={TaskCategory.OTHER}>Other</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setEditForm({
                      title: task.title || "",
                      description: task.description || "",
                      priority: task.priority || TaskPriority.MEDIUM,
                      category: task.category || TaskCategory.OTHER,
                    })
                  }}
                  disabled={updating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateTask()}
                  disabled={updating || !editForm.title.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <Save className="h-4 w-4 mr-2"/>}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ──── VIEW MODE ──── */
          <div className="space-y-4">
            {/* Task Header */}
            <div className="flex items-start gap-4">
              {/* Conditional checkbox based on permissions */}
              {canToggleCompletion ? (
                // Interactive checkbox - user CAN toggle
                <button
                  onClick={() => toggleCompletion()}
                  disabled={updating}
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                    displayCompleted 
                      ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' 
                      : 'border-gray-300 hover:border-[#1e40af] hover:bg-[#1e40af]/10'
                  } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={isAssignedTask ? `Complete your assigned task (${currentUser?.username})` : "Toggle task completion"}
                >
                  {updating ? (
                    <Loader2 className="w-3 h-3 animate-spin"/>
                  ) : displayCompleted ? (
                    <Check className="w-4 h-4"/>
                  ) : null}
                </button>
              ) : (
                // Read-only indicator - user CANNOT toggle
                <div 
                  className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center ${
                    displayCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300'
                  } opacity-60`}
                  title={`Task managed by assigned members (you are ${currentUser?.username})`}
                >
                  {displayCompleted ? <Check className="w-4 h-4"/> : null}
                </div>
              )}

              {/* Task Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className={`text-lg font-semibold ${displayCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title || "Untitled Task"}
                    </h3>
                    {/* Permission status indicators with username */}
                    {isAssignedTask && !canToggleCompletion && (
                      <p className="text-xs text-amber-600 mt-1">
                        🔒 Assigned to other members (you are {currentUser?.username})
                      </p>
                    )}
                    {isAssignedTask && canToggleCompletion && (
                      <p className="text-xs text-blue-600 mt-1">
                        👤 You ({currentUser?.username}) are assigned to this task
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={priorityColor(task.priority)}>
                      {(task.priority || "medium").charAt(0).toUpperCase() + (task.priority || "medium").slice(1)}
                    </Badge>
                    <Badge className={categoryColor(task.category)}>
                      {(task.category || "other").charAt(0).toUpperCase() + (task.category || "other").slice(1)}
                    </Badge>
                  </div>
                </div>

                {task.description && (
                  <p className={`text-muted-foreground mb-3 ${displayCompleted ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                )}

                {/* Assignments */}
                {taskAssignments.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-muted-foreground"/>
                    <span className="text-sm text-muted-foreground">Assigned to:</span>
                    <div className="flex flex-wrap gap-2">
                      {taskAssignments.map((assignment) => {
                        const username = assignment?.assigned_user_name || `User ${assignment?.assigned_to}`
                        return (
                          <div key={assignment.assigned_to} className="flex items-center gap-1 bg-[#1e40af]/10 text-[#1e40af] px-2 py-1 rounded-md text-xs">
                            <span>{username}</span>
                            <button
                              onClick={() => unassignUser(assignment.assigned_to)}
                              className="hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full p-0.5"
                              title="Unassign user (authorization handled by backend)"
                            >
                              <X className="h-3 w-3 text-red-600"/>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Completions */}
                {taskCompletions.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-green-600"/>
                    <span className="text-sm text-green-600">Completed by:</span>
                    <div className="flex flex-wrap gap-2">
                      {taskCompletions.map((completion) => {
                        const username = completion?.user_name || `User ${completion?.completed_by}`
                        return (
                          <span key={completion.id} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-md text-xs">
                            {username}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3"/>
                    Created: {fmt(task.created_at)}
                  </span>
                  {task.creator_name && (
                    <span>By: {task.creator_name}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border/30">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  fetchTripMembers()
                  setShowAssignModal(true)
                }}
                className="hover:bg-[#1e40af]/10"
                title="Assign user (authorization handled by backend)"
              >
                <UserPlus className="h-4 w-4 text-[#1e40af]"/>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="hover:bg-[#06b6d4]/10"
                title="Edit task (authorization handled by backend)"
              >
                <Edit className="h-4 w-4 text-[#06b6d4]"/>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="hover:bg-red-100 dark:hover:bg-red-900/20"
                title="Delete task (authorization handled by backend)"
              >
                <Trash2 className="h-4 w-4 text-red-600"/>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Assign User</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAssignModal(false)}>
                <X className="h-4 w-4"/>
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#1e40af]"/>
              </div>
            ) : tripMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3"/>
                <p className="text-muted-foreground">No trip members found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tripMembers.map((member) => {
                  if (!member?.id) return null
                  
                  const isAssigned = taskAssignments.some(a => a?.assigned_to === member.id)
                  const displayName = member.username || member.email || `User ${member.id}`
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{displayName}</div>
                        {member.email && member.username && (
                          <div className="text-sm text-muted-foreground">{member.email}</div>
                        )}
                      </div>
                      {isAssigned ? (
                        <Badge className="bg-green-100 text-green-800">Assigned</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => assignUser(member.id)}
                          className="bg-[#1e40af] hover:bg-[#1e40af]/90 text-white"
                        >
                          Assign
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-5 h-5 text-red-600"/>
            </div>
            <h3 className="font-semibold text-lg mb-2 text-center">Delete Task</h3>
            <p className="text-muted-foreground text-center mb-6">
              Are you sure you want to delete "{task?.title || 'this task'}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={updating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteTask()}
                disabled={updating}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                {updating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : null}
                Delete Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
