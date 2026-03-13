'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  ListTodo, 
  CalendarClock, 
  BarChart, 
  LogOut,
  Menu,
  X,
  Wallet,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navCategories = [
  {
    title: 'Principal',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Desempenho', href: '/performance', icon: BarChart },
    ]
  },
  {
    title: 'Gestão',
    items: [
      { name: 'Organização', href: '/organization', icon: ListTodo },
      { name: 'Rotina', href: '/routine', icon: CalendarClock },
      { name: 'Financeiro', href: '/financial', icon: Wallet },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { name: 'Configurações', href: '/settings', icon: Settings },
    ]
  }
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [profileName, setProfileName] = React.useState<string>('Usuário')
  
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setProfileName(user.user_metadata.full_name)
      } else if (user?.email) {
        setProfileName(user.email.split('@')[0])
      }
    })
  }, [supabase.auth])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const SidebarContent = () => (
    <>
      <div className="p-6 pb-2 flex flex-col gap-1">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-8 h-8 rounded-xl bg-action-primary flex items-center justify-center text-text-on-brand shadow-lg shadow-action-primary/20">
            <div className="w-3 h-3 border-2 border-current rounded-[3px] rotate-45 hover:rotate-90 transition-transform duration-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-lg text-text-primary leading-tight">
              Organize.ia
            </span>
            <span className="text-[10px] text-text-secondary font-medium">Foco & Produtividade</span>
          </div>
        </Link>
        
        {/* Mobile close button */}
        <button 
          className="md:hidden p-2 text-text-secondary hover:text-text-primary absolute right-4 top-4"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navCategories.map((category) => (
          <div key={category.title}>
            <p className="px-2 text-[10px] font-bold tracking-wider text-text-secondary uppercase mb-2">
              {category.title}
            </p>
            <nav className="space-y-1">
              {category.items.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium",
                      isActive 
                        ? "bg-action-primary text-text-on-brand shadow-lg shadow-action-primary/20" 
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-text-on-brand" : "text-text-secondary group-hover:text-text-primary")} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-border-default bg-surface-card">
        <div className="flex items-center justify-between group">
          <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 flex-1 px-2 py-2 rounded-lg hover:bg-surface-subtle transition-colors">
            <div className="w-9 h-9 rounded-full bg-action-primary/20 flex items-center justify-center text-action-primary font-bold shadow-inner">
               {profileName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
               <span className="text-sm font-semibold text-text-primary truncate">{profileName}</span>
               <span className="text-[10px] text-text-secondary truncate">Ver perfil</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors ml-1"
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-surface-page flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border-subtle bg-surface-section backdrop-blur-2xl z-20 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border-subtle bg-surface-section backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-action-primary/20 flex items-center justify-center text-action-primary">
            <div className="w-4 h-4 border-2 border-current rounded-full" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Organize<span className="text-action-primary">.ia</span></span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-lg bg-surface-subtle text-text-primary"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 left-0 w-3/4 max-w-sm bg-surface-section border-r border-border-default z-50 flex flex-col md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 z-0 w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
