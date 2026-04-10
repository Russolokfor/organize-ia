'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

export function HeroSection() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      <div className="container px-6 mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Copy */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col items-start gap-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-primary">
              <Sparkles className="w-4 h-4" />
              <span>O Futuro da Gestão Integrada</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-white">
              A inteligência por trás da sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">execução diária.</span>
            </h1>
            
            <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
              Potencialize seu CRM, otimize seus acompanhamentos e organize sua rotina com o poder da Inteligência Artificial em um só ecossistema desenhado para alta performance.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto">
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full sm:w-auto h-14 px-8 text-base bg-primary hover:bg-primary-hover text-white shadow-xl shadow-primary/25 border-none"
              >
                Acessar Plataforma <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                onClick={() => document.getElementById('solucoes')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline" 
                className="w-full sm:w-auto h-14 px-8 text-base border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                Ver Funcionalidades
              </Button>
            </div>

            <div className="flex items-center gap-6 mt-8 text-sm text-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Sem cartão de crédito
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Setup instantâneo
              </div>
            </div>
          </motion.div>

          {/* Right Column: Visualization Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative lg:h-[600px] flex items-center justify-center lg:justify-end"
          >
            {/* Main Mockup Card floating */}
            <div className="relative w-full max-w-[500px] aspect-[4/5] sm:aspect-square bg-card/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-6 flex flex-col transform lg:rotate-2 lg:hover:rotate-0 transition-transform duration-500">
              
              <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-text-secondary">Tarefas Concluídas</div>
                  <div className="text-3xl font-bold text-white">128 Completas</div>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Fake Graph */}
              <div className="flex-1 flex items-end gap-2 mb-6 opacity-80">
                {[40, 70, 45, 90, 65, 100, 80].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                    className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-primary' : 'bg-surface'}`}
                  />
                ))}
              </div>

              {/* Fake Tasks list */}
              <div className="space-y-3">
                <div className="h-12 w-full bg-surface/50 rounded-lg border border-white/5 flex items-center px-4 gap-3">
                  <div className="w-4 h-4 rounded border border-primary/50 text-primary flex items-center justify-center bg-primary/10">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                  <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                </div>
                <div className="h-12 w-full bg-surface/50 rounded-lg border border-white/5 flex items-center px-4 gap-3">
                  <div className="w-4 h-4 rounded border border-white/20" />
                  <div className="h-2 w-2/3 bg-white/20 rounded-full" />
                </div>
              </div>

              {/* Absolute glowing badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-6 top-1/3 bg-card border border-white/10 shadow-xl rounded-2xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs text-text-secondary">IA Entendeu</div>
                  <div className="text-sm font-semibold text-white">12 Tarefas Nova</div>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
