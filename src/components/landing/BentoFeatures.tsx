import React from 'react'
import { BrainCircuit, Briefcase, Calculator, LineChart } from 'lucide-react'

export function BentoFeatures() {
  return (
    <section id="funcionalidades" className="py-24 relative overflow-hidden">
      <div className="container px-6 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
            Gestão inteligente, não <br/>apenas uma ferramenta.
          </h2>
          <p className="text-lg text-text-secondary">
            O Organize.ia consolida tudo o que você precisa para gerenciar seus negócios através de rotinas e listas guiadas pela nossa IA para eliminar trabalho manual.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* Card 1: AI (Span 2 columns on desktop) */}
          <div className="md:col-span-2 bg-surface/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:bg-surface/60 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all" />
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 mb-8 relative z-10">
              <BrainCircuit className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Inteligência Artificial Nativa</h3>
            <p className="text-text-secondary text-lg max-w-md relative z-10">
              Transforme texto comum e anotações em tarefas estruturadas, prazos e categorias perfeitamente organizadas através da nossa IA generativa.
            </p>
          </div>

          {/* Card 2: CRM */}
          <div className="bg-surface/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:bg-surface/60 transition-colors relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mb-8">
              <Briefcase className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">CRM Dinâmico</h3>
            <p className="text-text-secondary">
              Gestão de clientes inteligente. Organize clientes PF e PJ, anexe contratos e acompanhe todos os status visualmente.
            </p>
          </div>

          {/* Card 3: Routine & Focus */}
          <div className="bg-surface/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:bg-surface/60 transition-colors relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30 mb-8 relative z-10">
              <LineChart className="w-7 h-7 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Dashboard de Performance Semanal</h3>
            <p className="text-text-secondary text-lg max-w-lg relative z-10">
              Mais do que listas. Visualize sua consistência diária, descubra o seu "Foco de Hoje" guiado pela IA, e pare de procrastinar com análises de pendências críticas.
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
