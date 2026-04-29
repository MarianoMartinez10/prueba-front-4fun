import { useCallback, useEffect, useState } from "react";
import { DashboardApiService } from "@/lib/services/DashboardApiService";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    activeProducts: number;
    lowStockProducts: number;
    pendingAmount: number;
    monthlyGrowth: number;
}

export interface ChartItem {
    date: string;
    total: number;
    orders: number;
    displayDate?: string;
}

export interface TopProduct {
    _id: string;
    name: string;
    totalSold: number;
    revenueGenerated: number;
}

/**
 * ViewModel del Panel de Control Administrador (Dashboard)
 * --------------------------------------------------------------------------
 * Orquesta la carga en paralelo de analíticas de negocio (BI), transformación 
 * de fechas para los gráficos, y gestión de exportaciones PDF/Excel.
 */
export function useAdminDashboardViewModel() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<ChartItem[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const [statsData, chartRes, topRes] = await Promise.all([
                DashboardApiService.getStats(),
                DashboardApiService.getSalesChart(),
                DashboardApiService.getTopProducts()
            ]);

            setStats(statsData);
            
            // Adaptar fechas para el eje X
            const chartArr = Array.isArray(chartRes) ? chartRes : [];
            setChartData(chartArr.map((item: any) => ({
                ...item,
                displayDate: new Date(item.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
            })));
            
            setTopProducts(Array.isArray(topRes) ? topRes : []);
        } catch (error: any) {
            console.error("[AdminDashboardViewModel] Falla de analítica:", error);
            
            // RN - Robustez: Extraemos título y mensaje del contrato de API
            const title = error.message || "Error de Conexión";
            const description = error.data?.message || "No se pudieron sincronizar las estadísticas. Intente nuevamente.";

            toast({
                title: title,
                description: description,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    const handleExportPDF = () => {
        if (!stats) return;
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.text("4Fun Marketplace — Resumen de Ventas", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleString("es-AR")}`, 14, 30);
        doc.setTextColor(0);

        doc.setFontSize(14);
        doc.text("Desempeño Financiero", 14, 45);
        autoTable(doc, {
            startY: 50,
            head: [["KPI", "MÉTRICA ACTUAL", "INDICADOR"]],
            body: [
                ["Ingresos Generales", formatCurrency(stats.totalRevenue), "Auditado"],
                ["Total de Órdenes", stats.totalOrders.toString(), "Operativo"],
                ["Crecimiento Mensual", `${stats.monthlyGrowth}%`, stats.monthlyGrowth >= 0 ? "Positivo" : "Requiere Acción"],
                ["Total de Usuarios", stats.totalUsers.toString(), "Activos"]
            ],
            theme: 'striped',
            headStyles: { fillColor: [45, 45, 55] }
        });

        doc.setFontSize(14);
        doc.text("Top 5 Juegos Más Vendidos", 14, (doc as any).lastAutoTable.finalY + 15);
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

        doc.save(`reporte_ventas_${new Date().getTime()}.pdf`);
        toast({ title: "PDF Generado", description: "Tu reporte ya se descargó." });
    };

    const handleExportExcel = () => {
        if (!stats) return;

        const summaryData = [
            { "CATEGORÍA": "MÉTRICA GLOBAL", "VALOR": "" },
            { "CATEGORÍA": "Ingresos Generales", "VALOR": stats.totalRevenue },
            { "CATEGORÍA": "Órdenes Totales", "VALOR": stats.totalOrders },
            { "CATEGORÍA": "Usuarios Registrados", "VALOR": stats.totalUsers },
            { "CATEGORÍA": "Juegos Activos", "VALOR": stats.activeProducts },
            { "CATEGORÍA": "Crecimiento %", "VALOR": stats.monthlyGrowth },
            { "CATEGORÍA": "", "VALOR": "" },
            { "CATEGORÍA": "TOP JUEGOS", "VALOR": "" },
            ...topProducts.map((p, i) => ({
                "CATEGORÍA": `#${i + 1} ${p.name}`,
                "VALOR": p.revenueGenerated
            }))
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws, "Panel Admin");
        XLSX.writeFile(wb, `matriz_ventas_${new Date().getTime()}.xlsx`);
        toast({ title: "Excel Exportado", description: "Tu planilla ya se descargó." });
    };

    return {
        stats,
        chartData,
        topProducts,
        loading,
        handleExportPDF,
        handleExportExcel
    };
}
