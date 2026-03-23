'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { addMonths, parseISO, format } from 'date-fns'
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
  const [installmentsCount, setInstallmentsCount] = React.useState('2')
  const [step, setStep] = React.useState(1)
  const [goalId, setGoalId] = React.useState('none')
  const [ignoreBalance, setIgnoreBalance] = React.useState(false)

  React.useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setTitle('')
      setAmount('')
      setDueDate('')
      setRecurrence('none')
      setInstallmentsCount('2')
      setGoalId('none')
      setIgnoreBalance(false)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !amount) return
    
    const finalDate = dueDate || new Date().toISOString().split('T')[0]
    const isInstallments = recurrence === 'installments'
    const isRecurring = recurrence !== 'none' && !isInstallments
    const parsedAmount = parseFloat(amount)
    const iterations = isInstallments ? parseInt(installmentsCount, 10) : 1
    const baseDate = parseISO(finalDate)
    
    try {
      for (let i = 0; i < iterations; i++) {
        const currentDate = addMonths(baseDate, i)
        const dateString = format(currentDate, 'yyyy-MM-dd')
        const refMonth = format(currentDate, 'yyyy-MM')
        
        await addEntry({
          title: isInstallments ? `${title} (${i + 1}/${iterations})` : title,
          amount: parsedAmount, // Note: Este é o valor de "Cada Parcela" inserido pelo próprio usuário
          type,
          category,
          is_paid: type === 'income' ? true : (i === 0 ? isPaid : false), // Apenas a primeira parcela herda o status 'paga' inicial num parcelamento de despesa futura
          paid_at: (type === 'income' || (i === 0 && isPaid)) ? new Date().toISOString() : null,
          due_date: dateString,
          notes: null,
          is_recurring: isRecurring,
          recurrence_type: isRecurring ? recurrence : null,
          is_fixed: isRecurring,
          reference_month: isInstallments ? refMonth : referenceMonth, // O valor singular avança pro mês atual se for só "referenceMonth", mas parcelamentos andam nos calendários. Mas wait, 'referenceMonth' do modal ou da data original? Avançamos a data. Para o primeiro usamos `referenceMonth` do view/hoje ou o mes do form. Vamos usar refMonth gerado localmente.
          goal_id: goalId !== 'none' ? goalId : null,
          ignore_from_balance: goalId !== 'none' ? ignoreBalance : false
        })
      }

      if (goalId !== 'none') {
        const modifier = type === 'income' ? (parsedAmount * iterations) : -(parsedAmount * iterations);
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
      <form onSubmit={handleSubmit} className="flex flex-col">
        {/* Step Indicator Headers */}
        <div className="flex justify-center items-center gap-4 mb-8 mt-2 relative">
          <div className="absolute top-1/2 left-[20%] right-[20%] h-[2px] bg-surface-base -z-10 -translate-y-1/2 rounded" />
          
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-10 h-10 rounded-full flex flex-col items-center justify-center font-bold text-sm transition-all duration-300 z-10 ${
                step === s 
                  ? 'bg-action-primary text-text-on-brand shadow-lg shadow-action-primary/20 scale-110' 
                  : step > s 
                    ? 'bg-surface-elevated text-text-primary border-2 border-action-primary' 
                    : 'bg-surface-base text-text-tertiary border-2 border-surface-border'
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="flex flex-col h-full"
              >
                <div className="flex p-1 bg-surface-elevated rounded-xl border border-border-default/50 mb-6">
                  <button 
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'expense' ? 'bg-status-error text-white shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    Despesa
                  </button>
                  <button 
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === 'income' ? 'bg-status-success text-white shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    Receita
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center py-10 mb-6 rounded-2xl bg-surface-base/50 border border-border-default/30">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary mb-3">Valor da {type === 'income' ? 'Receita' : 'Despesa'}</span>
                  <div className="flex items-center justify-center">
                    <span className="text-3xl font-medium text-text-tertiary mr-2">R$</span>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="text-5xl font-bold bg-transparent border-none focus:ring-0 text-center w-56 text-text-primary placeholder:text-surface-border p-0 m-0"
                      placeholder="0.00"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (!amount || parseFloat(amount) <= 0) return;
                      setStep(2);
                    }}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="w-full h-12 text-base font-semibold bg-action-primary hover:bg-action-primary-hover text-text-on-brand shadow-lg transition-all rounded-xl disabled:opacity-50"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Título</label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Mercado, Salário..." className="h-12 bg-surface-card border-border-default focus-visible:ring-action-primary" autoFocus />
                </div>

                <div className="flex gap-4">
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
                  <div className="space-y-1.5 flex-[1.2]">
                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Data (Opcional)</label>
                    <Input 
                      type="date" 
                      value={dueDate} 
                      onChange={e => setDueDate(e.target.value)} 
                      className="h-12 bg-surface-card border-border-default focus-visible:ring-action-primary color-scheme-dark"
                      title="Se não selecionar, usará a data de hoje"
                    />
                  </div>
                </div>

                <div className="mt-8 pt-4 flex gap-3">
                  <Button 
                    type="button" 
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 h-12 text-base font-semibold border-border-default hover:bg-surface-subtle transition-all rounded-xl"
                  >
                    Voltar
                  </Button>
                  <Button 
                    type="button" 
                    onClick={() => {
                      if (!title.trim()) return;
                      setStep(3);
                    }}
                    disabled={!title.trim()}
                    className="flex-1 h-12 text-base font-semibold bg-action-primary hover:bg-action-primary-hover text-text-on-brand shadow-lg transition-all rounded-xl disabled:opacity-50"
                  >
                    Continuar
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Repetição</label>
                  <select 
                    value={recurrence} 
                    onChange={e => setRecurrence(e.target.value)}
                    className="flex h-12 w-full rounded-md border border-border-default bg-surface-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary text-text-primary"
                  >
                    <option value="none" className="bg-surface-elevated text-text-primary">Única vez</option>
                    <option value="weekly" className="bg-surface-elevated text-text-primary">Toda Semana</option>
                    <option value="biweekly" className="bg-surface-elevated text-text-primary">A cada 15 dias</option>
                    <option value="monthly" className="bg-surface-elevated text-text-primary">Mensal (Fixo/Infinito)</option>
                    <option value="installments" className="bg-surface-elevated text-status-warning">Parcelado (Tempo dtrm.)</option>
                  </select>
                </div>

                <AnimatePresence>
                  {recurrence === 'installments' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 overflow-hidden">
                      <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Quantidade de Parcelas</label>
                      <Input 
                        type="number" 
                        min="2" 
                        max="360" 
                        value={installmentsCount} 
                        onChange={e => setInstallmentsCount(e.target.value)} 
                        className="h-12 bg-surface-card border-status-warning/50 focus-visible:ring-status-warning text-text-primary"
                        title="Insira o número de meses"
                      />
                      <p className="text-[10px] text-text-tertiary">Sistemas criará {installmentsCount} contas futuras automaticamente.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Vincular a uma Meta/Reserva (Opcional)</label>
                  <select 
                    value={goalId} 
                    onChange={e => setGoalId(e.target.value)}
                    className="flex h-12 w-full rounded-md border border-border-default bg-surface-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-primary text-text-primary"
                  >
                    <option value="none" className="bg-surface-elevated text-text-primary">Nenhuma</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id} className="bg-surface-elevated text-text-primary">{g.title}</option>
                    ))}
                  </select>
                </div>

                {goalId !== 'none' && (
                  <label className="flex items-center justify-between p-4 rounded-xl border border-border-default bg-surface-elevated cursor-pointer hover:border-border-focus transition-colors mt-2">
                    <span className="text-sm font-medium text-text-primary">Isolar do Saldo (Não contabilizar no total)</span>
                    <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${ignoreBalance ? 'bg-action-primary' : 'bg-surface-base border border-border-default'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${ignoreBalance ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <input type="checkbox" checked={ignoreBalance} onChange={e => setIgnoreBalance(e.target.checked)} className="sr-only" />
                  </label>
                )}

                {type === 'expense' && (
                  <label className="flex items-center justify-between p-4 rounded-xl border border-border-default bg-surface-elevated cursor-pointer hover:border-border-focus transition-colors mt-2">
                    <span className="text-sm font-medium text-text-primary">Esta despesa já está paga?</span>
                    <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${isPaid ? 'bg-status-success' : 'bg-surface-base border border-border-default'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${isPaid ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="sr-only" />
                  </label>
                )}

                <div className="mt-8 pt-4 flex gap-3">
                  <Button 
                    type="button" 
                    onClick={() => setStep(2)}
                    variant="outline"
                    className="flex-1 h-12 text-base font-semibold border-border-default hover:bg-surface-subtle transition-all rounded-xl"
                  >
                    Voltar
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2] h-12 text-base font-semibold bg-action-primary hover:bg-action-primary-hover text-text-on-brand shadow-lg transition-all rounded-xl"
                  >
                    {type === 'income' ? 'Registrar Receita' : 'Registrar Despesa'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
