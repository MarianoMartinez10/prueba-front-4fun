"use client";

/**
 * Capa de Administración: Auditoría Profunda de Perfil (User Detail)
 * --------------------------------------------------------------------------
 * Orquesta la revisión exhaustiva de la actividad de un cliente en el ecosistema.
 * Expone estadísticas de compra, validación de perfil e historial de pedidos. Provee
 * información detallada sobre la cuenta para facilitar la gestión administrativa.
 * (MVC / View-Admin)
 */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserApiService } from "@/lib/services/UserApiService";
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
    History,
    Store,
    Download,
    FileSpreadsheet,
    FilePieChart,
    Activity
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface UserOrder {
    id: string;
    createdAt: string;
    totalPrice: number;
    status: string;
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
    role: "USER" | "ADMIN" | "SELLER";
    isVerified: boolean;
    createdAt: string;
    stats: {
        totalSpent: number;
        orderCount: number;
        totalOrders: number;
        lastOrderDate: string | null;
    };
    sellerProfile: {
        storeName: string;
        isApproved: boolean;
        storeDescription: string | null;
    } | null;
    orders: UserOrder[];
}

/**
 * RN - Taxonomía de Estados: Mapeo de lógica visual para trazabilidad operativa.
 */
const getStatusBadge = (status: string) => {
    const normalizedStatus = status?.toUpperCase();
    switch (normalizedStatus) {
        case "DELIVERED":
            return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 py-0 uppercase text-[9px] font-black">Entregado</Badge>;
        case "PROCESSING":
            return <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 py-0 uppercase text-[9px] font-black">Procesando</Badge>;
        case "PENDING":
            return <Badge variant="outline" className="text-yellow-600 border-yellow-600/50 py-0 uppercase text-[9px] font-black">Pendiente</Badge>;
        case "SHIPPED":
            return <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 py-0 uppercase text-[9px] font-black">Enviado</Badge>;
        case "CANCELLED":
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
    const [actionLoading, setActionLoading] = useState(false);
    const [orderPage, setOrderPage] = useState(1);
    const ordersPerPage = 5;

    /**
     * RN - Moderación de Vendedores (Modelo Simplificado): 
     * Eleva al usuario al rol de vendedor directamente.
     */
    const handleApproveSeller = async () => {
        setActionLoading(true);
        try {
            await UserApiService.approveSeller(userId);
            toast({ 
                title: "Vendedor Activado", 
                description: `El usuario ahora tiene permisos de venta en el Marketplace.` 
            });
            // Actualización de estado local inmediata para UX reactiva
            setProfile(prev => prev ? { 
                ...prev, 
                role: 'SELLER', 
                sellerProfile: { 
                    ...prev.sellerProfile!, 
                    isApproved: true,
                    storeName: prev.sellerProfile?.storeName || prev.name
                } 
            } : null);
        } catch (err: any) {
            toast({ 
                title: "Error de Aprobación", 
                description: err.message, 
                variant: "destructive" 
            });
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * RN - Auditoría Registral: Exportación de historial de pedidos a CSV.
     */
    const handleExportCSV = () => {
        if (!profile || profile.orders.length === 0) return;
        const headers = ["Pedido ID", "Fecha", "Estado", "Pago", "Total"];
        const rows = profile.orders.map(o => [
            o.id.toUpperCase(),
            new Date(o.createdAt).toLocaleDateString("es-AR"),
            o.status.toUpperCase(),
            o.isPaid ? "SI" : "NO",
            o.totalPrice.toFixed(2)
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement("a"), {
            href: url,
            download: `pedidos_${profile.name.replace(/\s+/g, '_')}_${new Date().getTime()}.csv`,
        });
        link.click();
    };

    /**
     * RN - Auditoría Registral: Exportación de historial de pedidos a PDF.
     */
    const handleExportPDF = () => {
        if (!profile || profile.orders.length === 0) return;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Historial de Pedidos: ${profile.name}`, 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Email: ${profile.email} | Generado: ${new Date().toLocaleString("es-AR")}`, 14, 30);
        doc.setTextColor(0);

        autoTable(doc, {
            startY: 40,
            head: [["ID PEDIDO", "FECHA", "ESTADO", "PAGO", "TOTAL"]],
            body: profile.orders.map(o => [
                o.id.slice(-8).toUpperCase(),
                new Date(o.createdAt).toLocaleDateString("es-AR"),
                o.status === 'DELIVERED' ? 'ENTREGADO' : o.status.toUpperCase(),
                o.isPaid ? 'LIQUIDADO' : 'PENDIENTE',
                formatCurrency(o.totalPrice),
            ]),
            styles: { fontSize: 8, cellPadding: 4 },
            headStyles: { fillColor: [45, 45, 55], textColor: [255, 255, 255] },
        });
        doc.save(`reporte_pedidos_${profile.name.replace(/\s+/g, '_')}.pdf`);
    };

    /**
     * RN - Sincronización Registral: Recupera el estado íntegro del perfil.
     */
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await UserApiService.getUserById(userId);
                if (res.success && res.data) {
                    setProfile(res.data);
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Cargando...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Button variant="ghost" onClick={() => router.push("/admin/users")} className="font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-white">
                    <ArrowLeft className="mr-2 h-4 w-4" /> VOLVER
                </Button>
                <Card className="border-dashed border-white/10 bg-transparent">
                    <CardContent className="py-24 text-center">
                        <UserIcon className="h-16 w-16 mx-auto mb-4 opacity-10" />
                        <p className="text-muted-foreground uppercase text-xs font-black tracking-widest">Cuenta no encontrada</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const initials = (profile.name || "U").substring(0, 2).toUpperCase();
    const memberSince = new Date(profile.createdAt).toLocaleDateString("es-AR", { year: "numeric", month: "long", day: "numeric" });
    const lastOrder = profile.stats.lastOrderDate ? new Date(profile.stats.lastOrderDate).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" }) : "SIN ACTIVIDAD";

    const totalOrders = profile.orders.length;
    const totalOrderPages = Math.ceil(totalOrders / ordersPerPage);
    const paginatedOrders = profile.orders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Cabecera de Identidad Auditada */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-4">
                <Button variant="ghost" onClick={() => router.push("/admin/users")} className="gap-2 font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground border border-white/5 hover:bg-white/5">
                    <ArrowLeft className="h-4 w-4" /> VOLVER
                </Button>
                <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                    <Activity className="h-4 w-4 animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Detalle de la cuenta</span>
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
                                {profile.role === "ADMIN" ? (
                                    <Badge className="bg-destructive text-white border-none gap-2 py-1 px-4 font-black uppercase text-[10px]">
                                        <Shield className="h-3.5 w-3.5" /> Administrador
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="gap-2 py-1 px-4 font-black uppercase text-[10px] bg-muted/40">
                                        <UserIcon className="h-3.5 w-3.5" /> Cliente
                                    </Badge>
                                )}
                                
                                {profile.isVerified ? (
                                    <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-400/5 gap-2 py-1 px-4 font-black uppercase text-[10px]">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Identidad Verificada
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="border-yellow-500/40 text-yellow-500 bg-yellow-500/5 gap-2 py-1 px-4 font-black uppercase text-[10px]">
                                        <XCircle className="h-3.5 w-3.5" /> Pendiente de validar
                                    </Badge>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fecha de registro</p>
                                    <p className="text-sm font-bold text-white flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-primary/50" /> {memberSince}
                                    </p>
                                </div>
                                {profile.phone && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Teléfono</p>
                                        <p className="text-sm font-bold text-white flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-primary/50" /> {profile.phone}
                                        </p>
                                    </div>
                                )}
                                {profile.address && (
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dirección</p>
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
            
            {/* SECCIÓN DE MODERACIÓN DE VENDEDOR (3FN) */}
            <Card className={cn(
                "border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden",
                profile.role !== "SELLER" && "ring-1 ring-yellow-500/30"
            )}>
                <CardHeader className="border-b border-white/5 bg-muted/20 pb-8 pt-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Store className="h-6 w-6 text-primary" />
                            <CardTitle className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Vendedor</CardTitle>
                        </div>
                        <Badge variant={profile.role === "SELLER" ? "default" : "outline"} className={cn(
                            "text-xs font-black uppercase tracking-widest py-1.5 px-4",
                            profile.role === "SELLER" ? "bg-green-500 text-white" : "text-yellow-500 border-yellow-500/30"
                        )}>
                            {profile.role === "SELLER" ? "VENDEDOR ACTIVO" : "PENDIENTE DE APROBACIÓN"}
                        </Badge>
                    </div>
                </CardHeader>
                    <CardContent className="pt-10 pb-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-white/60 leading-relaxed max-w-xl">
                                    Este usuario tiene permisos para operar dentro del Marketplace de 4Fun. Como administrador, puedes monitorear su historial de ventas y transacciones en tiempo real.
                                </p>
                            </div>
                            
                            {profile.role !== "SELLER" && (
                                <div className="flex flex-col gap-3 w-full md:w-auto">
                                    <Button 
                                        onClick={handleApproveSeller} 
                                        disabled={!!actionLoading}
                                        className="h-16 px-12 bg-green-500 hover:bg-green-600 text-white font-black uppercase text-sm tracking-[0.15em] transition-all shadow-xl shadow-green-500/20 rounded-2xl"
                                    >
                                        {actionLoading ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <CheckCircle2 className="h-6 w-6 mr-3" />}
                                        OTORGAR LICENCIA DE VENTA
                                    </Button>
                                    <p className="text-[10px] text-center text-muted-foreground uppercase font-black tracking-widest px-2 opacity-50">
                                        Al aprobar, el usuario podrá publicar productos en el Marketplace
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            {/* MATRIZ DE RENDIMIENTO (KPI DE CONSUMO) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl p-6 group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-green-500/10 group-hover:scale-110 transition-transform"><DollarSign className="h-6 w-6 text-green-400" /></div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total gastado</p>
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
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cantidad de compras</p>
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
                            <CardTitle className="text-xl font-headline font-bold text-white uppercase tracking-tight">Historial de Pedidos</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleExportCSV}
                                className="border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest h-8"
                                disabled={profile.orders.length === 0}
                            >
                                <FileSpreadsheet className="mr-2 h-3.5 w-3.5 text-green-500" /> CSV
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handleExportPDF}
                                className="border-white/10 hover:bg-white/5 text-[9px] font-black uppercase tracking-widest h-8"
                                disabled={profile.orders.length === 0}
                            >
                                <FilePieChart className="mr-2 h-3.5 w-3.5 text-destructive" /> PDF
                            </Button>
                            <Badge variant="outline" className="border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Últimos movimientos</Badge>
                        </div>
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
                                    <TableHead className="font-bold uppercase tracking-widest text-xs text-muted-foreground pl-8 h-14">Nro de pedido</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-xs text-muted-foreground h-14">Fecha</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-xs text-muted-foreground h-14">Estado</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-xs text-muted-foreground h-14">Pago</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-xs text-muted-foreground h-14">Detalle de productos</TableHead>
                                    <TableHead className="text-right font-bold uppercase tracking-widest text-xs text-muted-foreground pr-8 h-14">Valor Neto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedOrders.map((order) => (
                                    <TableRow key={order.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="font-mono text-xs text-muted-foreground pl-8">
                                            #{order.id.slice(-8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="text-sm font-medium text-white/70">
                                            {new Date(order.createdAt).toLocaleDateString("es-AR")}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell>
                                            {order.isPaid ? (
                                                <Badge variant="outline" className="text-green-400 border-green-500/20 bg-green-500/5 py-0 uppercase text-[10px] font-black">Liquidado</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-destructive border-destructive/20 bg-destructive/5 py-0 uppercase text-[10px] font-black">Pendiente de Pago</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 py-2">
                                                {order.items.slice(0, 2).map((item, idx) => (
                                                    <p key={idx} className="text-xs font-bold text-white/50 uppercase leading-tight">
                                                        {item.name} <span className="text-primary/70">×{item.quantity}</span>
                                                    </p>
                                                ))}
                                                {order.items.length > 2 && (
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">
                                                        + {order.items.length - 2} productos
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-black text-white text-lg pr-8">
                                            {formatCurrency(order.totalPrice)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
                
                {/* Navegación de Pedidos */}
                {totalOrderPages > 1 && (
                    <div className="flex items-center justify-between p-6 border-t border-white/5 bg-muted/10">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Página {orderPage} de {totalOrderPages}</p>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-white/10 text-[10px] uppercase font-black tracking-widest"
                                onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                                disabled={orderPage === 1}
                            >
                                Anterior
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 border-white/10 text-[10px] uppercase font-black tracking-widest"
                                onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))}
                                disabled={orderPage === totalOrderPages}
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
