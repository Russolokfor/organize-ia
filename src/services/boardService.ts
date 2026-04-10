import { createClient } from '@/lib/supabase'
import { TaskBoard, TaskBoardInsert, TaskBoardUpdate } from '@/types'

export const boardService = {
  async fetchBoards(): Promise<TaskBoard[]> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('task_boards')
      .select('*')
      .eq('user_id', user.id)
      .order('is_archived', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as TaskBoard[]
  },

  async fetchBoardById(boardId: string): Promise<TaskBoard | null> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('task_boards')
      .select('*')
      .eq('id', boardId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not Found
      throw error
    }
    return data as TaskBoard
  },

  async createBoard(board: TaskBoardInsert): Promise<TaskBoard> {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('task_boards')
      .insert([{ ...board, user_id: user.id }])
      .select()
      .single()

    if (error) throw error
    return data as TaskBoard
  },

  async updateBoard(id: string, updates: TaskBoardUpdate): Promise<TaskBoard> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('task_boards')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as TaskBoard
  },

  async deleteBoard(id: string): Promise<void> {
    const supabase = createClient()
    // Deleting the board will set board_id to null on associated tasks (ON DELETE SET NULL)
    const { error } = await supabase
      .from('task_boards')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
