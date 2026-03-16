'use client'

import * as React from 'react'
import { motion, Reorder } from 'framer-motion'
import { useTasks } from '@/components/tasks/TaskProvider'
import { TaskItem } from '@/components/tasks/TaskItem'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, ListTodo, Plus, Sparkles, Target, ArrowUpDown, CheckSquare, Trash2, Copy } from 'lucide-react'
import { isToday, parseISO } from 'date-fns'
import { Task } from '@/types'

export default function RoutinePage() {
  const { tasks, routineMetrics, addTask, updateTask, refresh, loading, deleteTasks, duplicateTasks } = useTasks()
  const [quickAdd, setQuickAdd] = React.useState('')
  const [isAILoading, setIsAILoading] = React.useState(false)
  const [sortMode, setSortMode] = React.useState<'manual' | 'alpha'>('manual')
  const [isSelectMode, setIsSelectMode] = React.useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<string>>(new Set())
  const [isProcessingBulk, setIsProcessingBulk] = React.useState(false)

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

  const toggleSelection = (id: string) => {
    const next = new Set(selectedTaskIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedTaskIds(next)
  }

  const executeBulkDelete = async () => {
    if (selectedTaskIds.size === 0) return
    if (!window.confirm(`Excluir permanentemente ${selectedTaskIds.size} tarefas da sua rotina?`)) return
    
    setIsProcessingBulk(true)
    try {
      await deleteTasks(Array.from(selectedTaskIds))
      setIsSelectMode(false)
      setSelectedTaskIds(new Set())
    } catch (err) {
      console.error(err)
      alert("Erro ao excluir tarefas.")
    } finally {
      setIsProcessingBulk(false)
    }
  }

  const executeBulkDuplicate = async () => {
    if (selectedTaskIds.size === 0) return
    setIsProcessingBulk(true)
    try {
      await duplicateTasks(Array.from(selectedTaskIds))
      setIsSelectMode(false)
      setSelectedTaskIds(new Set())
    } catch (err) {
      console.error(err)
      alert("Erro ao copiar tarefas.")
    } finally {
      setIsProcessingBulk(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-3xl mx-auto pb-12"
    >
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-action-primary/10 text-action-primary mb-6 ring-4 ring-action-primary/5">
          <Target className="w-8 h-8" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2 text-text-primary">Sua Rotina de Hoje</h1>
        <p className="text-text-secondary text-base">Foque apenas no que importa no momento. Execute.</p>
      </div>

      <Card className="bg-surface-card border-border-default shadow-card overflow-hidden relative">
        <div className="absolute top-0 left-0 h-1 bg-surface-subtle w-full">
          <motion.div 
            className="h-full bg-action-primary"
            initial={{ width: 0 }}
            animate={{ width: `${routineMetrics.completionPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <CardContent className="p-6 md:p-8 pt-10">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-1">
              <div className="text-center shrink-0">
                <p className="text-4xl font-bold text-text-primary">{routineMetrics.completionPercentage}%</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mt-1">Concluído</p>
              </div>
              <div className="h-12 w-px bg-border-subtle hidden md:block" />
              <div className="flex gap-6 w-full justify-around md:justify-start">
                <div className="flex flex-col gap-1 items-center md:items-start">
                  <div className="flex items-center text-text-secondary gap-1.5"><ListTodo className="w-4 h-4" /> <span className="text-sm font-medium">Total</span></div>
                  <p className="text-xl font-semibold text-text-primary">{routineMetrics.total}</p>
                </div>
                <div className="flex flex-col gap-1 items-center md:items-start">
                  <div className="flex items-center text-status-success gap-1.5"><CheckCircle2 className="w-4 h-4" /> <span className="text-sm font-medium">Feitas</span></div>
                  <p className="text-xl font-semibold text-text-primary">{routineMetrics.completed}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <form onSubmit={handleQuickAdd} className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
            <Plus className="w-5 h-5 text-text-secondary group-focus-within:text-action-primary transition-colors" />
          </div>
          <Input 
            type="text"
            placeholder="Adicione rápido ou cole seu 'brain dump'..."
            value={quickAdd}
            onChange={e => setQuickAdd(e.target.value)}
            disabled={isAILoading}
            className="pl-12 h-14 bg-surface-card backdrop-blur-sm border-border-default text-base shadow-lg rounded-2xl transition-all disabled:opacity-50"
          />
          <div className="absolute inset-y-0 right-2 flex items-center gap-2">
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              onClick={handleAIGenerate}
              disabled={isAILoading || !quickAdd.trim()}
              className={`h-10 w-10 text-action-primary hover:text-action-primary hover:bg-action-primary/10 rounded-xl transition-all ${isAILoading ? 'animate-pulse' : ''}`} 
              title="Organizar com IA"
            >
              <Sparkles className={`w-5 h-5 ${isAILoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button type="submit" size="sm" className="h-10 px-4 rounded-xl shadow-sm bg-action-primary hover:bg-action-primary-hover text-text-on-brand" disabled={!quickAdd.trim() || loading || isAILoading}>
              Adicionar
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-between px-2 pt-4">
          <h2 className="font-medium text-text-secondary text-sm">Lista de Execução</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSortMode(s => s === 'manual' ? 'alpha' : 'manual')}
              className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
              disabled={isSelectMode}
            >
              <ArrowUpDown className="w-3 h-3" />
              {sortMode === 'manual' ? 'Ordem Manual' : 'Alfabética'}
            </button>
            <Button 
              variant={isSelectMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setIsSelectMode(!isSelectMode)
                setSelectedTaskIds(new Set())
              }}
              className={`gap-2 h-8 text-xs ${isSelectMode ? 'bg-primary text-primary-foreground' : 'bg-transparent text-text-secondary border-transparent hover:bg-surface-elevated'}`}
            >
              <CheckSquare className="w-3 h-3" /> 
              {isSelectMode ? 'Cancelar' : 'Selecionar'}
            </Button>
          </div>
        </div>

        {orderedTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border-default bg-surface-card mt-4">
            <p className="text-text-secondary">Você ainda não tem tarefas para hoje.</p>
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
                dragListener={sortMode === 'manual' && !isSelectMode}
              >
                <TaskItem 
                  task={task} 
                  showDragHandle={sortMode === 'manual' && !isSelectMode} 
                  isSelectMode={isSelectMode}
                  isSelected={selectedTaskIds.has(task.id)}
                  onToggleSelect={toggleSelection}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Bulk Action Bar */}
      {isSelectMode && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-surface-elevated/90 backdrop-blur-xl border border-border-default p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-text-primary">
              {selectedTaskIds.size} selecionada(s)
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" className="text-status-error hover:bg-status-error/10" disabled={selectedTaskIds.size === 0 || isProcessingBulk} onClick={executeBulkDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </Button>
              <Button size="sm" className="bg-action-primary hover:bg-action-primary-hover text-text-on-brand" disabled={selectedTaskIds.size === 0 || isProcessingBulk} onClick={executeBulkDuplicate}>
                <Copy className="w-4 h-4 mr-2" /> Repetir
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
