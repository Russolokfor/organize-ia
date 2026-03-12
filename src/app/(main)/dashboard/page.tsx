'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useTasks } from '@/components/tasks/TaskProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { subDays, format, parseISO, startOfWeek, addDays, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, CheckCircle2, Clock, ListTodo, Plus, Target, Flame, Zap, Calendar as CalendarIcon, Activity, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const { tasks, dashboardMetrics, loading } = useTasks()
  const supabase = createClient()
  const [profileName, setProfileName] = React.useState<string>('Usuário')

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setProfileName(user.user_metadata.full_name)
      } else if (user?.email) {
        setProfileName(user.email.split('@')[0])
      }
    })
  }, [])

  // Prepare heatmap data (last 28 dias / 4 semanas)
  const heatmapData = React.useMemo(() => {
    const data = []
    const today = new Date()
    const startDate = subDays(today, 27) // 4 weeks total
    
    let maxDone = 1 // to prevent division by zero

    for (let i = 0; i < 28; i++) {
        const d = addDays(startDate, i)
        const dateStr = format(d, 'yyyy-MM-dd')
        const count = tasks.filter(t => t.status === 'done' && t.completed_at?.startsWith(dateStr)).length
        if (count > maxDone) maxDone = count
        
        data.push({
            date: d,
            count: count,
            level: count === 0 ? 0 : Math.ceil((count / maxDone) * 4) // 0-4 scale
        })
    }
    return data
  }, [tasks])

  // Get next 3 tasks for today/pinned
  const todayTasksList = React.useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    return tasks
      .filter(t => t.status !== 'done' && (t.pinned_today || t.due_date === todayStr))
      .slice(0, 3)
  }, [tasks])

  const overdueList = React.useMemo(() => {
    const todayDate = new Date()
    todayDate.setHours(0,0,0,0)
    return tasks
      .filter(t => t.status !== 'done' && t.due_date && parseISO(t.due_date) < todayDate)
      .slice(0, 3)
  }, [tasks])

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-64 bg-muted/50 rounded-2xl"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/50 rounded-2xl"></div>)}
      </div>
      <div className="h-64 bg-muted/50 rounded-2xl"></div>
    </div>
  }

  const kpis = [
    { title: 'Tarefas Ativas', value: dashboardMetrics.active, trend: '+3', icon: ListTodo },
    { title: 'Progresso 7d', value: `${dashboardMetrics.rate7}%`, trend: '+5%', icon: TrendingUp },
    { title: 'Foco de Hoje', value: dashboardMetrics.today, trend: 'Atual', icon: Zap },
    { title: 'Atrasadas', value: dashboardMetrics.overdue, trend: '-2', icon: Clock },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Olá, <span className="text-primary text-xl">{profileName}!</span>
          </h1>
          <p className="text-foreground mt-1 text-sm md:text-base font-semibold">
            Vamos otimizar o seu fluxo diário.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary min-w-[140px] font-bold border border-primary/20">
            <Link href="/organization">
              <Plus className="w-4 h-4 mr-2" /> Nova Tarefa
            </Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary-hover text-primary-foreground min-w-[140px] font-bold shadow-lg shadow-primary/20">
            <Link href="/routine">
              <Zap className="w-4 h-4 mr-2" /> Iniciar Rotina
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom Hero Card - Span 2 */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-border/50 bg-card/40 shadow-xl pt-10 px-8 pb-12 flex flex-col justify-end group">
           <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/30 rounded-full blur-[80px] pointer-events-none transition-transform duration-1000 group-hover:scale-110" />
           <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background to-transparent pointer-events-none" />
           
           <div className="relative z-10 max-w-lg">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary tracking-wide">ORGANIZAÇÃO ATIVA</span>
             </div>
             <h2 className="text-3xl md:text-4xl font-extrabold text-foreground leading-[1.1] mb-4">
               Maximize a sua<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">
                 produtividade diária.
               </span>
             </h2>
             <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md">
               Transforme sua lista de pendências em uma rotina executável. O Organize.ia centraliza suas tarefas e metas financeiras em um único fluxo focado em resultados.
             </p>
           </div>
        </div>

        {/* Small Calendar/Focus Card */}
        <Card className="rounded-3xl border-border/50 bg-card/40 flex flex-col pt-2 shadow-xl">
           <CardHeader className="pb-2">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                   <span className="text-sm font-semibold">{format(new Date(), 'MMMM yyyy', { locale: ptBR })}</span>
                </div>
                <div className="flex gap-1">
                   {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map((day, i) => (
                      <div key={i} className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-md text-[10px] font-bold",
                        i === new Date().getDay() ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                      )}>
                        {day[0]}
                      </div>
                   ))}
                </div>
             </div>
           </CardHeader>
           <div className="px-6 flex-1 mt-2">
             <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Foco de Hoje</p>
             <div className="space-y-3">
               {todayTasksList.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Nenhum foco definido.</p>
               ) : (
                 todayTasksList.map((task, i) => (
                   <div key={task.id} className="flex gap-3 relative">
                     <div className="w-px h-full bg-border absolute left-[3.5px] top-4 -z-10" />
                     <div className={cn(
                       "w-2 h-2 rounded-full mt-1.5 flex-shrink-0 z-10",
                       i === 0 ? "bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-muted-foreground"
                     )} />
                     <div>
                       <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">{task.title}</p>
                       <span className="text-[10px] font-medium text-muted-foreground">
                         {task.duration_min ? `${task.duration_min}m de foco` : 'Tempo flexível'}
                       </span>
                     </div>
                   </div>
                 ))
               )}
             </div>
           </div>
           <div className="p-4 mt-auto">
             <Button asChild className="w-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold">
                <Link href="/routine">Ver rotina completa</Link>
             </Button>
           </div>
        </Card>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-2xl border-border/50 bg-card/40 hover:border-primary/30 transition-colors shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <kpi.icon className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs font-bold text-muted-foreground">{kpi.title}</p>
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground">{kpi.value}</p>
                  <p className="text-[10px] font-bold text-primary mt-1">{kpi.trend} ref. semana</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap 30 Days - Span 2 */}
        <Card className="lg:col-span-2 flex flex-col rounded-3xl border-border/50 bg-card/40 shadow-none">
          <CardHeader className="pb-1 hover:border-transparent">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                 <Activity className="w-4 h-4 text-primary" /> Carga de Trabalho Semanal
              </CardTitle>
              <div className="flex gap-2 text-[10px] font-medium text-muted-foreground items-center">
                 <span>Baixa</span>
                 <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-[2px] bg-muted/30 border border-border/50" />
                    <div className="w-3 h-3 rounded-[2px] bg-primary/30" />
                    <div className="w-3 h-3 rounded-[2px] bg-primary/60" />
                    <div className="w-3 h-3 rounded-[2px] bg-primary" />
                 </div>
                 <span>Alta</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center p-6">
            <div className="w-full overflow-x-auto pb-2">
               {/* Gráfico Estilo Github Commit */}
               <div className="flex gap-1 min-w-max justify-center">
                 {/* Semanas -> Colunas, Dias da Semana -> Linhas */}
                 {Array.from({ length: 4 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, dayIndex) => {
                         const dayDataIndex = (weekIndex * 7) + dayIndex;
                         const hData = heatmapData[dayDataIndex];
                         if (!hData) return null;

                         let bgColor = "bg-muted/20 border-border/50";
                         if (hData.level === 1) bgColor = "bg-primary/30 border-primary/20";
                         if (hData.level === 2) bgColor = "bg-primary/60 border-primary/40";
                         if (hData.level >= 3) bgColor = "bg-primary border-primary";

                         return (
                            <div 
                              key={dayIndex} 
                              className={cn("w-6 h-6 sm:w-8 sm:h-8 rounded-[4px] border transition-transform hover:scale-110 relative group cursor-pointer", bgColor)}
                            >
                               <div className="absolute inset-0 bg-white/0 hover:bg-white/10 flex flex-col items-center justify-center text-[8px] sm:text-[10px] font-bold text-transparent group-hover:text-white transition-colors text-center leading-[8px]">
                                   {hData.count > 0 ? hData.count : ''}
                               </div>
                               <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-50">
                                   {format(hData.date, 'dd/MM')} - {hData.count} concl.
                               </div>
                            </div>
                         )
                      })}
                    </div>
                 ))}
               </div>
               <div className="flex justify-between mt-3 px-1.5 w-full mx-auto text-[10px] font-semibold text-muted-foreground uppercase tracking-wider relative max-w-sm sm:max-w-md">
                 <div className="flex w-full">
                    <span className="flex-1 text-center">Sem. 1</span>
                    <span className="flex-1 text-center">Sem. 2</span>
                    <span className="flex-1 text-center">Sem. 3</span>
                    <span className="flex-1 text-center">Sem. 4</span>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Needed Card */}
        <Card className="rounded-3xl border-border/50 bg-card/40 shadow-none flex flex-col">
           <CardHeader className="pb-3 border-b border-border/50">
             <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-primary" /> Ações Pendentes
             </CardTitle>
           </CardHeader>
           <CardContent className="p-0 flex-1">
              {overdueList.length === 0 ? (
                  <div className="p-6 text-center text-sm font-medium text-muted-foreground flex flex-col items-center justify-center h-full">
                     <CheckCircle2 className="w-8 h-8 text-success/50 mb-2" />
                     <p>Tudo em dia!</p>
                  </div>
              ) : (
                  <div className="divide-y divide-border/20">
                    {overdueList.map(task => (
                        <div key={task.id} className="p-4 hover:bg-muted/10 transition-colors flex justify-between items-center group">
                           <div>
                              <p className="font-semibold text-sm text-foreground line-clamp-1">{task.title}</p>
                              <p className="text-[10px] font-bold text-danger mt-0.5 tracking-wider uppercase">Atrasado</p>
                           </div>
                           <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </div>
                    ))}
                  </div>
              )}
           </CardContent>
           <div className="p-3 bg-muted/10 border-t border-border/50">
               <Button asChild variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:text-foreground">
                  <Link href="/performance">Ver Histórico de Desempenho</Link>
               </Button>
           </div>
        </Card>
      </div>
    </motion.div>
  )
}
