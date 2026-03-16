'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { Trash2 } from 'lucide-react'

export function GoalsProgress() {
  const { goals, deleteGoal } = useFinancial()

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <Card className="bg-surface-card backdrop-blur-sm border-border-default shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-text-primary">Metas e Reservas</CardTitle>
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
                      onClick={() => {
                        if(confirm('Tem certeza que deseja excluir esta meta?')) {
                          deleteGoal(goal.id)
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded transition-all"
                      title="Excluir Meta"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
  )
}
