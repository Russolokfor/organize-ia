'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFinancial } from '@/components/financial/FinancialProvider'

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface-card border border-border-default shadow-card rounded-2xl p-6 z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-surface-subtle text-text-secondary hover:text-text-primary rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function TransactionModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addEntry, referenceMonth, goals, addFundsToGoal } = useFinancial()
  const [type, setType] = React.useState<'income' | 'expense'>('expense')
  const [title, setTitle] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [category, setCategory] = React.useState('Alimentação')
  const [dueDate, setDueDate] = React.useState('')
  const [isPaid, setIsPaid] = React.useState(true)
  const [recurrence, setRecurrence] = React.useState('none')
  const [goalId, setGoalId] = React.useState('none')
  const [ignoreBalance, setIgnoreBalance] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setAmount('')
      setDueDate('')
      setRecurrence('none')
      setGoalId('none')
      setIgnoreBalance(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return
    
    const finalDate = dueDate || new Date().toISOString().split('T')[0]
    const isRecurring = recurrence !== 'none'
    const parsedAmount = parseFloat(amount)
    
    try {
      await addEntry({
        title,
        amount: parsedAmount,
        type,
        category,
        is_paid: type === 'income' ? true : isPaid,
        paid_at: (type === 'income' || isPaid) ? new Date().toISOString() : null,
        due_date: finalDate,
        notes: null,
        is_recurring: isRecurring,
        recurrence_type: isRecurring ? recurrence : null,
        is_fixed: isRecurring,
        reference_month: referenceMonth,
        goal_id: goalId !== 'none' ? goalId : null,
        ignore_from_balance: goalId !== 'none' ? ignoreBalance : false
      })

      if (goalId !== 'none') {
        const modifier = type === 'income' ? parsedAmount : -parsedAmount;
        await addFundsToGoal(goalId, modifier);
      }

      onClose()
    } catch(err) {
      console.error(err)
      alert("Erro ao adicionar transação")
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Transação">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2 p-1.5 bg-surface-elevated rounded-xl border border-border-default/50">
          <button 
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${type === 'expense' ? 'bg-status-error/10 text-status-error shadow-sm border border-status-error/20' : 'text-text-secondary hover:text-text-primary'}`}
          >
            🔽 Despesa
          </button>
          <button 
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${type === 'income' ? 'bg-status-success/10 text-status-success shadow-sm border border-status-success/20' : 'text-text-secondary hover:text-text-primary'}`}
          >
            🔼 Receita
          </button>
        </div>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Título</label>
            <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Mercado, Salário..." className="h-12 bg-surface-card border-border-default focus-visible:ring-action-primary" />
          </div>

          <div className="flex gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Valor (R$)</label>
              <Input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="h-12 bg-surface-card border-border-default focus-visible:ring-action-primary text-lg font-medium" />
            </div>
            
            <div className="space-y-1.5 flex-[1.5]">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Categoria</label>
              <select 
                value={category} 
                onChange={e => setCategory(e.target.value)}
                className="flex h-12 w-full rounded-md border border-border-default bg-surface-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary text-text-primary"
              >
                <option className="bg-surface-elevated text-text-primary">Alimentação</option>
                <option className="bg-surface-elevated text-text-primary">Moradia</option>
                <option className="bg-surface-elevated text-text-primary">Transporte</option>
                <option className="bg-surface-elevated text-text-primary">Saúde</option>
                <option className="bg-surface-elevated text-text-primary">Lazer</option>
                <option className="bg-surface-elevated text-text-primary">Salário</option>
                <option className="bg-surface-elevated text-text-primary">Outros</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Data (Opcional)</label>
              <Input 
                type="date" 
                value={dueDate} 
                onChange={e => setDueDate(e.target.value)} 
                className="h-12 bg-surface-card border-border-default focus-visible:ring-action-primary color-scheme-dark"
                title="Se não selecionar, usará a data de hoje"
              />
            </div>
            <div className="space-y-1.5 flex-[1.2]">
              <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Repetição</label>
              <select 
                value={recurrence} 
                onChange={e => setRecurrence(e.target.value)}
                className="flex h-12 w-full rounded-md border border-border-default bg-surface-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary text-text-primary"
              >
                <option value="none" className="bg-surface-elevated text-text-primary">Única vez</option>
                <option value="weekly" className="bg-surface-elevated text-text-primary">Toda Semana</option>
                <option value="biweekly" className="bg-surface-elevated text-text-primary">A cada 15 dias</option>
                <option value="monthly" className="bg-surface-elevated text-text-primary">Todo Mês (12x)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Vincular a uma Meta / Reserva?</label>
            <select 
              value={goalId} 
              onChange={e => setGoalId(e.target.value)}
              className="flex h-12 w-full rounded-md border border-border-default bg-surface-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary text-text-primary"
            >
              <option value="none" className="bg-surface-elevated text-text-primary">Não vincular</option>
              {goals.map(g => (
                <option key={g.id} value={g.id} className="bg-surface-elevated text-text-primary">{g.title}</option>
              ))}
            </select>
          </div>

          {goalId !== 'none' && (
            <div className="pt-2">
              <label className="flex items-center gap-3 text-sm font-medium cursor-pointer text-text-primary bg-surface-elevated p-3 rounded-xl border border-border-default/50 hover:border-border-default transition-colors">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input 
                    type="checkbox" 
                    checked={ignoreBalance} 
                    onChange={e => setIgnoreBalance(e.target.checked)} 
                    className="appearance-none peer w-5 h-5 border-2 border-border-focus rounded cursor-pointer checked:bg-action-primary checked:border-action-primary transition-all" 
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                Isolar valor (Não contabilizar no saldo do mês)
              </label>
            </div>
          )}

          {type === 'expense' && (
            <div className="pt-2">
              <label className="flex items-center gap-3 text-sm font-medium cursor-pointer text-text-primary bg-surface-elevated p-3 rounded-xl border border-border-default/50 hover:border-border-default transition-colors">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input 
                    type="checkbox" 
                    checked={isPaid} 
                    onChange={e => setIsPaid(e.target.checked)} 
                    className="appearance-none peer w-5 h-5 border-2 border-border-focus rounded cursor-pointer checked:bg-status-success checked:border-status-success transition-all" 
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                Esta despesa já está paga
              </label>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold mt-4 bg-action-primary hover:bg-action-primary-hover text-text-on-brand shadow-lg hover:shadow-action-primary/25 transition-all">
          {type === 'income' ? 'Registrar Receita' : 'Registrar Despesa'}
        </Button>
      </form>
    </Modal>
  )
}

export function BudgetModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { upsertBudget, referenceMonth } = useFinancial()
  const [category, setCategory] = React.useState('Alimentação')
  const [limit, setLimit] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!limit) return
    await upsertBudget({
      category,
      amount_limit: parseFloat(limit),
      reference_month: referenceMonth
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Orçamento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Categoria</label>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border-default bg-surface-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:opacity-50 text-text-primary"
          >
            <option className="bg-surface-elevated text-text-primary">Alimentação</option>
            <option className="bg-surface-elevated text-text-primary">Moradia</option>
            <option className="bg-surface-elevated text-text-primary">Transporte</option>
            <option className="bg-surface-elevated text-text-primary">Saúde</option>
            <option className="bg-surface-elevated text-text-primary">Lazer</option>
            <option className="bg-surface-elevated text-text-primary">Outros</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Limite (R$)</label>
          <Input required type="number" step="0.01" value={limit} onChange={e => setLimit(e.target.value)} placeholder="Ex: 800.00" />
        </div>
        <Button type="submit" className="w-full bg-action-primary hover:bg-action-primary-hover text-text-on-brand">Salvar Orçamento</Button>
      </form>
    </Modal>
  )
}

export function GoalModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { addGoal } = useFinancial()
  const [title, setTitle] = React.useState('')
  const [target, setTarget] = React.useState('')
  const [current, setCurrent] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !target) return
    await addGoal({
      title,
      target_amount: parseFloat(target),
      current_amount: parseFloat(current) || 0,
      target_date: null,
      notes: null
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Meta Financeira">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">A que se destina?</label>
          <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Viagem Europa, Reserva Emergência..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Valor Alvo (R$)</label>
          <Input required type="number" step="0.01" value={target} onChange={e => setTarget(e.target.value)} placeholder="Ex: 10000.00" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Já tenho acumulado (R$)</label>
          <Input type="number" step="0.01" value={current} onChange={e => setCurrent(e.target.value)} placeholder="Ex: 1000.00 (opcional)" />
        </div>
        <Button type="submit" className="w-full bg-action-primary hover:bg-action-primary-hover text-text-on-brand">Criar Meta</Button>
      </form>
    </Modal>
  )
}
