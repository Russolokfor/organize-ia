export type TaskStatus = 'planned' | 'doing' | 'done'

export interface Subtask {
  id: string
  task_id: string
  user_id: string
  title: string
  is_done: boolean
  due_date: string | null
  due_time: string | null
  created_at: string
  updated_at: string
}

export type SubtaskInsert = Omit<Subtask, 'id' | 'user_id' | 'created_at' | 'updated_at'>

export interface Task {
  id: string
  user_id: string
  title: string
  notes: string | null
  status: TaskStatus
  priority: 1 | 2 | 3 | null
  duration_min: number | null
  due_date: string | null // YYYY-MM-DD format
  due_time: string | null // HH:MM format (24h)
  completed_at: string | null // ISO Timestamp
  pinned_today: boolean
  routine_order: number | null
  board_id: string | null
  created_at: string
  updated_at: string
  subtasks?: Subtask[]
}

export type TaskInsert = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type TaskUpdate = Partial<TaskInsert>

export type TaskFilterStatus = 'all' | 'planned' | 'doing' | 'done'
export type TaskFilterScope = 'all' | 'today' | 'next7' | 'overdue' | 'no_due_date'

export interface TaskFilters {
  status?: TaskFilterStatus
  scope?: TaskFilterScope
  board_id?: string | null
}

export interface DashboardMetrics {
  active: number
  done: number
  overdue: number
  today: number
  rate7: number // Percentage 0-100
}

export interface RoutineMetrics {
  total: number
  completed: number
  pinned: number
  completionPercentage: number
}

export interface PerformanceMetrics {
  completedInRange: number
  totalInRange: number
  pctDone: number
  pctOverdue: number
  overdueList: Task[]
}

export interface AIParseResponse {
  tasks: {
    title: string
    duration_min: number
    priority: 1 | 2 | 3
    energy: 'high' | 'medium' | 'low'
  }[]
}

// ==========================================
// TASKS BOARD TYPES
// ==========================================

export interface TaskBoard {
  id: string
  user_id: string
  name: string
  description: string | null
  is_archived: boolean
  created_at: string
  updated_at: string
}

export type TaskBoardInsert = Omit<TaskBoard, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type TaskBoardUpdate = Partial<TaskBoardInsert>

