'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTasks } from '@/components/tasks/TaskProvider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { subDays, format, parseISO, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Clock, ListTodo, Plus, Target, Zap, Activity, TrendingUp, AlertCircle, Play, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function DashboardPage() {
  const { tasks, dashboardMetrics, routineMetrics, toggleTaskDone, getPerformanceMetrics, loading } = useTasks()
  const supabase = createClient()
  const [profileName, setProfileName] = React.useState<string>('Usuário')

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setProfileName(user.user_metadata.full_name.split(' ')[0])
      } else if (user?.email) {
        setProfileName(user.email.split('@')[0])
      }
    })
  }, [])

  // Today Focus Tasks
  const todayTasksList = React.useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    return tasks
      .filter(t => t.status !== 'done' && (t.pinned_today || t.due_date === todayStr))
      .slice(0, 4)
  }, [tasks])

  const todayEstimatedTime = React.useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done' && (t.pinned_today || t.due_date === format(new Date(), 'yyyy-MM-dd')))
      .reduce((acc, t) => acc + (t.duration_min || 0), 0)
  }, [tasks])

  // Critical Tasks (Overdue + Due Today Not Done not pinned maybe? Just any overdue or due today)
  const criticalTasks = React.useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const todayDate = new Date()
    todayDate.setHours(0,0,0,0)
    
    return tasks
      .filter(t => t.status !== 'done' && t.due_date && (parseISO(t.due_date) < todayDate || t.due_date === todayStr))
      .sort((a, b) => {
        // overdue first
        const isOverdueA = a.due_date && parseISO(a.due_date) < todayDate ? -1 : 1
        const isOverdueB = b.due_date && parseISO(b.due_date) < todayDate ? -1 : 1
        return isOverdueA - isOverdueB
      })
      .slice(0, 4)
  }, [tasks])

  // Week Progress Data
  const weeklyData = React.useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const count = tasks.filter(t => t.status === 'done' && t.completed_at?.startsWith(dateStr)).length
      return {
        name: format(d, 'EEE', { locale: ptBR }).toUpperCase(),
        fullName: format(d, 'EEEE, d MMM', { locale: ptBR }),
        concluidas: count,
        isToday: isToday(d)
      }
    })
  }, [tasks])

  const perf7 = React.useMemo(() => getPerformanceMetrics(7), [getPerformanceMetrics])

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-24 bg-surface-subtle rounded-2xl"></div>
        <div className="h-48 bg-surface-subtle rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-surface-subtle rounded-2xl"></div>
          <div className="h-64 bg-surface-subtle rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12 max-w-[1600px] mx-auto"
    >
      {/* 1. Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            Olá, <span className="text-text-primary">{profileName}</span>
          </h1>
          <p className="text-text-secondary mt-1 text-sm md:text-base">
            Veja o que precisa da sua atenção hoje.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="border-border-default text-text-primary hover:bg-surface-subtle font-medium h-10 w-full sm:w-auto">
            <Link href="/organization">
              <Plus className="w-4 h-4 mr-2" /> Nova tarefa
            </Link>
          </Button>
          <Button asChild className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand font-semibold shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-action-primary-hover/50 h-10 w-full sm:w-auto">
            <Link href="/routine">
              <Play className="w-4 h-4 mr-2 fill-current" /> Iniciar rotina
            </Link>
          </Button>
        </div>
      </div>

      {/* 5. KPIs Compactos */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Para Hoje', value: routineMetrics.total, icon: Zap, color: 'text-action-primary' },
          { label: 'Atrasadas', value: dashboardMetrics.overdue, icon: AlertCircle, color: 'text-status-error' },
          { label: 'Em Andamento', value: dashboardMetrics.active, icon: Activity, color: 'text-status-warning' },
          { label: 'Consistência 7d', value: `${dashboardMetrics.rate7}%`, icon: TrendingUp, color: 'text-status-success' }
        ].map((kpi, i) => (
          <Card key={i} className="bg-surface-card border-border-default shadow-sm min-h-[88px] flex justify-center flex-col">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("p-2 rounded-lg bg-surface-subtle border border-border-default", kpi.color)}>
                <kpi.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-wider truncate">{kpi.label}</p>
                <p className="text-xl sm:text-2xl font-bold text-text-primary leading-tight">{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Resumo do Dia (Main Card) */}
      <Card className="bg-surface-card border-border-default overflow-hidden relative shadow-md">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-action-primary/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex-1 w-full space-y-5">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-1">Resumo do dia</h2>
              <p className="text-sm text-text-secondary">Seu panorama operacional atual.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border-default/50">
              <div>
                <p className="text-xs text-text-secondary mb-1 font-medium">Tarefas Foco</p>
                <p className="text-2xl font-bold text-text-primary">{routineMetrics.total} <span className="text-sm font-medium text-text-secondary">itens</span></p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1 font-medium">Estimativa</p>
                <p className="text-2xl font-bold text-text-primary">{todayEstimatedTime > 0 ? `${todayEstimatedTime}m` : '--'}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1 font-medium">Atrasos Globais</p>
                <p className={cn("text-2xl font-bold", dashboardMetrics.overdue > 0 ? "text-status-error" : "text-text-primary")}>{dashboardMetrics.overdue}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1 font-medium">Concluídas Hoje</p>
                <p className="text-2xl font-bold text-status-success">{routineMetrics.completed}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Progresso Diário</span>
                <span className="text-xs font-bold text-action-primary">{routineMetrics.completionPercentage}%</span>
              </div>
              <Progress value={routineMetrics.completionPercentage} className="h-2.5 bg-surface-subtle" indicatorClassName="bg-action-primary shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
            </div>
          </div>

          <div className="w-full md:w-[320px] bg-surface-elevated border border-border-default rounded-xl p-5 shadow-inner shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-action-primary" />
              <h3 className="font-semibold text-sm text-text-primary">Direto ao ponto</h3>
            </div>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              {routineMetrics.total === 0 
                ? "Você não tem tarefas definidas para hoje. Vá em Organização para planejar e evitar que o dia fique vago."
                : routineMetrics.completionPercentage === 100 
                  ? "Excelente! Você concluiu todo o foco de hoje. Aproveite para planejar o amanhã."
                  : "Próxima ação recomendada: Iniciar rotina de foco para concluir suas tarefas planejadas."
              }
            </p>
            <div className="space-y-3 flex flex-col">
              <Button asChild className="w-full bg-action-primary text-text-on-brand hover:bg-action-primary-hover font-semibold h-11">
                <Link href="/routine">Iniciar rotina</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full text-xs font-medium text-text-secondary hover:text-text-primary h-9 border border-transparent hover:border-border-default hover:bg-surface-subtle">
                <Link href="/routine">Ver rotina completa</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        
        {/* 3. Foco de Hoje */}
        <Card className="bg-surface-card border-border-default shadow-md flex flex-col">
          <CardHeader className="pb-4 border-b border-border-default/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Zap className="w-5 h-5 text-action-primary" /> Foco de hoje
              </CardTitle>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-text-primary">
                <Link href="/routine"><ChevronRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col min-h-[300px]">
            {todayTasksList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-status-success opacity-80" />
                </div>
                <p className="text-base font-medium text-text-primary mb-1">Tudo limpo!</p>
                <p className="text-sm text-text-secondary">Nenhuma tarefa prioritária na rotina.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-default/50 flex-1 flex flex-col">
                {todayTasksList.map((task) => (
                  <div key={task.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-surface-subtle transition-colors group">
                    <button 
                      onClick={() => toggleTaskDone(task)}
                      className="mt-0.5 w-5 h-5 rounded border-2 border-border-default flex items-center justify-center hover:border-action-primary hover:bg-action-primary/10 transition-colors flex-shrink-0"
                    >
                      {task.status === 'done' && <Check className="w-3 h-3 text-action-primary" />}
                    </button>
                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-semibold text-text-primary line-clamp-2 sm:line-clamp-1 group-hover:text-action-primary transition-colors">{task.title}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          {task.duration_min && (
                            <span className="text-[11px] flex items-center gap-1.5 text-text-secondary font-medium">
                              <Clock className="w-3.5 h-3.5 opacity-70" /> {task.duration_min}m
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-secondary border border-border-subtle font-medium">
                            {task.priority ? `Prioridade ${task.priority}` : 'Geral'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button onClick={() => toggleTaskDone(task)} size="sm" variant="outline" className="h-7 px-2 text-[11px] border-status-success text-status-success hover:bg-status-success hover:text-white">
                           Concluir
                         </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-surface-elevated px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border-default mt-auto">
            <span className="text-xs font-semibold text-text-secondary">
              Progresso do foco: <span className="text-text-primary">{routineMetrics.completed} / {routineMetrics.total}</span>
            </span>
            <div className="w-full sm:w-1/2 flex items-center gap-3">
              <Progress value={routineMetrics.completionPercentage} className="h-2 flex-1 bg-surface-subtle" indicatorClassName="bg-action-primary" />
            </div>
          </CardFooter>
        </Card>

        {/* 4. Pendências Críticas */}
        <Card className="bg-surface-card border-border-default shadow-md flex flex-col">
          <CardHeader className="pb-4 border-b border-border-default/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-status-error" /> Pendências críticas
              </CardTitle>
              <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-text-secondary hover:text-text-primary">
                <Link href="/organization"><ChevronRight className="w-4 h-4" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex flex-col min-h-[300px]">
            {criticalTasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-status-success opacity-80" />
                </div>
                <p className="text-base font-medium text-text-primary mb-1">Controle perfeito.</p>
                <p className="text-sm text-text-secondary">Nenhuma tarefa atrasada ou estourando prazo hoje.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-default/50 flex-1">
                {criticalTasks.map(task => {
                  const todayStr = format(new Date(), 'yyyy-MM-dd')
                  const isOverdueTask = task.due_date && task.due_date < todayStr
                  
                  return (
                    <div key={task.id} className="p-4 sm:p-5 hover:bg-surface-subtle transition-colors flex justify-between items-center group">
                      <div className="min-w-0 pr-4">
                        <p className="font-semibold text-sm text-text-primary line-clamp-1 mb-1.5">{task.title}</p>
                        <Badge variant="outline" className={cn(
                          "text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider",
                          isOverdueTask ? "text-status-error border-status-error/30 bg-status-error/10" : "text-status-warning border-status-warning/30 bg-status-warning/10"
                        )}>
                          {isOverdueTask ? 'Atrasado' : 'Vence Hoje'}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => toggleTaskDone(task)}
                          size="sm"
                          variant="ghost" 
                          className="h-8 w-8 p-0 rounded-full border border-border-default hover:border-action-primary hover:bg-action-primary/10 hover:text-action-primary transition-colors flex-shrink-0"
                          title="Concluir tarefa"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 6. Progresso Semanal */}
        <Card className="lg:col-span-2 bg-surface-card border-border-default shadow-md flex flex-col h-[340px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-action-primary" /> Progresso semanal
            </CardTitle>
            <CardDescription className="text-xs text-text-secondary">Desempenho de conclusão diária</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 px-4 sm:px-6 pt-2 pb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 15, right: 0, left: -25, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: 'var(--color-text-secondary)', fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-surface-elevated)', opacity: 0.8 }}
                  contentStyle={{ backgroundColor: 'var(--color-surface-elevated)', border: '1px solid var(--color-border-default)', borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', padding: '12px' }}
                  itemStyle={{ color: 'var(--color-text-primary)', fontWeight: 'bold', fontSize: '14px' }}
                  labelStyle={{ color: 'var(--color-text-secondary)', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}
                  formatter={(value: any) => [`${value}`, 'Concluídas']}
                  labelFormatter={(_, payload) => payload[0]?.payload.fullName}
                />
                <Bar dataKey="concluidas" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {weeklyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.isToday ? 'var(--color-action-primary)' : 'var(--color-action-primary)'} fillOpacity={entry.isToday ? 1 : 0.3} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 7. Histórico de Desempenho */}
        <Card className="bg-surface-card border-border-default shadow-md flex flex-col h-[340px]">
           <CardHeader className="pb-4 border-b border-border-default/50">
             <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-action-primary" /> Histórico de desempenho
             </CardTitle>
             <CardDescription className="text-xs text-text-secondary">Os últimos 7 dias da sua rotina.</CardDescription>
           </CardHeader>
           <CardContent className="p-0 flex-1 flex flex-col justify-center">
              <div className="divide-y divide-border-default/50">
                 <div className="p-5 flex justify-between items-center group">
                    <p className="text-sm font-semibold text-text-secondary">Criadas</p>
                    <p className="text-xl font-bold text-text-primary">{perf7.totalInRange}</p>
                 </div>
                 <div className="p-5 flex justify-between items-center group">
                    <p className="text-sm font-semibold text-text-secondary">Concluídas</p>
                    <p className="text-xl font-bold text-status-success">{perf7.completedInRange}</p>
                 </div>
                 <div className="p-5 flex justify-between items-center group">
                    <p className="text-sm font-semibold text-text-secondary">Atrasos acumulados</p>
                    <p className={cn("text-xl font-bold", dashboardMetrics.overdue > 0 ? "text-status-error" : "text-text-primary")}>{dashboardMetrics.overdue}</p>
                 </div>
              </div>
           </CardContent>
           <div className="p-4 bg-surface-subtle border-t border-border-default">
               <Button asChild variant="outline" className="w-full text-xs font-semibold text-text-primary bg-surface-elevated hover:bg-surface-card rounded-lg h-9">
                  <Link href="/performance">Histórico completo</Link>
               </Button>
           </div>
        </Card>

      </div>
    </motion.div>
  )
}
