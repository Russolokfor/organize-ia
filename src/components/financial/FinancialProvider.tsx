'use client'

import * as React from 'react'
import { format, isBefore, startOfToday } from 'date-fns'
import { 
  FinancialEntry, FinancialBudget, FinancialGoal, 
  FinancialEntryInsert, FinancialBudgetInsert, FinancialGoalInsert,
  FinancialEntryUpdate, FinancialBudgetUpdate, FinancialGoalUpdate
} from '@/types'
import { financialEntryService } from '@/services/financialEntryService'
import { financialBudgetService } from '@/services/financialBudgetService'
import { financialGoalService } from '@/services/financialGoalService'

interface FinancialMetrics {
  balance: number
  totalIncome: number
  totalExpense: number
  committedAmount: number
  pendingBillsCount: number
  overdueBillsCount: number
}

interface FinancialContextType {
  entries: FinancialEntry[]
  budgets: FinancialBudget[]
  goals: FinancialGoal[]
  metrics: FinancialMetrics
  loading: boolean
  referenceMonth: string
  setReferenceMonth: (month: string) => void
  refresh: () => Promise<void>
  
  // Entries
  addEntry: (entry: FinancialEntryInsert) => Promise<void>
  updateEntry: (id: string, updates: FinancialEntryUpdate) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  togglePaid: (id: string, isPaid: boolean) => Promise<void>

  // Budgets
  upsertBudget: (budget: FinancialBudgetInsert) => Promise<void>
  deleteBudget: (id: string) => Promise<void>

  // Goals
  addGoal: (goal: FinancialGoalInsert) => Promise<void>
  updateGoal: (id: string, updates: FinancialGoalUpdate) => Promise<void>
  addFundsToGoal: (id: string, amount: number) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
}

const FinancialContext = React.createContext<FinancialContextType | undefined>(undefined)

interface FinancialProviderProps {
  children: React.ReactNode
  initialData?: {
    entries: FinancialEntry[]
    budgets: FinancialBudget[]
    goals: FinancialGoal[]
  }
}

export function FinancialProvider({ children, initialData }: FinancialProviderProps) {
  const [entries, setEntries] = React.useState<FinancialEntry[]>(initialData?.entries || [])
  const [budgets, setBudgets] = React.useState<FinancialBudget[]>(initialData?.budgets || [])
  const [goals, setGoals] = React.useState<FinancialGoal[]>(initialData?.goals || [])
  
  // Se veio com os dados iniciais, loading entra como falso
  const [loading, setLoading] = React.useState(!initialData)
  const [referenceMonth, setReferenceMonth] = React.useState(format(new Date(), 'yyyy-MM'))
  
  // Usado para evitar fetch na primeira montagem caso os dados já tenham vindo do Server
  const hydrated = React.useRef(!!initialData)

  const refresh = React.useCallback(async () => {
    // Se acabamos de receber initialData no SSR, não busca na primeira vez
    if (hydrated.current) {
      hydrated.current = false
      return
    }

    try {
      setLoading(true)
      const [fetchedEntries, fetchedBudgets, fetchedGoals] = await Promise.all([
        financialEntryService.getEntriesByMonth(referenceMonth),
        financialBudgetService.getBudgetsByMonth(referenceMonth),
        financialGoalService.getGoals()
      ])
      
      setEntries(fetchedEntries)
      setBudgets(fetchedBudgets)
      setGoals(fetchedGoals)
    } catch (error) {
      console.error('Error fetching financial data:', error)
    } finally {
      setLoading(false)
    }
  }, [referenceMonth])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  // Metrics Calculation
  const metrics = React.useMemo(() => {
    const today = startOfToday()
    let totalIncome = 0
    let paidExpense = 0
    let committedAmount = 0
    let pendingBillsCount = 0
    let overdueBillsCount = 0

    entries.forEach(entry => {
      if (entry.ignore_from_balance) return;

      if (entry.type === 'income') {
        totalIncome += Number(entry.amount)
      } else if (entry.type === 'expense') {
        if (entry.is_paid) {
          paidExpense += Number(entry.amount)
        } else {
          committedAmount += Number(entry.amount)
          pendingBillsCount += 1
          
          if (entry.due_date && isBefore(new Date(entry.due_date), today)) {
            overdueBillsCount += 1
          }
        }
      }
    })

    return {
      balance: totalIncome - paidExpense,
      totalIncome,
      totalExpense: paidExpense + committedAmount,
      committedAmount,
      pendingBillsCount,
      overdueBillsCount
    }
  }, [entries])

  // Entry Actions
  const addEntry = async (entry: FinancialEntryInsert) => {
    if (!entry.is_recurring) {
      // Single entry
      const newEntry = await financialEntryService.createEntry(entry)
      if (newEntry.reference_month === referenceMonth) {
        setEntries(prev => [newEntry, ...prev])
      }
      return
    }

    // Recurring entries
    import('date-fns').then(async ({ addMonths, addWeeks, addDays, format, parseISO }) => {
      const baseDate = parseISO(entry.due_date!)
      const inserts: Promise<any>[] = []
      
      let count = 1
      if (entry.recurrence_type === 'monthly') count = 12
      else if (entry.recurrence_type === 'weekly') count = 52
      else if (entry.recurrence_type === 'biweekly') count = 24

      for (let i = 0; i < count; i++) {
        let nextDate = baseDate
        if (i > 0) {
          if (entry.recurrence_type === 'monthly') nextDate = addMonths(baseDate, i)
          else if (entry.recurrence_type === 'weekly') nextDate = addWeeks(baseDate, i)
          else if (entry.recurrence_type === 'biweekly') nextDate = addDays(baseDate, i * 14)
        }

        const nextDateStr = format(nextDate, 'yyyy-MM-dd')
        const nextMonthRef = format(nextDate, 'yyyy-MM')
        
        inserts.push(financialEntryService.createEntry({
          ...entry,
          due_date: nextDateStr,
          reference_month: nextMonthRef,
          is_paid: i === 0 ? entry.is_paid : false, // only first might be paid
          paid_at: i === 0 ? entry.paid_at : null
        }))
      }

      const results = await Promise.all(inserts)
      
      // Update local state if any of the new entries belong to the currently viewed month
      const currentMonthEntries = results.filter(r => r.reference_month === referenceMonth)
      if (currentMonthEntries.length > 0) {
        setEntries(prev => [...currentMonthEntries, ...prev])
      }
    })
  }

  const updateEntry = async (id: string, updates: FinancialEntryUpdate) => {
    const updated = await financialEntryService.updateEntry(id, updates)
    setEntries(prev => prev.map(e => e.id === id ? updated : e))
  }

  const deleteEntry = async (id: string) => {
    await financialEntryService.deleteEntry(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  const togglePaid = async (id: string, isPaid: boolean) => {
    const updated = await financialEntryService.togglePaid(id, isPaid)
    setEntries(prev => prev.map(e => e.id === id ? updated : e))
  }

  // Budget Actions
  const upsertBudget = async (budget: FinancialBudgetInsert) => {
    const saved = await financialBudgetService.upsertBudget(budget)
    setBudgets(prev => {
      const exists = prev.find(b => b.id === saved.id)
      if (exists) return prev.map(b => b.id === saved.id ? saved : b)
      return [...prev, saved]
    })
  }

  const deleteBudget = async (id: string) => {
    await financialBudgetService.deleteBudget(id)
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  // Goal Actions
  const addGoal = async (goal: FinancialGoalInsert) => {
    const newGoal = await financialGoalService.createGoal(goal)
    setGoals(prev => [...prev, newGoal])
  }

  const updateGoal = async (id: string, updates: FinancialGoalUpdate) => {
    const updated = await financialGoalService.updateGoal(id, updates)
    setGoals(prev => prev.map(g => g.id === id ? updated : g))
  }

  const addFundsToGoal = async (id: string, amount: number) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    const updated = await financialGoalService.addFunds(id, amount, Number(goal.current_amount))
    setGoals(prev => prev.map(g => g.id === id ? updated : g))
  }

  const deleteGoal = async (id: string) => {
    await financialGoalService.deleteGoal(id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const value = React.useMemo(() => ({
    entries, budgets, goals, metrics, loading, referenceMonth, setReferenceMonth, refresh,
    addEntry, updateEntry, deleteEntry, togglePaid,
    upsertBudget, deleteBudget,
    addGoal, updateGoal, addFundsToGoal, deleteGoal
  }), [entries, budgets, goals, metrics, loading, referenceMonth, setReferenceMonth, refresh])

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancial() {
  const context = React.useContext(FinancialContext)
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider')
  }
  return context
}
