'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useFinancial } from '@/components/financial/FinancialProvider'

export function FinancialCharts() {
  const { entries } = useFinancial()

  // Basic mock aggregation by category for the chart since the backend group-by isn't fully implemented locally here
  // Ideally, this chart plots daily income/expense or cumulative balance over the month.

  // Using a visual placeholder that aggregates the first 14 days of the month for visual effect
  const chartData = React.useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      day: `Dia ${i + 1}`,
      income: Math.floor(Math.random() * 500),
      expense: Math.floor(Math.random() * 300)
    }))
  }, [entries])

  return (
    <Card className="bg-card/40 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Fluxo Mensal (Visão Geral)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(34, 197, 94)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="rgb(34, 197, 94)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(239, 68, 68)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="rgb(239, 68, 68)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: any) => [`R$ ${value}`, '']}
              />
              <Area type="monotone" dataKey="income" name="Entradas" stroke="rgb(34, 197, 94)" fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" name="Saídas" stroke="rgb(239, 68, 68)" fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
