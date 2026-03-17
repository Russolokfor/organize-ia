'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { format, parseISO } from 'date-fns'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Circle, AlertTriangle, CheckSquare } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function RecentEntries() {
  const { entries, togglePaid, loading, deleteEntry } = useFinancial()
  const [isSelectMode, setIsSelectMode] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  const recent = entries.slice(0, 10) // Show more now that it's a list with management

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <Card className="bg-surface-card backdrop-blur-sm border-border-default shadow-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium text-text-primary">Lançamentos Recentes</CardTitle>
        <Button 
          variant={isSelectMode ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setIsSelectMode(!isSelectMode)
            setSelectedIds(new Set())
          }}
          className={`gap-2 h-8 text-xs ${isSelectMode ? 'bg-primary text-primary-foreground' : 'bg-surface-card text-text-secondary border-border-default'}`}
        >
          <CheckSquare className="w-3.5 h-3.5" /> 
          {isSelectMode ? 'Cancelar' : 'Selecionar'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {recent.length === 0 ? (
          <p className="text-text-secondary text-sm text-center py-4">Nenhum lançamento registrado este mês.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((entry) => (
              <div 
                key={entry.id} 
                className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${
                  selectedIds.has(entry.id) ? 'bg-action-primary/10 border border-action-primary' : 'hover:bg-surface-subtle border border-transparent'
                }`}
                onClick={(e) => {
                  if (isSelectMode) {
                    const newSet = new Set(selectedIds)
                    if (newSet.has(entry.id)) newSet.delete(entry.id)
                    else newSet.add(entry.id)
                    setSelectedIds(newSet)
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  {isSelectMode && (
                     <input 
                       type="checkbox" 
                       checked={selectedIds.has(entry.id)} 
                       onChange={() => {}} // handled by parent onClick
                       className="rounded border-border-default h-4 w-4 bg-surface-card accent-action-primary"
                     />
                  )}
                  <div className={`p-2 rounded-lg ${entry.type === 'income' ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                    {entry.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-text-primary">{entry.title}</p>
                      {entry.is_recurring && <span className="text-[10px] bg-action-primary/20 text-action-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Recorrente</span>}
                    </div>
                    <p className="text-xs text-text-secondary">{entry.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className={`font-semibold text-sm ${entry.type === 'income' ? 'text-status-success' : 'text-status-error'}`}>
                      {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                    </p>
                    {entry.due_date && (
                      <p className="text-xs text-text-secondary">{format(parseISO(entry.due_date), 'dd/MM/yyyy')}</p>
                    )}
                  </div>
                  {entry.type === 'expense' && !isSelectMode && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePaid(entry.id, !entry.is_paid); }}
                      className="p-1 hover:bg-surface-elevated rounded-lg transition-colors"
                      title={entry.is_paid ? 'Marcar como não pago' : 'Marcar como pago'}
                    >
                      {entry.is_paid ? (
                        <CheckCircle2 className="w-5 h-5 text-status-success" />
                      ) : (
                        <Circle className="w-5 h-5 text-text-secondary" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {isSelectMode && selectedIds.size > 0 && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-card border border-status-error shadow-xl rounded-full px-4 py-2 flex items-center gap-4 z-50">
           <span className="text-sm font-medium text-text-primary pl-2">{selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}</span>
           <button 
             onClick={() => setShowDeleteConfirm(true)}
             className="bg-status-error/10 text-status-error hover:bg-status-error hover:text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
           >
             Excluir
           </button>
         </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
              onClick={() => setShowDeleteConfirm(false)}
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
                  <h2 className="text-lg font-semibold text-text-primary mb-1">Excluir lançamentos?</h2>
                  <p className="text-sm text-text-secondary">
                    Tem certeza que deseja excluir {selectedIds.size} {selectedIds.size > 1 ? 'lançamentos selecionados' : 'lançamento selecionado'}?
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                 <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="h-10 px-4 text-text-primary border-border-default bg-transparent hover:bg-surface-elevated">
                   Cancelar
                 </Button>
                 <Button 
                   variant="danger" 
                   className="h-10 px-4 bg-status-error hover:bg-red-600 text-white border-0"
                   onClick={async () => {
                     for (const id of Array.from(selectedIds)) {
                       await deleteEntry(id)
                     }
                     setSelectedIds(new Set())
                     setIsSelectMode(false)
                     setShowDeleteConfirm(false)
                   }}
                 >
                   Excluir
                 </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Card>
  )
}
