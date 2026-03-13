import * as React from 'react'
import { motion } from 'framer-motion'
import { Task } from '@/types'
import { useTasks } from './TaskProvider'
import { Check, Clock, GripVertical, MoreVertical, Pin, Trash2, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { EditTaskModal } from './EditTaskModal'
import { Pencil } from 'lucide-react'

interface TaskItemProps {
  task: Task
  showDragHandle?: boolean
}

export function TaskItem({ task, showDragHandle }: TaskItemProps) {
  const { toggleTaskDone, pinTaskToday, deleteTask } = useTasks()
  const [showOptions, setShowOptions] = React.useState(false)
  const [isEditModalOpen, setEditModalOpen] = React.useState(false)

  const isDone = task.status === 'done'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, height: 0 }}
      className={`group flex items-center gap-3 p-4 bg-card/40 border border-border/50 rounded-2xl hover:bg-muted/20 transition-all ${isDone ? 'opacity-50' : ''}`}
    >
      {showDragHandle && (
        <button className="cursor-grab text-muted-foreground hover:text-foreground">
          <GripVertical className="w-5 h-5" />
        </button>
      )}

      {/* Check Button */}
      <button 
        onClick={() => toggleTaskDone(task)}
        className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
          isDone ? 'bg-success border-success text-white' : 'border-muted-foreground hover:border-primary'
        }`}
      >
        {isDone && <Check className="w-4 h-4" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm md:text-base truncate transition-all ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </p>
        
        {/* Meta tags */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.due_date && (
            <Badge variant="outline" className="text-xs bg-background/50 border-border shadow-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {format(parseISO(task.due_date), 'dd/MM')}
            </Badge>
          )}

          {task.duration_min && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {task.duration_min}m
            </span>
          )}

          {task.priority && (
            <Badge variant={task.priority === 1 ? 'danger' : task.priority === 2 ? 'warning' : 'secondary'} className="text-[10px] px-1.5 py-0">
              P{task.priority}
            </Badge>
          )}
          
          {task.pinned_today && !isDone && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 flex items-center gap-1 bg-primary/20 text-primary">
              <Pin className="w-3 h-3" /> Rotina
            </Badge>
          )}
        </div>
      </div>

      {/* Options Menu Toggle */}
      <div className="relative">
        <button 
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {/* Simple Popover via state */}
        {showOptions && (
          <div className="absolute right-0 top-10 w-40 bg-card border border-border rounded-xl shadow-2xl z-10 py-1 flex flex-col overflow-hidden">
            <button
              onClick={() => {
                pinTaskToday(task.id, !task.pinned_today)
                setShowOptions(false)
              }}
              className="px-4 py-2 text-sm text-left hover:bg-muted/50 flex items-center gap-2"
            >
              <Pin className="w-4 h-4" /> {task.pinned_today ? 'Remover Foco' : 'Focar Hoje'}
            </button>
            <button
              onClick={() => {
                setShowOptions(false)
                setEditModalOpen(true)
              }}
              className="px-4 py-2 text-sm text-left hover:bg-muted/50 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Editar
            </button>
            <button
              onClick={() => {
                deleteTask(task.id)
                setShowOptions(false)
              }}
              className="px-4 py-2 text-sm text-left hover:bg-danger/20 text-danger flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </div>
        )}
      </div>

      {showOptions && (
        <div className="fixed inset-0 z-0" onClick={() => setShowOptions(false)} />
      )}

      <EditTaskModal 
        task={task} 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
      />
    </motion.div>
  )
}
