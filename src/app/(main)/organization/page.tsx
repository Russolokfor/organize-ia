'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useTasks } from '@/components/tasks/TaskProvider'
import { Card, CardContent } from '@/components/ui/card'
import { TaskItem } from '@/components/tasks/TaskItem'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Plus, Target, CheckSquare, Trash2, Copy } from 'lucide-react'
import { TaskFilterScope, TaskFilterStatus } from '@/types'

export default function OrganizationPage() {
  const { tasks, addTask, refresh, loading, deleteTasks, duplicateTasks } = useTasks()
  const [title, setTitle] = React.useState('')
  const [dueDate, setDueDate] = React.useState('')
  const [duration, setDuration] = React.useState('30')
  const [priority, setPriority] = React.useState<'1'|'2'|'3'>('3')
  
  const [statusFilter, setStatusFilter] = React.useState<TaskFilterStatus>('all')
  const [scopeFilter, setScopeFilter] = React.useState<TaskFilterScope>('all')

  const [isSelectMode, setIsSelectMode] = React.useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<string>>(new Set())
  const [isProcessingBulk, setIsProcessingBulk] = React.useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    await addTask({
      title,
      due_date: dueDate || null,
      duration_min: parseInt(duration) || 30,
      priority: parseInt(priority) as 1 | 2 | 3
    })
    setTitle('')
    setDueDate('')
    setDuration('30')
    setPriority('3')
  }

  React.useEffect(() => {
    refresh({ status: statusFilter, scope: scopeFilter })
  }, [statusFilter, scopeFilter, refresh])

  const toggleSelection = (id: string) => {
    const next = new Set(selectedTaskIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedTaskIds(next)
  }

  const executeBulkDelete = async () => {
    if (selectedTaskIds.size === 0) return
    if (!window.confirm(`Excluir permanentemente ${selectedTaskIds.size} tarefas?`)) return
    
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
      className="space-y-6 max-w-4xl mx-auto pb-12"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Organização</h1>
        <p className="text-text-secondary mt-1 text-sm md:text-base">
          Painel geral para criar, filtrar e organizar o que você vai executar.
        </p>
      </div>

      <Card className="bg-action-primary/5 border-action-primary/20 backdrop-blur-2xl overflow-visible relative shadow-none">
        <div className="absolute inset-0 bg-gradient-to-r from-action-primary/10 to-transparent pointer-events-none rounded-2xl" />
        <CardContent className="p-4 md:p-6 relative z-10">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex bg-surface-card backdrop-blur rounded-xl border border-border-default p-1 shadow-inner focus-within:ring-2 focus-within:ring-action-primary/50 transition-all">
              <input
                type="text"
                placeholder="O que você precisa fazer?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-transparent px-4 py-3 text-base text-text-primary placeholder:text-text-secondary focus:outline-none placeholder:font-medium"
                required
              />
              <Button type="submit" size="icon" className="h-12 w-12 rounded-lg shrink-0" disabled={!title.trim() || loading}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 md:gap-4 px-1 mt-4">
              <div className="flex items-center gap-2 bg-surface-card backdrop-blur px-3 py-1.5 border border-border-default rounded-lg shadow-sm">
                <Calendar className="w-4 h-4 text-text-secondary" />
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none text-text-primary color-scheme-dark"
                />
              </div>

              <div className="flex items-center gap-2 bg-surface-card backdrop-blur px-3 py-1.5 border border-border-default rounded-lg shadow-sm">
                <Clock className="w-4 h-4 text-text-secondary" />
                <select 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)}
                  className="bg-transparent text-sm focus:outline-none text-text-primary appearance-none"
                >
                  <option value="15" className="bg-surface-elevated text-text-primary">15 min</option>
                  <option value="30" className="bg-surface-elevated text-text-primary">30 min</option>
                  <option value="60" className="bg-surface-elevated text-text-primary">1 hora</option>
                  <option value="120" className="bg-surface-elevated text-text-primary">2 horas</option>
                </select>
              </div>

              <div className="flex items-center gap-2 bg-surface-card backdrop-blur px-3 py-1.5 border border-border-default rounded-lg shadow-sm">
                <Target className="w-4 h-4 text-text-secondary" />
                <select 
                  value={priority} 
                  onChange={e => setPriority(e.target.value as any)}
                  className="bg-transparent text-sm focus:outline-none text-text-primary appearance-none"
                >
                  <option value="1" className="bg-surface-elevated text-status-error font-bold">P1 Alta</option>
                  <option value="2" className="bg-surface-elevated text-status-warning font-bold">P2 Média</option>
                  <option value="3" className="bg-surface-elevated text-text-secondary">P3 Baixa</option>
                </select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
        <h2 className="font-semibold px-1 text-text-primary">Todas as Tarefas ({tasks.length})</h2>
        <div className="flex items-center gap-2 self-start md:self-auto w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-sm bg-surface-card border border-border-default rounded-lg px-3 py-2 text-text-primary focus:outline-none ring-offset-surface-page focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <option value="all">Ver todas</option>
            <option value="planned">Planejadas</option>
            <option value="done">Concluídas</option>
          </select>

          <select 
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value as any)}
            className="text-sm bg-surface-card border border-border-default rounded-lg px-3 py-2 text-text-primary focus:outline-none ring-offset-surface-page focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <option value="all">Todo o tempo</option>
            <option value="today">Hoje</option>
            <option value="next7">Próximos 7 dias</option>
            <option value="overdue">Atrasadas</option>
            <option value="no_due_date">Sem prazo</option>
          </select>

          <Button 
            variant={isSelectMode ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setIsSelectMode(!isSelectMode)
              setSelectedTaskIds(new Set())
            }}
            className={`gap-2 ml-2 ${isSelectMode ? 'bg-primary text-primary-foreground' : 'bg-surface-card text-text-secondary border-border-default'}`}
          >
            <CheckSquare className="w-4 h-4" /> 
            {isSelectMode ? 'Cancelar' : 'Selecionar'}
          </Button>
        </div>
      </div>

      <motion.div layout className="flex flex-col gap-2">
        {loading && tasks.length === 0 ? (
          <div className="animate-pulse space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-surface-subtle rounded-2xl w-full"></div>)}
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border-default bg-surface-section">
            <div className="w-16 h-16 mx-auto bg-surface-subtle rounded-2xl flex items-center justify-center mb-4 text-text-secondary">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="text-lg font-medium text-text-primary">Sua lista está vazia</h3>
            <p className="text-sm text-text-secondary mt-2 max-w-sm mx-auto">
              Comece adicionando tarefas no campo acima. Tire os pensamentos da cabeça e coloque no sistema.
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isSelectMode={isSelectMode}
              isSelected={selectedTaskIds.has(task.id)}
              onToggleSelect={toggleSelection}
            />
          ))
        )}
      </motion.div>

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
