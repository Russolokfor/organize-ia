'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { format, parseISO } from 'date-fns'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Circle } from 'lucide-react'

export function RecentEntries() {
  const { entries, togglePaid, loading, deleteEntry } = useFinancial()
  const [isSelectMode, setIsSelectMode] = React.useState(false)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  const recent = entries.slice(0, 10) // Show more now that it's a list with management

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <Card className="bg-surface-card backdrop-blur-sm border-border-default shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-text-primary">Lançamentos Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="pt-2 flex justify-between items-center">
          <button 
            onClick={() => {
              setIsSelectMode(!isSelectMode)
              setSelectedIds(new Set())
            }}
            className="text-xs font-semibold text-text-secondary hover:text-text-primary uppercase tracking-wider transition-colors"
          >
            {isSelectMode ? 'Cancelar Seleção' : 'Gerenciar Lançamentos'}
          </button>
        </div>
      </CardContent>

      {isSelectMode && selectedIds.size > 0 && (
         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-surface-card border border-status-error shadow-xl rounded-full px-4 py-2 flex items-center gap-4 z-50">
           <span className="text-sm font-medium text-text-primary pl-2">{selectedIds.size} selecionado{selectedIds.size > 1 ? 's' : ''}</span>
           <button 
             onClick={async () => {
               if(confirm(`Tem certeza que deseja excluir ${selectedIds.size} lançamentos?`)) {
                 for (const id of Array.from(selectedIds)) {
                   await deleteEntry(id)
                 }
                 setSelectedIds(new Set())
                 setIsSelectMode(false)
               }
             }}
             className="bg-status-error/10 text-status-error hover:bg-status-error hover:text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
           >
             Excluir
           </button>
         </div>
      )}
    </Card>
  )
}
