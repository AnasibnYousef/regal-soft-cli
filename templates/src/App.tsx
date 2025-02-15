import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <main className="flex flex-col w-full">
          <Outlet />
        </main>
      </SidebarProvider>
      <div>
        <ReactQueryDevtools initialIsOpen={false} />
      </div>
      <Toaster richColors position="top-right" visibleToasts={2} />
    </ThemeProvider>
  );
}

export default App;
