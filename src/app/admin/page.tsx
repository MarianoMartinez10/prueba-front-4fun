"use client";

/**
 * Capa de Administración: Dashboard de Control Maestro (Admin Home)
 * --------------------------------------------------------------------------
 * Orquesta la visualización de Inteligencia de Negocios (BI) en tiempo real. 
 * Implementa indicadores clave de desempeño (KPI) para el seguimiento de 
 * ingresos, usuarios y salud del inventario. Utiliza motores de gráficos 
 * dinámicos para el análisis de tendencias transaccionales. (MVC / Page)
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DollarSign, Package, Users, AlertTriangle, TrendingUp, Activity, PieChart, BarChart3, Target } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardCardSkeleton } from "@/components/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    activeProducts: number;
    lowStockProducts: number;
    monthlyGrowth: number;
}

interface ChartItem {
    date: string;
    total: number;
    orders: number;
    displayDate?: string;
}

interface TopProduct {
    _id: string;
    name: string;
    totalSold: number;
    revenueGenerated: number;
}

export default function AdminDashboardPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<ChartItem[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

    /**
     * RN - Auditoría de Procesos: Sincroniza las métricas críticas del ecosistema.
     */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, chartRes, topRes] = await Promise.all([
                    ApiClient.getDashboardStats(),
                    ApiClient.getSalesChart(),
                    ApiClient.getTopProducts()
                ]);

                setStats(statsData);
                
                // RN - Visualización de Datos: Normalización cronológica para motores de gráficos.
                const chartArr = Array.isArray(chartRes) ? chartRes : [];
                setChartData(chartArr.map((item: any) => ({
                    ...item,
                    displayDate: new Date(item.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                })));
                
                setTopProducts(Array.isArray(topRes) ? topRes : []);
            } catch (error) {
                console.error("[DashboardAdmin] Error synchronization:", error);
                toast({
                    title: "Fallo de Analítica",
                    description: "No se pudieron sincronizar las métricas de BI del servidor.",
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    if (loading) {
        return (
            <div className="space-y-8 p-4 animate-in fade-in duration-500">
                <div className="space-y-2">
                    <Skeleton className="h-10 w-48 bg-white/5" />
                    <Skeleton className="h-4 w-96 bg-white/5" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <DashboardCardSkeleton />
                    <DashboardCardSkeleton />
                    <DashboardCardSkeleton />
                    <DashboardCardSkeleton />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4 rounded-3xl border border-white/5 bg-card/20 p-8 h-[500px]" />
                    <div className="col-span-3 rounded-3xl border border-white/5 bg-card/20 p-8 h-[500px]" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
                        <Activity className="h-10 w-10 text-primary" />
                        Consola de Inteligencia
                    </h1>
                    <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black opacity-80 pl-1">
                        Resumen Operativo y Análisis de Tracción en Tiempo Real
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Sincronización Activa</span>
                </div>
            </div>

            {/* TABLERO DE KPI (INDICADORES CLAVE) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ingresos Consolidados</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform"><DollarSign className="h-4 w-4 text-primary" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white tracking-tighter">{formatCurrency(stats?.totalRevenue || 0)}</div>
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={cn("text-[9px] font-black border-none py-0", (stats?.monthlyGrowth || 0) >= 0 ? "text-green-400 bg-green-400/10" : "text-destructive bg-destructive/10")}>
                                {(stats?.monthlyGrowth || 0) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                                {stats?.monthlyGrowth || 0}%
                            </Badge>
                            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">vs ciclo anterior</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nómina de Usuarios</CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform"><Users className="h-4 w-4 text-blue-400" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white tracking-tighter">{stats?.totalUsers || 0}</div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter mt-2">Registros de Identidad Activos</p>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Activos en Catálogo</CardTitle>
                        <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform"><Package className="h-4 w-4 text-purple-400" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white tracking-tighter">{stats?.activeProducts || 0}</div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter mt-2">Entidades Disponibles para Tracción</p>
                    </CardContent>
                </Card>

                <Card className={cn("border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden group", stats?.lowStockProducts ? "ring-1 ring-destructive/30" : "")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alerta de Existencias</CardTitle>
                        <div className={cn("p-2 rounded-lg group-hover:scale-110 transition-transform", stats?.lowStockProducts ? "bg-destructive/10" : "bg-green-500/10")}>
                            <AlertTriangle className={cn("h-4 w-4", stats?.lowStockProducts ? 'text-destructive' : 'text-green-400')} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl font-black tracking-tighter", stats?.lowStockProducts ? 'text-destructive animate-pulse' : 'text-white')}>
                            {stats?.lowStockProducts || 0}
                        </div>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter mt-2">Productos con Stock Crítico ({"<"} 5 Unid.)</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* MATRIZ DE VENTAS (HISTÓRICO) */}
                <Card className="col-span-4 border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6">
                        <CardTitle className="text-xl font-headline font-bold text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" /> Tendencia Transaccional
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                            Análisis Volumétrico de Ingresos (Últimos 30 días)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[380px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="displayDate"
                                            stroke="#555"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            stroke="#555"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-card/95 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-3xl">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                                                            <p className="text-lg font-black text-primary">{formatCurrency(payload[0].value as number)}</p>
                                                            <p className="text-[9px] font-bold text-white/50 uppercase">Ingresos Auditados</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                        />
                                        <Bar dataKey="total" fill="currentColor" radius={[6, 6, 0, 0]} className="fill-primary/60 hover:fill-primary transition-all cursor-pointer" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground uppercase text-[10px] font-black tracking-widest opacity-30 border-2 border-dashed border-white/5 rounded-3xl">
                                    Historial No Identificado en el Ciclo Actual
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* RANKING DE TRACCIÓN (TOP PRODUCTS) */}
                <Card className="col-span-3 border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6 text-center">
                        <CardTitle className="text-xl font-headline font-bold text-white flex items-center justify-center gap-2">
                            <Target className="h-5 w-5 text-primary" /> Productos de Alta Rotación
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                            Top 5 Unidades - Valorización de Tracción
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 px-6">
                        <div className="space-y-6">
                            {topProducts.length > 0 ? (
                                topProducts.map((product, idx) => (
                                    <div key={product._id} className="flex items-center group">
                                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-primary border border-white/5 mr-4 group-hover:bg-primary group-hover:text-black transition-all">
                                            #{idx + 1}
                                        </div>
                                        <div className="space-y-1 overflow-hidden flex-1">
                                            <p className="text-sm font-bold text-white leading-none truncate pr-4 group-hover:text-primary transition-colors" title={product.name}>
                                                {product.name}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter opacity-60">
                                                {product.totalSold} Despachos Confirmados
                                            </p>
                                        </div>
                                        <div className="font-black text-sm text-white">
                                            {formatCurrency(product.revenueGenerated)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                                   <PieChart className="h-12 w-12 mb-4" />
                                   <p className="text-[10px] font-black uppercase tracking-widest">Sin Data Transaccional</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
