import * as React from 'react'
import { motion, AnimatePresence, Reorder, useDragControls, DragControls } from 'framer-motion'
import { Task, Subtask } from '@/types'
import { useTasks } from './TaskProvider'
import { Check, Clock, GripVertical, MoreVertical, Pin, Trash2, Calendar, AlarmClock, ChevronDown, ChevronRight, CornerDownRight, ListTree } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { format, parseISO } from 'date-fns'
import { EditTaskModal } from './EditTaskModal'
import { Pencil } from 'lucide-react'

interface TaskItemProps {
  task: Task
  showDragHandle?: boolean
  isSelectMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
  dragControls?: DragControls
}

export function TaskItem({ task, showDragHandle, isSelectMode, isSelected, onToggleSelect, dragControls }: TaskItemProps) {
  const { toggleTaskDone, pinTaskToday, deleteTask, addSubtask, updateSubtask, deleteSubtask, reorderSubtasksFrontend } = useTasks()
  const [isEditModalOpen, setEditModalOpen] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('')
  const [isCreatingSubtask, setIsCreatingSubtask] = React.useState(false)

  const isDone = task.status === 'done'

  const handleItemClick = () => {
    if (isSelectMode && onToggleSelect) {
      onToggleSelect(task.id)
    }
  }

  const handleReorderSub = (newOrder: Subtask[]) => {
    // Determine which item moved where based on ID sequence differences if we want,
    // but the easy frontend way is to just call a special `reorderSubtasksExact` that takes the full array of IDs,
    // OR we can just use `updateSubtask` loop, OR the provider handles it.
    // Provider `reorderSubtasksFrontend` has `(taskId, activeId, overId)`.
    // Let's actually fire an updates map locally, then save.
    // However, to keep it simple and perfectly synced, let's call `reorderSubtasksFrontend` with a dedicated new mode in the next step,
    // actually, let's just use `taskService.reorderSubtasks()`. 
    // Wait, the provider doesn't have a `setSubtasksList` method yet. We can just use standard `updateSubtask` in a loop, but that would trigger 5 calls.
    // We already made `taskService.reorderSubtasks`. We can just call it and locally mutate the state!
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, height: 0 }}
      onClick={handleItemClick}
      className={`group flex flex-col p-4 bg-card/40 border ${isSelected ? 'border-primary bg-primary/5' : 'border-border/50'} rounded-2xl hover:bg-muted/20 transition-all ${isDone && !isSelectMode ? 'opacity-50' : ''} ${isSelectMode ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start md:items-center gap-3 w-full relative">
        {showDragHandle && !isSelectMode && !isDone && (
          <button 
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground mt-1 md:mt-0 p-1 -ml-1 rounded transition-colors hover:bg-muted/50 touch-none"
            onPointerDown={(e) => dragControls?.start(e)}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

      {/* Select Mode Checkbox */}
      {isSelectMode ? (
        <div className={`w-6 h-6 mt-0.5 md:mt-0 rounded-md flex flex-shrink-0 items-center justify-center border-2 transition-colors ${isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
          {isSelected && <Check className="w-4 h-4" />}
        </div>
      ) : (
        /* Check Button */
        <button 
          onClick={(e) => { e.stopPropagation(); toggleTaskDone(task); }}
          className={`w-6 h-6 mt-0.5 md:mt-0 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
            isDone ? 'bg-success border-success text-white' : 'border-muted-foreground hover:border-primary'
          }`}
        >
          {isDone && <Check className="w-4 h-4" />}
        </button>
      )}

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

          {task.due_time && (
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <AlarmClock className="w-3 h-3" /> {task.due_time}
            </span>
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

        {/* Subtasks Expander Badge */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-2 flex items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary px-2 py-0.5 rounded-md hover:bg-white/5 transition-colors border border-transparent hover:border-border-default"
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="font-semibold">{task.subtasks.filter(s => s.is_done).length}/{task.subtasks.length}</span> Subtarefas
            </button>
          </div>
        )}
      </div>

      {/* Options Menu Toggle */}
      {!isSelectMode && (
        <div className="flex flex-col md:flex-row items-end md:items-center justify-end md:ml-auto shrink-0 gap-1 md:gap-2">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg opacity-0 group-hover:opacity-100 transition-opacity outline-none"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-48 bg-card border-border rounded-xl shadow-2xl p-1 z-50">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(true)
                }}
                className="cursor-pointer"
              >
                <ListTree className="w-4 h-4 mr-2" /> Adicionar Subtarefa
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  pinTaskToday(task.id, !task.pinned_today)
                }}
                className="cursor-pointer"
              >
                <Pin className="w-4 h-4 mr-2" /> {task.pinned_today ? 'Remover Foco' : 'Focar Hoje'}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  setEditModalOpen(true)
                }}
                className="cursor-pointer"
              >
                <Pencil className="w-4 h-4 mr-2" /> Editar
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation()
                  deleteTask(task.id)
                }}
                className="text-red-500 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      )}
      </div> {/* End array row */}

      {/* Subtasks Accordion */}
      {!isSelectMode && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden w-full"
            >
              <div className="pt-3 pb-1 pl-[2.2rem] md:pl-[2.7rem] space-y-2">
                <Reorder.Group 
                  axis="y" 
                  values={task.subtasks || []} 
                  onReorder={(newOrder) => reorderSubtasksFrontend(task.id, newOrder)}
                  className="space-y-2"
                >
                  {task.subtasks?.map(sub => (
                    <SubtaskRow key={sub.id} sub={sub} task={task} />
                  ))}
                </Reorder.Group>
                
                {/* New Subtask Input Sticky */}
                <div className="flex flex-col pt-2 mt-2 border-t border-dashed border-border-default/50" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2 text-text-secondary w-full">
                    <CornerDownRight className="w-4 h-4 shrink-0" />
                    <input 
                      placeholder="+ Nova subtarefa (Pressione Enter para criar)..."
                      value={newSubtaskTitle}
                      onChange={e => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={async e => {
                        if (e.key === 'Enter' && newSubtaskTitle.trim() && !isCreatingSubtask) {
                          e.preventDefault();
                          setIsCreatingSubtask(true);
                          try {
                            await addSubtask(task.id, newSubtaskTitle);
                            setNewSubtaskTitle('');
                          } finally {
                            setIsCreatingSubtask(false);
                          }
                        }
                      }}
                      className="flex-1 bg-transparent text-sm font-medium border-none focus:ring-0 p-0 text-text-primary placeholder:text-text-secondary/50 outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <EditTaskModal 
        task={task} 
        isOpen={isEditModalOpen} 
        onClose={() => setEditModalOpen(false)} 
      />
    </motion.div>
  )
}

function SubtaskRow({ sub, task }: { sub: Subtask, task: Task }) {
  const { updateSubtask, deleteSubtask } = useTasks()
  const controls = useDragControls()
  
  return (
    <Reorder.Item value={sub} dragListener={false} dragControls={controls}>
      <div className="group/sub relative flex flex-wrap items-center gap-2 pl-1 bg-surface-card rounded-xl border border-transparent hover:border-border-default hover:bg-surface-elevated transition-colors" onClick={e => e.stopPropagation()}>
        {/* Grip Handle */}
        <button 
          className="cursor-grab active:cursor-grabbing text-text-secondary/50 hover:text-text-primary p-1.5 touch-none"
          onPointerDown={(e) => controls.start(e)}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {/* Checkbox */}
        <button 
          onClick={() => updateSubtask(task.id, sub.id, { is_done: !sub.is_done })} 
          className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors bg-surface-elevated ${sub.is_done ? 'bg-primary border-primary' : 'border-border-default hover:border-primary'}`}
        >
          {sub.is_done && <Check className="w-3 h-3 text-white" />}
        </button>
        
        {/* Title input */}
        <input 
          value={sub.title} 
          onChange={e => updateSubtask(task.id, sub.id, { title: e.target.value })}
          className={`flex-1 min-w-[120px] bg-transparent text-sm border-none focus:ring-0 p-0 transition-colors cursor-text ${sub.is_done ? 'line-through text-text-secondary/50' : 'text-text-primary'}`}
        />
        
        {/* Compact Date/Time Controls */}
        <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover/sub:opacity-100 transition-opacity ml-auto shrink-0 pr-2 py-1.5">
          <div className="flex items-center gap-1 bg-surface-elevated px-1.5 py-0.5 rounded-md border border-border-default">
            <Calendar className="w-3 h-3 text-text-secondary" />
            <input 
              type="date" 
              className="text-[10px] bg-transparent border-none text-text-secondary focus:text-text-primary w-[85px] p-0 focus:ring-0" 
              value={sub.due_date || ''} 
              title="Data limite"
              onChange={e => updateSubtask(task.id, sub.id, { due_date: e.target.value || null })} 
            />
          </div>
          <div className="flex items-center gap-1 bg-surface-elevated px-1.5 py-0.5 rounded-md border border-border-default">
            <AlarmClock className="w-3 h-3 text-text-secondary" />
            <input 
              type="time" 
              className="text-[10px] bg-transparent border-none text-text-secondary focus:text-text-primary w-[55px] p-0 focus:ring-0" 
              value={sub.due_time || ''} 
              title="Hora limite"
              onChange={e => updateSubtask(task.id, sub.id, { due_time: e.target.value || null })} 
            />
          </div>
          
          {/* Delete */}
          <button 
            onClick={() => deleteSubtask(task.id, sub.id)} 
            className="text-red-400 p-1 hover:bg-red-500/10 rounded-md transition-colors"
            title="Excluir subtarefa"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Reorder.Item>
  )
}
