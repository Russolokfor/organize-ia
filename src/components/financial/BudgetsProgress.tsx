'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'

export function BudgetsProgress() {
  const { budgets, entries } = useFinancial()

  const getSpentForCategory = (category: string) => {
    return entries
      .filter(e => e.type === 'expense' && e.is_paid && e.category === category)
      .reduce((sum, e) => sum + Number(e.amount), 0)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
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
              <div key={budget.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-text-primary">{budget.category}</span>
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
  )
}
