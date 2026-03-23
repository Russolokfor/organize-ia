export type ClientType = 'individual' | 'business'
export type ClientStatus = 'active' | 'inactive' | 'late' | 'defaulting' | 'suspended' | 'closed'
export type BillingCycle = 'monthly' | 'yearly' | 'one-time' | 'custom'

export interface ClientDocument {
  name: string
  url: string
  size: number
  uploaded_at: string
}

export interface Client {
  id: string
  user_id: string
  type: ClientType
  name: string
  company_name: string | null
  document: string | null
  email: string | null
  phone: string | null
  status: ClientStatus
  service_value: number | null
  billing_cycle: BillingCycle | null
  next_payment_date: string | null
  join_date: string | null
  notes: string | null
  documents: ClientDocument[]
  created_at: string
  updated_at: string
}

export type ClientInsert = Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { user_id?: string }
export type ClientUpdate = Partial<ClientInsert>
