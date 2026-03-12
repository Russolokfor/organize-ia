'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { FinancialSummaryCards } from '@/components/financial/FinancialSummaryCards'
import { FinancialCharts } from '@/components/financial/FinancialCharts'
import { RecentEntries } from '@/components/financial/RecentEntries'
import { BillsDue } from '@/components/financial/BillsDue'
import { BudgetsProgress } from '@/components/financial/BudgetsProgress'
import { GoalsProgress } from '@/components/financial/GoalsProgress'
import { TransactionModal, BudgetModal, GoalModal } from '@/components/financial/FinancialForms'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function FinancialPage() {
  const { loading, referenceMonth, setReferenceMonth } = useFinancial()
  const [isTransactionModalOpen, setTransactionModalOpen] = React.useState(false)
  const [isBudgetModalOpen, setBudgetModalOpen] = React.useState(false)
  const [isGoalModalOpen, setGoalModalOpen] = React.useState(false)

  if (loading) {
    return <div className="p-8 animate-pulse">Carregando dados financeiros...</div>
  }

  // Helper to change month
  const handleMonthChange = (offset: number) => {
    const [year, month] = referenceMonth.split('-').map(Number)
    let newDate = new Date(year, month - 1 + offset, 1)
    const newStr = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    setReferenceMonth(newStr)
  }

  const [year, month] = referenceMonth.split('-')
  const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-6xl mx-auto pb-24"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portal Financeiro</h1>
          <p className="text-muted-foreground mt-1">Clareza no fluxo de caixa e compromissos do mês.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-card border border-border/50 rounded-xl shadow-sm p-1">
            <button onClick={() => handleMonthChange(-1)} className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">&lt;</button>
            <span className="px-4 font-medium text-sm capitalize">{monthName}</span>
            <button onClick={() => handleMonthChange(1)} className="px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">&gt;</button>
          </div>
          <Button className="rounded-xl shadow-md" onClick={() => setTransactionModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Transação
          </Button>
        </div>
      </div>

      <FinancialSummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FinancialCharts />
          <RecentEntries />
        </div>
        <div className="space-y-6">
          <BillsDue />
          
          <div className="space-y-2">
            <div className="flex justify-end pr-1">
              <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1" onClick={() => setBudgetModalOpen(true)}>
                <Plus className="w-3 h-3"/> Novo Orçamento
              </button>
            </div>
            <BudgetsProgress />
          </div>

          <div className="space-y-2">
            <div className="flex justify-end pr-1">
              <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1" onClick={() => setGoalModalOpen(true)}>
                <Plus className="w-3 h-3"/> Nova Meta
              </button>
            </div>
            <GoalsProgress />
          </div>
        </div>
      </div>

      <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setTransactionModalOpen(false)} />
      <BudgetModal isOpen={isBudgetModalOpen} onClose={() => setBudgetModalOpen(false)} />
      <GoalModal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} />
    </motion.div>
  )
}
