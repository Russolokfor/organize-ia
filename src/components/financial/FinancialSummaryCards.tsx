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
      <Card className="bg-card/40 hover:bg-card/60 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo do Mês</p>
              <p className="text-2xl font-bold">{currencyValue(metrics.balance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receitas */}
      <Card className="bg-card/40 hover:bg-card/60 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Receitas</p>
              <p className="text-2xl font-bold">{currencyValue(metrics.totalIncome)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Despesas Gerais */}
      <Card className="bg-card/40 hover:bg-card/60 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-warning/10 text-warning">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Despesas Mapeadas</p>
              <p className="text-2xl font-bold text-warning">{currencyValue(metrics.totalExpense)}</p>
              <p className="text-xs text-muted-foreground mt-1">Comprometido: {currencyValue(metrics.committedAmount)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contas em Risco */}
      <Card className="border-danger/20 bg-danger/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-danger/20 text-danger">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-danger/80">Situação de Pendências</p>
              <p className="text-2xl font-bold text-danger">
                {metrics.overdueBillsCount} 
                <span className="text-lg font-medium text-muted-foreground ml-2">vencidas</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">{metrics.pendingBillsCount} abertas aguardando</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
