"use client";

/**
 * Capa de Presentación: Dashboard de Vendedor (Seller Home)
 * --------------------------------------------------------------------------
 * Provee herramientas analíticas y de gestión para los comerciantes.
 * Consume el ViewModel `useSellerDashboardViewModel` para datos privados.
 * (MVC / View)
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import {
    Area, AreaChart, ResponsiveContainer, XAxis, YAxis,
    Tooltip, CartesianGrid,
} from "recharts";
import {
    DollarSign, Package, AlertTriangle, Activity,
    BarChart3, Target, TrendingUp, Zap,
    ArrowUpRight, ArrowDownRight, ShoppingBag, Download,
    FileSpreadsheet, FilePieChart, Store,
} from "lucide-react";
import { DashboardCardSkeleton } from "@/components/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useSellerDashboardViewModel } from "@/hooks/use-seller-dashboard-view-model";

// ── KPI Card Premium ──────────────────────────────────────────────────────────
function KpiCard({
    title, value, subtitle, icon: Icon,
    iconBg, iconColor, trend, trendValue, alert,
}: {
    title: string; value: string | number; subtitle?: string;
    icon: React.ElementType; iconBg: string; iconColor: string;
    trend?: "up" | "down"; trendValue?: string; alert?: boolean;
}) {
    return (
        <Card className={cn(
            "relative border-0 overflow-hidden group transition-all duration-300",
            "bg-card/60 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5",
            alert
                ? "ring-1 ring-destructive/40 shadow-destructive/10"
                : "ring-1 ring-white/5 hover:ring-white/10"
        )}>
            <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                alert
                    ? "bg-gradient-to-br from-destructive/5 to-transparent"
                    : "bg-gradient-to-br from-primary/5 to-transparent"
            )} />
            <CardContent className="p-5 lg:p-6 relative">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                        "p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                        iconBg
                    )}>
                        <Icon className={cn("h-5 w-5", iconColor)} />
                    </div>
                    {trendValue && trend && (
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-wider",
                            trend === "up"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-destructive/10 text-destructive"
                        )}>
                            {trend === "up"
                                ? <ArrowUpRight className="h-3 w-3" />
                                : <ArrowDownRight className="h-3 w-3" />}
                            {trendValue}
                        </div>
                    )}
                </div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground mb-1.5">
                    {title}
                </p>
                <p className={cn(
                    "text-4xl lg:text-5xl font-black tracking-tighter leading-none",
                    alert && "text-destructive"
                )}>
                    {value}
                </p>
                {subtitle && (
                    <p className="text-xs text-muted-foreground/50 font-bold tracking-tight mt-2">
                        {subtitle}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────
export default function SellerDashboardPage() {
    const { 
        stats, 
        chartData, 
        topProducts, 
        loading, 
        handleExportPDF, 
        handleExportExcel 
    } = useSellerDashboardViewModel();

    if (loading) {
        return (
            <div className="space-y-8 p-10 animate-in fade-in duration-500">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48 bg-white/5" />
                    <Skeleton className="h-4 w-96 bg-white/5" />
                </div>
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => <DashboardCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    const maxSold = topProducts.length > 0 ? Math.max(...topProducts.map(p => p.totalSold)) : 1;

    return (
        <div className="container mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-700 pb-20">

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary/15 ring-1 ring-primary/20">
                            <Store className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-4xl font-headline font-black tracking-tight italic">
                            Centro de Ventas
                        </h1>
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-[0.22em] font-bold pl-1 opacity-70">
                        Gestión de Publicaciones y Ventas · {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Reportes de Venta
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-headline italic">Exportar Mis Reportes</DialogTitle>
                                <DialogDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground mt-2">
                                    Auditoría de ingresos propios
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-8">
                                <Button
                                    variant="outline"
                                    className="h-20 justify-start px-6 gap-5"
                                    onClick={handleExportExcel}
                                >
                                    <div className="p-3 rounded-xl bg-green-500/10 transition-transform">
                                        <FileSpreadsheet className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-base text-white">Excel de Ventas</p>
                                        <p className="text-xs text-muted-foreground">Datos brutos filtrados por tu ID</p>
                                    </div>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-20 justify-start px-6 gap-5"
                                    onClick={handleExportPDF}
                                >
                                    <div className="p-3 rounded-xl bg-destructive/10 transition-transform">
                                        <FilePieChart className="h-6 w-6 text-destructive" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-base text-white">Informe PDF Premium</p>
                                        <p className="text-xs text-muted-foreground">Resumen visual de performance</p>
                                    </div>
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    
                    <Button asChild className="px-8">
                        <Link href="/seller/products">Gestionar Publicaciones</Link>
                    </Button>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Mis Ingresos"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    subtitle="Ventas registradas"
                    icon={DollarSign}
                    iconBg="bg-primary/20"
                    iconColor="text-primary"
                    trend={stats && stats.monthlyGrowth >= 0 ? "up" : "down"}
                    trendValue={`${Math.abs(stats?.monthlyGrowth || 0)}%`}
                />
                <KpiCard
                    title="Mis Ventas"
                    value={stats?.totalOrders || 0}
                    subtitle="Órdenes completadas"
                    icon={ShoppingBag}
                    iconBg="bg-blue-500/15"
                    iconColor="text-blue-400"
                />
                <KpiCard
                    title="Mi Catálogo"
                    value={stats?.activeProducts || 0}
                    subtitle="Juegos publicados"
                    icon={Package}
                    iconBg="bg-violet-500/15"
                    iconColor="text-violet-400"
                />

            </div>

            {/* GRÁFICO CENTRAL */}
            <div className="grid gap-5 grid-cols-1">
                <Card className="border-0 ring-1 ring-white/5 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-4 border-b border-white/5">
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl font-headline font-black italic flex items-center gap-3">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                    Ventas · Últimos 30 días
                                </CardTitle>
                                <CardDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mt-2">
                                    Evolución de tus ingresos privados
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 pt-6">
                        <div className="h-[350px] w-full px-4">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
                                        <defs>
                                            <linearGradient id="sellerGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(285 100% 70%)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(285 100% 70%)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="displayDate"
                                            stroke="transparent"
                                            tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="transparent"
                                            tick={{ fill: '#555', fontSize: 10, fontWeight: 900 }}
                                            tickLine={false}
                                            tickFormatter={(v) => `$${v}`}
                                            width={60}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-card/98 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1.5">{label}</p>
                                                            <p className="text-2xl font-black text-primary leading-none">{formatCurrency(payload[0].value as number)}</p>
                                                            <p className="text-[9px] font-bold text-muted-foreground/40 uppercase mt-2">Tus Ingresos</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="hsl(285 100% 70%)"
                                            strokeWidth={3}
                                            fill="url(#sellerGrad)"
                                            dot={{ r: 4, fill: "hsl(285 100% 70%)", strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: "#fff", stroke: "hsl(285 100% 70%)", strokeWidth: 3 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center flex-col gap-4 opacity-20">
                                    <Activity className="h-16 w-16" />
                                    <p className="font-black uppercase tracking-widest text-[10px]">Sin actividad de ventas registrada</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* RANKING PERSONAL */}
            <Card className="w-full border-0 ring-1 ring-white/5 bg-card/60 backdrop-blur-xl shadow-lg overflow-hidden">
                <CardHeader className="px-8 pt-8 pb-4 border-b border-white/5">
                    <CardTitle className="text-2xl font-headline font-black italic flex items-center gap-3">
                        <Zap className="h-6 w-6 text-primary" />
                        Tus Best-Sellers
                    </CardTitle>
                    <CardDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mt-2">
                        Ranking de tus juegos más rentables
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 py-8">
                    {topProducts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {topProducts.map((p, i) => (
                          <div key={p._id} className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors group">
                             <div className="flex items-center gap-4 mb-4">
                               <span className="text-4xl font-black italic text-primary/40 group-hover:text-primary transition-colors">#{i+1}</span>
                               <div className="flex-1 min-w-0">
                                 <p className="font-bold text-lg truncate">{p.name}</p>
                                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{p.totalSold} vendidos</p>
                               </div>
                             </div>
                             <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Ingresos</p>
                               <p className="text-xl font-black text-white">{formatCurrency(p.revenueGenerated)}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center opacity-20">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-[10px]">Aún no tenés productos rankeados</p>
                      </div>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}
