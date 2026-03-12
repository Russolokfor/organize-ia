import { createClient } from '@/lib/supabase'
import { FinancialBudget, FinancialBudgetInsert, FinancialBudgetUpdate } from '@/types'

export class FinancialBudgetService {
  private supabase = createClient()

  private async getUserId(): Promise<string> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error || !user) throw new Error('Unauthorized')
    return user.id
  }

  async getBudgetsByMonth(referenceMonth: string): Promise<FinancialBudget[]> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('financial_budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('reference_month', referenceMonth)
      .order('category', { ascending: true })

    if (error) throw error
    return data || []
  }

  async upsertBudget(budget: FinancialBudgetInsert): Promise<FinancialBudget> {
    const userId = await this.getUserId()
    // Check if exists first to handle the upsert gracefully on the frontend side
    const { data: existing } = await this.supabase
      .from('financial_budgets')
      .select('id')
      .eq('user_id', userId)
      .eq('category', budget.category)
      .eq('reference_month', budget.reference_month)
      .single()

    if (existing) {
      return this.updateBudget(existing.id, { amount_limit: budget.amount_limit })
    }

    const { data, error } = await this.supabase
      .from('financial_budgets')
      .insert([{ ...budget, user_id: userId }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error inserting budget:', error)
      throw error
    }
    return data
  }

  async updateBudget(id: string, updates: FinancialBudgetUpdate): Promise<FinancialBudget> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('financial_budgets')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating budget:', error)
      throw error
    }
    return data
  }

  async deleteBudget(id: string): Promise<void> {
    const userId = await this.getUserId()
    const { error } = await this.supabase
      .from('financial_budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error deleting budget:', error)
      throw error
    }
  }
}

export const financialBudgetService = new FinancialBudgetService()
