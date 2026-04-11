'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTasks } from '@/components/tasks/TaskProvider'
import { Card, CardContent } from '@/components/ui/card'
import { TaskItem } from '@/components/tasks/TaskItem'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Plus, FolderKanban, Edit2, Settings, Target, Clock, AlarmClock } from 'lucide-react'
import { boardService } from '@/services/boardService'
import { TaskBoard } from '@/types'
import { useRouter, useParams } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Input } from '@/components/ui/input'

export default function BoardDetailPage() {
  const router = useRouter()
  const params = useParams()
  const boardId = params.id as string

  const { tasks, addTask, refresh, loading: tasksLoading } = useTasks()
  const [board, setBoard] = useState<TaskBoard | null>(null)
  const [loading, setLoading] = useState(true)

  // Task Creation State
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [duration, setDuration] = useState('30')
  const [priority, setPriority] = useState<'1'|'2'|'3'>('3')
  const [isSubmittingTask, setIsSubmittingTask] = useState(false)

  // Board Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  useEffect(() => {
    loadBoard()
  }, [boardId])

  const boardTasks = tasks.filter(t => t.board_id === boardId)

  const loadBoard = async () => {
    try {
      setLoading(true)
      const data = await boardService.fetchBoardById(boardId)
      if (data) {
        setBoard(data)
        setEditName(data.name)
        setEditDesc(data.description || '')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim()) return
    await boardService.updateBoard(boardId, { name: editName, description: editDesc })
    setIsEditModalOpen(false)
    loadBoard()
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isSubmittingTask) return
    setIsSubmittingTask(true)
    
    try {
      await addTask({
        title,
        board_id: boardId,
        due_date: dueDate || null,
        due_time: dueTime || null,
        duration_min: parseInt(duration) || 30,
        priority: parseInt(priority) as 1 | 2 | 3
      })
      setTitle('')
      setDueDate('')
      setDueTime('')
      setDuration('30')
      setPriority('3')
    } catch (err: any) {
      alert(`Erro ao criar tarefa: ${err.message}`)
    } finally {
      setIsSubmittingTask(false)
    }
  }

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-text-secondary">Carregando quadro...</div>
  }

  if (!board) {
    return <div className="p-10 text-center text-text-secondary">Quadro não encontrado.</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-5xl mx-auto pb-12"
    >
      {/* Header section */}
      <div>
        <Button variant="ghost" onClick={() => router.push('/boards')} className="mb-4 pl-0 text-text-secondary hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Quadros
        </Button>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{board.name}</h1>
              {board.is_archived && <span className="px-2 py-1 bg-white/10 text-text-secondary text-xs rounded-md">Arquivado</span>}
            </div>
            {board.description && <p className="text-text-secondary mt-2 max-w-2xl">{board.description}</p>}
          </div>
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="border-white/10 hover:bg-white/5 whitespace-nowrap">
            <Edit2 className="w-4 h-4 mr-2" /> Editar Quadro
          </Button>
        </div>
      </div>

      {/* Embedded Task Creation specific to Board */}
      {!board.is_archived && (
        <Card className="bg-action-primary/5 border-action-primary/20 backdrop-blur-2xl overflow-visible relative shadow-none">
          <div className="absolute inset-0 bg-gradient-to-r from-action-primary/10 to-transparent pointer-events-none rounded-2xl" />
          <CardContent className="p-4 md:p-6 relative z-10">
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="flex bg-surface-card backdrop-blur rounded-xl border border-border-default p-1 shadow-inner focus-within:ring-2 focus-within:ring-action-primary/50 transition-all">
                <input
                  type="text"
                  placeholder={`Nova tarefa para ${board.name}...`}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-base text-text-primary placeholder:text-text-secondary focus:outline-none placeholder:font-medium"
                  required
                />
                <Button type="submit" size="icon" className="h-12 w-12 rounded-lg shrink-0" disabled={!title.trim() || tasksLoading || isSubmittingTask}>
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 px-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-text-secondary" />
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-transparent text-sm text-text-primary border-none focus:ring-0 p-0" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-text-secondary" />
                  <input type="time" value={dueTime} onChange={e => setDueTime(e.target.value)} className="bg-transparent text-sm text-text-primary border-none focus:ring-0 p-0" />
                </div>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <AlarmClock className="w-3.5 h-3.5" />
                  <select value={duration} onChange={e => setDuration(e.target.value)} className="bg-transparent border-none focus:ring-0 text-text-primary p-0">
                    <option value="15">15m</option><option value="30">30m</option><option value="60">1h</option><option value="120">2h</option>
                  </select>
                </div>
                <div className="h-4 w-px bg-white/10 mx-1" />
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Target className="w-3.5 h-3.5" />
                  <select value={priority} onChange={e => setPriority(e.target.value as any)} className="bg-transparent border-none focus:ring-0 text-text-primary p-0">
                    <option value="1">Alta</option><option value="2">Média</option><option value="3">Baixa</option>
                  </select>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
          Tarefas do Quadro <span className="bg-white/10 text-sm px-2 py-0.5 rounded-full">{boardTasks.length}</span>
        </h3>
        
        {tasksLoading ? (
          <div className="text-center py-10 text-text-secondary animate-pulse">Carregando tarefas...</div>
        ) : boardTasks.length === 0 ? (
          <div className="text-center py-16 bg-surface/50 border border-border-default border-dashed rounded-2xl">
            <p className="text-text-secondary font-medium">Nenhuma tarefa neste quadro ainda.</p>
          </div>
        ) : (
          boardTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isSelectMode={false} 
              isSelected={false} 
              onToggleSelect={() => {}} 
            />
          ))
        )}
      </div>

      {/* Edit Board Modal */}
      <Dialog.Root open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-white/10 p-6 shadow-2xl rounded-3xl z-50">
            <h2 className="text-xl font-bold text-white mb-6">Editar Quadro</h2>
            <form onSubmit={handleUpdateBoard} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Nome</label>
                <Input value={editName} onChange={e => setEditName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Descrição</label>
                <textarea 
                  value={editDesc} 
                  onChange={e => setEditDesc(e.target.value)}
                  className="w-full h-24 rounded-xl border border-white/10 bg-background px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-primary hover:bg-primary-hover text-white">Salvar Alterações</Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </motion.div>
  )
}
