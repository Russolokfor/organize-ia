'use client'

import * as React from 'react'
import { motion, Reorder } from 'framer-motion'
import { useTasks } from '@/components/tasks/TaskProvider'
import { TaskItem } from '@/components/tasks/TaskItem'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, ListTodo, Plus, Sparkles, Target, ArrowUpDown } from 'lucide-react'
import { isToday, parseISO } from 'date-fns'
import { Task } from '@/types'

export default function RoutinePage() {
  const { tasks, routineMetrics, addTask, updateTask, refresh, loading } = useTasks()
  const [quickAdd, setQuickAdd] = React.useState('')
  const [isAILoading, setIsAILoading] = React.useState(false)
  const [sortMode, setSortMode] = React.useState<'manual' | 'alpha'>('manual')
  
  // Filter today's tasks
  const todayTasks = React.useMemo(() => {
    return tasks.filter(t => t.pinned_today || (t.due_date && isToday(parseISO(t.due_date))))
  }, [tasks])

  // Sort them for display
  const [orderedTasks, setOrderedTasks] = React.useState<Task[]>([])

  React.useEffect(() => {
    let sorted = [...todayTasks]
    if (sortMode === 'alpha') {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      // manual: sort by routine_order, then fallback to created_at
      sorted.sort((a, b) => {
        if (a.routine_order !== null && b.routine_order !== null) {
          return a.routine_order - b.routine_order
        }
        if (a.routine_order !== null) return -1
        if (b.routine_order !== null) return 1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    }
    setOrderedTasks(sorted)
  }, [todayTasks, sortMode])

  const handleReorder = async (newOrder: Task[]) => {
    if (sortMode !== 'manual') return
    setOrderedTasks(newOrder)
    
    // Update backend routine_order
    for (let i = 0; i < newOrder.length; i++) {
      if (newOrder[i].routine_order !== i) {
        await updateTask(newOrder[i].id, { routine_order: i })
      }
    }
  }

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickAdd.trim()) return
    await addTask({
      title: quickAdd,
      priority: 2,
      pinned_today: true // instantly goes to routine
    })
    setQuickAdd('')
  }

  const handleAIGenerate = async () => {
    if (!quickAdd.trim() || isAILoading) return
    try {
      setIsAILoading(true)
      const res = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: quickAdd })
      })
      if (!res.ok) throw new Error('Falha ao processar com IA')
      const data = await res.json()
      
      if (data.tasks && Array.isArray(data.tasks)) {
        for (const t of data.tasks) {
          await addTask({
            title: t.title,
            duration_min: t.duration_min,
            priority: t.priority,
            pinned_today: true
          })
        }
        setQuickAdd('')
        await refresh() // Ensure list is updated visually if needed
      }
    } catch (err) {
      console.error(err)
      alert("Erro ao usar IA. Verifique se a API Key está configurada.")
    } finally {
      setIsAILoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-3xl mx-auto pb-12"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-6 ring-4 ring-primary/5">
          <Target className="w-8 h-8" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">Sua Rotina de Hoje</h1>
        <p className="text-muted-foreground text-base">Foque apenas no que importa no momento. Execute.</p>
      </div>

      <Card className="bg-card/40 border-primary/20 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 h-1 bg-muted w-full">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${routineMetrics.completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <CardContent className="p-6 md:p-8 pt-10">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="text-center shrink-0">
                <p className="text-4xl font-bold text-primary">{routineMetrics.completionPercentage}%</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-1">Concluído</p>
              </div>
              <div className="h-12 w-px bg-border/50 hidden md:block" />
              <div className="flex gap-6 w-full justify-around md:justify-start">
                <div className="flex flex-col gap-1 items-center md:items-start">
                  <div className="flex items-center text-muted-foreground gap-1.5"><ListTodo className="w-4 h-4" /> <span className="text-sm font-medium">Total</span></div>
                  <p className="text-xl font-semibold">{routineMetrics.total}</p>
                </div>
                <div className="flex flex-col gap-1 items-center md:items-start">
                  <div className="flex items-center text-success gap-1.5"><CheckCircle2 className="w-4 h-4" /> <span className="text-sm font-medium">Feitas</span></div>
                  <p className="text-xl font-semibold">{routineMetrics.completed}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <form onSubmit={handleQuickAdd} className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Plus className="w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <Input 
            type="text"
            placeholder="Adicione rápido ou cole seu 'brain dump'..."
            value={quickAdd}
            onChange={e => setQuickAdd(e.target.value)}
            disabled={isAILoading}
            className="pl-12 h-14 bg-card/60 backdrop-blur-sm border-border/50 text-base shadow-lg rounded-2xl transition-all focus-within:ring-primary/30 disabled:opacity-50"
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-2">
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              onClick={handleAIGenerate}
              disabled={isAILoading || !quickAdd.trim()}
              className={`h-10 w-10 text-primary hover:text-primary hover:bg-primary/10 rounded-xl transition-all ${isAILoading ? 'animate-pulse' : ''}`} 
              title="Organizar com IA"
            >
              <Sparkles className={`w-5 h-5 ${isAILoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button type="submit" size="sm" className="h-10 px-4 rounded-xl shadow-sm" disabled={!quickAdd.trim() || loading || isAILoading}>
              Adicionar
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between px-2 pt-4">
          <h2 className="font-medium text-muted-foreground text-sm">Lista de Execução</h2>
          <button 
            onClick={() => setSortMode(s => s === 'manual' ? 'alpha' : 'manual')}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortMode === 'manual' ? 'Ordem Manual' : 'Alfabética'}
          </button>
        </div>

        {orderedTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border/50 bg-card/10 mt-4">
            <p className="text-muted-foreground">Você ainda não tem tarefas para hoje.</p>
          </div>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={orderedTasks} 
            onReorder={handleReorder}
            className="space-y-2 mt-4"
          >
            {orderedTasks.map(task => (
              <Reorder.Item 
                key={task.id} 
                value={task}
                dragListener={sortMode === 'manual'}
              >
                <TaskItem task={task} showDragHandle={sortMode === 'manual'} />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>
    </motion.div>
  )
}
