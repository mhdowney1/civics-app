import { TopNav } from '@/components/top-nav'
import { BottomNav } from '@/components/bottom-nav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
