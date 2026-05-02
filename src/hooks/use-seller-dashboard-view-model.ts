import { useCallback, useEffect, useState } from "react";
import { DashboardApiService } from "@/lib/services/DashboardApiService";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { DashboardStats, ChartItem, TopProduct } from "./use-admin-dashboard-view-model";

/**
 * ViewModel del Panel de Vendedor
 * --------------------------------------------------------------------------
 * Orquesta la carga de analíticas privadas del vendedor activo.
 * El backend filtra automáticamente por sellerId gracias al JWT.
 */
export function useSellerDashboardViewModel() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartData, setChartData] = useState<ChartItem[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [statsData, chartRes, topRes] = await Promise.all([
                DashboardApiService.getStats(),
                DashboardApiService.getSalesChart(),
                DashboardApiService.getTopProducts()
            ]);

            setStats(statsData);
            
            const chartArr = Array.isArray(chartRes) ? chartRes : [];
            setChartData(chartArr.map((item: any) => ({
                ...item,
                displayDate: new Date(item.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
            })));
            
            setTopProducts(Array.isArray(topRes) ? topRes : []);
        } catch (error) {
            console.error("[SellerDashboardViewModel] Falla de carga:", error);
            toast({
                title: "Error en el Dashboard",
                description: "No pudimos recuperar tus métricas de venta.",
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
        doc.text("Reporte de Ventas — 4Fun Seller", 14, 22);
        doc.setFontSize(10);
        doc.text(`Generado: ${new Date().toLocaleString("es-AR")}`, 14, 30);

        doc.setFontSize(14);
        doc.text("Resumen de Performance", 14, 45);
        autoTable(doc, {
            startY: 50,
            head: [["KPI", "VALOR"]],
            body: [
                ["Ingresos Propios", formatCurrency(stats.totalRevenue)],
                ["Ventas Realizadas", stats.totalOrders.toString()],
                ["Crecimiento del Mes", `${stats.monthlyGrowth}%`],
                ["Productos en Catálogo", stats.activeProducts.toString()]
            ],
            theme: 'grid',
            headStyles: { fillColor: [142, 68, 173] } // Color púrpura Seller
        });

        doc.text("Mis Juegos Más Vendidos", 14, (doc as any).lastAutoTable.finalY + 15);
        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [["POS", "JUEGO", "UNIDADES", "INGRESOS"]],
            body: topProducts.map((p, i) => [
                (i + 1).toString(),
                p.name,
                p.totalSold.toString(),
                formatCurrency(p.revenueGenerated)
            ]),
            headStyles: { fillColor: [52, 73, 94] }
        });

        doc.save(`mi_reporte_${new Date().getTime()}.pdf`);
        toast({ title: "Reporte PDF Generado" });
    };

    const handleExportExcel = () => {
        if (!stats) return;
        const summaryData = [
            { "ITEM": "INGRESOS TOTALES", "MONTO": stats.totalRevenue },
            { "ITEM": "ORDENES", "MONTO": stats.totalOrders },
            { "ITEM": "JUEGOS ACTIVOS", "MONTO": stats.activeProducts },
            { "ITEM": "", "MONTO": "" },
            ...topProducts.map(p => ({ "ITEM": p.name, "MONTO": p.revenueGenerated }))
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws, "Mis Estadísticas");
        XLSX.writeFile(wb, `ventas_seller_${new Date().getTime()}.xlsx`);
    };

    return {
        stats,
        chartData,
        topProducts,
        loading,
        handleExportPDF,
        handleExportExcel,
        refresh: fetchData
    };
}
