'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useFinancial } from '@/components/financial/FinancialProvider'
import { UploadCloud, FileText, CheckCircle2, ChevronRight, X, AlertCircle } from 'lucide-react'

interface ParsedTransaction {
  amount: number
  type: 'income' | 'expense'
  category: string
  title: string
  date: string
}

interface StatementUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StatementUploadModal({ isOpen, onClose }: StatementUploadModalProps) {
  const { addEntry } = useFinancial()
  const [file, setFile] = React.useState<File | null>(null)
  
  // Status states: 'idle' | 'reading' | 'analyzing' | 'preview' | 'importing' | 'done' | 'error'
  const [status, setStatus] = React.useState<'idle' | 'reading' | 'analyzing' | 'preview' | 'importing' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = React.useState('')
  const [parsedData, setParsedData] = React.useState<{balance: number, transactions: ParsedTransaction[]} | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setStatus('idle')
      setErrorMsg('')
    }
  }

  const handleProcess = async () => {
    if (!file) return

    setStatus('reading')
    try {
      const formData = new FormData()
      formData.append('file', file)

      // Artificial delay for UX
      await new Promise(r => setTimeout(r, 800))
      setStatus('analyzing')

      const response = await fetch('/api/ai/parse-pdf', {
         method: 'POST',
         body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao analisar extrato.')
      }

      setParsedData(data)
      setStatus('preview')
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  const handleSaveAll = async () => {
    if (!parsedData || !parsedData.transactions) return
    setStatus('importing')

    try {
      // Import sequentially or bulk depending on API
      for (const t of parsedData.transactions) {
        
        const txDate = t.date || new Date().toISOString().split('T')[0]
        const referenceMonth = txDate.substring(0, 7) // YYYY-MM

        await addEntry({
          title: t.title,
          amount: Math.abs(t.amount),
          type: t.type,
          category: t.category,
          notes: 'Importado bia PDF Inteligente',
          due_date: txDate,
          paid_at: new Date().toISOString(),
          is_paid: true, 
          is_recurring: false,
          recurrence_type: null,
          is_fixed: false,
          reference_month: referenceMonth
        })
      }
      
      setStatus('done')
      setTimeout(() => {
        handleReset()
      }, 3000)
    } catch (err: any) {
       console.error(err)
       setErrorMsg('Erro ao salvar no banco de dados.')
       setStatus('error')
    }
  }

  const handleReset = () => {
    setFile(null)
    setParsedData(null)
    setStatus('idle')
    setErrorMsg('')
    onClose()
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
          onClick={status !== 'importing' && status !== 'analyzing' ? handleReset : undefined}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-surface-card border border-border-default rounded-3xl shadow-card overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 md:p-8 pb-0 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-text-primary">Importação Inteligente</h2>
              <p className="text-sm text-text-secondary mt-1">
                Deixe a IA ler seu extrato bancário (PDF).
              </p>
            </div>
            {status !== 'analyzing' && status !== 'importing' && (
              <button onClick={handleReset} className="p-2 bg-surface-subtle hover:bg-surface-elevated text-text-secondary hover:text-text-primary rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-6">
            
            {status === 'idle' && (
              <div className="space-y-6">
                <div className="relative border-2 border-dashed border-border-default hover:border-action-primary/50 transition-colors rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-surface-subtle cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <div className="w-16 h-16 bg-action-primary/10 text-action-primary rounded-full flex items-center justify-center mb-4">
                     <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-text-primary">
                    {file ? file.name : "Arraste e solte o PDF do Extrato"}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {file ? "Pronto para leitura" : "Ou clique para escolher um arquivo do dispositivo"}
                  </p>
                </div>
                
                <Button 
                  className="w-full h-12 rounded-xl text-md bg-action-primary text-text-on-brand hover:bg-action-primary-hover" 
                  disabled={!file}
                  onClick={handleProcess}
                >
                  Ler com Inteligência Artificial
                </Button>
              </div>
            )}

            {(status === 'reading' || status === 'analyzing' || status === 'importing') && (
               <div className="flex flex-col items-center justify-center py-12 space-y-6">
                 <div className="relative w-24 h-24">
                   <div className="absolute inset-0 border-4 border-surface-subtle rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-action-primary rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center text-action-primary">
                      {status === 'analyzing' ? <FileText className="w-8 h-8 animate-pulse" /> : <UploadCloud className="w-8 h-8" />}
                   </div>
                 </div>
                 <div className="text-center space-y-2">
                   <h3 className="text-xl font-bold text-text-primary">
                     {status === 'reading' && "Extraindo texto do PDF..."}
                     {status === 'analyzing' && "A IA está categorizando os gastos..."}
                     {status === 'importing' && "Salvando no seu banco de dados..."}
                   </h3>
                   <p className="text-text-secondary text-sm">Isso pode levar alguns segundos, não feche a tela.</p>
                 </div>
               </div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-status-error/10 text-status-error rounded-full flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-status-error">Falha na Leitura</h3>
                    <p className="text-text-secondary text-sm mt-1 mb-6 max-w-sm">{errorMsg}</p>
                    <Button variant="outline" className="border-border-default text-text-primary" onClick={() => setStatus('idle')}>Tentar Novamente</Button>
                  </div>
                </div>
            )}

            {status === 'done' && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <motion.div initial={{scale:0}} animate={{scale:1}} className="w-20 h-20 bg-status-success/10 text-status-success rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-text-primary">Importação Concluída!</h3>
                    <p className="text-text-secondary mt-1">O seu dashboard já reflete as novas transações.</p>
                  </div>
                </div>
            )}

            {status === 'preview' && parsedData && (
               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-surface-elevated border-action-primary/20 bg-gradient-to-br from-action-primary/10 to-transparent shadow-none">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <p className="text-xs font-medium text-text-secondary mb-1 uppercase tracking-wider">Saldo Lido (Extrato)</p>
                        <h3 className="text-2xl font-extrabold font-mono text-action-primary">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parsedData.balance)}
                        </h3>
                      </CardContent>
                    </Card>
                    <Card className="bg-surface-elevated border-border-default shadow-none">
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <p className="text-xs font-medium text-text-secondary mb-1 uppercase tracking-wider">Transações Detectadas</p>
                        <h3 className="text-2xl font-bold text-text-primary">
                           {parsedData.transactions.length}
                        </h3>
                      </CardContent>
                    </Card>
                 </div>

                 <div className="bg-surface-page rounded-xl border border-border-default max-h-48 overflow-y-auto shadow-inner">
                    {parsedData.transactions.length > 0 ? (
                       <ul className="divide-y divide-border-default">
                         {parsedData.transactions.map((t, idx) => (
                           <li key={idx} className="flex items-center justify-between p-3 text-sm">
                              <div className="flex flex-col">
                                <span className="font-medium truncate max-w-[180px] md:max-w-xs text-text-primary">{t.title}</span>
                                <span className="text-xs text-text-secondary">{t.category} • {t.date}</span>
                              </div>
                              <span className={`font-semibold font-mono ${t.type === 'income' ? 'text-status-success' : 'text-status-error'}`}>
                                {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.abs(t.amount))}
                              </span>
                           </li>
                         ))}
                       </ul>
                    ) : (
                       <div className="p-4 text-center text-text-secondary text-sm">Nenhuma transação explícita lida no extrato.</div>
                    )}
                 </div>

                 <div className="flex gap-3 mt-4">
                   <Button variant="outline" className="flex-1 h-12 rounded-xl border-border-default text-text-primary hover:bg-surface-subtle" onClick={() => setStatus('idle')}>
                      Cancelar
                   </Button>
                   <Button className="flex-1 h-12 rounded-xl bg-action-primary text-text-on-brand hover:bg-action-primary-hover" onClick={handleSaveAll}>
                      Salvar Entradas
                   </Button>
                 </div>
               </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
