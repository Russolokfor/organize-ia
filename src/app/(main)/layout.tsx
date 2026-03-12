import { AppShell } from '@/components/shell/AppShell'
import { TaskProvider } from '@/components/tasks/TaskProvider'
import { FinancialProvider } from '@/components/financial/FinancialProvider'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TaskProvider>
      <FinancialProvider>
        <AppShell>{children}</AppShell>
      </FinancialProvider>
    </TaskProvider>
  )
}
