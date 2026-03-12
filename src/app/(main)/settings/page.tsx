'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'
import { Camera, Save, Lock, Bell, User } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [activeTab, setActiveTab] = React.useState<'profile' | 'security' | 'notifications'>('profile')
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Profile State
  const [fullName, setFullName] = React.useState('')
  const [email, setEmail] = React.useState('')

  // Password State
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  React.useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setFullName(user.user_metadata?.full_name || '')
        setEmail(user.email || '')
      }
    }
    loadUser()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      })

      if (error) throw error
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' })
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ] as const

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto pb-12"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Gerencie suas informações pessoais e preferências.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Tabs sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setMessage(null)
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1">
          {message && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-none">
              <CardHeader>
                <CardTitle>Perfil Público</CardTitle>
                <CardDescription>
                  Essas informações são visíveis apenas para você, mas são usadas nas saudações do aplicativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full bg-primary/20 flex flex-col items-center justify-center text-primary text-3xl font-bold shadow-inner overflow-hidden">
                         {fullName ? fullName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute inset-0 bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Camera className="w-6 h-6 text-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Foto de Perfil</p>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">A foto provém do seu provedor (ex: Google) ou é gerada aqui.</p>
                      <Button variant="outline" size="sm" className="mt-3 text-xs" type="button" disabled>
                        Alterar Avatar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Nome de Exibição</label>
                      <Input 
                        id="name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Como devemos lhe chamar?" 
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email (Login)</label>
                      <Input 
                        id="email" 
                        value={email}
                        disabled
                        className="bg-muted/50 cursor-not-allowed text-muted-foreground"
                      />
                      <p className="text-[10px] text-muted-foreground">O email não pode ser alterado por aqui no momento.</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                     <Button type="submit" disabled={loading} className="gap-2 font-semibold">
                       <Save className="w-4 h-4" />
                       {loading ? 'Salvando...' : 'Salvar Alterações'}
                     </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-none">
              <CardHeader>
                <CardTitle>Segurança da Conta</CardTitle>
                <CardDescription>
                  Garanta que sua conta está usando uma senha forte. Logins Sociais não exigem senha.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="new_pass" className="text-sm font-medium">Nova Senha</label>
                    <Input 
                      id="new_pass" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres" 
                      className="bg-background"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm_pass" className="text-sm font-medium">Confirme a Nova Senha</label>
                    <Input 
                      id="confirm_pass" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha" 
                      className="bg-background"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                     <Button type="submit" disabled={loading} className="gap-2 font-semibold">
                       <Lock className="w-4 h-4" />
                       {loading ? 'Atualizando...' : 'Atualizar Senha'}
                     </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-card/40 backdrop-blur-sm border-border/50 shadow-none">
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Decida como você quer que o Organize.ia se comunique com você.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Lembretes Diários</h4>
                    <p className="text-xs text-muted-foreground mt-1">Seja notificado sobre suas tarefas de hoje (rotina).</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer opacity-50 (not-implemented flex-shrink-0">
                     <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Alertas Financeiros</h4>
                    <p className="text-xs text-muted-foreground mt-1">Avisar quando uma conta estiver próxima do vencimento.</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer opacity-50 flex-shrink-0">
                     <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Resumo Semanal</h4>
                    <p className="text-xs text-muted-foreground mt-1">E-mail de fechamento da sua produtividade de 7 dias.</p>
                  </div>
                  <div className="w-12 h-6 bg-muted border border-border rounded-full relative flex-shrink-0">
                     <div className="w-4 h-4 bg-muted-foreground rounded-full absolute left-1 top-1" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground pt-4 mt-6 border-t border-border/50">
                  As notificações (Push/Email) ainda não estão habilitadas no provedor atual do projeto. Módulos de interface visual apenas.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}
