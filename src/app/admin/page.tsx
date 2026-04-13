"use client";

/**
 * Capa de Administración: Dashboard de Control Maestro (Admin Home)
 * --------------------------------------------------------------------------
 * Orquesta la visualización de Inteligencia de Negocios (BI) en tiempo real. 
 * Implementa indicadores clave de desempeño (KPI) para el seguimiento de 
 * ingresos, usuarios y salud del inventario. Utiliza motores de gráficos 
 * dinámicos para el análisis de tendencias. (MVC / Page)
 */

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { DollarSign, Package, Users, AlertTriangle, Activity, PieChart, BarChart3, Target } from "lucide-react";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DashboardCardSkeleton } from "@/components/ui/skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet, FilePieChart } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";

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
    const fetchData = useCallback(async () => {
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
    }, [toast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── SUBSISTEMA DE AUDITORÍA MACRO (Regla 5 TFI) ──

    const handleExportPDF = () => {
        if (!stats) return;
        const doc = new jsPDF();
        
        // Encabezado Institucional
        doc.setFontSize(22);
        doc.text("4Fun Marketplace — Informe de Auditoría General", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleString("es-AR")}`, 14, 30);
        doc.setTextColor(0);

        // Bloque 1: KPIs Financieros
        doc.setFontSize(14);
        doc.text("Resumen de Desempeño Financiero", 14, 45);
        autoTable(doc, {
            startY: 50,
            head: [["KPI", "MÉTRICA ACTUAL", "INDICADOR"]],
            body: [
                ["Ingresos Totales", formatCurrency(stats.totalRevenue), "Auditado"],
                ["Total Transacciones", stats.totalOrders.toString(), "Operativo"],
                ["Crecimiento Mensual", `${stats.monthlyGrowth}%`, stats.monthlyGrowth >= 0 ? "Positivo" : "Requiere Revisión"],
                ["Usuarios Base", stats.totalUsers.toString(), "Activos"]
            ],
            theme: 'striped',
            headStyles: { fillColor: [45, 45, 55] }
        });

        // Bloque 2: Productos Estrella
        doc.setFontSize(14);
        doc.text("Top 5 Productos de Alta Rotación", 14, (doc as any).lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [["POS", "PRODUCTO", "UNIDADES VENDIDAS", "RECAUDACIÓN"]],
            body: topProducts.map((p, i) => [
                (i + 1).toString(),
                p.name,
                p.totalSold.toString(),
                formatCurrency(p.revenueGenerated)
            ]),
            headStyles: { fillColor: [70, 70, 80] }
        });

        doc.save(`informe_general_${new Date().getTime()}.pdf`);
        toast({ title: "Informe PDF Generado", description: "El reporte de auditoría macro ha sido descargado." });
    };

    const handleExportExcel = () => {
        if (!stats) return;

        // Estructuración de Matriz para Contabilidad
        const summaryData = [
            { "CATEGORÍA": "MÉTRICA GLOBAL", "VALOR": "" },
            { "CATEGORÍA": "Ingresos Totales", "VALOR": stats.totalRevenue },
            { "CATEGORÍA": "Órdenes Totales", "VALOR": stats.totalOrders },
            { "CATEGORÍA": "Usuarios Registrados", "VALOR": stats.totalUsers },
            { "CATEGORÍA": "Productos Activos", "VALOR": stats.activeProducts },
            { "CATEGORÍA": "Crecimiento %", "VALOR": stats.monthlyGrowth },
            { "CATEGORÍA": "", "VALOR": "" },
            { "CATEGORÍA": "TOP PRODUCTOS", "VALOR": "" },
            ...topProducts.map((p, i) => ({
                "CATEGORÍA": `#${i + 1} ${p.name}`,
                "VALOR": p.revenueGenerated
            }))
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws, "Auditoría General");
        XLSX.writeFile(wb, `auditoria_macro_${new Date().getTime()}.xlsx`);
        toast({ title: "Matriz Excel Exportada", description: "Se ha generado la hoja de cálculo de auditoría." });
    };

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
                        Panel de Administración
                    </h1>
                    <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs lg:text-sm font-black opacity-80 pl-1">
                        Resumen de ventas y actividad
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold">
                                <Download className="mr-2 h-4 w-4" /> EXPORTAR AUDITORÍA
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-headline text-white">Auditoría Estratégica</DialogTitle>
                                <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground mt-1">Consolidado General de Negocio</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-3 py-6">
                                <Button variant="outline" className="h-16 justify-between px-6 border-white/10 hover:border-primary/50" onClick={handleExportExcel}>
                                    <div className="flex items-center gap-4">
                                        <FileSpreadsheet className="h-6 w-6 text-green-500" />
                                        <p className="font-bold text-white uppercase text-xs">Excel / Matriz Contable</p>
                                    </div>
                                </Button>
                                <Button variant="outline" className="h-16 justify-between px-6 border-white/10 hover:border-primary/50" onClick={handleExportPDF}>
                                    <div className="flex items-center gap-4">
                                        <FilePieChart className="h-6 w-6 text-destructive" />
                                        <p className="font-bold text-white uppercase text-xs">PDF Informe Ejecutivo</p>
                                    </div>
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Actualizado en vivo</span>
                    </div>
                </div>
            </div>

            {/* TABLERO DE KPI (INDICADORES CLAVE) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs lg:text-sm font-black uppercase tracking-widest text-muted-foreground">Ingresos</CardTitle>
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform"><DollarSign className="h-4 w-4 text-primary" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl lg:text-4xl font-bold text-white tracking-tighter">{formatCurrency(stats?.totalRevenue || 0)}</div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs lg:text-sm font-bold uppercase tracking-widest text-muted-foreground">Usuarios</CardTitle>
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform"><Users className="h-4 w-4 text-blue-400" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl lg:text-4xl font-bold text-white tracking-tighter">{stats?.totalUsers || 0}</div>
                        <p className="text-[9px] lg:text-xs text-muted-foreground font-bold tracking-tighter mt-2">Clientes activos</p>
                    </CardContent>
                </Card>

                <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs lg:text-sm font-bold uppercase tracking-widest text-muted-foreground">Productos</CardTitle>
                        <div className="p-2 bg-purple-500/10 rounded-lg group-hover:scale-110 transition-transform"><Package className="h-4 w-4 text-purple-400" /></div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl lg:text-4xl font-bold text-white tracking-tighter">{stats?.activeProducts || 0}</div>
                        <p className="text-[9px] lg:text-xs text-muted-foreground font-bold tracking-tighter mt-2">Disponibles</p>
                    </CardContent>
                </Card>

                <Card className={cn("border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden group", stats?.lowStockProducts ? "ring-1 ring-destructive/30" : "")}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs lg:text-sm font-bold uppercase tracking-widest text-muted-foreground">Stock bajo</CardTitle>
                        <div className={cn("p-2 rounded-lg group-hover:scale-110 transition-transform", stats?.lowStockProducts ? "bg-destructive/10" : "bg-green-500/10")}>
                            <AlertTriangle className={cn("h-4 w-4", stats?.lowStockProducts ? 'text-destructive' : 'text-green-400')} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("text-3xl lg:text-4xl font-black tracking-tighter", stats?.lowStockProducts ? 'text-destructive animate-pulse' : 'text-white')}>
                            {stats?.lowStockProducts || 0}
                        </div>
                        <p className="text-[9px] lg:text-xs text-muted-foreground font-bold tracking-tighter mt-2">Menos de 5 unidades</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                {/* MATRIZ DE VENTAS (HISTÓRICO) */}
                <Card className="col-span-4 border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6">
                        <CardTitle className="text-xl font-headline font-bold text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" /> Ventas de los ultimos 30 dias
                        </CardTitle>
                        <CardDescription className="text-xs font-bold tracking-wide text-muted-foreground">
                            Evolucion diaria de ingresos
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
                                                            <p className="text-[9px] font-bold text-white/50 uppercase">Ingresos del dia</p>
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
                                    Todavia no hay ventas en este periodo
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* RANKING DE TRACCIÓN (TOP PRODUCTS) */}
                <Card className="col-span-3 border-none bg-card/40 backdrop-blur-md shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6 text-center">
                        <CardTitle className="text-xl font-headline font-bold text-white flex items-center justify-center gap-2">
                            <Target className="h-5 w-5 text-primary" /> Juegos mas vendidos
                        </CardTitle>
                        <CardDescription className="text-xs font-bold tracking-wide text-muted-foreground">
                            Top 5 por cantidad de ventas
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
                                            <p className="text-[10px] text-muted-foreground font-black tracking-tighter opacity-60">
                                                {product.totalSold} ventas
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
                                   <p className="text-[10px] font-black uppercase tracking-widest">Sin ventas todavia</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
