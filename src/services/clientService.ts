import { createClient } from '@/lib/supabase'
import { Client, ClientInsert, ClientUpdate } from '@/types/crm'

const supabase = createClient()

export const clientService = {
  async getClients(): Promise<Client[]> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Não autenticado')

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Client[]
  },

  async createClient(client: ClientInsert): Promise<Client> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Não autenticado')

    const { data, error } = await supabase
      .from('clients')
      .insert({ ...client, user_id: session.user.id })
      .select()
      .single()

    if (error) throw error
    return data as Client
  },

  async updateClient(id: string, updates: ClientUpdate): Promise<Client> {
    const { data, error } = await supabase
      .from('clients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Client
  },

  async deleteClient(id: string): Promise<void> {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async uploadClientDocument(file: File): Promise<{ url: string; path: string }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Não autenticado')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${session.user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('crm_documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('crm_documents')
      .getPublicUrl(filePath)

    return {
      url: data.publicUrl,
      path: filePath
    }
  },
  
  async deleteClientDocument(path: string): Promise<void> {
    const { error } = await supabase.storage
      .from('crm_documents')
      .remove([path])
      
    if (error) throw error
  }
}
