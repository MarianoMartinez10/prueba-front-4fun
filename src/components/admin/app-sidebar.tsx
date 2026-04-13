"use client";

/**
 * Capa de Administración: Navegación Estructural (App Sidebar)
 * --------------------------------------------------------------------------
 * Orquesta el acceso a los módulos críticos del panel administrativo.
 * Implementa una arquitectura colapsable (Sidebar Rail) para optimizar el 
 * espacio de trabajo y proporciona trazabilidad visual del estado de 
 * sesión del operador. (MVC / View-Admin)
 */

import {
    LayoutDashboard,
    Package,
    Image as ImageIcon,
    ShoppingCart,
    LogOut,
    User
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

/**
 * RN - Estructura de Navegación: Mapeo de módulos de gestión.
 */
const items = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Productos",
        url: "/admin/products",
        icon: Package,
    },
    {
        title: "Visuales",
        url: "/admin/visuals",
        icon: ImageIcon,
    },
    {
        title: "Ordenes",
        url: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        title: "Usuarios",
        url: "/admin/users",
        icon: User,
    },
];

export function AppSidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" className="!top-16 md:!top-20 !h-[calc(100svh-4rem)] md:!h-[calc(100svh-5rem)] z-40 border-r border-white/5 bg-card/95 backdrop-blur-xl">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-2">
                    <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-primary text-black font-black shadow-lg shadow-primary/20">
                        <Package className="size-5" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-headline font-bold text-white uppercase tracking-tight">4Fun Admin</span>
                        <span className="truncate text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Panel de Control</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarSeparator className="bg-white/5" />
            
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground mb-2">Gestión Operativa</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={pathname === item.url || pathname.startsWith(item.url + '/')} 
                                        className="h-11 lg:h-12 transition-all duration-200 hover:bg-primary/10 data-[active=true]:bg-primary/20 data-[active=true]:text-primary"
                                    >
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="!h-5 !w-5" />
                                            <span className="text-sm font-bold uppercase tracking-wide group-data-[collapsible=icon]:hidden">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarRail className="bg-white/5" />
            
            <SidebarFooter className="border-t border-white/5 mt-auto">
                <SidebarMenu>
                    <SidebarMenuItem>
                        {/* Layer - Identidad del Operador */}
                        <div className="flex items-center gap-3 p-3 group-data-[collapsible=icon]:hidden">
                            <Avatar className="h-8 w-8 ring-1 ring-white/10">
                                {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{user?.name?.[0] || "A"}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                                <span className="truncate font-bold text-white">{user?.name}</span>
                                <span className="truncate text-[9px] text-muted-foreground uppercase opacity-70 italic">{user?.role}</span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => logout()} 
                                title="Finalizar Sesión Operativa"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Estado Colapsado: Fallback visual */}
                        <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center py-4">
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => logout()} 
                                title="Cerrar Sesión"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
