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
  const { addEntry, referenceMonth } = useFinancial()
  const [type, setType] = React.useState<'income' | 'expense'>('expense')
  const [title, setTitle] = React.useState('')
  const [amount, setAmount] = React.useState('')
  const [category, setCategory] = React.useState('Alimentação')
  const [dueDate, setDueDate] = React.useState('')
  const [isPaid, setIsPaid] = React.useState(true)

  React.useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setAmount('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return
    
    await addEntry({
      title,
      amount: parseFloat(amount),
      type,
      category,
      is_paid: type === 'income' ? true : isPaid,
      paid_at: (type === 'income' || isPaid) ? new Date().toISOString() : null,
      due_date: dueDate || null,
      notes: null,
      is_recurring: false,
      recurrence_type: null,
      is_fixed: false,
      reference_month: referenceMonth
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Transação">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-surface-elevated rounded-xl">
          <button 
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'expense' ? 'bg-surface-card shadow-sm text-status-error' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Despesa
          </button>
          <button 
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'income' ? 'bg-surface-card shadow-sm text-status-success' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Receita
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Título</label>
          <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Mercado, Salário..." />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Valor (R$)</label>
          <Input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Categoria</label>
          <select 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option>Alimentação</option>
            <option>Moradia</option>
            <option className="bg-surface-elevated text-text-primary">Transporte</option>
            <option className="bg-surface-elevated text-text-primary">Saúde</option>
            <option className="bg-surface-elevated text-text-primary">Lazer</option>
            <option className="bg-surface-elevated text-text-primary">Salário</option>
            <option className="bg-surface-elevated text-text-primary">Outros</option>
          </select>
        </div>

        {type === 'expense' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">Vencimento (Opcional)</label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </div>
        )}

        {type === 'expense' && (
           <label className="flex items-center gap-2 text-sm font-medium cursor-pointer text-text-primary">
             <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="rounded border-border-default text-action-primary focus:ring-action-primary h-4 w-4" />
             Já está pago
           </label>
        )}

        <Button type="submit" className="w-full mt-2 bg-action-primary hover:bg-action-primary-hover text-text-on-brand">Salvar {type === 'income' ? 'Receita' : 'Despesa'}</Button>
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
