'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, CheckCircle2, Clock, AlertCircle, Copy, Trash2, Receipt, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, isPast, differenceInDays, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { FinancialEntry } from '@/types'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { Edit2 } from 'lucide-react'

export function PayablesView({ onAddClick, onEditClick }: { onAddClick?: (type?: 'expense' | 'income', hideSelector?: boolean) => void, onEditClick?: (entry: FinancialEntry) => void }) {
  const { referenceMonth, refresh } = useFinancial()
  const [entries, setEntries] = React.useState<FinancialEntry[]>([])
  const [loading, setLoading] = React.useState(true)
  const [viewMode, setViewMode] = React.useState<'pending' | 'paid' | 'overdue'>('pending')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeCategory, setActiveCategory] = React.useState<string>('all')

  const fetchPayables = React.useCallback(async () => {
    try {
      setLoading(true)
      // For a global payables view, we fetch all expenses.
      // the financialEntryService currently only has getEntriesByMonth, but it exports supabase logic.
      // Wait! getEntriesByMonth uses reference_month. Let's create a custom fetch here to get all expenses.
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      const { data, error } = await supabase
        .from('financial_entries')
        .select('*')
        .eq('type', 'expense')
        .order('due_date', { ascending: true })
      
      if (error) throw error
      setEntries(data as FinancialEntry[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchPayables()
  }, [fetchPayables])

  const togglePaid = async (id: string, currentlyPaid: boolean) => {
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      
      const payload = {
        is_paid: !currentlyPaid,
        paid_at: !currentlyPaid ? new Date().toISOString() : null
      }

      const { data, error } = await supabase
        .from('financial_entries')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      setEntries(prev => prev.map(e => e.id === id ? { ...e, ...payload } : e))
      await refresh()
    } catch(e) {
      console.error(e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir esta despesa?")) return;
    try {
      const { createClient } = await import('@/lib/supabase')
      const supabase = createClient()
      await supabase.from('financial_entries').delete().eq('id', id)
      setEntries(prev => prev.filter(e => e.id !== id))
      await refresh()
    } catch(e) {
      console.error(e)
    }
  }

  // Derived state
  const now = new Date()
  
  const processedEntries = React.useMemo(() => {
    return entries.map(entry => {
      let status: 'paid' | 'pending' | 'overdue' = 'pending'
      if (entry.is_paid) {
        status = 'paid'
      } else if (entry.due_date) {
        const parsed = parseISO(entry.due_date);
        if (isValid(parsed) && isPast(parsed)) {
          status = 'overdue'
        }
      }
      return { ...entry, status }
    })
  }, [entries])

  const entriesInScope = processedEntries.filter(entry => {
    if (!entry.due_date) return false
    const d = parseISO(entry.due_date)
    return isValid(d) && format(d, 'yyyy-MM') === referenceMonth
  })

  const filteredEntries = entriesInScope.filter(entry => {
    const matchesView = entry.status === viewMode
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (entry.category && entry.category.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCat = activeCategory === 'all' || entry.category === activeCategory
    
    return matchesView && matchesSearch && matchesCat
  })

  // Group by category for pills
  const categories = Array.from(new Set(entriesInScope.filter(e => e.status === viewMode).map(e => e.category || 'Outros')))

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  // KPIs limitados ao escopo do mês selecionado
  const totalThisMonth = entriesInScope.reduce((acc, e) => acc + Number(e.amount), 0)
  const totalPending = entriesInScope.filter(e => e.status === 'pending').reduce((acc, e) => acc + Number(e.amount), 0)
  const totalOverdue = entriesInScope.filter(e => e.status === 'overdue').reduce((acc, e) => acc + Number(e.amount), 0)

  return (
    <div className="space-y-6 mt-4">
      {/* Header Removed for Portal Integration */}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-surface-card border-border-default shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-secondary">Gasto do Mês Atual</p>
              <h3 className="text-2xl font-bold text-text-primary">{formatCurrency(totalThisMonth)}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-action-primary/10 flex items-center justify-center text-action-primary">
              <Wallet className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-card border-border-default shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-secondary">Próximos Vencimentos</p>
              <h3 className="text-2xl font-bold text-text-primary">{formatCurrency(totalPending)}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-status-warning/10 flex items-center justify-center text-status-warning">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-surface-card border-border-default shadow-card">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-text-secondary">Em Atraso</p>
              <h3 className="text-2xl font-bold text-status-error">{formatCurrency(totalOverdue)}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-status-error/10 flex items-center justify-center text-status-error">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Switch & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface-card p-2 rounded-2xl border border-border-default shadow-sm">
        <div className="flex w-full md:w-auto p-1 bg-surface-base rounded-xl">
          <button
            onClick={() => setViewMode('pending')}
            className={`flex-1 md:w-32 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'pending' ? 'bg-surface-card text-text-primary shadow-sm border border-border-default' : 'border border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setViewMode('overdue')}
            className={`flex-1 md:w-32 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'overdue' ? 'bg-status-error/10 text-status-error shadow-sm border border-status-error/20' : 'border border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            Atrasadas
          </button>
          <button
            onClick={() => setViewMode('paid')}
            className={`flex-1 md:w-32 py-2 text-sm font-semibold rounded-lg transition-all ${viewMode === 'paid' ? 'bg-surface-card text-text-primary shadow-sm border border-border-default' : 'border border-transparent text-text-secondary hover:text-text-primary'}`}
          >
            Pagas
          </button>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Buscar conta..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border-default bg-surface-base text-sm focus:outline-none focus:ring-2 focus:ring-action-primary text-text-primary transition-all"
            />
          </div>
          {onAddClick && (
            <Button onClick={() => onAddClick('expense', true)} className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand rounded-xl h-10 px-4 whitespace-nowrap hidden md:flex">
              <Plus className="w-4 h-4 mr-2" /> Nova Conta
            </Button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === 'all' ? 'bg-action-primary text-text-on-brand' : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}`}
          >
            Todas
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-action-primary text-text-on-brand' : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-surface-subtle animate-pulse rounded-2xl" />)
        ) : filteredEntries.length === 0 ? (
          <div className="col-span-full py-16 text-center text-text-secondary bg-surface-card border border-border-default border-dashed rounded-2xl">
            Nenhuma conta encontrada nesta categoria.
          </div>
        ) : (
          <AnimatePresence>
            {filteredEntries.map((entry) => (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="group"
              >
                <Card className="bg-surface-card shadow-sm hover:shadow-md border-border-default hover:border-border-focus transition-all duration-300">
                  <CardContent className="p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="font-semibold text-text-primary text-base line-clamp-1">{entry.title}</span>
                        <span className="text-xs text-text-secondary mt-0.5">{entry.category || 'Outros'}</span>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${
                           entry.status === 'paid' ? 'bg-status-success/10 text-status-success border-status-success/20' : 
                           entry.status === 'overdue' ? 'bg-status-error/10 text-status-error border-status-error/20' : 
                           'bg-status-warning/10 text-status-warning border-status-warning/20'
                         }`}>
                            {entry.status === 'paid' ? 'Pago' : entry.status === 'overdue' ? 'Em Atraso' : 'Pendente'}
                         </span>
                         <div className="flex items-center gap-1 transition-opacity pt-1">
                           {onEditClick && (
                             <button 
                               onClick={() => onEditClick(entry)}
                               className="p-1.5 text-text-secondary hover:text-action-primary hover:bg-action-primary/10 rounded-lg transition-colors border border-transparent hover:border-action-primary/20"
                               title="Editar Conta"
                             >
                               <Edit2 className="w-4 h-4" />
                             </button>
                           )}
                           <button 
                             onClick={() => handleDelete(entry.id)}
                             className="p-1.5 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors border border-transparent hover:border-status-error/20"
                             title="Excluir Conta"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm border-t border-border-subtle pt-3">
                      <div>
                        <p className="text-xs text-text-secondary">Valor</p>
                        <p className="font-bold text-text-primary">{formatCurrency(Number(entry.amount))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-text-secondary">Vencimento</p>
                        <p className={`font-medium ${entry.status === 'overdue' ? 'text-status-error' : 'text-text-primary'}`}>
                          {entry.due_date && isValid(parseISO(entry.due_date)) ? format(parseISO(entry.due_date), 'dd MMM', { locale: ptBR }) : '-'}
                        </p>
                      </div>
                    </div>

                    {/* Quick action button */}
                    <Button 
                      onClick={() => togglePaid(entry.id, entry.is_paid)}
                      variant="outline"
                      className={`w-full mt-2 h-9 text-xs font-semibold ${
                        entry.status === 'paid' 
                        ? 'border-status-success/50 text-status-success hover:bg-status-success/10' 
                        : 'border-border-default text-text-primary hover:bg-action-primary/10 hover:text-action-primary hover:border-action-primary/50'
                      }`}
                    >
                      {entry.status === 'paid' ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Desfazer Pagamento</>
                      ) : (
                         'Marcar como Pago'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
