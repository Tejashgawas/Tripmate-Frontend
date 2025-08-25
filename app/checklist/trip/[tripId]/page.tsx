"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/dashboard-shell";
import TaskComponent from "@/components/task-component";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  ArrowLeft,
  CheckSquare,
  Loader2,
  Plus,
  BarChart3,
  X,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

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
  id: number;
  username: string;
  email: string;
}

interface TaskCompletion {
  completion_id: number;
  user_id: number;
  user: User;
  completed_at: string;
}

interface TaskAssignment {
  user_id: number;
  user: User;
  assigned_at: string;
  assigned_by: number;
}

interface Task {
  id: number;
  trip_id: number;
  title: string;
  description?: string;
  priority: TaskPriority;
  category: TaskCategory;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  assigned_by?: number;
  notes?: string;
  completions: TaskCompletion[];
  assignments: TaskAssignment[];
}

interface TaskForm {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  due_date: string;
}

const initialTaskForm: TaskForm = {
  title: "",
  description: "",
  priority: TaskPriority.MEDIUM,
  category: TaskCategory.OTHER,
  due_date: "",
};

export default function TripChecklistPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const { user } = useAuth();
  const { get, post, loading: apiLoading, error: apiError } = useApi();
  
  // State management
  const [refreshKey, setRefreshKey] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // ✅ NEW: Track initial load

  // Modal states
  const [showAddTask, setShowAddTask] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("Error");

  // Filter states
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");

  // Form state
  const [taskForm, setTaskForm] = useState<TaskForm>(initialTaskForm);

  // Helper functions
  const showErrorModal = useCallback((title: string, message: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowError(true);
  }, []);

  const showSuccessModal = useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  }, []);

  // ✅ FIXED: Remove tasks.length from dependencies
  const fetchTasks = useCallback(async () => {
    if (!tripId || !user) return;

    try {
      // ✅ FIXED: Use initialLoad instead of tasks.length
      if (initialLoad) setLoading(true);

      const params = new URLSearchParams();
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      console.log(`[CHECKLIST] Fetching tasks for trip ${tripId}...`);
      
      const data = await get<Task[]>(`/trips/${tripId}/checklist?${params}`);
      const newTasks = Array.isArray(data) ? data : (data as any)?.tasks || [];
      
      setTasks(newTasks); // ✅ FIXED: Don't spread array
      setRefreshKey(prev => prev + 1);
      setInitialLoad(false); // ✅ NEW: Mark initial load complete
      
      console.log(`[CHECKLIST] Loaded ${newTasks.length} tasks`);
    } catch (error) {
      console.error("[CHECKLIST] Error fetching tasks:", error);
      showErrorModal("Failed to Load Tasks", "Unable to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [tripId, user, priorityFilter, categoryFilter, get, showErrorModal, initialLoad]); // ✅ FIXED: Removed tasks.length

  const formatDateForBackend = (dateString: string): string => {
    try {
      const dateObj = new Date(dateString);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00`;
    } catch (error) {
      throw new Error("Invalid date format");
    }
  };

  const addTask = useCallback(async () => {
    if (!tripId || !taskForm.title.trim()) return;

    try {
      setSaving(true);

      const requestBody: any = {
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority: taskForm.priority,
        category: taskForm.category,
      };

      if (taskForm.due_date?.trim()) {
        try {
          requestBody.due_date = formatDateForBackend(taskForm.due_date);
        } catch (dateError) {
          showErrorModal("Invalid Date", "Invalid date format. Please select a valid date.");
          return;
        }
      }

      console.log("[CHECKLIST] Adding task:", requestBody);

      await post(`/trips/${tripId}/checklist`, requestBody);
      
      console.log("[CHECKLIST] Task added successfully");
      setShowAddTask(false);
      setTaskForm(initialTaskForm);
      showSuccessModal("Task added successfully!");
      
      // ✅ FIXED: Direct call instead of setTimeout
      fetchTasks();
    } catch (error) {
      console.error("[CHECKLIST] Error adding task:", error);
      showErrorModal("Failed to Add Task", "Unable to add task. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [tripId, taskForm, post, showErrorModal, showSuccessModal, fetchTasks]);

  const handleTaskUpdate = useCallback(async (message: string, taskId?: number, isError: boolean = false) => {
    console.log("[CHECKLIST] Task update:", { message, taskId, isError });

    if (isError) {
      showErrorModal("Task Operation Failed", message);
    } else {
      showSuccessModal(message);
      fetchTasks(); // ✅ FIXED: Direct call
    }
  }, [showErrorModal, showSuccessModal, fetchTasks]);

  // ✅ FIXED: Only run on mount and when tripId/user changes
  useEffect(() => {
    if (tripId && user) {
      fetchTasks();
    }
  }, [tripId, user]); // ✅ FIXED: Removed fetchTasks from dependencies

  // ✅ FIXED: Separate effect for filter changes
  useEffect(() => {
    if (!initialLoad) { // Only refetch if not initial load
      const timeoutId = setTimeout(() => fetchTasks(), 500);
      return () => clearTimeout(timeoutId);
    }
  }, [priorityFilter, categoryFilter]); // ✅ FIXED: Removed fetchTasks

  // Computed values
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === "completed" && !task.is_completed) return false;
    if (statusFilter === "pending" && task.is_completed) return false;
    return true;
  });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.is_completed).length,
    pending: tasks.filter(t => !t.is_completed).length,
    urgent: tasks.filter(t => t.priority === TaskPriority.URGENT).length,
  };

  // Early returns
  if (!tripId) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Invalid trip ID</p>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <Link href="/checklist">
              <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10 w-10 h-10 sm:w-12 sm:h-12 rounded-full">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1e40af]" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
                Trip Checklist
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Organize and track your travel preparation tasks
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <Link href={`/checklist/trip/${tripId}/dashboard`}>
              <Button variant="outline" className="w-full sm:w-auto border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10 h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Button
              onClick={() => setShowAddTask(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 px-4 sm:px-6 rounded-lg sm:rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Summary Statistics */}
        {taskStats.total > 0 && (
          <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-muted/20 rounded-lg sm:rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-[#1e40af]">{taskStats.total}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-muted/20 rounded-lg sm:rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-muted/20 rounded-lg sm:rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{taskStats.pending}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-muted/20 rounded-lg sm:rounded-xl">
              <div className="text-xl sm:text-2xl font-bold text-red-600">{taskStats.urgent}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Urgent</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 sm:p-6 mb-6 bg-background/80 backdrop-blur-sm rounded-xl sm:rounded-2xl">
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
              className="px-3 sm:px-4 py-2 border rounded-md bg-background min-w-[140px] sm:min-w-[150px] text-sm sm:text-base h-10 sm:h-12"
            >
              <option value="all">All Priorities</option>
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.URGENT}>Urgent</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TaskCategory | "all")}
              className="px-3 sm:px-4 py-2 border rounded-md bg-background min-w-[140px] sm:min-w-[150px] text-sm sm:text-base h-10 sm:h-12"
            >
              <option value="all">All Categories</option>
              <option value={TaskCategory.DOCUMENTS}>Documents</option>
              <option value={TaskCategory.ACTIVITIES}>Activities</option>
              <option value={TaskCategory.FOOD}>Food</option>
              <option value={TaskCategory.ACCOMMODATION}>Accommodation</option>
              <option value={TaskCategory.TRANSPORT}>Transport</option>
              <option value={TaskCategory.SHOPPING}>Shopping</option>
              <option value={TaskCategory.OTHER}>Other</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "completed" | "pending")}
              className="px-3 sm:px-4 py-2 border rounded-md bg-background min-w-[140px] sm:min-w-[150px] text-sm sm:text-base h-10 sm:h-12"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </Card>
         {/* 👇 NEW: small explanatory note */}
        <p className="text-sm font-semibold text-red-600 italic -mt-1 mb-6">
          only task creator can delete or update task,in an attempt to do that so by another member will be failed!
        </p>

        {/* Tasks List */}
        {loading ? (
          <div className="flex flex-col items-center py-16 sm:py-20">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1e40af] to-[#06b6d4] rounded-full animate-pulse"></div>
              <Loader2 className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 animate-spin text-white p-3 sm:p-4"/>
            </div>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground">Loading tasks…</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="relative inline-block mb-6 sm:mb-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
                <CheckSquare className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-4">No Tasks Found</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
              {tasks.length === 0
                ? "Start organizing your trip by adding your first task"
                : "No tasks match your current filters"
              }
            </p>
            <Button
              onClick={() => setShowAddTask(true)}
              className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 px-6 sm:px-8 rounded-lg sm:rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredTasks.map((task) => (
              <TaskComponent
                key={`${task.id}-${refreshKey}`}
                task={task}
                tripId={parseInt(tripId)}
                onUpdate={handleTaskUpdate}
              />
            ))}
          </div>
        )}

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold">Add New Task</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddTask(false)} className="w-8 h-8 sm:w-10 sm:h-10">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="h-10 sm:h-12 rounded-lg sm:rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Task description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows={3}
                    className="resize-none rounded-lg sm:rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
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
                      value={taskForm.category}
                      onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as TaskCategory })}
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
                    onClick={() => setShowAddTask(false)}
                    disabled={saving}
                    className="flex-1 h-10 sm:h-12 rounded-lg sm:rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addTask}
                    disabled={saving || !taskForm.title.trim()}
                    className="flex-1 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white h-10 sm:h-12 rounded-lg sm:rounded-xl"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Add Task
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-center">Success!</h3>
              <p className="text-sm sm:text-base text-muted-foreground text-center mb-4">{successMessage}</p>
              <Button onClick={() => setShowSuccess(false)} className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-background border border-border/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-xs sm:max-w-md w-full mx-4 shadow-2xl animate-in fade-in-0 zoom-in-95">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-base sm:text-lg mb-2 text-center text-red-800 dark:text-red-300">
                {errorTitle}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground text-center mb-4">{errorMessage}</p>
              <Button
                onClick={() => setShowError(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-10 sm:h-12 rounded-lg sm:rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
