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
  Check, Edit, Trash2, UserPlus, X, Save, Loader2,
  Users, Calendar, AlertTriangle, CheckCircle,
} from "lucide-react"

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

interface TaskComponentProps {
  task: Task
  tripId: number
  onUpdate: (message: string, taskId?: number, isError?: boolean) => void
}

export default function TaskComponent({ task, tripId, onUpdate }: TaskComponentProps) {
  const { user } = useAuth() // ✅ NEW: Use auth context
  const { get, post, put, delete: deleteApi } = useApi() // ✅ NEW: Use API client
  
  const [isEditing, setIsEditing] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
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
  const isCurrentUserAssigned = user && isAssignedTask && taskAssignments.some(
    assignment => assignment.assigned_to === user.id
  )

  // Checkbox permission logic
  const canToggleCompletion = isUnassignedTask || isCurrentUserAssigned

  // ✅ REMOVED: All manual authentication logic (refreshToken, fetchCurrentUser)

  // Update display completion when task or user changes
  useEffect(() => {
    const newDisplayCompleted = isAssignedTask 
      ? task.is_completed  // For assigned tasks, use backend is_completed flag
      : (taskCompletions.length > 0 || task.is_completed)  // For unassigned, use completion records
    
    setDisplayCompleted(newDisplayCompleted)
    console.log(`[TASK ${task?.id}] Display completed updated:`, {
      currentUserId: user?.id,
      currentUsername: user?.username,
      isAssignedTask,
      taskIsCompleted: task.is_completed,
      completionsCount: taskCompletions.length,
      displayCompleted: newDisplayCompleted,
      canToggle: canToggleCompletion,
      isUserAssigned: isCurrentUserAssigned
    })
  }, [task?.id, task?.is_completed, taskCompletions.length, isAssignedTask, canToggleCompletion, user])

  // Update edit form when task prop changes
  useEffect(() => {
    setEditForm({
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || TaskPriority.MEDIUM,
      category: task?.category || TaskCategory.OTHER,
    })
  }, [task?.id, task?.title, task?.description, task?.priority, task?.category])

  /* ───── toggle task completion using useApi ───── */
  const toggleCompletion = async () => {
    if (!task?.id || !user) {
      onUpdate("Please login to update tasks", task.id, true)
      return
    }
    
    // Check permission before attempting
    if (!canToggleCompletion) {
      console.log(`[TASK] Cannot toggle - user ${user?.username} (${user?.id}) not authorized`)
      if (isAssignedTask) {
        onUpdate("You don't have permission to complete this assigned task (only assigned members can complete)", task.id, true)
      }
      return
    }
    
    try {
      setUpdating(true)
      
      console.log(`[TASK] User ${user?.username} (${user?.id}) toggling completion for task ${task.id}`)
      
      if (displayCompleted) {
        console.log(`[TASK] Task appears completed, calling DELETE to uncomplete`)
        await deleteApi(`/trips/${tripId}/checklist/${task.id}/complete`)
        console.log(`[TASK] Successfully uncompleted task ${task.id}`)
        
        // Optimistic update for unassigned tasks
        if (isUnassignedTask) setDisplayCompleted(false)
        onUpdate("Task marked as pending", task.id)
      } else {
        console.log(`[TASK] Task appears not completed, calling POST to complete`)
        await post(`/trips/${tripId}/checklist/${task.id}/complete`, {
          notes: "Task completed"
        })
        console.log(`[TASK] Successfully completed task ${task.id}`)
        
        // Optimistic update for unassigned tasks
        if (isUnassignedTask) setDisplayCompleted(true)
        onUpdate("Task completed!", task.id)
      }
    } catch (error) {
      console.error("[TASK] Error toggling completion:", error)
      onUpdate("Failed to update task status. Please try again.", task.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── update task using useApi ───── */
  const updateTask = async () => {
    if (!task?.id || !user) {
      onUpdate("Please login to update tasks", task.id, true)
      return
    }
    
    try {
      setUpdating(true)
      await put(`/trips/${tripId}/checklist/${task.id}`, editForm)
      setIsEditing(false)
      onUpdate("Task updated successfully!")
    } catch (error) {
      console.error("[TASK] Error updating task:", error)
      onUpdate("Failed to update task. Please try again.", task.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── delete task using useApi ───── */
  const deleteTask = async () => {
    if (!task?.id || !user) {
      onUpdate("Please login to delete tasks", task.id, true)
      return
    }
    
    try {
      setUpdating(true)
      await deleteApi(`/trips/${tripId}/checklist/${task.id}`)
      setShowDeleteConfirm(false)
      onUpdate("Task deleted successfully!")
    } catch (error) {
      console.error("[TASK] Error deleting task:", error)
      onUpdate("Failed to delete task. Please try again.", task.id, true)
    } finally {
      setUpdating(false)
    }
  }

  /* ───── fetch trip members using useApi ───── */
  const fetchTripMembers = async () => {
    if (!user) {
      onUpdate("Please login to view trip members", task.id, true)
      return
    }

    try {
      setLoading(true)
      const data = await get<any>(`/trip-member/trip/${tripId}`)
      const members = data?.members || data || []
      const users = Array.isArray(members) ? members.map((m: any) => m?.user || m).filter(Boolean) : []
      setTripMembers(users)
      console.log(`[TASK] Loaded ${users.length} trip members`)
    } catch (error) {
      console.error("[TASK] Error fetching trip members:", error)
      onUpdate("Failed to load trip members", task.id, true)
    } finally {
      setLoading(false)
    }
  }

  /* ───── assign user to task using useApi ───── */
  const assignUser = async (userId: number) => {
    if (!task?.id || !userId || !user) {
      onUpdate("Invalid assignment request", task.id, true)
      return
    }
    
    try {
      const requestData = { assigned_to: userId }
      await post(`/trips/${tripId}/checklist/${task.id}/assign`, requestData)
      setShowAssignModal(false)
      onUpdate("User assigned successfully!")
    } catch (error) {
      console.error("[TASK] Error assigning user:", error)
      onUpdate("Failed to assign user. Please try again.", task.id, true)
    }
  }

  /* ───── unassign user from task using useApi ───── */
  const unassignUser = async (userId: number) => {
    if (!task?.id || !userId || !user) {
      onUpdate("Invalid unassignment request", task.id, true)
      return
    }
    
    try {
      await deleteApi(`/trips/${tripId}/checklist/${task.id}/assign/${userId}`)
      onUpdate("User unassigned successfully!")
    } catch (error) {
      console.error("[TASK] Error unassigning user:", error)
      onUpdate("Failed to unassign user. Please try again.", task.id, true)
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
      <Card className="p-4 sm:p-6">
        <div className="text-center text-muted-foreground">
          <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2"/>
          <p className="text-sm sm:text-base">Task data not available</p>
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card className={`p-4 sm:p-6 transition-all duration-300 rounded-xl sm:rounded-2xl ${
        displayCompleted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-background/80 backdrop-blur-sm border-border/50'
      } ${isEditing ? 'shadow-xl shadow-[#1e40af]/15 border-[#1e40af]/50' : 'hover:shadow-lg'}`}>
        
        {isEditing ? (
          /* ──── EDIT MODE ──── */
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#1e40af] flex items-center justify-center">
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 text-white"/>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#1e40af]">Editing Task</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  placeholder="Task title"
                  className="h-10 sm:h-12 rounded-lg sm:rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="Task description"
                  rows={3}
                  className="resize-none rounded-lg sm:rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={editForm.priority}
                    onChange={(e) => setEditForm({...editForm, priority: e.target.value as TaskPriority})}
                    className="w-full p-2 border rounded-md bg-background h-10 sm:h-12 text-sm sm:text-base"
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
                    className="w-full p-2 border rounded-md bg-background h-10 sm:h-12 text-sm sm:text-base"
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
                  className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => updateTask()}
                  disabled={updating || !editForm.title.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl"
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
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Conditional checkbox based on permissions */}
              {canToggleCompletion ? (
                // Interactive checkbox - user CAN toggle
                <button
                  onClick={() => toggleCompletion()}
                  disabled={updating}
                  className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center transition-all ${
                    displayCompleted 
                      ? 'bg-green-500 border-green-500 text-white hover:bg-green-600' 
                      : 'border-gray-300 hover:border-[#1e40af] hover:bg-[#1e40af]/10'
                  } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title={isAssignedTask ? `Complete your assigned task (${user?.username})` : "Toggle task completion"}
                >
                  {updating ? (
                    <Loader2 className="w-2 h-2 sm:w-3 sm:h-3 animate-spin"/>
                  ) : displayCompleted ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4"/>
                  ) : null}
                </button>
              ) : (
                // Read-only indicator - user CANNOT toggle
                <div 
                  className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded border-2 flex items-center justify-center ${
                    displayCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300'
                  } opacity-60`}
                  title={`Task managed by assigned members (you are ${user?.username})`}
                >
                  {displayCompleted ? <Check className="w-3 h-3 sm:w-4 sm:h-4"/> : null}
                </div>
              )}

              {/* Task Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base sm:text-lg font-semibold ${displayCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.title || "Untitled Task"}
                    </h3>
                    {/* Permission status indicators with username */}
                    {isAssignedTask && !canToggleCompletion && (
                      <p className="text-xs text-amber-600 mt-1">
                        🔒 Assigned to other members (you are {user?.username})
                      </p>
                    )}
                    {isAssignedTask && canToggleCompletion && (
                      <p className="text-xs text-blue-600 mt-1">
                        👤 You ({user?.username}) are assigned to this task
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${priorityColor(task.priority)}`}>
                      {(task.priority || "medium").charAt(0).toUpperCase() + (task.priority || "medium").slice(1)}
                    </Badge>
                    <Badge className={`text-xs ${categoryColor(task.category)}`}>
                      {(task.category || "other").charAt(0).toUpperCase() + (task.category || "other").slice(1)}
                    </Badge>
                  </div>
                </div>

                {task.description && (
                  <p className={`text-sm sm:text-base text-muted-foreground mb-3 ${displayCompleted ? 'line-through' : ''}`}>
                    {task.description}
                  </p>
                )}

                {/* Assignments */}
                {taskAssignments.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground"/>
                      <span className="text-xs sm:text-sm text-muted-foreground">Assigned to:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {taskAssignments.map((assignment) => {
                        const username = assignment?.assigned_user_name || `User ${assignment?.assigned_to}`
                        return (
                          <div key={assignment.assigned_to} className="flex items-center gap-1 bg-[#1e40af]/10 text-[#1e40af] px-2 py-1 rounded-md text-xs">
                            <span>{username}</span>
                            <button
                              onClick={() => unassignUser(assignment.assigned_to)}
                              className="hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full p-0.5"
                              title="Unassign user"
                            >
                              <X className="h-2 w-2 sm:h-3 sm:w-3 text-red-600"/>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Completions */}
                {taskCompletions.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600"/>
                      <span className="text-xs sm:text-sm text-green-600">Completed by:</span>
                    </div>
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-2 w-2 sm:h-3 sm:w-3"/>
                    Created: {fmt(task.created_at)}
                  </span>
                  {task.creator_name && (
                    <span>By: {task.creator_name}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 pt-3 sm:pt-4 border-t border-border/30">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  fetchTripMembers()
                  setShowAssignModal(true)
                }}
                className="hover:bg-[#1e40af]/10 w-8 h-8 sm:w-10 sm:h-10"
                title="Assign user"
              >
                <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-[#1e40af]"/>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="hover:bg-[#06b6d4]/10 w-8 h-8 sm:w-10 sm:h-10"
                title="Edit task"
              >
                <Edit className="h-3 w-3 sm:h-4 sm:w-4 text-[#06b6d4]"/>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="hover:bg-red-100 dark:hover:bg-red-900/20 w-8 h-8 sm:w-10 sm:h-10"
                title="Delete task"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600"/>
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold">Assign User</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAssignModal(false)} className="w-8 h-8 sm:w-10 sm:h-10">
                <X className="h-4 w-4"/>
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#1e40af]"/>
              </div>
            ) : tripMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3"/>
                <p className="text-sm sm:text-base text-muted-foreground">No trip members found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tripMembers.map((member) => {
                  if (!member?.id) return null
                  
                  const isAssigned = taskAssignments.some(a => a?.assigned_to === member.id)
                  const displayName = member.username || member.email || `User ${member.id}`
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm sm:text-base truncate">{displayName}</div>
                        {member.email && member.username && (
                          <div className="text-xs sm:text-sm text-muted-foreground truncate">{member.email}</div>
                        )}
                      </div>
                      {isAssigned ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">Assigned</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => assignUser(member.id)}
                          className="bg-[#1e40af] hover:bg-[#1e40af]/90 text-white text-xs px-3 py-1"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600"/>
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2 text-center">Delete Task</h3>
            <p className="text-sm sm:text-base text-muted-foreground text-center mb-6">
              Are you sure you want to delete "{task?.title || 'this task'}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={updating}
                className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteTask()}
                disabled={updating}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl"
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
