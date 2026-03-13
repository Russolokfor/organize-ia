'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { format, parseISO } from 'date-fns'
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Circle } from 'lucide-react'

export function RecentEntries() {
  const { entries, togglePaid, loading } = useFinancial()

  const recent = entries.slice(0, 5)

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
          recent.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-subtle transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${entry.type === 'income' ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                  {entry.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-medium text-sm text-text-primary">{entry.title}</p>
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
                {entry.type === 'expense' && (
                  <button 
                    onClick={() => togglePaid(entry.id, !entry.is_paid)}
                    className="p-1 hover:bg-surface-subtle rounded-lg transition-colors"
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
          ))
        )}
      </CardContent>
    </Card>
  )
}
