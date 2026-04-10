'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Hexagon } from 'lucide-react'

export function Navbar() {
  const router = useRouter()

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-background/70 backdrop-blur-md border-b border-white/5"
    >
      <div className="flex items-center gap-2 cursor-pointer font-bold text-xl tracking-tight" onClick={() => router.push('/')}>
        <Hexagon className="w-6 h-6 text-primary fill-primary/20" />
        <span>Organize<span className="text-primary">.ia</span></span>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
        <a href="#solucoes" className="hover:text-text-primary transition-colors">Soluções</a>
        <a href="#funcionalidades" className="hover:text-text-primary transition-colors">Funcionalidades</a>
        <a href="#depoimentos" className="hover:text-text-primary transition-colors">Comunidade</a>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" className="hidden sm:flex text-text-secondary hover:text-white" onClick={() => router.push('/login')}>
          Entrar
        </Button>
        <Button onClick={() => router.push('/login')} className="bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 border-none">
          Começar Grátis
        </Button>
      </div>
    </motion.nav>
  )
}
