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

  // Notifications State
  const [notificationPermission, setNotificationPermission] = React.useState<string>('default')
  const [dailyTime, setDailyTime] = React.useState('08:00')

  React.useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
    const savedTime = localStorage.getItem('organize_daily_reminder_time')
    if (savedTime) setDailyTime(savedTime)
  }, [])

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

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      setMessage({ type: 'error', text: 'Seu navegador não suporta notificações.' })
      return
    }
    
    try {
      const perm = await Notification.requestPermission()
      setNotificationPermission(perm)
      
      if (perm === 'granted') {
        localStorage.setItem('organize_daily_reminder_time', dailyTime)
        setMessage({ type: 'success', text: `Notificações ativadas! Lembretes agendados para as ${dailyTime}.` })
        
        // Simulador de notificação para teste imediato (3 segundos depois)
        setTimeout(() => {
           if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                title: 'Organize.ia',
                body: `Seu lembrete diário das ${dailyTime} foi configurado!`
              })
           } else {
             new Notification('Organize.ia', { body: `Lembrete configurado para as ${dailyTime}` })
           }
        }, 3000)
      } else {
        setMessage({ type: 'error', text: 'Permissão para notificações foi negada.' })
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message })
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
        <h1 className="text-3xl font-bold tracking-tight text-text-primary">Configurações</h1>
        <p className="text-text-secondary mt-1 text-sm md:text-base">
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
                  ? 'bg-action-primary/10 text-action-primary' 
                  : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
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
            <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-status-success/10 text-status-success border border-status-success/20' : 'bg-status-error/10 text-status-error border border-status-error/20'}`}>
              {message.text}
            </div>
          )}

          {activeTab === 'profile' && (
            <Card className="bg-surface-card backdrop-blur-sm border-border-default shadow-none">
              <CardHeader>
                <CardTitle className="text-text-primary">Perfil Público</CardTitle>
                <CardDescription className="text-text-secondary">
                  Essas informações são visíveis apenas para você, mas são usadas nas saudações do aplicativo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group cursor-pointer">
                      <div className="w-24 h-24 rounded-full bg-action-primary/20 flex flex-col items-center justify-center text-action-primary text-3xl font-bold shadow-inner overflow-hidden">
                         {fullName ? fullName.charAt(0).toUpperCase() : email.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute inset-0 bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Camera className="w-6 h-6 text-text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text-primary">Foto de Perfil</p>
                      <p className="text-xs text-text-secondary mt-1 max-w-[200px]">A foto provém do seu provedor (ex: Google) ou é gerada aqui.</p>
                      <Button variant="outline" size="sm" className="mt-3 text-xs border-border-default text-text-primary" type="button" disabled>
                        Alterar Avatar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-text-primary">Nome de Exibição</label>
                      <Input 
                        id="name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Como devemos lhe chamar?" 
                        className="bg-surface-elevated text-text-primary border-border-default"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-text-primary">Email (Login)</label>
                      <Input 
                        id="email" 
                        value={email}
                        disabled
                        className="bg-surface-subtle cursor-not-allowed text-text-secondary border-border-default"
                      />
                      <p className="text-[10px] text-text-secondary">O email não pode ser alterado por aqui no momento.</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                     <Button type="submit" disabled={loading} className="gap-2 font-semibold bg-action-primary text-text-on-brand hover:bg-action-primary-hover">
                       <Save className="w-4 h-4" />
                       {loading ? 'Salvando...' : 'Salvar Alterações'}
                     </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-surface-card backdrop-blur-sm border-border-default shadow-none">
              <CardHeader>
                <CardTitle className="text-text-primary">Segurança da Conta</CardTitle>
                <CardDescription className="text-text-secondary">
                  Garanta que sua conta está usando uma senha forte. Logins Sociais não exigem senha.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="new_pass" className="text-sm font-medium text-text-primary">Nova Senha</label>
                    <Input 
                      id="new_pass" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres" 
                      className="bg-surface-elevated text-text-primary border-border-default"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirm_pass" className="text-sm font-medium text-text-primary">Confirme a Nova Senha</label>
                    <Input 
                      id="confirm_pass" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha" 
                      className="bg-surface-elevated text-text-primary border-border-default"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                     <Button type="submit" disabled={loading} className="gap-2 font-semibold bg-action-primary text-text-on-brand hover:bg-action-primary-hover">
                       <Lock className="w-4 h-4" />
                       {loading ? 'Atualizando...' : 'Atualizar Senha'}
                     </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-surface-card backdrop-blur-sm border-border-default shadow-none">
              <CardHeader>
                <CardTitle className="text-text-primary">Preferências de Notificação</CardTitle>
                <CardDescription className="text-text-secondary">
                  Decida como você quer que o Organize.ia se comunique com você.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">Lembretes Diários (Rotina)</h4>
                    <p className="text-xs text-text-secondary mt-1">Seja notificado no celular sobre suas tarefas focadas.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input 
                       type="time" 
                       value={dailyTime} 
                       onChange={(e) => setDailyTime(e.target.value)}
                       className="w-24 h-9 text-xs bg-surface-elevated text-text-primary color-scheme-dark border-border-default"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleRequestNotification} 
                      variant={notificationPermission === 'granted' ? 'default' : 'outline'}
                      className={notificationPermission === 'granted' ? 'bg-success hover:bg-success/90 text-white' : ''}
                    >
                      {notificationPermission === 'granted' ? 'Ativado' : 'Habilitar Local'}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">Alertas Financeiros</h4>
                    <p className="text-xs text-text-secondary mt-1">Avisar quando uma conta estiver próxima do vencimento.</p>
                  </div>
                  <div className="w-12 h-6 bg-action-primary rounded-full relative cursor-pointer opacity-50 flex-shrink-0">
                     <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">Resumo Semanal</h4>
                    <p className="text-xs text-text-secondary mt-1">E-mail de fechamento da sua produtividade de 7 dias.</p>
                  </div>
                  <div className="w-12 h-6 bg-surface-elevated border border-border-default rounded-full relative flex-shrink-0">
                     <div className="w-4 h-4 bg-text-secondary rounded-full absolute left-1 top-1" />
                  </div>
                </div>
                <p className="text-[10px] text-text-secondary pt-4 mt-6 border-t border-border-default">
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
