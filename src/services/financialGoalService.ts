import { createClient } from '@/lib/supabase'
import { FinancialGoal, FinancialGoalInsert, FinancialGoalUpdate } from '@/types'

export class FinancialGoalService {
  private supabase = createClient()

  private async getUserId(): Promise<string> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error || !user) throw new Error('Unauthorized')
    return user.id
  }

  async getGoals(): Promise<FinancialGoal[]> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  async createGoal(goal: FinancialGoalInsert): Promise<FinancialGoal> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('financial_goals')
      .insert([{ ...goal, user_id: userId }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error inserting goal:', error)
      throw error
    }
    return data
  }

  async updateGoal(id: string, updates: FinancialGoalUpdate): Promise<FinancialGoal> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('financial_goals')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating goal:', error)
      throw error
    }
    return data
  }

  async addFunds(id: string, amountToAdd: number, currentAmount: number): Promise<FinancialGoal> {
    return this.updateGoal(id, { current_amount: currentAmount + amountToAdd })
  }

  async deleteGoal(id: string): Promise<void> {
    const userId = await this.getUserId()
    const { error } = await this.supabase
      .from('financial_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error deleting goal:', error)
      throw error
    }
  }
}

export const financialGoalService = new FinancialGoalService()
