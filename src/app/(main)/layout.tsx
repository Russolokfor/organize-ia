import { AppShell } from '@/components/shell/AppShell'
import { TaskProvider } from '@/components/tasks/TaskProvider'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TaskProvider>
      <AppShell>{children}</AppShell>
    </TaskProvider>
  )
}
