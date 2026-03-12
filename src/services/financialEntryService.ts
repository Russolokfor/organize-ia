import { createClient } from '@/lib/supabase'
import { FinancialEntry, FinancialEntryInsert, FinancialEntryUpdate } from '@/types'

export class FinancialEntryService {
  private supabase = createClient()

  private async getUserId(): Promise<string> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error || !user) throw new Error('Unauthorized')
    return user.id
  }

  async getEntriesByMonth(referenceMonth: string): Promise<FinancialEntry[]> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('financial_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('reference_month', referenceMonth)
      .order('due_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getPendingExpenses(): Promise<FinancialEntry[]> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('financial_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .eq('is_paid', false)
      .order('due_date', { ascending: true, nullsFirst: false })

    if (error) throw error
    return data || []
  }

  async createEntry(entry: FinancialEntryInsert): Promise<FinancialEntry> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('financial_entries')
      .insert([{ ...entry, user_id: userId }])
      .select()
      .single()

    if (error) {
      console.error('Supabase error inserting entry:', error)
      throw error
    }
    return data
  }

  async updateEntry(id: string, updates: FinancialEntryUpdate): Promise<FinancialEntry> {
    const userId = await this.getUserId()
    const { data, error } = await this.supabase
      .from('financial_entries')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Supabase error updating entry:', error)
      throw error
    }
    return data
  }

  async deleteEntry(id: string): Promise<void> {
    const userId = await this.getUserId()
    const { error } = await this.supabase
      .from('financial_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error deleting entry:', error)
      throw error
    }
  }

  async togglePaid(id: string, isPaid: boolean): Promise<FinancialEntry> {
    const paidAt = isPaid ? new Date().toISOString() : null
    return this.updateEntry(id, { is_paid: isPaid, paid_at: paidAt })
  }
}

export const financialEntryService = new FinancialEntryService()
