'use client'

import * as React from 'react'
import { Client, ClientInsert, ClientUpdate } from '@/types/crm'
import { clientService } from '@/services/clientService'

interface CrmContextType {
  clients: Client[]
  loading: boolean
  addClient: (client: ClientInsert) => Promise<void>
  updateClient: (id: string, updates: ClientUpdate) => Promise<void>
  deleteClient: (id: string) => Promise<void>
  refreshClients: () => Promise<void>
}

const CrmContext = React.createContext<CrmContextType | undefined>(undefined)

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = React.useState<Client[]>([])
  const [loading, setLoading] = React.useState(true)

  const fetchClients = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await clientService.getClients()
      setClients(data)
    } catch (error) {
      console.error('Failed to load clients', error)
      alert("Erro ao carregar clientes: " + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const addClient = async (entry: ClientInsert) => {
    try {
      const newClient = await clientService.createClient(entry)
      setClients(prev => [newClient, ...prev])
    } catch (error) {
        console.error('Adding client failed', error)
        throw error
    }
  }

  const updateClient = async (id: string, updates: ClientUpdate) => {
    try {
      const updated = await clientService.updateClient(id, updates)
      setClients(prev => prev.map(c => c.id === id ? updated : c))
    } catch (error) {
       console.error('Update client failed', error)
       throw error
    }
  }

  const deleteClient = async (id: string) => {
    try {
      await clientService.deleteClient(id)
      setClients(prev => prev.filter(c => c.id !== id))
    } catch (error) {
       console.error('Delete client failed', error)
       throw error
    }
  }

  return (
    <CrmContext.Provider value={{
      clients,
      loading,
      addClient,
      updateClient,
      deleteClient,
      refreshClients: fetchClients
    }}>
      {children}
    </CrmContext.Provider>
  )
}

export function useCrm() {
  const context = React.useContext(CrmContext)
  if (context === undefined) {
    throw new Error('useCrm must be used within a CrmProvider')
  }
  return context
}
