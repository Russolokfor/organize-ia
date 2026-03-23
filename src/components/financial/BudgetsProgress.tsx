'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { Trash2, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function BudgetsProgress() {
  const { budgets, entries, deleteBudget } = useFinancial()
  const [budgetToDelete, setBudgetToDelete] = React.useState<string | null>(null)

  const getSpentForCategory = (category: string) => {
    return entries
      .filter(e => e.type === 'expense' && e.is_paid && e.category === category)
      .reduce((sum, e) => sum + Number(e.amount), 0)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <>
    <Card className="bg-surface-card backdrop-blur-sm border-border-default shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-text-primary">Orçamento Mensal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length === 0 ? (
          <p className="text-text-secondary text-sm py-2">Nenhum orçamento definido para este mês.</p>
        ) : (
          budgets.map((budget) => {
            const spent = getSpentForCategory(budget.category)
            const limit = Number(budget.amount_limit)
            const pct = Math.min((spent / limit) * 100, 100)
            const isOver = spent > limit

            return (
              <div key={budget.id} className="space-y-1 group">
                <div className="flex justify-between items-start text-sm">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setBudgetToDelete(budget.id)}
                      className="p-1.5 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-md transition-all border border-transparent hover:border-status-error/20"
                      title="Excluir Orçamento"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="font-medium text-text-primary">{budget.category}</span>
                  </div>
                  <span className={isOver ? 'text-status-error font-medium' : 'text-text-secondary'}>
                    {formatCurrency(spent)} / {formatCurrency(limit)}
                  </span>
                </div>
                <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${isOver ? 'bg-status-error' : pct > 80 ? 'bg-status-warning' : 'bg-action-primary'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>

    {/* Custom Delete Confirmation Modal */}
    <AnimatePresence>
      {budgetToDelete && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setBudgetToDelete(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-surface-card border border-border-default shadow-card rounded-2xl p-6 z-50"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-status-error/10 text-status-error rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Excluir Orçamento?</h2>
                <p className="text-sm text-text-secondary">
                  Tem certeza que deseja excluir esta meta mensal? Seus lançamentos vinculados a ela permanecerão intactos.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
               <Button variant="outline" onClick={() => setBudgetToDelete(null)} className="h-10 px-4 text-text-primary border-border-default bg-transparent hover:bg-surface-elevated">
                 Cancelar
               </Button>
               <Button 
                 className="h-10 px-4 bg-status-error hover:bg-red-600 text-white border-0"
                 onClick={() => {
                   if (budgetToDelete) {
                     deleteBudget(budgetToDelete)
                     setBudgetToDelete(null)
                   }
                 }}
               >
                 Excluir Orçamento
               </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  )
}
