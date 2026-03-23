'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Building2, Calendar, FileText, UploadCloud, File, Trash2, DollarSign } from 'lucide-react'
import { Client, ClientInsert, ClientType, ClientStatus, BillingCycle, ClientDocument } from '@/types/crm'
import { useCrm } from './CrmProvider'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
}

export function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const { addClient, updateClient } = useCrm()
  const [activeTab, setActiveTab] = React.useState<'dados' | 'contrato' | 'anexos'>('dados')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form State
  const [type, setType] = React.useState<ClientType>('individual')
  const [name, setName] = React.useState('')
  const [companyName, setCompanyName] = React.useState('')
  const [document, setDocument] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  
  const [status, setStatus] = React.useState<ClientStatus>('active')
  const [serviceValue, setServiceValue] = React.useState<string>('')
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>('monthly')
  const [joinDate, setJoinDate] = React.useState('')
  const [nextPaymentDate, setNextPaymentDate] = React.useState('')
  
  const [notes, setNotes] = React.useState('')
  const [documents, setDocuments] = React.useState<ClientDocument[]>([])

  React.useEffect(() => {
    if (client) {
      setType(client.type)
      setName(client.name)
      setCompanyName(client.company_name || '')
      setDocument(client.document || '')
      setEmail(client.email || '')
      setPhone(client.phone || '')
      setStatus(client.status)
      setServiceValue(client.service_value ? client.service_value.toString() : '')
      setBillingCycle(client.billing_cycle || 'monthly')
      setJoinDate(client.join_date || '')
      setNextPaymentDate(client.next_payment_date || '')
      setNotes(client.notes || '')
      setDocuments(client.documents || [])
    } else {
      setType('individual')
      setName('')
      setCompanyName('')
      setDocument('')
      setEmail('')
      setPhone('')
      setStatus('active')
      setServiceValue('')
      setBillingCycle('monthly')
      setJoinDate(format(new Date(), 'yyyy-MM-dd'))
      setNextPaymentDate('')
      setNotes('')
      setDocuments([])
      setActiveTab('dados')
    }
  }, [client, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const payload: ClientInsert = {
        type,
        name,
        company_name: type === 'business' ? companyName : null,
        document: document || null,
        email: email || null,
        phone: phone || null,
        status,
        service_value: serviceValue ? parseFloat(serviceValue) : null,
        billing_cycle: billingCycle,
        join_date: joinDate || null,
        next_payment_date: nextPaymentDate || null,
        notes: notes || null,
        documents
      }

      if (client) {
        await updateClient(client.id, payload)
      } else {
        await addClient(payload)
      }
      onClose()
    } catch (error) {
       console.error(error)
       alert('Erro ao salvar cliente')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="relative w-full max-w-2xl bg-surface-card border border-border-default shadow-2xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border-default flex justify-between items-center bg-surface-section">
            <h2 className="text-xl font-bold text-text-primary">
              {client ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <button onClick={onClose} className="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-surface-subtle rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs */}
            <div className="flex px-6 border-b border-border-subtle bg-surface-card pt-2">
              <button
                type="button"
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'dados' ? 'border-action-primary text-action-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                onClick={() => setActiveTab('dados')}
              >
                <User className="w-4 h-4" /> Dados Gerais
              </button>
              <button
                type="button"
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'contrato' ? 'border-action-primary text-action-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                onClick={() => setActiveTab('contrato')}
              >
                <DollarSign className="w-4 h-4" /> Contrato & Serviço
              </button>
              <button
                type="button"
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'anexos' ? 'border-action-primary text-action-primary' : 'border-transparent text-text-secondary hover:text-text-primary'}`}
                onClick={() => setActiveTab('anexos')}
              >
                <FileText className="w-4 h-4" /> Anexos e Notas
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {activeTab === 'dados' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex items-center gap-4 bg-surface-subtle p-1 rounded-xl w-max mb-6">
                     <button type="button" onClick={() => setType('individual')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${type === 'individual' ? 'bg-surface-card shadow text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                        <User className="w-4 h-4" /> Pessoa Física
                     </button>
                     <button type="button" onClick={() => setType('business')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${type === 'business' ? 'bg-surface-card shadow text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
                        <Building2 className="w-4 h-4" /> Empresa (PJ)
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:col-span-2">
                       <label className="text-sm font-medium text-text-secondary">
                         {type === 'individual' ? 'Nome Completo' : 'Nome do Contato Principal'} *
                       </label>
                       <input 
                         required
                         value={name} onChange={e => setName(e.target.value)}
                         className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus"
                         placeholder={type === 'individual' ? 'João da Silva' : 'Nome de quem responde pela empresa...'}
                       />
                    </div>

                    {type === 'business' && (
                      <div className="space-y-1.5 md:col-span-2">
                         <label className="text-sm font-medium text-text-secondary">Razão Social / Nome da Empresa *</label>
                         <input 
                           required={type === 'business'}
                           value={companyName} onChange={e => setCompanyName(e.target.value)}
                           className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus"
                           placeholder="Nome da empresa..."
                         />
                      </div>
                    )}

                    <div className="space-y-1.5">
                       <label className="text-sm font-medium text-text-secondary">{type === 'individual' ? 'CPF' : 'CNPJ'}</label>
                       <input 
                         value={document} onChange={e => setDocument(e.target.value)}
                         className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus"
                         placeholder={type === 'individual' ? '000.000.000-00' : '00.000.000/0000-00'}
                       />
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-sm font-medium text-text-secondary">E-mail</label>
                       <input 
                         type="email"
                         value={email} onChange={e => setEmail(e.target.value)}
                         className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus"
                         placeholder="email@exemplo.com"
                       />
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-sm font-medium text-text-secondary">Telefone / WhatsApp</label>
                       <input 
                         value={phone} onChange={e => setPhone(e.target.value)}
                         className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus"
                         placeholder="(11) 90000-0000"
                       />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'contrato' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-text-secondary">Situação do Cliente</label>
                         <select 
                           value={status} onChange={e => setStatus(e.target.value as ClientStatus)}
                           className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus appearance-none"
                         >
                           <option value="active">🟢 Ativo</option>
                           <option value="late">🟡 Pagamento em Atraso</option>
                           <option value="defaulting">🔴 Inadimplente</option>
                           <option value="suspended">⚪ Suspenso</option>
                           <option value="inactive">⚪ Inativo</option>
                           <option value="closed">⚫ Encerrado</option>
                         </select>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-text-secondary">Valor do Serviço / Contrato (R$)</label>
                         <input 
                           type="number" step="0.01"
                           value={serviceValue} onChange={e => setServiceValue(e.target.value)}
                           className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus"
                           placeholder="Ex: 1500.00"
                         />
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-text-secondary">Ciclo de Cobrança</label>
                         <select 
                           value={billingCycle} onChange={e => setBillingCycle(e.target.value as BillingCycle)}
                           className="w-full bg-surface-elevated border border-border-default rounded-xl px-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus appearance-none"
                         >
                           <option value="monthly">Mensal (Recorrente)</option>
                           <option value="yearly">Anual</option>
                           <option value="one-time">Pagamento Único</option>
                           <option value="custom">Personalizado (Avulso)</option>
                         </select>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-text-secondary">Data de Adesão</label>
                         <div className="relative">
                           <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                           <input 
                             type="date"
                             value={joinDate} onChange={e => setJoinDate(e.target.value)}
                             className="w-full bg-surface-elevated border border-border-default rounded-xl pl-10 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus"
                           />
                         </div>
                      </div>

                      <div className="space-y-1.5">
                         <label className="text-sm font-medium text-text-secondary">Próximo Pagamento</label>
                         <div className="relative">
                           <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary pointer-events-none" />
                           <input 
                             type="date"
                             value={nextPaymentDate} onChange={e => setNextPaymentDate(e.target.value)}
                             className="w-full bg-surface-elevated border border-border-default rounded-xl pl-10 pr-4 py-2.5 text-text-primary focus:outline-none focus:border-border-focus"
                           />
                         </div>
                      </div>
                    </div>
                 </div>
              )}

              {activeTab === 'anexos' && (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-1.5 flex-1">
                       <label className="text-sm font-medium text-text-secondary">Anotações Gerais</label>
                       <textarea 
                         value={notes} onChange={e => setNotes(e.target.value)}
                         className="w-full h-32 bg-surface-elevated border border-border-default rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-border-focus resize-none"
                         placeholder="Escreva informações importantes sobre este cliente, detalhes do contrato ou necessidades especiais..."
                       />
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border-default">
                       <label className="text-sm font-medium text-text-secondary block">Documentos Anexos</label>
                       
                       {/* Placeholder for real upload since storage is setup, could use normal input type=file here */}
                       <div className="border-2 border-dashed border-border-default hover:border-action-primary transition-colors rounded-xl p-6 text-center bg-surface-elevated cursor-pointer group">
                          <UploadCloud className="w-8 h-8 text-text-secondary group-hover:text-action-primary mx-auto mb-2 transition-colors" />
                          <p className="text-sm font-medium text-text-primary">Clique ou arraste documentos</p>
                          <p className="text-xs text-text-secondary mt-1">PDFs, Imagens (Máx 5MB)</p>
                       </div>

                       {/* List of uploaded docs (mock) */}
                       {documents.length > 0 && (
                         <div className="space-y-2 mt-4">
                           {documents.map((doc, i) => (
                              <div key={i} className="flex justify-between items-center bg-surface-card border border-border-default p-3 rounded-lg">
                                 <div className="flex items-center gap-3 overflow-hidden">
                                   <div className="p-2 bg-action-primary/10 text-action-primary rounded-lg">
                                     <File className="w-4 h-4" />
                                   </div>
                                   <div className="truncate shrink">
                                     <p className="text-sm font-medium text-text-primary truncate">{doc.name}</p>
                                     <p className="text-[10px] text-text-secondary">{doc.size > 1000 ? `${(doc.size/1024).toFixed(1)}MB` : `${doc.size}KB`} • Enviado em {format(new Date(doc.uploaded_at), 'dd/MM/yyyy')}</p>
                                   </div>
                                 </div>
                                 <button type="button" className="p-2 text-text-secondary hover:text-status-error bg-surface-subtle hover:bg-status-error/10 rounded-lg transition-colors ml-2">
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           ))}
                         </div>
                       )}
                    </div>
                 </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border-default bg-surface-section flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="border-border-default text-text-primary bg-transparent hover:bg-surface-elevated">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
              </Button>
            </div>
          </form>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
