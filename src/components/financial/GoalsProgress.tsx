'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'

export function GoalsProgress() {
  const { goals } = useFinancial()

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Metas e Reservas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.length === 0 ? (
          <p className="text-muted-foreground text-sm py-2">Nenhuma meta configurada.</p>
        ) : (
          goals.map((goal) => {
            const current = Number(goal.current_amount)
            const target = Number(goal.target_amount)
            const pct = Math.min((current / target) * 100, 100)

            return (
              <div key={goal.id} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{goal.title}</span>
                  <span className="text-muted-foreground">
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {formatCurrency(current)} / {formatCurrency(target)}
                </p>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
