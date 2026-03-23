'use client'

import * as React from 'react'
import { Plus, Users, Building2, Search, ArrowRight, Activity, CalendarDays } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CrmProvider, useCrm } from '@/components/crm/CrmProvider'
import { ClientType, Client } from '@/types/crm'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { format, parseISO, isPast, differenceInDays, addMonths, addYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { ClientModal } from '@/components/crm/ClientModal'

function PaymentCountdown({ client, onPaymentAction }: { client: Client, onPaymentAction: (client: Client, paid: boolean) => void }) {
  if (!client.next_payment_date) return null;
  
  const nextDate = parseISO(client.next_payment_date);
  const today = new Date();
  
  // Strip time for accurate day difference
  const nextDay = new Date(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diff = differenceInDays(nextDay, todayDay);
  
  let msg = '';
  let color = 'text-text-secondary';
  let showAction = false;
  
  if (diff > 0) {
    if (diff <= 7) {
      msg = `Vence em ${diff} dia${diff === 1 ? '' : 's'}`;
      color = 'text-text-primary font-medium';
    } else {
      msg = `Vence em ${diff} dias`;
    }
  } else if (diff === 0) {
    msg = 'Vence Hoje!';
    color = 'text-status-warning font-bold';
    showAction = true;
  } else {
    msg = `Vencido há ${Math.abs(diff)} dia${Math.abs(diff) === 1 ? '' : 's'}`;
    color = 'text-status-error font-bold';
    showAction = true;
  }

  return (
    <div className="mt-4 pt-3 border-t border-border-subtle" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center">
        <span className={`text-xs ${color}`}>{msg}</span>
      </div>
      {showAction && (
        <div className="mt-3 bg-surface-elevated rounded-xl p-3 border border-border-default">
          <p className="text-xs text-text-primary font-medium mb-3">O pagamento foi realizado?</p>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 bg-status-success hover:bg-status-success/90 text-white h-8 text-xs" onClick={() => onPaymentAction(client, true)}>Sim, foi pago</Button>
            <Button size="sm" variant="outline" className="flex-1 border-status-error text-status-error hover:bg-status-error/10 h-8 text-xs" onClick={() => onPaymentAction(client, false)}>Ainda não</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function CrmDashboard() {
  const { clients, loading, updateClient } = useCrm()
  const [viewMode, setViewMode] = React.useState<ClientType>('individual')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [editingClient, setEditingClient] = React.useState<Client | null>(null)

  const filteredClients = clients.filter(client => {
    const matchesView = client.type === viewMode
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      client.name.toLowerCase().includes(searchLower) ||
      (client.company_name?.toLowerCase().includes(searchLower) ?? false) ||
      (client.email?.toLowerCase().includes(searchLower) ?? false)
    
    return matchesView && matchesSearch
  })

  const formatCurrency = (val: number | null) => {
    if (val === null) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-status-success bg-status-success/10 border-status-success/20'
      case 'late': return 'text-status-warning bg-status-warning/10 border-status-warning/20'
      case 'defaulting': return 'text-status-error bg-status-error/10 border-status-error/20'
      case 'inactive': 
      case 'suspended': return 'text-text-secondary bg-surface-subtle border-border-default'
      default: return 'text-text-secondary bg-surface-subtle border-border-default'
    }
  }
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'late': return 'Em Atraso'
      case 'defaulting': return 'Inadimplente'
      case 'inactive': return 'Inativo'
      case 'suspended': return 'Suspenso'
      case 'closed': return 'Encerrado'
      default: return status
    }
  }

  const kpiData = {
    totalActive: clients.filter(c => c.status === 'active').length,
    totalLate: clients.filter(c => c.status === 'late' || c.status === 'defaulting').length,
    monthlyRevenue: clients.filter(c => c.status === 'active' && c.billing_cycle === 'monthly').reduce((acc, c) => acc + (c.service_value || 0), 0)
  }

  const handlePaymentAction = async (client: Client, paid: boolean) => {
    if (paid) {
      let newDateStr = client.next_payment_date;
      if (client.next_payment_date) {
        const currentNext = parseISO(client.next_payment_date);
        let updatedDate = currentNext;
        if (client.billing_cycle === 'monthly') {
          updatedDate = addMonths(currentNext, 1);
        } else if (client.billing_cycle === 'yearly') {
          updatedDate = addYears(currentNext, 1);
        }
        newDateStr = format(updatedDate, 'yyyy-MM-dd');
      }

      await updateClient(client.id, {
        status: 'active',
        next_payment_date: newDateStr
      });
    } else {
      await updateClient(client.id, {
        status: 'defaulting'
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Gestão de Clientes</h1>
          <p className="text-text-secondary mt-1">Acompanhe seus contratos, retenção e pagamentos.</p>
        </div>
        
        <Button onClick={() => { setEditingClient(null); setIsModalOpen(true) }} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-surface-card border-border-default shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
             <div className="p-3 bg-action-primary/10 text-action-primary rounded-xl">
               <Users className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Clientes Ativos</p>
               <p className="text-2xl font-bold text-text-primary">{loading ? '-' : kpiData.totalActive}</p>
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-surface-card border-border-default shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
             <div className="p-3 bg-status-error/10 text-status-error rounded-xl">
               <Activity className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Inadimplências</p>
               <p className="text-2xl font-bold text-text-primary">{loading ? '-' : kpiData.totalLate}</p>
             </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-card border-border-default shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
             <div className="p-3 bg-status-success/10 text-status-success rounded-xl">
               <CalendarDays className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Receita Mensal</p>
               <p className="text-2xl font-bold text-text-primary">{loading ? '-' : formatCurrency(kpiData.monthlyRevenue)}</p>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-card p-2 rounded-2xl border border-border-default">
        <div className="flex bg-surface-elevated p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setViewMode('individual')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'individual' ? 'bg-surface-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Users className="w-4 h-4" /> Pessoas Físicas
          </button>
          <button
            onClick={() => setViewMode('business')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'business' ? 'bg-surface-card text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Building2 className="w-4 h-4" /> Empresas
          </button>
        </div>

        <div className="relative w-full md:w-64 px-2 md:px-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input 
            type="text"
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-elevated border border-border-default rounded-xl text-sm focus:outline-none focus:border-border-focus transition-colors text-text-primary placeholder:text-text-secondary"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-40 bg-surface-subtle animate-pulse rounded-2xl" />)
        ) : filteredClients.length === 0 ? (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 py-16 text-center bg-surface-card border border-border-default rounded-2xl border-dashed">
             <div className="w-16 h-16 mx-auto bg-surface-subtle rounded-full flex items-center justify-center mb-4">
                {viewMode === 'individual' ? <Users className="w-8 h-8 text-text-secondary" /> : <Building2 className="w-8 h-8 text-text-secondary" />}
             </div>
             <h3 className="text-lg font-medium text-text-primary">Nenhum cliente encontrado</h3>
             <p className="text-text-secondary mt-1">Adicione seu primeiro cliente ou refine a busca.</p>
          </div>
        ) : (
          filteredClients.map(client => (
            <motion.div 
               layout 
               initial={{ opacity: 0, y: 20 }} 
               animate={{ opacity: 1, y: 0 }}
               key={client.id}
               onClick={() => { setEditingClient(client); setIsModalOpen(true) }}
            >
              <Card className="group cursor-pointer hover:border-border-focus transition-all duration-300 h-full bg-surface-card shadow-sm hover:shadow-md">
                <CardContent className="p-5 space-y-4">
                   <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-action-primary/10 flex items-center justify-center font-bold text-action-primary shrink-0">
                         {viewMode === 'business' && client.company_name ? client.company_name.charAt(0) : client.name.charAt(0)}
                       </div>
                       <div className="overflow-hidden">
                         <h3 className="font-semibold text-text-primary truncate" title={client.company_name || client.name}>
                           {viewMode === 'business' ? (client.company_name || client.name) : client.name}
                         </h3>
                         <p className="text-xs text-text-secondary truncate">{client.email || 'Sem email'}</p>
                       </div>
                     </div>
                     <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${getStatusColor(client.status)}`}>
                        {getStatusLabel(client.status)}
                     </span>
                   </div>

                   <div className="grid grid-cols-2 gap-2 text-sm border-t border-border-subtle pt-3 mt-3">
                     <div>
                       <p className="text-xs text-text-secondary">Valor do Plano</p>
                       <p className="font-medium text-text-primary">{formatCurrency(client.service_value)}</p>
                     </div>
                     <div>
                       <p className="text-xs text-text-secondary">Próx. Pagamento</p>
                       <p className={`font-medium ${client.next_payment_date && isPast(parseISO(client.next_payment_date)) ? 'text-status-error' : 'text-text-primary'}`}>
                         {client.next_payment_date ? format(parseISO(client.next_payment_date), 'dd MMM yyyy', { locale: ptBR }) : '-'}
                       </p>
                     </div>
                   </div>

                   <PaymentCountdown client={client} onPaymentAction={handlePaymentAction} />

                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <ClientModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        client={editingClient}
      />
    </div>
  )
}

export default function CrmPage() {
  return (
    <CrmProvider>
      <CrmDashboard />
    </CrmProvider>
  )
}
