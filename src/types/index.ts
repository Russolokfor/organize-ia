export type TaskStatus = 'planned' | 'doing' | 'done'

export interface Task {
  id: string
  user_id: string
  title: string
  notes: string | null
  status: TaskStatus
  priority: 1 | 2 | 3 | null
  duration_min: number | null
  due_date: string | null // YYYY-MM-DD format
  completed_at: string | null // ISO Timestamp
  pinned_today: boolean
  routine_order: number | null
  created_at: string
  updated_at: string
}

export type TaskInsert = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type TaskUpdate = Partial<TaskInsert>

export type TaskFilterStatus = 'all' | 'planned' | 'doing' | 'done'
export type TaskFilterScope = 'all' | 'today' | 'next7' | 'overdue' | 'no_due_date'

export interface TaskFilters {
  status?: TaskFilterStatus
  scope?: TaskFilterScope
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
// FINANCIAL MODULE TYPES
// ==========================================

export type FinancialEntryType = 'income' | 'expense'

export interface FinancialEntry {
  id: string
  user_id: string
  title: string
  amount: number
  type: FinancialEntryType
  category: string
  notes: string | null
  due_date: string | null // YYYY-MM-DD format
  paid_at: string | null // ISO Timestamp
  is_paid: boolean
  is_recurring: boolean
  recurrence_type: string | null
  is_fixed: boolean
  reference_month: string // YYYY-MM format
  created_at: string
  updated_at: string
}

export type FinancialEntryInsert = Omit<FinancialEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type FinancialEntryUpdate = Partial<FinancialEntryInsert>

export interface FinancialBudget {
  id: string
  user_id: string
  category: string
  amount_limit: number
  reference_month: string
  created_at: string
  updated_at: string
}

export type FinancialBudgetInsert = Omit<FinancialBudget, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type FinancialBudgetUpdate = Partial<FinancialBudgetInsert>

export interface FinancialGoal {
  id: string
  user_id: string
  title: string
  target_amount: number
  current_amount: number
  target_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type FinancialGoalInsert = Omit<FinancialGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type FinancialGoalUpdate = Partial<FinancialGoalInsert>
