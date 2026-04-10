'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, FolderKanban, MoreVertical, Archive, Trash2, Edit2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { boardService } from '@/services/boardService'
import { TaskBoard } from '@/types'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function BoardsPage() {
  const router = useRouter()
  const [boards, setBoards] = useState<TaskBoard[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBoard, setEditingBoard] = useState<TaskBoard | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    loadBoards()
  }, [])

  const loadBoards = async () => {
    try {
      const data = await boardService.fetchBoards()
      setBoards(data)
    } catch (error) {
      console.error('Failed to load boards', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (editingBoard) {
        await boardService.updateBoard(editingBoard.id, { name, description })
      } else {
        await boardService.createBoard({ name, description, is_archived: false })
      }
      setIsModalOpen(false)
      loadBoards()
    } catch (error) {
      console.error('Save failed', error)
    }
  }

  const openCreateModal = () => {
    setEditingBoard(null)
    setName('')
    setDescription('')
    setIsModalOpen(true)
  }

  const openEditModal = (board: TaskBoard) => {
    setEditingBoard(board)
    setName(board.name)
    setDescription(board.description || '')
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza? Todas as tarefas deste quadro ficarão órfãs.')) {
      await boardService.deleteBoard(id)
      loadBoards()
    }
  }

  const handleArchive = async (board: TaskBoard) => {
    await boardService.updateBoard(board.id, { is_archived: !board.is_archived })
    loadBoards()
  }

  const filteredBoards = boards.filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-2">Quadros de Tarefas</h1>
          <p className="text-text-secondary">Explore e gerencie seus projetos e temas centralizados</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
            <Input 
              placeholder="Buscar quadros..." 
              className="pl-9 w-[250px] bg-surface border-white/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openCreateModal} className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5 mr-2" />
            Novo Quadro
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-surface animate-pulse" />)}
        </div>
      ) : filteredBoards.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-3xl border border-white/5">
          <FolderKanban className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" />
          <h3 className="text-xl font-medium text-text-primary mb-2">Nenhum quadro encontrado</h3>
          <p className="text-text-secondary mb-6 pl-6 pr-6">Comece criando seu primeiro quadro para agrupar tarefas relacionadas.</p>
          <Button onClick={openCreateModal} variant="outline" className="border-white/10 hover:bg-white/5">
            Criar Primeiro Quadro
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredBoards.map(board => (
              <motion.div
                layout
                key={board.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`group relative overflow-hidden bg-surface rounded-2xl border ${board.is_archived ? 'border-dashed border-white/10 opacity-60' : 'border-white/5 hover:border-primary/50'} transition-all cursor-pointer shadow-lg`}
              >
                <div 
                  className="p-6 h-full flex flex-col"
                  onClick={() => router.push(`/boards/${board.id}`)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <FolderKanban className="w-6 h-6" />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-2 -mr-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-white/5">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-surface border-white/10 text-white rounded-xl shadow-2xl p-2 z-50">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditModal(board) }} className="hover:bg-white/10 cursor-pointer rounded-lg p-2 flex items-center gap-2">
                          <Edit2 className="w-4 h-4" /> Editar Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleArchive(board) }} className="hover:bg-white/10 cursor-pointer rounded-lg p-2 flex items-center gap-2">
                          <Archive className="w-4 h-4" /> {board.is_archived ? 'Desarquivar' : 'Arquivar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(board.id) }} className="text-red-400 hover:bg-red-500/10 cursor-pointer rounded-lg p-2 flex items-center gap-2">
                          <Trash2 className="w-4 h-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {board.name}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2 mb-4 flex-1">
                    {board.description || 'Sem descrição'}
                  </p>

                  <div className="text-xs font-medium text-text-secondary/50 pt-4 border-t border-white/5 uppercase tracking-wider">
                    {board.is_archived ? 'Arquivado' : 'Ativo'}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal - Could be a Separate Component */}
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface border border-white/10 p-6 shadow-2xl rounded-3xl z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingBoard ? 'Editar Quadro' : 'Novo Quadro'}
            </h2>
            
            <form onSubmit={handleSaveBoard} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Nome do Tema</label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Reforma da Casa, Lançamento XYZ..."
                  className="bg-background border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Descrição (Opcional)</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Insira detalhes sobre as tarefas deste quadro..."
                  className="w-full h-24 rounded-xl border border-white/10 bg-background px-3 py-2 text-sm text-white placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-text-secondary hover:text-white hover:bg-white/5">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary-hover text-white">
                  {editingBoard ? 'Salvar Alterações' : 'Criar Quadro'}
                </Button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>
  )
}
