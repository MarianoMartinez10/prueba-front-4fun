"use client";

/**
 * Capa de Administración: Auditoría Profunda de Perfil (User Detail)
 * --------------------------------------------------------------------------
 * Orquesta la revisión exhaustiva de la actividad de un sujeto en el ecosistema.
 * Expone métricas de valorización transaccional (CLV), cumplimiento de 
 * seguridad registral e historial cronológico de consumos. Provee trazabilidad 
 * total sobre la identidad del usuario para fines de auditoría técnica.
 * (MVC / View-Admin)
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Loader2,
    ArrowLeft,
    Shield,
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CheckCircle2,
    XCircle,
    Package,
    DollarSign,
    ShoppingCart,
    Clock,
    Activity,
    History
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserOrder {
    id: string;
    createdAt: string;
    totalPrice: number;
    orderStatus: string;
    isPaid: boolean;
    itemCount: number;
    items: { name: string; quantity: number; price: number }[];
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    address?: string | null;
    role: "user" | "admin";
    isVerified: boolean;
    createdAt: string;
    stats: {
        totalSpent: number;
        orderCount: number;
        totalOrders: number;
        lastOrderDate: string | null;
    };
    orders: UserOrder[];
}

/**
 * RN - Taxonomía de Estados: Mapeo de lógica visual para trazabilidad operativa.
 */
const getStatusBadge = (status: string) => {
    switch (status) {
        case "delivered":
            return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 py-0 uppercase text-[9px] font-black">Entregado</Badge>;
        case "processing":
            return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 py-0 uppercase text-[9px] font-black">Procesando</Badge>;
        case "pending":
            return <Badge variant="outline" className="text-yellow-600 border-yellow-600/50 py-0 uppercase text-[9px] font-black">Pendiente</Badge>;
        case "shipped":
            return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 py-0 uppercase text-[9px] font-black">Enviado</Badge>;
        case "cancelled":
            return <Badge variant="destructive" className="py-0 uppercase text-[9px] font-black">Cancelado</Badge>;
        default:
            return <Badge variant="secondary" className="py-0 uppercase text-[9px] font-black">{status}</Badge>;
    }
};

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const userId = params.id as string;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    /**
     * RN - Sincronización Registral: Recupera el estado íntegro del perfil.
     */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await ApiClient.getUserById(userId);
                if ((res as any).success && (res as any).data) {
                    setProfile((res as any).data);
                }
            } catch (error: any) {
                console.error("[UserAudit] Fallo en recuperación:", error);
                toast({
                    title: "Error de Auditoría",
                    description: error.message || "No se pudo recuperar la ficha técnica del usuario.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchProfile();
    }, [userId, toast]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4 text-primary">
                <Loader2 className="h-12 w-12 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Compilando Auditoría...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Button variant="ghost" onClick={() => router.push("/admin/users")} className="font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> REPROBAR AUDITORÍA
                </Button>
                <Card className="border-dashed border-white/10 bg-transparent">
                    <CardContent className="py-24 text-center">
                        <UserIcon className="h-16 w-16 mx-auto mb-4 opacity-10" />
                        <p className="text-muted-foreground uppercase text-xs font-black tracking-widest">Identidad No Hallada en el Padrón</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const initials = (profile.name || "U").substring(0, 2).toUpperCase();
    const memberSince = new Date(profile.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
    const lastOrder = profile.stats.lastOrderDate ? new Date(profile.stats.lastOrderDate).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" }) : "SIN ACTIVIDAD";

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Cabecera de Identidad Auditada */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4">
                <Button variant="ghost" onClick={() => router.push("/admin/users")} className="gap-2 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground border border-white/5 hover:bg-white/5">
                    <ArrowLeft className="h-4 w-4" /> REGRESAR AL PADRÓN
                </Button>
                <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                    <Activity className="h-3.5 w-3.5 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sujeto Bajo Auditoría Directa</span>
                </div>
            </div>

            <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardContent className="pt-10 pb-10">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                            <Avatar className="h-32 w-32 border-4 border-card relative">
                                {profile.avatar && <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />}
                                <AvatarFallback className="bg-muted/50 text-primary text-4xl font-black">{initials}</AvatarFallback>
                            </Avatar>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <h1 className="text-4xl font-headline font-bold text-white tracking-tight">{profile.name}</h1>
                                <p className="text-muted-foreground font-mono text-sm mt-1 opacity-70 flex items-center gap-2 justify-center md:justify-start">
                                    <Mail className="h-4 w-4 text-primary" /> {profile.email}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                {profile.role === "admin" ? (
                                    <Badge className="bg-destructive text-white border-none gap-2 py-1 px-4 font-black uppercase text-[10px]">
                                        <Shield className="h-3.5 w-3.5" /> Administrador del Sistema
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="gap-2 py-1 px-4 font-black uppercase text-[10px] bg-muted/40">
                                        <UserIcon className="h-3.5 w-3.5" /> Cliente / Usuario Final
                                    </Badge>
                                )}
                                
                                {profile.isVerified ? (
                                    <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-400/5 gap-2 py-1 px-4 font-black uppercase text-[10px]">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Identidad Verificada
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-yellow-500/40 text-yellow-500 bg-yellow-500/5 gap-2 py-1 px-4 font-black uppercase text-[10px]">
                                        <XCircle className="h-3.5 w-3.5" /> Registro Pendiente de Validación
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alta Registral</p>
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary/50" /> {memberSince}
                                    </p>
                                </div>
                                {profile.phone && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Canal de Contacto</p>
                                        <p className="text-sm font-bold text-white flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary/50" /> {profile.phone}
                                        </p>
                                    </div>
                                )}
                                {profile.address && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localización de Entrega</p>
                                        <p className="text-sm font-bold text-white flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary/50" /> {profile.address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* MATRIZ DE RENDIMIENTO (KPI DE CONSUMO) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-green-500/10 group-hover:scale-110 transition-transform"><DollarSign className="h-6 w-6 text-green-400" /></div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Valor de Vida (CLV)</p>
                            <p className="text-2xl font-black text-white">{formatCurrency(profile.stats.totalSpent)}</p>
                        </div>
                    </div>
                </Card>

                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10 group-hover:scale-110 transition-transform"><ShoppingCart className="h-6 w-6 text-blue-400" /></div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Órdenes Liquidadas</p>
                            <p className="text-2xl font-black text-white">{profile.stats.orderCount}</p>
                        </div>
                    </div>
                </Card>

                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-purple-500/10 group-hover:scale-110 transition-transform"><Package className="h-6 w-6 text-purple-400" /></div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Volumen Transaccional</p>
                            <p className="text-2xl font-black text-white">{profile.stats.totalOrders}</p>
                        </div>
                    </div>
                </Card>

                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-orange-500/10 group-hover:scale-110 transition-transform"><Clock className="h-6 w-6 text-orange-400" /></div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recurrencia / Abandono</p>
                            <p className="text-lg font-black text-white uppercase">{lastOrder}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* HISTORIAL CRONOLÓGICO DE ÓRDENES */}
            <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-muted/20 pb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <History className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl font-headline font-bold text-white uppercase tracking-tight">Trazabilidad de Consumo</CardTitle>
                        </div>
                        <Badge variant="outline" className="border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Auditoría Registral Completa</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {profile.orders.length === 0 ? (
                        <div className="py-24 text-center opacity-30">
                            <Package className="h-12 w-12 mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Sin Antecedentes Transaccionales Hallados</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="font-bold uppercase tracking-widest text-[9px] text-muted-foreground pl-8">ID ÓMS</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Cronología</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Estado Operativo</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Finanzas</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[9px] text-muted-foreground">Configuración de Ítems</TableHead>
                                    <TableHead className="text-right font-bold uppercase tracking-widest text-[9px] text-muted-foreground pr-8">Valor Neto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {profile.orders.map((order) => (
                                    <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="font-mono text-[10px] text-muted-foreground pl-8">
                                            #{order.id.slice(-8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="text-xs font-medium text-white/70">
                                            {new Date(order.createdAt).toLocaleDateString("es-AR")}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(order.orderStatus)}
                                        </TableCell>
                                        <TableCell>
                                            {order.isPaid ? (
                                                <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/5 py-0 uppercase text-[9px] font-black">Liquidado</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5 py-0 uppercase text-[9px] font-black">Pendiente de Pago</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 py-2">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <p key={idx} className="text-[10px] font-bold text-white/50 uppercase leading-tight">
                                                        {item.name} <span className="text-primary/70">×{item.quantity}</span>
                                                    </p>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40">
                                                        + {order.items.length - 2} Activos Adicionales
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-white pr-8">
                                            {formatCurrency(order.totalPrice)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
