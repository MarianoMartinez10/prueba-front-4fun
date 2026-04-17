"use client";

/**
 * Capa de Presentación: Central de Gestión de Identidad (Account Page)
 * --------------------------------------------------------------------------
 * Orquesta la visualización de órdenes, edición de perfil y configuración
 * de seguridad. Consumidor puro del ViewModel `useAccountViewModel`.
 * (MVC / View)
 */

import { useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Key,
  Package,
  Calendar,
  Camera,
  User as UserIcon,
  Mail,
  Shield,
  Lock,
  Settings,
  Trash2,
  ShieldCheck,
  CreditCard,
  BadgeCheck,
  XCircle,
  Store,
  BarChart3,
  TrendingUp,
  Rocket,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAccountViewModel } from "@/hooks/use-account-view-model";
import type { Order } from "@/lib/types";

export default function AccountPage() {
  const vm = useAccountViewModel();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Renderizado mientras carga auth
  if (vm.isLoading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          Cargando tu cuenta...
        </p>
      </div>
    );
  }

  if (!vm.user) return null;

  // Helpers
  const initials = (vm.user.name || "U").substring(0, 2).toUpperCase();
  const memberSince = vm.user.createdAt
    ? new Date(vm.user.createdAt).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
      })
    : "Evaluación TFI";

  // Handlers con toast
  const handleSaveProfile = async () => {
    try {
      await vm.saveProfile();
      toast({
        title: "Perfil Guardado",
        description: "Tu información se guardó correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error de Guardado",
        description: error.message || "Algo salió mal, probá de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await vm.handleAvatarUpload(file);
      toast({
        title: "Foto Actualizada",
        description: "Tu foto de perfil se cambió correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error en Carga",
        description: error.message || "Fallo en la nube de activos.",
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await vm.handleRemoveAvatar();
      toast({
        title: "Avatar Removido",
        description: "Se ha purgado el activo multimedia del perfil.",
      });
    } catch (error: any) {
      toast({
        title: "Fallo en Operación",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async () => {
    try {
      const message = await vm.changePassword();
      toast({
        title: "Seguridad Reforzada",
        description: message,
      });
    } catch (error: any) {
      toast({
        title: "Fallo de Validación",
        description: error.message || "La contraseña actual es incorrecta.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl animate-in fade-in duration-1000">
      {/* Luz Ambiental de Fondo para eliminar oscuridad excesiva */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Cabecera Técnica de Cuenta */}
      <header className="mb-16 flex flex-col md:flex-row items-center gap-10 bg-white/[0.08] backdrop-blur-3xl p-12 rounded-[3rem] border border-white/10 relative overflow-hidden group hover:bg-white/[0.12] transition-colors duration-500 shadow-2xl shadow-primary/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        <div className="relative z-10">
          <div className="relative group/avatar">
            <Avatar className="h-40 w-40 border-8 border-primary/30 shadow-[0_0_40px_rgba(214,88,250,0.2)] ring-1 ring-primary/20 group-hover/avatar:ring-primary/40 group-hover/avatar:shadow-[0_0_60px_rgba(214,88,250,0.3)] transition-all duration-500">
              {vm.user.avatar ? (
                <AvatarImage src={vm.user.avatar} alt={vm.user.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={vm.uploadingAvatar}
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              {vm.uploadingAvatar ? (
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Camera className="h-8 w-8 text-white" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">
                    Actualizar Activo
                  </span>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        <div className="text-center md:text-left space-y-4 relative z-10 flex-1">
          <div className="space-y-1">
            <h1 className="text-5xl font-black font-headline text-transparent bg-clip-text bg-gradient-to-r from-white via-primary/90 to-white tracking-tighter italic leading-tight">
              {vm.user.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start font-medium opacity-60 text-lg">
              <Mail className="h-5 w-5 text-primary" /> {vm.user.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
            <Badge
              variant="outline"
              className="h-8 px-4 bg-primary/15 border-primary/30 text-primary font-black uppercase tracking-widest text-[11px] hover:bg-primary/20 hover:border-primary/40 transition-all font-headline"
            >
              <Shield className="h-4 w-4 mr-2" />
              {vm.user.role === "admin" ? "Admin" : vm.user.role === "seller" ? "Vendedor" : "Comprador"}
            </Badge>
            {vm.user.isVerified ? (
              <Badge
                variant="outline"
                className="h-8 px-4 border-green-500/30 bg-green-500/10 text-green-400 font-black uppercase tracking-widest text-[11px] hover:bg-green-500/15 hover:border-green-500/40 transition-all"
              >
                <BadgeCheck className="h-4 w-4 mr-2" /> Email Verificado
              </Badge>
            ) : (
                <Badge
                  variant="outline"
                  className="h-8 px-4 border-yellow-500/30 bg-yellow-500/10 text-yellow-500 font-black uppercase tracking-widest text-[9px] hover:bg-yellow-500/15 hover:border-yellow-500/40 transition-all font-headline"
                >
                  <XCircle className="h-3 w-3 mr-2" /> Verificación pendiente
                </Badge>
            )}
          </div>
          
          <div className="pt-4 flex items-center gap-4 justify-center md:justify-start">
            <div className="bg-white/5 px-4 py-2 rounded-xl">
              <p className="text-[12px] text-muted-foreground font-black uppercase tracking-widest opacity-40 mb-1">
                Miembro desde
              </p>
              <p className="text-sm text-white font-bold">{memberSince}</p>
            </div>

            {!vm.user.isVerified && (
              <Button 
                onClick={async () => {
                  try {
                    await vm.resendVerification();
                    toast({ 
                      title: "Email Enviado", 
                      description: "Revisá tu bandeja de entrada para verificar tu cuenta.",
                      className: "bg-primary/20 border-primary/20 text-white" 
                    });
                  } catch (error: any) {
                    toast({ title: "Error", description: error.message, variant: "destructive" });
                  }
                }}
                disabled={vm.resendingVerification}
                className="h-12 px-8 bg-white/5 text-white hover:bg-primary hover:text-black border border-white/10 hover:border-primary font-black uppercase text-[10px] tracking-[0.15em] rounded-xl shadow-xl hover:shadow-primary/20 transition-all duration-300 group"
              >
                {vm.resendingVerification ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ShieldCheck className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                )}
                Verificar el Mail
              </Button>
            )}
          </div>
        </div>
      </header>

      <Tabs defaultValue="orders" className="w-full space-y-12">
        <TabsList className="h-16 w-full max-w-2xl mx-auto bg-white/[0.05] backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-1.5 shadow-2xl flex items-center relative overflow-hidden">
          {/* Luz de fondo vibrante en todo el contenedor */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-xl pointer-events-none" />
          
          <TabsTrigger
            value="orders"
            className="relative flex-1 h-full rounded-[1.2rem] font-black uppercase tracking-[0.15em] text-[11px] text-white/40 border border-transparent hover:bg-white/5 hover:border-white/10 hover:text-white data-[state=active]:text-black data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:shadow-[0_0_30px_rgba(214,88,250,0.3)] transition-all duration-500 z-10"
          >
            <Package className="h-4 w-4 mr-2" /> Mis Órdenes
          </TabsTrigger>
          <TabsTrigger
            value="seller"
            className="relative flex-1 h-full rounded-[1.2rem] font-black uppercase tracking-[0.15em] text-[11px] text-white/40 border border-transparent hover:bg-white/5 hover:border-white/10 hover:text-white data-[state=active]:text-black data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:shadow-[0_0_30px_rgba(214,88,250,0.3)] transition-all duration-500 z-10"
          >
            <Store className="h-4 w-4 mr-2" /> Mis Ventas
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="relative flex-1 h-full rounded-[1.2rem] font-black uppercase tracking-[0.15em] text-[11px] text-white/40 border border-transparent hover:bg-white/5 hover:border-white/10 hover:text-white data-[state=active]:text-black data-[state=active]:bg-primary data-[state=active]:border-primary data-[state=active]:shadow-[0_0_30px_rgba(214,88,250,0.3)] transition-all duration-500 z-10"
          >
            <Settings className="h-4 w-4 mr-2" /> Configuración
          </TabsTrigger>
        </TabsList>

        {/* ======== AUDITORÍA TRANSACCIONAL ======== */}
        <TabsContent value="orders">
          <AnimatePresence mode="wait">
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {vm.loadingOrders ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <p className="font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Buscando tus compras...</p>
                </div>
              ) : vm.orders.length === 0 ? (
                <Card className="border-none bg-white/[0.03] backdrop-blur-3xl py-24 text-center rounded-[3rem] ring-1 ring-white/5 shadow-2xl">
                  <CardContent className="space-y-6">
                    <div className="h-20 w-20 bg-white/[0.05] rounded-full mx-auto flex items-center justify-center border border-white/5 shadow-inner">
                      <Package className="h-10 w-10 text-muted-foreground opacity-20" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tighter">
                        Sin Órdenes Todavía
                      </h3>
                      <p className="text-muted-foreground text-sm mt-2">
                        ¿Listo para tu primer juego? Explorá el catálogo completo.
                      </p>
                    </div>
                    <Button
                      asChild
                    >
                      <Link href="/productos">Explorar el Catálogo</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {vm.orders.map((order: any) => (
                    <Card
                      key={order.id || order._id}
                      className="overflow-hidden border-none bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] group hover:from-white/[0.08] hover:to-white/[0.04] transition-all duration-500 shadow-xl ring-1 ring-white/10 hover:ring-primary/30 hover:shadow-[0_10px_50px_rgba(214,88,250,0.1)]"
                    >
                      <div className="bg-primary/5 px-8 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                              Orden #
                            </span>
                            <CardTitle className="text-lg font-bold font-headline text-white">
                              {(order.id || order._id).slice(-8).toUpperCase()}
                            </CardTitle>
                          </div>
                          <Badge
                            className={cn(
                              "h-7 px-4 rounded-full font-black uppercase text-[9px] tracking-widest",
                              order.isPaid
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            )}
                            variant="outline"
                          >
                            {order.isPaid ? "Pagada" : "Pendiente"}
                          </Badge>
                        </div>
                        <div className="text-right flex flex-col items-center md:items-end">
                          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                            Total
                          </span>
                          <p className="font-black text-2xl text-white tabular-nums tracking-tighter">
                            {formatCurrency(order.totalPrice || order.total)}
                          </p>
                        </div>
                      </div>
                      <CardContent className="p-8 space-y-6">
                        <div className="space-y-4">
                          {Array.isArray(order.orderItems || order.items) &&
                            (order.orderItems || order.items).map(
                              (item: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center bg-gradient-to-r from-white/[0.04] to-white/[0.02] p-6 rounded-2xl border border-primary/5 hover:border-primary/15 hover:bg-gradient-to-r hover:from-white/[0.06] hover:to-white/[0.03] transition-all duration-300 group/item"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center">
                                      <CreditCard className="h-5 w-5 text-primary opacity-60" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-white text-sm">{item.name}</p>
                                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                        Unidades: {item.quantity}
                                      </p>
                                    </div>
                                  </div>

                                  {order.isPaid && Array.isArray(order.digitalKeys) && (
                                    <div className="flex flex-col items-end gap-2">
                                      {order.digitalKeys
                                        .filter(
                                          (k: any) =>
                                            k.productoId === item.product ||
                                            k.productoId === (item.product as any)?._id ||
                                            k.productoId === item.productId
                                        )
                                        .map((k: any, kIdx: number) => (
                                          <div
                                            key={kIdx}
                                            className="flex items-center gap-3 bg-green-500/10 text-green-400 px-4 py-2 rounded-xl text-xs font-mono border border-green-500/30 animate-in slide-in-from-right-2 hover:bg-green-500/15 hover:border-green-500/50 hover:scale-105 transition-all duration-300 cursor-pointer"
                                          >
                                            <Key className="h-4 w-4 animate-pulse" />
                                            {k.clave}
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 opacity-40">
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                            <Calendar className="h-3 w-3" /> Registrada:{" "}
                            {new Date(order.createdAt).toLocaleDateString("es-AR")}
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Gateway: {order.paymentMethod || "Mercado Pago"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Controles de Paginación Premium */}
              {vm.ordersTotalPages > 1 && (
                <div className="flex items-center justify-center gap-6 pt-12 pb-4">
                  <Button
                    onClick={() => vm.changeOrdersPage(vm.ordersPage - 1)}
                    disabled={vm.ordersPage === 1 || vm.loadingOrders}
                    variant="outline"
                    size="icon"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex flex-col items-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 mb-1">Página</p>
                    <p className="text-2xl font-black italic tracking-tighter">
                      {vm.ordersPage} <span className="text-white/20 mx-1">/</span> {vm.ordersTotalPages}
                    </p>
                  </div>

                  <Button
                    onClick={() => vm.changeOrdersPage(vm.ordersPage + 1)}
                    disabled={vm.ordersPage === vm.ordersTotalPages || vm.loadingOrders}
                    variant="outline"
                    size="icon"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ======== SECCIÓN DE VENDEDOR / MARKETPLACE ======== */}
        <TabsContent value="seller">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {vm.user.role === "seller" || vm.user.role === "admin" ? (
                /* Vista del Vendedor Activo */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-none bg-gradient-to-br from-primary/20 to-white/[0.02] backdrop-blur-3xl rounded-[3rem] p-10 ring-1 ring-primary/30 shadow-2xl shadow-primary/10">
                    <CardHeader className="p-0 mb-6">
                      <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-3xl font-black italic">Centro de Ventas</CardTitle>
                      <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60">
                        Estado de tus publicaciones en 4Fun
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6">
                      <div className="flex items-center gap-2">
                        {(vm.user.role === 'seller' || vm.user.role === 'admin') ? (
                          <Badge className="bg-green-500/10 text-green-400 border-green-500/20 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[9px]">
                            <ShieldCheck className="h-3 w-3 mr-2" /> Vendedor Verificado
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[9px]">
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" /> Pendiente de Aprobación
                          </Badge>
                        )}
                      </div>
                      <Button asChild className="w-full mt-4">
                        <Link href="/seller/dashboard">
                          <BarChart3 className="h-4 w-4 mr-2" /> Panel de Ventas
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card className="border-none bg-white/[0.04] backdrop-blur-3xl rounded-[2rem] p-8 border border-white/10 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Mis Ventas</p>
                          <p className="text-3xl font-black tracking-tighter italic">Próximamente</p>
                        </div>
                        <TrendingUp className="h-10 w-10 text-primary opacity-20" />
                      </div>
                    </Card>
                    <Card className="border-none bg-white/[0.04] backdrop-blur-3xl rounded-[2rem] p-8 border border-white/10 shadow-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Nivel de Stock</p>
                          <p className="text-3xl font-black tracking-tighter italic">Optimizado</p>
                        </div>
                        <Package className="h-10 w-10 text-primary opacity-20" />
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                /* Banner Hero para Convertirse en Vendedor (Simplificado) */
                <Card className="relative border-none bg-gradient-to-br from-card/60 to-black/40 backdrop-blur-3xl rounded-[3rem] overflow-hidden ring-1 ring-white/10 shadow-2xl min-h-[500px] flex items-center">
                  {/* Decoración de fondo */}
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                  
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 w-full">
                    <div className="p-12 lg:p-20 space-y-10">
                      <div className="space-y-6">
                        <div className="h-20 w-20 bg-primary rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(214,88,250,0.5)] rotate-3">
                          <Rocket className="h-10 w-10 text-black animate-bounce" />
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black font-headline tracking-tighter italic leading-[0.9] text-white">
                          Empezá a <br /> vender en <span className="text-primary italic">4Fun</span>
                        </h2>
                        <p className="text-xl text-white/60 font-medium leading-relaxed max-w-md">
                          Publicá tus productos y ganá dinero con 4Fun. Vendé tus keys de forma segura y retirá tus ganancias al instante.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Comisión</p>
                          <p className="text-2xl font-black italic">0% <span className="text-sm text-white/40">FIJA</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Seguridad</p>
                          <p className="text-2xl font-black italic text-nowrap">Safe-Key <span className="text-sm text-white/40">v2</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="p-12 lg:p-20 flex flex-col justify-center items-center lg:items-end text-center lg:text-right space-y-8 lg:border-l lg:border-white/5">
                      <div className="space-y-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">Sin trámites, 100% Automático</p>
                        <h3 className="text-3xl font-black italic leading-tight">
                          Publicá tus juegos <br /> y empezá a ganar
                        </h3>
                      </div>

                      <div className="w-full max-w-sm space-y-6">
                        <Button 
                          onClick={async () => {
                            try {
                              const msg = await vm.becomeSeller(true); // Fast Track: On
                              toast({ title: "¡Perfil de Venta Activado!", description: "Ya podés publicar tu primer producto." });
                            } catch (error: any) {
                              toast({ title: "Error", description: error.message, variant: "destructive" });
                            }
                          }}
                          disabled={vm.becomingSeller}
                          className="w-full"
                        >
                          {vm.becomingSeller ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              ¡Empezá a vender ahora!
                            </>
                          )}
                        </Button>
                        <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.2em]">
                          Al continuar, aceptás los términos de venta de 4Fun
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ======== CONFIGURACIÓN DE NODO ======== */}
        <TabsContent value="settings" className="space-y-12">
          {/* Avatar y Datos Personales */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group/card shadow-xl ring-1 ring-white/10 hover:ring-primary/20 hover:shadow-[0_10px_40px_rgba(214,88,250,0.1)] transition-all">
              <CardHeader className="p-10 pb-6 border-b border-white/5">
                <CardTitle className="flex items-center gap-4 text-2xl font-black text-white italic">
                  <Camera className="h-6 w-6 text-primary" /> Tu Avatar
                </CardTitle>
                <CardDescription className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-60 mt-2">
                  Cambiá cómo te ven en la comunidad
                </CardDescription>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                <div className="flex flex-col items-center gap-8">
                  <Avatar className="h-32 w-32 border-4 border-white/10 shadow-2xl">
                    {vm.user.avatar ? (
                      <AvatarImage src={vm.user.avatar} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col w-full gap-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={vm.uploadingAvatar}
                    >
                      {vm.uploadingAvatar ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="mr-2 h-4 w-4" />
                      )}
                      Cambiar Foto
                    </Button>
                    {vm.user.avatar && (
                      <Button
                        variant="ghost"
                        onClick={handleRemoveAvatar}
                        disabled={vm.uploadingAvatar}
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Quitar Foto
                      </Button>
                    )}
                    <p className="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">
                      JPG, PNG o WebP • Máximo 5MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Datos Personales */}
            <Card className="border-none bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-xl ring-1 ring-white/10 hover:ring-primary/20 hover:shadow-[0_10px_40px_rgba(214,88,250,0.1)] transition-all">
              <CardHeader className="p-10 pb-6 border-b border-white/5">
                <CardTitle className="flex items-center gap-4 text-2xl font-black text-white italic">
                  <UserIcon className="h-6 w-6 text-primary" /> Datos Personales
                </CardTitle>
                <CardDescription className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-60 mt-2">
                  Mantené tu información al día
                </CardDescription>
              </CardHeader>
              <CardContent className="px-10 pb-10 space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-name"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                  >
                    Tu Nombre
                  </Label>
                  <Input
                    id="edit-name"
                    value={vm.editName}
                    onChange={(e) => vm.updateEditName(e.target.value)}
                    className="h-12 bg-white/[0.04] border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-white/20 focus:bg-white/[0.08] focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    Correo Electrónico{" "}
                    <Badge
                      variant="outline"
                      className="text-[8px] h-4 w-4 border-white/10 opacity-40 flex items-center justify-center p-0"
                      title="No se puede cambiar"
                    >
                      <Lock className="w-3 h-3" />
                    </Badge>
                  </Label>
                  <div className="h-12 bg-white/5 border border-white/5 rounded-xl flex items-center px-4 text-muted-foreground text-sm font-medium">
                    {vm.user.email}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-phone"
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Teléfono (Opcional)
                    </Label>
                    <Input
                      id="edit-phone"
                      value={vm.editPhone}
                      onChange={(e) => vm.updateEditPhone(e.target.value)}
                      placeholder="+54 11 ..."
                      className="h-12 bg-white/[0.04] border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-white/20 focus:bg-white/[0.08] focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-address"
                      className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Provincia (Opcional)
                    </Label>
                    <Input
                      id="edit-address"
                      value={vm.editAddress}
                      onChange={(e) => vm.updateEditAddress(e.target.value)}
                      placeholder="Provincia, País"
                      className="h-12 bg-white/[0.04] border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-white/20 focus:bg-white/[0.08] focus:border-primary/50 focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={vm.savingProfile}
                    className="w-full"
                  >
                    {vm.savingProfile ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <BadgeCheck className="mr-2 h-4 w-4" />
                    )}
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cambiar Contraseña */}
          <Card className="border-none bg-gradient-to-br from-destructive/8 to-destructive/3 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-destructive/15 hover:ring-destructive/25 hover:shadow-[0_10px_40px_rgba(239,68,68,0.1)] transition-all">
            <CardHeader className="p-10 pb-6 border-b border-destructive/10">
              <CardTitle className="flex items-center gap-4 text-2xl font-black text-white italic">
                <Lock className="h-6 w-6 text-destructive" /> Cambiar Contraseña
              </CardTitle>
              <CardDescription className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-60 mt-2">
                Reforzá tu seguridad cuando lo necesites
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Contraseña Actual
                  </Label>
                  <Input
                    type="password"
                    value={vm.currentPassword}
                    onChange={(e) => vm.updateCurrentPassword(e.target.value)}
                    placeholder="Tu contraseña actual"
                    className="h-14 bg-black/30 border-destructive/10 rounded-2xl hover:bg-black/40 hover:border-destructive/20 focus:border-destructive/50 focus:ring-2 focus:ring-destructive/30 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Nueva Contraseña
                  </Label>
                  <Input
                    type="password"
                    value={vm.newPassword}
                    onChange={(e) => vm.updateNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="h-14 bg-black/30 border-destructive/10 rounded-2xl hover:bg-black/40 hover:border-destructive/20 focus:border-destructive/50 focus:ring-2 focus:ring-destructive/30 transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    Confirmar Contraseña
                  </Label>
                  <Input
                    type="password"
                    value={vm.confirmPassword}
                    onChange={(e) => vm.updateConfirmPassword(e.target.value)}
                    placeholder="Repetí la nueva contraseña"
                    className="h-14 bg-black/30 border-destructive/10 rounded-2xl hover:bg-black/40 hover:border-destructive/20 focus:border-destructive/50 focus:ring-2 focus:ring-destructive/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-center pt-6">
                <Button
                  onClick={handleChangePassword}
                  disabled={vm.changingPassword}
                  variant="outline"
                  className="px-12 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {vm.changingPassword ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Actualizar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center opacity-20 select-none pb-12">
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white">
              4Fun Store • Mi Cuenta v2.4
            </span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}