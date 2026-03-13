'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useTasks } from '@/components/tasks/TaskProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TaskItem } from '@/components/tasks/TaskItem'
import { Activity, AlertTriangle, CalendarDays, CheckCircle2, TrendingUp } from 'lucide-react'

export default function PerformancePage() {
  const { getPerformanceMetrics, loading, tasks } = useTasks()
  const [period, setPeriod] = React.useState<7 | 30>(7)

  const metrics = React.useMemo(() => getPerformanceMetrics(period), [getPerformanceMetrics, period, tasks])

  if (loading) {
    return <div className="animate-pulse p-8">Carregando métricas...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Desempenho</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            A consistência supera a intensidade. Acompanhe sua execução.
          </p>
        </div>
        
        <div className="flex p-1 bg-surface-card border border-border-default rounded-xl shadow-sm">
          <button 
            onClick={() => setPeriod(7)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${period === 7 ? 'bg-action-primary text-text-on-brand shadow' : 'text-text-secondary hover:text-text-primary'}`}
          >
            7 Dias
          </button>
          <button 
            onClick={() => setPeriod(30)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${period === 30 ? 'bg-action-primary text-text-on-brand shadow' : 'text-text-secondary hover:text-text-primary'}`}
          >
            30 Dias
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-surface-card border-border-default shadow-sm hover:border-border-subtle transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-action-primary/10 text-action-primary">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-text-primary">{metrics.pctDone}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-border-default shadow-sm hover:border-border-subtle transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-status-success/10 text-status-success">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Tarefas Entregues</p>
                <p className="text-2xl font-bold text-text-primary">{metrics.completedInRange} / {metrics.totalInRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-border-default shadow-sm hover:border-border-subtle transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-status-warning/10 text-status-warning">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary">Volume Criado</p>
                <p className="text-2xl font-bold text-text-primary">{metrics.totalInRange}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-status-error/20 bg-status-error/5 shadow-sm hover:border-status-error/40 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-status-error/20 text-status-error">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-status-error/80">Taxa de Atraso</p>
                <p className="text-2xl font-bold text-status-error">{metrics.pctOverdue}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-6">
        <div className="flex items-center gap-2 mb-6 text-status-error">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Tarefas Atrasadas ({metrics.overdueList.length})</h2>
        </div>
        
        {metrics.overdueList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-status-success/30 bg-status-success/5">
            <div className="w-16 h-16 mx-auto bg-status-success/20 rounded-2xl flex items-center justify-center mb-4 text-status-success">
              <span className="text-2xl">🎉</span>
            </div>
            <h3 className="text-lg font-medium text-status-success">Nenhuma tarefa atrasada!</h3>
            <p className="text-sm text-status-success/80 mt-2 max-w-sm mx-auto">
              Sua execução está perfeitamente em dia. Continue assim.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {metrics.overdueList.map(task => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
