'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LogIn, UserPlus } from 'lucide-react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        // Optionally show message to check email
        setError('Check seu email para o link de confirmação.')
      }
    } catch (error: any) {
      setError(error.message || 'Ocorreu um erro na autenticação')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      setError('Falha ao receber o token do Google.')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credentialResponse.credential,
      })
      
      if (error) throw error
      
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Erro ao processar login com Google no servidor')
      setLoading(false)
    }
  }

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 p-8 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.9 }} 
            animate={{ scale: 1 }} 
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4"
          >
            <div className="w-6 h-6 border-2 border-current rounded-full" />
          </motion.div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Organize<span className="text-primary">.ia</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            A inteligência por trás da sua execução diária.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm text-center border border-danger/20">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4 mb-6">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground ml-1">
              Email
            </label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground ml-1">
              Senha
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="animate-pulse">Aguarde...</span>
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4 mr-2" /> Entrar
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" /> Criar conta
              </>
            )}
          </Button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Ou</span>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              setError('O login com Google falhou ou foi cancelado.')
            }}
            useOneTap
            shape="rectangular"
            theme="filled_black"
            text="continue_with"
            size="large"
          />
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline hover:text-primary-hover font-medium transition-colors"
          >
            {isLogin ? 'Criar agora' : 'Entrar'}
          </button>
        </p>
      </motion.div>
    </div>
    </GoogleOAuthProvider>
  )
}
