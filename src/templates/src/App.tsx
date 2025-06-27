import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Outlet } from 'react-router-dom'
import { Toaster } from './components/ui/sonner'
import { ThemeProvider } from './components/theme-provider'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <MainOutlet />
      </SidebarProvider>
      <div>
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
      <Toaster richColors visibleToasts={2} position="top-center" closeButton />
    </ThemeProvider>
  )
}

export default App

function MainOutlet() {
  const { state, isMobile } = useSidebar()
  return (
    <main
      className={`flex flex-col transition-all duration-0 ease-in-out ${state == 'expanded'
          ? 'w-[calc(100vw-var(--sidebar-width))]'
          : 'w-[calc(100vw-var(--sidebar-width-icon))]'
        } ${isMobile && 'w-screen'}`}
    >
      <Outlet />
    </main>
  )
}
