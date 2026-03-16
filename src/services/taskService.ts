import { SupabaseClient } from '@supabase/supabase-js'
import { Task, TaskInsert, TaskUpdate, TaskFilters } from '@/types'
import { isToday, isPast, parseISO, addDays } from 'date-fns'

export class TaskService {
  constructor(private supabase: SupabaseClient) {}

  async getUserId(): Promise<string> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error || !user) throw new Error('Unauthorized')
    return user.id
  }

  async list(filters?: TaskFilters): Promise<Task[]> {
    const userId = await this.getUserId()
    let query = this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query
    if (error) throw error

    let tasks = data as Task[]

    // In-memory advanced filtering for scope over dates since SQL logic for dates can be complex 
    // depending on timezone, simpler to do here for this MVP
    if (filters?.scope && filters.scope !== 'all') {
      const todayDate = new Date()
      // Reset hours for accurate day comparison
      todayDate.setHours(0, 0, 0, 0)

      switch (filters.scope) {
        case 'today':
          tasks = tasks.filter(t => t.pinned_today || (t.due_date && isToday(parseISO(t.due_date))))
          break
        case 'next7':
          const nextWeek = addDays(todayDate, 7)
          tasks = tasks.filter(t => {
            if (!t.due_date) return false
            const d = parseISO(t.due_date)
            return d >= todayDate && d <= nextWeek
          })
          break
        case 'overdue':
          tasks = tasks.filter(t => {
            if (!t.due_date || t.status === 'done') return false
            const d = parseISO(t.due_date)
            // It's overdue if the date is strictly before today
            return d < todayDate
          })
          break
        case 'no_due_date':
          tasks = tasks.filter(t => !t.due_date)
          break
      }
    }

    return tasks
  }

  async create(payload: Partial<TaskInsert>): Promise<Task> {
    const userId = await this.getUserId()
    
    // Set sensible defaults according to rules
    const newTask = {
      user_id: userId,
      status: 'planned',
      priority: 3,
      duration_min: 30,
      pinned_today: false,
      ...payload
    }

    const { data, error } = await this.supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single()

    if (error) throw error
    return data as Task
  }

  async update(id: string, patch: TaskUpdate): Promise<Task> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('tasks')
      .update(patch)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data as Task
  }

  async remove(id: string): Promise<void> {
    const userId = await this.getUserId()
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  async toggleDone(task: Task): Promise<Task> {
    const isDone = task.status === 'done'
    const patch: TaskUpdate = {
      status: isDone ? 'planned' : 'done',
      completed_at: isDone ? null : new Date().toISOString()
    }
    return this.update(task.id, patch)
  }

  async setPinnedToday(id: string, pinned: boolean): Promise<Task> {
    const patch: TaskUpdate = {
      pinned_today: pinned,
      routine_order: pinned ? undefined : null // if removing from routine, unset order
    }
    return this.update(id, patch)
  }

  async removeMany(ids: string[]): Promise<void> {
    const userId = await this.getUserId()
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('user_id', userId)
      .in('id', ids)

    if (error) throw error
  }

  async duplicateMany(ids: string[]): Promise<Task[]> {
    const userId = await this.getUserId()
    
    // 1. Fetch the tasks to copy
    const { data: originalTasks, error: fetchErr } = await this.supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .in('id', ids)

    if (fetchErr) throw fetchErr
    if (!originalTasks || originalTasks.length === 0) return []

    // 2. Map and clean them for insertion
    const copies = originalTasks.map(t => {
      const { id, created_at, updated_at, completed_at, ...rest } = t
      return {
        ...rest,
        status: 'planned', // Re-planning them
        pinned_today: false, // Don't carry over pinning automatically
        routine_order: null, // Reset routine order
      }
    })

    // 3. Bulk insert
    const { data, error: insertErr } = await this.supabase
      .from('tasks')
      .insert(copies)
      .select()

    if (insertErr) throw insertErr
    return data as Task[]
  }
}
