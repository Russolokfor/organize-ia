'use client'

import React from 'react'
import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { BentoFeatures } from '@/components/landing/BentoFeatures'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Hexagon } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-white">
      <Navbar />
      
      <main>
        <HeroSection />
        <BentoFeatures />

        {/* Final CTA Strip */}
        <section className="py-24 relative overflow-hidden border-t border-white/5 bg-surface/30">
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 rounded-[100%] blur-[100px] pointer-events-none" />
          
          <div className="container px-6 mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
              Pronto para colocar sua <br />gestão no azul?
            </h2>
            <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
              Crie sua conta gratuitamente e experimente o futuro da gestão assistida por IA. Pare de reagir e comece a executar.
            </p>
            <Button 
              onClick={() => router.push('/login')}
              className="h-16 px-10 text-lg bg-primary hover:bg-primary-hover text-white shadow-2xl shadow-primary/30 border-none"
            >
              Criar Conta Gratuita Exclusiva
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 bg-background">
        <div className="container px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-white/50">
            <Hexagon className="w-5 h-5" />
            <span>Organize.ia &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
