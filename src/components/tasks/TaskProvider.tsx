'use client'

import * as React from 'react'
import { Task, DashboardMetrics, RoutineMetrics, PerformanceMetrics, TaskFilters } from '@/types'
import { TaskService } from '@/services/taskService'
import { createClient } from '@/lib/supabase'
import { isToday, isPast, parseISO, subDays } from 'date-fns'

interface TaskContextType {
  tasks: Task[]
  loading: boolean
  error: string | null
  refresh: (filters?: TaskFilters) => Promise<void>
  addTask: (payload: any) => Promise<void>
  updateTask: (id: string, patch: any) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskDone: (task: Task) => Promise<void>
  pinTaskToday: (id: string, pinned: boolean) => Promise<void>
  dashboardMetrics: DashboardMetrics
  routineMetrics: RoutineMetrics
  getPerformanceMetrics: (days: 7 | 30) => PerformanceMetrics
}

const TaskContext = React.createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const supabase = createClient()
  const taskService = new TaskService(supabase)

  const refresh = React.useCallback(async (filters?: TaskFilters) => {
    try {
      setLoading(true)
      const data = await taskService.list(filters)
      setTasks(data)
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

  // Metrics Calculations (Frontend as requested)
  const dashboardMetrics = React.useMemo(() => {
    const todayDate = new Date()
    todayDate.setHours(0,0,0,0)
    const active = tasks.filter(t => t.status !== 'done').length
    const done = tasks.filter(t => t.status === 'done').length
    const overdue = tasks.filter(t => {
      if (!t.due_date || t.status === 'done') return false
      return parseISO(t.due_date) < todayDate
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
      return parseISO(t.due_date) < todayDate
    })
    
    const pctDone = totalInRange === 0 ? 0 : Math.round((completedInRange / totalInRange) * 100)
    const pctOverdue = tasks.length === 0 ? 0 : Math.round((overdueList.length / tasks.length) * 100)

    return { completedInRange, totalInRange, pctDone, pctOverdue, overdueList }
  }, [tasks])

  const contextValue = React.useMemo(() => ({
    tasks, loading, error, refresh, addTask, updateTask, deleteTask, toggleTaskDone, pinTaskToday,
    dashboardMetrics, routineMetrics, getPerformanceMetrics
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
