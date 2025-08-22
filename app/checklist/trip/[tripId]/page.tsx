"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardShell from "@/components/dashboard-shell";
import TaskComponent from "@/components/task-component";

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

const BASE_URL = "https://tripmate-39hm.onrender.com/";

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
  
  // State management
  const [refreshKey, setRefreshKey] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const refreshToken = useCallback(async (): Promise<boolean> => {
    setRefreshing(true);
    try {
      const response = await fetch(`${BASE_URL}auth/refresh`, {
        method: "POST",
        credentials: "include"
      });
      return response.ok;
    } catch (error) {
      console.error("[TOKEN] Refresh failed:", error);
      return false;
    } finally {
      setRefreshing(false);
    }
  }, []);

  const fetchTasks = useCallback(async (retry = false) => {
    if (!tripId) return;

    try {
      if (!tasks.length) setLoading(true);

      const params = new URLSearchParams();
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const res = await fetch(`${BASE_URL}trips/${tripId}/checklist?${params}`, {
        credentials: "include"
      });

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        const tokenRefreshed = await refreshToken();
        if (tokenRefreshed) return fetchTasks(true);
      }

      if (res.ok) {
        const data = await res.json();
        const newTasks = Array.isArray(data) ? data : data.tasks || [];
        
        setTasks([...newTasks]);
        setRefreshKey(prev => prev + 1);
        
        console.log(`[CHECKLIST] Refreshed ${newTasks.length} tasks`);
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
    } catch (error) {
      console.error("[CHECKLIST] Error fetching tasks:", error);
      showErrorModal("Failed to Load Tasks", "Unable to fetch tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [tripId, tasks.length, priorityFilter, categoryFilter, refreshToken, showErrorModal]);

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

  const addTask = useCallback(async (retry = false) => {
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

      const res = await fetch(`${BASE_URL}trips/${tripId}/checklist`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (!res.ok && (res.status === 401 || res.status === 403) && !retry) {
        const tokenRefreshed = await refreshToken();
        if (tokenRefreshed) return addTask(true);
      }

      if (res.ok) {
        setShowAddTask(false);
        setTaskForm(initialTaskForm);
        showSuccessModal("Task added successfully!");
        
        setTimeout(async () => {
          await fetchTasks();
        }, 200);
      } else {
        try {
          const errorData = await res.json();
          showErrorModal("Failed to Add Task", errorData.detail || `Server error: ${res.status}`);
        } catch {
          const errorText = await res.text();
          showErrorModal("Failed to Add Task", errorText || `Server error: ${res.status}`);
        }
      }
    } catch (error) {
      console.error("[CHECKLIST] Error adding task:", error);
      showErrorModal("Network Error", "Unable to connect to server. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }, [tripId, taskForm, refreshToken, showErrorModal, showSuccessModal, fetchTasks]);

  const handleTaskUpdate = useCallback(async (message: string, taskId?: number, isError: boolean = false) => {
    console.log("[CHECKLIST] Task update:", { message, taskId, isError });

    if (isError) {
      showErrorModal("Task Operation Failed", message);
    } else {
      showSuccessModal(message);
      await fetchTasks();
    }
  }, [showErrorModal, showSuccessModal, fetchTasks]);

  // Effects
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchTasks(), 500);
    return () => clearTimeout(timeoutId);
  }, [priorityFilter, categoryFilter, fetchTasks]);

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

  const priorityColor = (priority: TaskPriority): string => ({
    low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }[priority]);

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
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/checklist">
            <Button variant="ghost" size="icon" className="hover:bg-[#1e40af]/10">
              <ArrowLeft className="h-5 w-5 text-[#1e40af]" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1e40af] to-[#06b6d4] bg-clip-text text-transparent">
              Trip Checklist
            </h1>
            <p className="text-muted-foreground">
              Organize and track your travel preparation tasks
            </p>
          </div>
          <Link href={`/checklist/trip/${tripId}/dashboard`}>
            <Button variant="outline" className="border-[#06b6d4] text-[#06b6d4] hover:bg-[#06b6d4]/10">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Button
            onClick={() => setShowAddTask(true)}
            className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Summary Statistics */}
        {taskStats.total > 0 && (
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-[#1e40af]">{taskStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{taskStats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{taskStats.urgent}</div>
              <div className="text-sm text-muted-foreground">Urgent</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6 bg-background/80 backdrop-blur-sm">
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | "all")}
              className="px-4 py-2 border rounded-md bg-background min-w-[150px]"
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
              className="px-4 py-2 border rounded-md bg-background min-w-[150px]"
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
              className="px-4 py-2 border rounded-md bg-background min-w-[150px]"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </Card>

        {/* Tasks List */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#1e40af] mb-4" />
            <p className="text-muted-foreground">Loading tasks…</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20">
            <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tasks Found</h3>
            <p className="text-muted-foreground mb-6">
              {tasks.length === 0
                ? "Start organizing your trip by adding your first task"
                : "No tasks match your current filters"
              }
            </p>
            <Button
              onClick={() => setShowAddTask(true)}
              className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-background border border-border/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Add New Task</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddTask(false)}>
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <Textarea
                    placeholder="Task description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as TaskPriority })}
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
                      value={taskForm.category}
                      onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as TaskCategory })}
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
                    onClick={() => setShowAddTask(false)}
                    disabled={saving}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addTask}
                    disabled={saving || !taskForm.title.trim()}
                    className="flex-1 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-background border border-border/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-center">Success!</h3>
              <p className="text-muted-foreground text-center mb-4">{successMessage}</p>
              <Button onClick={() => setShowSuccess(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showError && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-background border border-border/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-center text-red-800 dark:text-red-300">
                {errorTitle}
              </h3>
              <p className="text-muted-foreground text-center mb-4">{errorMessage}</p>
              <Button
                onClick={() => setShowError(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
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
