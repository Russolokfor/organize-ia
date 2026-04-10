'use client'

import * as React from 'react'
import { Task, Subtask, DashboardMetrics, RoutineMetrics, PerformanceMetrics, TaskFilters } from '@/types'
import { TaskService } from '@/services/taskService'
import { createClient } from '@/lib/supabase'
import { isToday, isPast, parseISO, subDays } from 'date-fns'

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  addTask: (payload: any) => Promise<void>
  updateTask: (id: string, patch: any) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskDone: (task: Task) => Promise<void>
  pinTaskToday: (id: string, pinned: boolean) => Promise<void>
  dashboardMetrics: DashboardMetrics
  routineMetrics: RoutineMetrics
  getPerformanceMetrics: (days: 7 | 30) => PerformanceMetrics
  deleteTasks: (ids: string[]) => Promise<void>
  duplicateTasks: (ids: string[]) => Promise<void>
  addSubtask: (taskId: string, title: string) => Promise<void>
  updateSubtask: (taskId: string, subtaskId: string, patch: any) => Promise<void>
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>
  
  // Reordering
  reorderTasksFrontend: (newOrder: Task[]) => void
  reorderSubtasksFrontend: (taskId: string, newOrder: Subtask[]) => void
}

const TaskContext = React.createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const supabase = createClient()
  const taskService = new TaskService(supabase)

  const refresh = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await taskService.list()
      const sortedData = data.map(t => ({
        ...t,
        subtasks: t.subtasks ? [...t.subtasks].sort((a, b) => (a.order_index || 0) - (b.order_index || 0)) : []
      }))
      setTasks(sortedData)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  // Actions
  const addTask = async (payload: any) => {
    try {
      const newTask = await taskService.create(payload)
      setTasks(prev => [newTask, ...prev])
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateTask = async (id: string, patch: any) => {
    try {
      const updated = await taskService.update(id, patch)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await taskService.remove(id)
      setTasks(prev => prev.filter(t => t.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const toggleTaskDone = async (task: Task) => {
    try {
      // Optimistic update
      const isDone = task.status === 'done'
      setTasks(prev => prev.map(t => t.id === task.id ? { 
        ...t, 
        status: isDone ? 'planned' : 'done',
        completed_at: isDone ? null : new Date().toISOString()
      } : t))
      
      const updated = await taskService.toggleDone(task)
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t))
    } catch (err: any) {
      setError(err.message)
      refresh() // rollback
    }
  }

  const pinTaskToday = async (id: string, pinned: boolean) => {
    try {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, pinned_today: pinned } : t))
      const updated = await taskService.setPinnedToday(id, pinned)
      setTasks(prev => prev.map(t => t.id === id ? updated : t))
    } catch (err: any) {
      setError(err.message)
      refresh()
    }
  }

  const deleteTasks = async (ids: string[]) => {
    try {
      // Optimistic
      setTasks(prev => prev.filter(t => !ids.includes(t.id)))
      await taskService.removeMany(ids)
    } catch (err: any) {
      setError(err.message)
      refresh()
      throw err
    }
  }

  const duplicateTasks = async (ids: string[]) => {
    try {
      const newTasks = await taskService.duplicateMany(ids)
      setTasks(prev => [...newTasks, ...prev])
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // --- Subtasks ---
  const addSubtask = async (taskId: string, title: string) => {
    const tempId = 'temp-' + Date.now()
    try {
      // Optimistic up
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const st = t.subtasks || []
          return { ...t, subtasks: [...st, { id: tempId, task_id: taskId, title, is_done: false, user_id: '', order_index: st.length, due_date: null, due_time: null, created_at: '', updated_at: '' }] }
        }
        return t
      }))
      const created = await taskService.addSubtask(taskId, title)
      // replace temp
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, subtasks: (t.subtasks || []).map(s => s.id === tempId ? created : s) }
        }
        return t
      }))
    } catch (err: any) {
      setError(err.message)
      refresh()
    }
  }

  const updateSubtask = async (taskId: string, subtaskId: string, patch: any) => {
    try {
      // Optimistic
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, subtasks: (t.subtasks || []).map(s => s.id === subtaskId ? { ...s, ...patch } : s) }
        }
        return t
      }))
      await taskService.updateSubtask(subtaskId, patch)
    } catch (err: any) {
      setError(err.message)
      refresh()
    }
  }

  const deleteSubtask = async (taskId: string, subtaskId: string) => {
    try {
      // Optimistic
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, subtasks: (t.subtasks || []).filter(s => s.id !== subtaskId) }
        }
        return t
      }))
      await taskService.deleteSubtask(subtaskId)
    } catch (err: any) {
      setError(err.message)
      refresh()
    }
  }

  // --- Reordering DND ---
  const reorderTasksFrontend = async (newOrder: Task[]) => {
    // Assign sequence numbers based on their new visual order
    const updates = newOrder.map((t, idx) => ({ id: t.id, routine_order: idx }))

    // Apply to global state optimistic
    setTasks(prev => prev.map(t => {
      const u = updates.find(x => x.id === t.id)
      return u ? { ...t, routine_order: u.routine_order } : t
    }))

    try {
      await taskService.reorderTasks(updates)
    } catch (err) {
      console.error('Reorder tasks error:', err)
      refresh() // rollback
    }
  }

  const reorderSubtasksFrontend = async (taskId: string, newOrder: Subtask[]) => {
    const updates = newOrder.map((s, idx) => ({ id: s.id, order_index: idx }))

    // Optimistic
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: newOrder.map((s, idx) => ({ ...s, order_index: idx }))
        }
      }
      return t
    }))

    try {
      await taskService.reorderSubtasks(updates)
    } catch (err) {
      console.error('Reorder subtasks error:', err)
      refresh()
    }
  }

  // Metrics Calculations (Frontend as requested)
  const dashboardMetrics = React.useMemo(() => {
    const todayDate = new Date()
    todayDate.setHours(0,0,0,0)
    const active = tasks.filter(t => t.status === 'doing').length
    const done = tasks.filter(t => t.status === 'done').length
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false
      const d = parseISO(t.due_date)
      if (d < todayDate) return true // day already passed
      // If due today and has a time set, check if the time is already past
      if (d.getTime() === todayDate.getTime() && t.due_time) {
        const [h, m] = t.due_time.split(':').map(Number)
        const dueDateTime = new Date(todayDate)
        dueDateTime.setHours(h, m, 0, 0)
        return new Date() > dueDateTime
      }
      return false
    }).length
    
    const todayCount = tasks.filter(t => t.status !== 'done' && (t.pinned_today || (t.due_date && isToday(parseISO(t.due_date))))).length

    const weekAgo = subDays(todayDate, 7)
    const created7 = tasks.filter(t => new Date(t.created_at) >= weekAgo).length
    const done7 = tasks.filter(t => t.status === 'done' && t.completed_at && new Date(t.completed_at) >= weekAgo).length
    const rate7 = created7 === 0 ? 0 : Math.round((done7 / created7) * 100)

    return { active, done, overdue, today: todayCount, rate7 }
  }, [tasks])

  const routineMetrics = React.useMemo(() => {
    const todayTasks = tasks.filter(t => t.pinned_today || (t.due_date && isToday(parseISO(t.due_date))))
    const total = todayTasks.length
    const completed = todayTasks.filter(t => t.status === 'done').length
    const pinned = todayTasks.filter(t => t.pinned_today).length
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100)

    return { total, completed, pinned, completionPercentage }
  }, [tasks])

  const getPerformanceMetrics = React.useCallback((days: 7 | 30) => {
    const start = subDays(new Date(), days)
    start.setHours(0,0,0,0)
    
    const inRange = tasks.filter(t => new Date(t.created_at) >= start || (t.due_date && parseISO(t.due_date) >= start))
    const totalInRange = inRange.length
    const completedInRange = inRange.filter(t => t.status === 'done').length
    
    const todayDate = new Date()
    todayDate.setHours(0,0,0,0)

    const overdueList = tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false
      const d = parseISO(t.due_date)
      const todayMidnight = new Date()
      todayMidnight.setHours(0,0,0,0)
      if (d < todayMidnight) return true
      if (d.getTime() === todayMidnight.getTime() && t.due_time) {
        const [h, m] = t.due_time.split(':').map(Number)
        const dueDateTime = new Date(todayMidnight)
        dueDateTime.setHours(h, m, 0, 0)
        return new Date() > dueDateTime
      }
      return false
    })
    
    const pctDone = totalInRange === 0 ? 0 : Math.round((completedInRange / totalInRange) * 100)
    const pctOverdue = tasks.length === 0 ? 0 : Math.round((overdueList.length / tasks.length) * 100)

    return { completedInRange, totalInRange, pctDone, pctOverdue, overdueList }
  }, [tasks])

  const contextValue = React.useMemo(() => ({
    tasks, loading, error, refresh, addTask, updateTask, deleteTask, toggleTaskDone, pinTaskToday,
    dashboardMetrics, routineMetrics, getPerformanceMetrics, deleteTasks, duplicateTasks,
    addSubtask, updateSubtask, deleteSubtask, reorderTasksFrontend, reorderSubtasksFrontend
  }), [tasks, loading, error, refresh, dashboardMetrics, routineMetrics, getPerformanceMetrics])

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = React.useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}
