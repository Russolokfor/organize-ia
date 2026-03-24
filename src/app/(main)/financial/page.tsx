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
import { FinancialEntry } from '@/types'
import { GoalModal, BudgetModal, TransactionModal } from '@/components/financial/FinancialForms'
import { StatementUploadModal } from '@/components/financial/StatementUploadModal'
import { PayablesView } from '@/components/financial/PayablesView'
import { Button } from '@/components/ui/button'
import { Plus, Wand2 } from 'lucide-react'

export default function FinancialPage() {
  const { loading, referenceMonth, setReferenceMonth, refresh } = useFinancial()
  const [isTransactionModalOpen, setTransactionModalOpen] = React.useState(false)
  const [transactionModalType, setTransactionModalType] = React.useState<'expense' | 'income'>('expense')
  const [hideTransactionSelector, setHideTransactionSelector] = React.useState(false)
  const [editingEntry, setEditingEntry] = React.useState<FinancialEntry | null>(null)

  const [isBudgetModalOpen, setBudgetModalOpen] = React.useState(false)
  const [isGoalModalOpen, setGoalModalOpen] = React.useState(false)
  const [isStatementModalOpen, setStatementModalOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'overview' | 'payables'>('overview')

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
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Portal Financeiro</h1>
          <p className="text-text-secondary mt-1">Clareza no fluxo de caixa e compromissos do mês.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-card border border-border-default rounded-xl shadow-sm p-1">
            <button onClick={() => handleMonthChange(-1)} className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-colors">&lt;</button>
            <span className="px-4 font-medium text-sm capitalize text-text-primary">{monthName}</span>
            <button onClick={() => handleMonthChange(1)} className="px-3 py-1.5 text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-lg transition-colors">&gt;</button>
          </div>
          <Button variant="outline" className="rounded-xl shadow-sm border-action-primary/20 hover:bg-surface-subtle hidden md:flex" onClick={() => setStatementModalOpen(true)}>
            <Wand2 className="w-4 h-4 mr-2 text-action-primary" /> Importar Extrato
          </Button>
          <Button className="rounded-xl shadow-md bg-action-primary text-text-on-brand hover:bg-action-primary-hover" onClick={() => {
            setTransactionModalType('expense')
            setHideTransactionSelector(false)
            setEditingEntry(null)
            setTransactionModalOpen(true)
          }}>
            <Plus className="w-4 h-4 mr-2" /> Nova Transação
          </Button>
        </div>
      </div>

      <div className="flex w-full md:w-auto p-1 bg-surface-base rounded-xl mb-6 border border-border-default/50 max-w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`whitespace-nowrap flex-1 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-surface-card text-text-primary shadow-sm border border-border-default' : 'border border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          Visão Geral
        </button>
        <button
          onClick={() => setActiveTab('payables')}
          className={`whitespace-nowrap flex-1 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'payables' ? 'bg-surface-card text-text-primary shadow-sm border border-border-default' : 'border border-transparent text-text-secondary hover:text-text-primary'}`}
        >
          Contas a Pagar
        </button>
      </div>

      {activeTab === 'overview' ? (
        <motion.div 
          key="overview"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        >
          <FinancialSummaryCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <FinancialCharts />
              <RecentEntries />
            </div>
            <div className="space-y-6">
              <BillsDue />
              
              <div className="space-y-2">
                <div className="flex justify-end pr-1">
                  <button className="text-xs font-semibold text-action-primary hover:text-action-primary-hover flex items-center gap-1" onClick={() => setBudgetModalOpen(true)}>
                    <Plus className="w-3 h-3"/> Novo Orçamento
                  </button>
                </div>
                <BudgetsProgress />
              </div>

              <div className="space-y-2">
                <div className="flex justify-end pr-1">
                  <button className="text-xs font-semibold text-action-primary hover:text-action-primary-hover flex items-center gap-1" onClick={() => setGoalModalOpen(true)}>
                    <Plus className="w-3 h-3"/> Nova Meta
                  </button>
                </div>
                <GoalsProgress />
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="payables"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
        >
          <PayablesView 
            onAddClick={(type = 'expense', hideSelector = true) => {
              setTransactionModalType(type)
              setHideTransactionSelector(hideSelector)
              setEditingEntry(null)
              setTransactionModalOpen(true)
            }}
            onEditClick={(entry) => {
              setEditingEntry(entry)
              setTransactionModalType(entry.type)
              setHideTransactionSelector(true) // lock type during edit
              setTransactionModalOpen(true)
            }}
          />
        </motion.div>
      )}
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => {
          setTransactionModalOpen(false)
          setTimeout(() => {
            setEditingEntry(null)
            setHideTransactionSelector(false)
          }, 300)
        }} 
        defaultType={transactionModalType}
        hideTypeSelector={hideTransactionSelector}
        editEntry={editingEntry}
        onRefresh={refresh}
      />
      <BudgetModal isOpen={isBudgetModalOpen} onClose={() => setBudgetModalOpen(false)} />
      <GoalModal isOpen={isGoalModalOpen} onClose={() => setGoalModalOpen(false)} />
      <StatementUploadModal isOpen={isStatementModalOpen} onClose={() => setStatementModalOpen(false)} />
    </motion.div>
  )
}
