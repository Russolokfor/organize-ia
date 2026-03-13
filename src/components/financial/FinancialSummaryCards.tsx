'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, AlertTriangle, AlertCircle } from 'lucide-react'
import { useFinancial } from '@/components/financial/FinancialProvider'

export function FinancialSummaryCards() {
  const { metrics } = useFinancial()

  const currencyValue = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Saldo Principal */}
      <Card className="bg-surface-card border-border-default shadow-sm hover:border-border-subtle transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-action-primary/10 text-action-primary">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Saldo do Mês</p>
              <p className="text-2xl font-bold text-text-primary">{currencyValue(metrics.balance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receitas */}
      <Card className="bg-surface-card border-border-default shadow-sm hover:border-border-subtle transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-status-success/10 text-status-success">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Total de Receitas</p>
              <p className="text-2xl font-bold text-text-primary">{currencyValue(metrics.totalIncome)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Despesas Gerais */}
      <Card className="bg-surface-card border-border-default shadow-sm hover:border-border-subtle transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-status-warning/10 text-status-warning">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Despesas Mapeadas</p>
              <p className="text-2xl font-bold text-status-warning">{currencyValue(metrics.totalExpense)}</p>
              <p className="text-xs text-text-secondary mt-1">Comprometido: {currencyValue(metrics.committedAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contas em Risco */}
      <Card className="border-status-error/20 bg-status-error/5 shadow-sm hover:border-status-error/40 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-status-error/20 text-status-error">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-status-error/80">Situação de Pendências</p>
              <p className="text-2xl font-bold text-status-error">
                {metrics.overdueBillsCount} 
                <span className="text-lg font-medium text-text-secondary ml-2">vencidas</span>
              </p>
              <p className="text-xs text-text-secondary mt-1">{metrics.pendingBillsCount} abertas aguardando</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
