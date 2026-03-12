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
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Lançamentos Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recent.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">Nenhum lançamento registrado este mês.</p>
        ) : (
          recent.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${entry.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {entry.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">{entry.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className={`font-semibold text-sm ${entry.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {entry.type === 'income' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </p>
                  {entry.due_date && (
                    <p className="text-xs text-muted-foreground">{format(parseISO(entry.due_date), 'dd/MM/yyyy')}</p>
                  )}
                </div>
                {entry.type === 'expense' && (
                  <button 
                    onClick={() => togglePaid(entry.id, !entry.is_paid)}
                    className="p-1 hover:bg-muted rounded-lg transition-colors"
                    title={entry.is_paid ? 'Marcar como não pago' : 'Marcar como pago'}
                  >
                    {entry.is_paid ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
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
