'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { useFinancial } from '@/components/financial/FinancialProvider'

export function FinancialCharts() {
  const { entries } = useFinancial()

  const chartData = React.useMemo(() => {
    // Determine the number of days in the current reference month.
    // If we don't have a direct referenceMonth passed, we assume the current month
    // since entries are already filtered by referenceMonth in the provider.
    const today = new Date()
    let year = today.getFullYear()
    let month = today.getMonth()

    if (entries.length > 0) {
      const [y, m] = entries[0].reference_month.split('-')
      year = parseInt(y)
      month = parseInt(m) - 1
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Initialize an array with one object per day
    const dailyData = Array.from({ length: daysInMonth }).map((_, i) => ({
      day: `Dia ${i + 1}`,
      income: 0,
      expense: 0
    }))

    // Aggregate entries into their respective days
    entries.forEach(entry => {
      if (entry.ignore_from_balance) return

      // due_date is YYYY-MM-DD
      const dateStr = entry.due_date
      if (!dateStr) return

      const dayPart = parseInt(dateStr.split('-')[2], 10)
      if (dayPart >= 1 && dayPart <= daysInMonth) {
        if (entry.type === 'income') {
          dailyData[dayPart - 1].income += Number(entry.amount)
        } else {
          dailyData[dayPart - 1].expense += Number(entry.amount)
        }
      }
    })

    return dailyData
  }, [entries])

  const chartTicks = React.useMemo(() => {
    if (chartData.length === 0) return []
    // To ensure perfect horizontal alignment and no weird automatic skips
    // we define explicit, evenly spaced ticks.
    const lastDay = chartData[chartData.length - 1].day
    const ticks = ['Dia 1', 'Dia 8', 'Dia 15', 'Dia 22']
    if (!ticks.includes(lastDay)) {
      ticks.push(lastDay)
    }
    return ticks
  }, [chartData])

  return (
    <Card className="bg-surface-card backdrop-blur-sm border-border-default shadow-card">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-text-primary">Fluxo Mensal (Visão Geral)</CardTitle>
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
              <XAxis 
                dataKey="day" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                ticks={chartTicks}
                interval={0}
              />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333333" />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface-card)', borderColor: 'var(--color-border-default)', borderRadius: '8px' }}
                itemStyle={{ color: 'var(--color-text-primary)' }}
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
