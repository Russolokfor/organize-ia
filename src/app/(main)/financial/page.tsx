import { createClient } from '@/lib/supabase-server'
import { FinancialPortalClient } from './FinancialPortalClient'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function FinancialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-text-secondary">Faça login para acessar o financeiro.</p>
      </div>
    )
  }

  const referenceMonth = format(new Date(), 'yyyy-MM')

  const [entriesRes, budgetsRes, goalsRes] = await Promise.all([
    supabase
      .from('financial_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('reference_month', referenceMonth)
      .order('due_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('financial_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('reference_month', referenceMonth)
      .order('category', { ascending: true }),
    supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
  ])

  const initialData = {
    entries: entriesRes.data || [],
    budgets: budgetsRes.data || [],
    goals: goalsRes.data || [],
    referenceMonth: referenceMonth,
  }

  return <FinancialPortalClient initialData={initialData} />
}
