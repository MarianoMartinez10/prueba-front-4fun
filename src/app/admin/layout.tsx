"use client";

import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { useAdminLayoutViewModel } from "@/hooks/use-admin-layout-view-model";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { loading, isAuthorized } = useAdminLayoutViewModel();

  // Pantalla de carga profesional con el color primario de 4Fun
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si no está autorizado, no mostramos nada mientras el router hace su trabajo
  if (!isAuthorized) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/5 bg-card/60 backdrop-blur-xl px-4 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-white/10" />
        </header>
        
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 xl:p-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}