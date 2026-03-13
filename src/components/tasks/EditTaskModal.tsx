'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task } from '@/types'
import { useTasks } from '@/components/tasks/TaskProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, Target, X } from 'lucide-react'

interface EditTaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
}

export function EditTaskModal({ task, isOpen, onClose }: EditTaskModalProps) {
  const { updateTask } = useTasks()
  const [title, setTitle] = React.useState(task.title)
  const [dueDate, setDueDate] = React.useState(task.due_date ? task.due_date.split('T')[0] : '')
  const [duration, setDuration] = React.useState(task.duration_min?.toString() || '30')
  const [priority, setPriority] = React.useState(task.priority?.toString() || '3')
  const [loading, setLoading] = React.useState(false)

  // Reset form when task changes
  React.useEffect(() => {
    if (isOpen) {
      setTitle(task.title)
      setDueDate(task.due_date ? task.due_date.split('T')[0] : '')
      setDuration(task.duration_min?.toString() || '30')
      setPriority(task.priority?.toString() || '3')
    }
  }, [task, isOpen])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await updateTask(task.id, {
        title,
        due_date: dueDate || null,
        duration_min: parseInt(duration) || 30,
        priority: parseInt(priority) as 1 | 2 | 3
      })
      onClose()
    } catch (err) {
      console.error(err)
      alert('Erro ao salvar tarefa.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">Editar Tarefa</h2>
              <button 
                onClick={onClose}
                className="p-2 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">Título da Tarefa</label>
                <Input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nome da tarefa"
                  className="h-12 bg-background border-border focus-visible:ring-primary/50"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" /> Prazo
                  </label>
                  <Input 
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-12 bg-background border-border focus-visible:ring-primary/50 color-scheme-dark"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" /> Duração
                  </label>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  >
                    <option value="15" className="bg-card">15 minutos</option>
                    <option value="30" className="bg-card">30 minutos</option>
                    <option value="60" className="bg-card">1 hora</option>
                    <option value="120" className="bg-card">2 horas</option>
                    <option value="240" className="bg-card">4 horas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" /> Prioridade
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <label className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${priority === '1' ? 'bg-danger/10 border-danger text-danger font-semibold' : 'bg-background border-border/50 text-muted-foreground hover:border-danger/50'}`}>
                    <input type="radio" name="priority" value="1" className="hidden" checked={priority === '1'} onChange={() => setPriority('1')} />
                    P1 - Alta
                  </label>
                  <label className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${priority === '2' ? 'bg-warning/10 border-warning text-warning font-semibold' : 'bg-background border-border/50 text-muted-foreground hover:border-warning/50'}`}>
                    <input type="radio" name="priority" value="2" className="hidden" checked={priority === '2'} onChange={() => setPriority('2')} />
                    P2 - Média
                  </label>
                  <label className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${priority === '3' ? 'bg-primary/10 border-primary text-primary font-semibold' : 'bg-background border-border/50 text-muted-foreground hover:border-primary/50'}`}>
                    <input type="radio" name="priority" value="3" className="hidden" checked={priority === '3'} onChange={() => setPriority('3')} />
                    P3 - Baixa
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 h-12 rounded-xl" disabled={loading || !title.trim()}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
