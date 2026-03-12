'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { format, parseISO, isBefore, startOfToday } from 'date-fns'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'

export function BillsDue() {
  const { entries, togglePaid } = useFinancial()

  const today = startOfToday()

  // Find expenses that are not paid
  const pendingBills = entries
    .filter(e => e.type === 'expense' && !e.is_paid)
    .sort((a, b) => {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    })
    .slice(0, 5)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex justify-between items-center">
          Contas a Pagar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingBills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-success">
            <CheckCircle2 className="w-8 h-8 mb-2 opacity-80" />
            <p className="text-sm font-medium">Tudo em dia!</p>
            <p className="text-xs opacity-80 mt-1">Nenhuma conta pendente.</p>
          </div>
        ) : (
          pendingBills.map((bill) => {
            const isOverdue = bill.due_date ? isBefore(parseISO(bill.due_date), today) : false

            return (
              <div key={bill.id} className={`flex items-start justify-between p-3 rounded-xl border ${isOverdue ? 'border-danger/30 bg-danger/5' : 'border-border/40 hover:bg-muted/20'} transition-colors`}>
                <div className="flex gap-3">
                  <button 
                      onClick={() => togglePaid(bill.id, true)}
                      className="mt-0.5 hover:text-success transition-colors"
                  >
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  </button>
                  <div>
                    <p className={`font-medium text-sm flex items-center gap-2 ${isOverdue ? 'text-danger' : ''}`}>
                      {bill.title}
                      {isOverdue && <AlertCircle className="w-3 h-3 text-danger" />}
                    </p>
                    {bill.due_date && (
                      <p className={`text-xs mt-1 ${isOverdue ? 'text-danger/80' : 'text-muted-foreground'}`}>
                        Vence: {format(parseISO(bill.due_date), 'dd/MM/yyyy')}
                      </p>
                    )}
                  </div>
                </div>

                <p className={`font-semibold text-sm ${isOverdue ? 'text-danger' : ''}`}>
                  {formatCurrency(bill.amount)}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
