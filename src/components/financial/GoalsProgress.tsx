'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { Trash2, AlertTriangle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function GoalsProgress() {
  const { goals, deleteGoal } = useFinancial()
  const [goalToDelete, setGoalToDelete] = React.useState<string | null>(null)

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <>
    <Card className="bg-surface-card backdrop-blur-sm border-border-default shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-text-primary flex items-center justify-between w-full">
          <span>Metas e Reservas</span>
          {goals.length > 0 && (
            <span className="text-sm font-normal text-text-secondary">Total: <span className="text-status-success font-medium">{formatCurrency(totalSaved)}</span></span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-text-secondary text-sm py-2">Nenhuma meta configurada.</p>
        ) : (
          goals.map((goal) => {
            const current = Number(goal.current_amount)
            const target = Number(goal.target_amount)
            const pct = Math.min((current / target) * 100, 100)

            return (
              <div key={goal.id} className="space-y-1 group">
                <div className="flex justify-between items-start text-sm">
                  <span className="font-medium text-text-primary pr-2">{goal.title}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setGoalToDelete(goal.id)}
                      className="p-1.5 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-md transition-all border border-transparent hover:border-status-error/20"
                      title="Excluir Meta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-text-secondary whitespace-nowrap">
                      {pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-surface-subtle rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-status-success transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-text-secondary text-right mt-1">
                  {formatCurrency(current)} / {formatCurrency(target)}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>

    {/* Custom Delete Confirmation Modal */}
    <AnimatePresence>
      {goalToDelete && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setGoalToDelete(null)}
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
                <h2 className="text-lg font-semibold text-text-primary mb-1">Excluir Meta?</h2>
                <p className="text-sm text-text-secondary">
                  Tem certeza que deseja excluir esta meta? Essa ação não poderá ser desfeita.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
               <Button variant="outline" onClick={() => setGoalToDelete(null)} className="h-10 px-4 text-text-primary border-border-default bg-transparent hover:bg-surface-elevated">
                 Cancelar
               </Button>
               <Button 
                 variant="danger" 
                 className="h-10 px-4 bg-status-error hover:bg-red-600 text-white border-0"
                 onClick={() => {
                   deleteGoal(goalToDelete)
                   setGoalToDelete(null)
                 }}
               >
                 Excluir Meta
               </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  )
}
