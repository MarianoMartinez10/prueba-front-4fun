"use client";

/**
 * Capa de Interfaz: Central de Gestión de Identidad (Account Page)
 * --------------------------------------------------------------------------
 * Orquesta la administración de perfiles, historial transaccional y 
 * configuración de seguridad del usuario. 
 * Responsabilidades:
 * 1. Auditoría Transaccional: Visualización de órdenes y recuperación de claves digitales.
 * 2. Gestión de Identidad: Actualización de biometría y activos multimedia (Avatar).
 * 3. Protocolos de Seguridad: Mutación de credenciales de acceso.
 * (MVC / View)
 */

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ApiClient } from "@/lib/api";
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
import { Separator } from "@/components/ui/separator";
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
  Phone,
  MapPin,
  Lock,
  CheckCircle2,
  XCircle,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  BadgeCheck
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Order } from "@/lib/types";

export default function AccountPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // RN - Estado Transaccional: Historial de Órdenes
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // RN - Gestión de Perfil: Estados de Edición
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // RN - Seguridad: Protocolo de Cambio de Credenciales
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  /**
   * RN - Guarda de Navegación: Redirección automática si no hay sesión activa.
   */
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  /** 
   * Hidratación de Campos de Edición
   */
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditAddress(user.address || "");
    }
  }, [user]);

  /**
   * RN - Sincronización de Órdenes: Recupera el historial del usuario desde el API.
   */
  useEffect(() => {
    if (user) {
      ApiClient.getMyOrders()
        .then((data: any) => {
          const list = Array.isArray(data) ? data : (data?.orders || []);
          setOrders(list);
        })
        .catch((err) => console.error("[Account] Error retrieving orders:", err))
        .finally(() => setLoadingOrders(false));
    }
  }, [user]);

  /**
   * RN - Gestión de Multimedia: Carga de Avatar a infraestructura Cloudinary.
   */
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Validación Fallida", description: "Formato de imagen no soportado.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Exceso de Volumen", description: "El activo supera el límite de 5MB.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    try {
      const imageUrl = await ApiClient.uploadImage(file);
      await ApiClient.updateProfile({ avatar: imageUrl });
      await refreshUser();
      toast({ title: "Identidad Actualizada", description: "El avatar ha sido sincronizado correctamente." });
    } catch (error: any) {
      toast({ title: "Error en Carga", description: error.message || "Fallo en la nube de activos.", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAvatar = async () => {
    setUploadingAvatar(true);
    try {
      await ApiClient.updateProfile({ avatar: null });
      await refreshUser();
      toast({ title: "Avatar Removido", description: "Se ha purgado el activo multimedia del perfil." });
    } catch (error: any) {
      toast({ title: "Fallo en Operación", description: error.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  /**
   * RN - Persistencia de Perfil: Actualiza metadatos del usuario.
   */
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      toast({ title: "Validación Requerida", description: "El campo nominal es obligatorio.", variant: "destructive" });
      return;
    }

    setSavingProfile(true);
    try {
      await ApiClient.updateProfile({
        name: editName.trim(),
        phone: editPhone.trim() || null,
        address: editAddress.trim() || null,
      });
      await refreshUser();
      toast({ title: "Perfil Sincronizado", description: "Los cambios han sido persistidos en el padrón." });
    } catch (error: any) {
      toast({ title: "Error de Guardado", description: error.message || "No se pudo actualizar la entidad.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  /**
   * RN - Seguridad Criptográfica: Mutación de credenciales.
   */
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ title: "Datos Incompletos", description: "Especifique las credenciales solicitadas.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Fortaleza Insuficiente", description: "La nueva contraseña debe poseer al menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Discrepancia", description: "La validación de contraseña no coincide.", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await ApiClient.changePassword({ currentPassword, newPassword });
      toast({ title: "Seguridad Reforzada", description: res.message || "Credenciales actualizadas correctamente." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({ title: "Fallo de Validación", description: error.message || "La contraseña actual es incorrecta.", variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Sincronizando Identidad...</p>
      </div>
    );
  }

  if (!user) return null;

  const initials = (user.name || "U").substring(0, 2).toUpperCase();
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "long" })
    : "Evaluación TFI";

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl animate-in fade-in duration-1000">
      
      {/* Cabecera Técnica de Cuenta */}
      <header className="mb-16 flex flex-col md:flex-row items-center gap-10 bg-card/20 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="relative z-10">
          <div className="relative group/avatar">
            <Avatar className="h-40 w-40 border-8 border-background shadow-3xl ring-1 ring-white/10">
              {user.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-4xl font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              {uploadingAvatar ? (
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                    <Camera className="h-8 w-8 text-white" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">Actualizar Activo</span>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>

        <div className="text-center md:text-left space-y-4 relative z-10 flex-1">
          <div className="space-y-1">
              <h1 className="text-5xl font-black font-headline text-white tracking-tighter italic italic-shadow">Terminal: {user.name}</h1>
              <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start font-medium opacity-60">
                <Mail className="h-4 w-4 text-primary" /> {user.email}
              </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
            <Badge variant="outline" className="h-8 px-4 bg-primary/10 border-primary/20 text-primary font-black uppercase tracking-widest text-[9px]">
              <Shield className="h-3 w-3 mr-2" />
              Rango: {user.role === "admin" ? "Sénior (Admin)" : "Miembro Estándar"}
            </Badge>
            {user.isVerified ? (
              <Badge variant="outline" className="h-8 px-4 border-green-500/20 bg-green-500/5 text-green-400 font-black uppercase tracking-widest text-[9px]">
                <BadgeCheck className="h-3 w-3 mr-2" /> Identidad Validada
              </Badge>
            ) : (
              <Badge variant="outline" className="h-8 px-4 border-yellow-500/20 bg-yellow-500/5 text-yellow-500 font-black uppercase tracking-widest text-[9px]">
                <XCircle className="h-3 w-3 mr-2" /> Pendiente de Validación
              </Badge>
            )}
          </div>
          
          <div className="pt-4 flex items-center gap-4 justify-center md:justify-start">
              <div className="bg-white/5 px-4 py-2 rounded-xl">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40 mb-1">Registro Inicial</p>
                  <p className="text-xs text-white font-bold">{memberSince}</p>
              </div>
          </div>
        </div>
      </header>

      <Tabs defaultValue="orders" className="w-full space-y-12">
        <TabsList className="h-16 w-full max-w-2xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-2">
          <TabsTrigger value="orders" className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
            <Package className="h-3 w-3 mr-2" /> Historial de Órdenes
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-black transition-all">
            <Settings className="h-3 w-3 mr-2" /> Configuración de Nodo
          </TabsTrigger>
        </TabsList>

        {/* ======== RN - AUDITORÍA TRANSACCIONAL ======== */}
        <TabsContent value="orders">
          <AnimatePresence mode="wait">
            <motion.div 
                key="orders"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
            >
                {loadingOrders ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Recuperando Historial...</span>
                    </div>
                ) : orders.length === 0 ? (
                    <Card className="border-none bg-card/20 backdrop-blur-3xl py-24 text-center rounded-[3rem]">
                        <CardContent className="space-y-6">
                            <div className="h-20 w-20 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                                <Package className="h-10 w-10 text-muted-foreground opacity-20" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tighter">Sin Transacciones</h3>
                                <p className="text-muted-foreground text-sm mt-2">No se han detectado operaciones financieras en este nodo.</p>
                            </div>
                            <Button asChild className="h-12 px-8 rounded-xl bg-primary text-black font-black uppercase text-[10px] tracking-widest hover:bg-primary/90">
                                <Link href="/productos">Explorar el Catálogo</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {orders.map((order: any) => (
                        <Card key={order.id || order._id} className="overflow-hidden border-none bg-card/20 backdrop-blur-3xl rounded-[2.5rem] group hover:bg-card/30 transition-all duration-500 shadow-xl ring-1 ring-white/5">
                            <div className="bg-primary/5 px-8 py-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Operación ID</span>
                                        <CardTitle className="text-lg font-bold font-headline text-white">#{ (order.id || order._id).slice(-8).toUpperCase() }</CardTitle>
                                    </div>
                                    <Badge className={cn(
                                        "h-7 px-4 rounded-full font-black uppercase text-[9px] tracking-widest",
                                        order.isPaid ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                    )} variant="outline">
                                        { order.isPaid ? 'Conciliado' : 'Pendiente de Liquidación' }
                                    </Badge>
                                </div>
                                <div className="text-right flex flex-col items-center md:items-end">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Inversión Total</span>
                                    <p className="font-black text-2xl text-white tabular-nums tracking-tighter">{formatCurrency(order.totalPrice || order.total)}</p>
                                </div>
                            </div>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-4">
                                    {Array.isArray(order.orderItems || order.items) && (order.orderItems || order.items).map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-black/40 flex items-center justify-center">
                                                <CreditCard className="h-5 w-5 text-primary opacity-60" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">{item.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Unidades: {item.quantity}</p>
                                            </div>
                                        </div>

                                        {order.isPaid && Array.isArray(order.digitalKeys) && (
                                        <div className="flex flex-col items-end gap-2">
                                            {order.digitalKeys
                                            .filter((k: any) => k.productoId === item.product || k.productoId === (item.product as any)?._id || k.productoId === item.productId)
                                            .map((k: any, kIdx: number) => (
                                                <div key={kIdx} className="flex items-center gap-3 bg-green-500/10 text-green-400 px-4 py-2 rounded-xl text-xs font-mono border border-green-500/20 animate-in slide-in-from-right-2">
                                                <Key className="h-4 w-4 animate-pulse" />
                                                {k.clave}
                                                </div>
                                            ))
                                            }
                                        </div>
                                        )}
                                    </div>
                                    ))}
                                </div>
                                
                                <div className="flex items-center justify-between pt-4 opacity-40">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                        <Calendar className="h-3 w-3" /> Registrada: { new Date(order.createdAt).toLocaleDateString("es-AR") }
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gateway: {order.paymentMethod || 'Mercado Pago'}</p>
                                </div>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>

        {/* ======== RN - CONFIGURACIÓN DE NODO ======== */}
        <TabsContent value="settings" className="space-y-12">
          
          {/* RN - Identidad Visual */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="border-none bg-card/20 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden group/card shadow-xl">
                <CardHeader className="p-10 pb-6">
                    <CardTitle className="flex items-center gap-4 text-2xl font-black text-white italic">
                        <Camera className="h-6 w-6 text-primary" /> Atributos Visuales
                    </CardTitle>
                    <CardDescription className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-60 mt-2">
                        Gestión de la Capa de Presentación Personal
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10">
                    <div className="flex flex-col items-center gap-8">
                        <Avatar className="h-32 w-32 border-4 border-white/10 shadow-2xl">
                            {user.avatar ? <AvatarImage src={user.avatar} className="object-cover" /> : null}
                            <AvatarFallback className="bg-primary/5 text-primary text-3xl font-black">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col w-full gap-4">
                            <Button
                                variant="outline"
                                className="h-14 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                            >
                                {uploadingAvatar ? <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary" /> : <Camera className="mr-3 h-4 w-4" />}
                                Sincronizar Nuevo Activo
                            </Button>
                            {user.avatar && (
                                <Button
                                    variant="ghost"
                                    onClick={handleRemoveAvatar}
                                    disabled={uploadingAvatar}
                                    className="h-14 font-black uppercase tracking-widest text-[10px] text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="mr-3 h-4 w-4" /> Purgar Imagen
                                </Button>
                            )}
                            <p className="text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Formatos: JPG, PNG, WebP (Max 5MB)</p>
                        </div>
                    </div>
                </CardContent>
              </Card>

              {/* RN - Datos Nominativos */}
              <Card className="border-none bg-card/20 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-xl">
                <CardHeader className="p-10 pb-6">
                    <CardTitle className="flex items-center gap-4 text-2xl font-black text-white italic">
                        <UserIcon className="h-6 w-6 text-primary" /> Biometría de Identidad
                    </CardTitle>
                    <CardDescription className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-60 mt-2">
                        Actualización de Padrón Administrativo
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-10 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nombre Nominal</Label>
                        <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                            Email <Badge variant="outline" className="text-[8px] h-4 border-white/10 opacity-40">Bloqueado</Badge>
                        </Label>
                        <div className="h-12 bg-white/5 border border-white/5 rounded-xl flex items-center px-4 text-muted-foreground text-sm font-medium">
                            {user.email}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Teléfono</Label>
                            <Input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="+54 11 ..." className="h-12 bg-white/5 border-white/10 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Región</Label>
                            <Input id="edit-address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} placeholder="Provincia, País" className="h-12 bg-white/5 border-white/10 rounded-xl" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button onClick={handleSaveProfile} disabled={savingProfile} className="h-14 w-full bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/10">
                            {savingProfile ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <BadgeCheck className="mr-3 h-5 w-5" />}
                            Persistir Cambios
                        </Button>
                    </div>
                </CardContent>
              </Card>
          </section>

          {/* RN - Protocolo de Seguridad */}
          <Card className="border-none bg-destructive/5 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-destructive/10">
            <CardHeader className="p-10 pb-6">
                <CardTitle className="flex items-center gap-4 text-2xl font-black text-white italic">
                    <Lock className="h-6 w-6 text-destructive" /> Mutación de Credenciales
                </CardTitle>
                <CardDescription className="text-xs uppercase font-black tracking-widest text-muted-foreground opacity-60 mt-2">
                    Actualización Forzada de Accesos
                </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Password Vigente</Label>
                        <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="h-14 bg-black/40 border-white/5 rounded-2xl" />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nueva Clave</Label>
                        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 chars" className="h-14 bg-black/40 border-white/5 rounded-2xl" />
                    </div>
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Confirmación</Label>
                        <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-ingrese password" className="h-14 bg-black/40 border-white/5 rounded-2xl" />
                    </div>
                </div>

                <div className="flex justify-center pt-6">
                    <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline" className="h-14 px-12 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 font-black uppercase tracking-widest text-[10px]">
                        {changingPassword ? <Loader2 className="mr-3 h-4 w-4 animate-spin text-destructive" /> : <ShieldCheck className="mr-3 h-4 w-4" />}
                        Reconfigurar Credencial
                    </Button>
                </div>
            </CardContent>
          </Card>

          {/* RN - Footer Administrativo */}
          <div className="text-center opacity-20 select-none pb-12">
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white">Identity Manager Terminal TFI v2.4</span>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}