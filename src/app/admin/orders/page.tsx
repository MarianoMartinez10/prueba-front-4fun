"use client";

/**
 * Capa de Administración: Panel de Auditoría de Órdenes (Admin Orders)
 * --------------------------------------------------------------------------
 * Orquesta el seguimiento transaccional y la gestión de despachos.
 * Implementa un motor de auditoría para la generación de reportes legales (PDF/CSV)
 * y permite la mutación de estados del ciclo de vida de la orden (Logística).
 * (MVC / Page)
 */

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, Download, FileSpreadsheet, FilePieChart, ShoppingBag, Eye, RefreshCw, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderApiService } from "@/lib/services/OrderApiService";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { OrderEntity } from "@/domain/entities/OrderEntity";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    /**
     * RN - Auditoría Transaccional: Sincroniza el historial de órdenes con el API.
     */
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await OrderApiService.getAllOrders({
                page,
                limit: 5,
                status: statusFilter !== "all" ? statusFilter : undefined,
            });
            setOrders(res.orders || []);
            setTotal(res.total || 0);
            setTotalPages(res.totalPages || 1);
        } catch (error) {
            console.error("[AdminOrders] Fallo en recuperación:", error);
            toast({ title: "Fallo de Carga", description: "No se pudo sincronizar el historial transaccional.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, toast]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    /**
     * RN - Motor Logístico: Gestiona la transición de estados de la orden.
     */
    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await OrderApiService.updateStatus(orderId, newStatus);
            toast({ title: "Estado Sincronizado", description: `Orden transicionada a: ${newStatus.toUpperCase()}` });
            fetchOrders();
        } catch (error) {
            toast({ title: "Error Operativo", description: "No se pudo mutar el registro de la operación.", variant: "destructive" });
        }
    };

    const handleMarkAsPaid = async (orderId: string) => {
        try {
            await OrderApiService.markAsPaid(orderId);
            toast({
                title: "Pago Confirmado",
                description: "Orden marcada como pagada y claves digitales enviadas por correo cuando corresponda."
            });
            fetchOrders();
        } catch (error) {
            toast({
                title: "Error Operativo",
                description: "No se pudo marcar la orden como pagada.",
                variant: "destructive"
            });
        }
    };

    /**
     * RN - Localización: Filtrado en caliente sobre el set de datos hidratado.
     */
    const filteredOrders = searchTerm
        ? orders.filter(o => {
            const term = searchTerm.toLowerCase();
            return o.getDisplayId().toLowerCase().includes(term) ||
                   o.getCustomerName().toLowerCase().includes(term);
        })
        : orders;

    // ─── SUBSISTEMA DE AUDITORÍA (PDF/CSV) ───

    const handleExportPDF = () => {
        if (!filteredOrders.length) return;
        
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("4Fun Marketplace — Auditoría Transaccional", 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha del Reporte: ${new Date().toLocaleString("es-AR")}`, 14, 30);
        doc.text(`Cobertura: ${total} transacciones en el periodo`, 14, 35);
        doc.setTextColor(0);

        autoTable(doc, {
            startY: 45,
            head: [["ID TICKET", "CLIENTE / ENTIDAD", "TOTALIZACIÓN", "ESTADO", "LIQUIDACIÓN", "CRONOLOGÍA"]],
            body: filteredOrders.map(o => o.toReportRow()), 
            styles: { fontSize: 8, cellPadding: 4 },
            headStyles: { fillColor: [45, 45, 55], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 250] }
        });

        doc.save(`auditoria_ventas_${new Date().getTime()}.pdf`);
        toast({ title: "Reporte PDF Generado" });
    };

    const handleExportCSV = () => {
        if (!filteredOrders.length) return;
        const headers = ["ID", "Cliente", "Email", "Método", "Total", "Estado", "Pago", "Fecha"];
        const rows = filteredOrders.map(o => o.toReportRow());
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `matriz_ventas_${new Date().getTime()}.csv`;
        link.click();
        toast({ title: "Matriz CSV Exportada" });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-headline font-bold text-white flex items-center gap-3">
                            <ShoppingBag className="h-8 w-8 text-primary" />
                            Consola de Auditoría Fiscal
                        </CardTitle>
                        <CardDescription className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                            Seguimiento de Órdenes de Compra y Control Transaccional
                        </CardDescription>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold">
                                    <Download className="mr-2 h-4 w-4" /> EXPORTAR DOCUMENTACIÓN
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 sm:max-w-[400px]">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-headline text-white">Auditoría Operativa</DialogTitle>
                                    <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground mt-1">Formato de Salida Registral</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-3 py-6">
                                    <Button variant="outline" className="h-16 justify-between px-6 border-white/10 hover:border-primary/50" onClick={handleExportCSV}>
                                        <div className="flex items-center gap-4">
                                            <FileSpreadsheet className="h-6 w-6 text-green-500" />
                                            <p className="font-bold text-white uppercase text-xs">EXPORTAR DOCUMENTACIÓN</p>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="h-16 justify-between px-6 border-white/10 hover:border-primary/50" onClick={handleExportPDF}>
                                        <div className="flex items-center gap-4">
                                            <FilePieChart className="h-6 w-6 text-destructive" />
                                            <p className="font-bold text-white uppercase text-xs">EXPORTAR DOCUMENTACIÓN</p>
                                        </div>
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-8">
                    {/* Barra de Filtros Indexada */}
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground opacity-50" />
                            <input 
                                className="w-full bg-muted/20 border border-white/10 rounded-xl h-12 pl-12 pr-4 text-base text-white placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                placeholder="ID de Orden o Nombre del Solicitante..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-[220px] h-12 bg-muted/20 border-white/10 rounded-xl text-white font-bold text-sm uppercase tracking-widest">
                                <SelectValue placeholder="FILTRAR ESTADO" />
                            </SelectTrigger>
                            <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10 text-white">
                                <SelectItem value="all">SISTEMA COMPLETO</SelectItem>
                                <SelectItem value="PENDING">PENDIENTE</SelectItem>
                                <SelectItem value="SHIPPED">DESPACHADO</SelectItem>
                                <SelectItem value="DELIVERED">ENTREGADO</SelectItem>
                                <SelectItem value="CANCELLED">ANULADO</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="rounded-2xl border border-white/5 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Ticket ID</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Solicitante</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Estado Operativo</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Liquidez / Pago</TableHead>
                                    <TableHead className="text-right font-bold uppercase tracking-widest text-xs text-muted-foreground">Total Transado</TableHead>
                                    <TableHead className="text-right font-bold uppercase tracking-widest text-xs text-muted-foreground">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-white/5"><TableCell colSpan={6}><div className="h-14 bg-muted/10 animate-pulse rounded-lg" /></TableCell></TableRow>
                                    ))
                                ) : filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">No se hallaron coincidencias transaccionales.</TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((o) => (
                                        <TableRow key={o.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                            <TableCell className="font-mono text-sm text-muted-foreground">#{o.id.slice(-8)}</TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <p className="font-bold text-white text-base">{o.getCustomerName()}</p>
                                                    <p className="text-xs text-muted-foreground opacity-70 italic">{o.getFormattedDate()}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("text-xs font-black uppercase py-0.5 px-3", o.isDelivered() || o.isShipped() ? "border-primary/50 text-primary" : "border-muted-foreground/30 text-muted-foreground")}>
                                                    {o.getStatusLabel()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={cn("text-xs font-bold py-1 px-4 uppercase", o.isPaid ? "border-green-500/30 text-green-400 bg-green-500/5" : "border-destructive/30 text-destructive bg-destructive/5")}>
                                                    {o.isPaid ? "LIQUIDADO" : "PENDIENTE DE PAGO"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-black text-white text-lg">{o.getDisplayTotal()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary"><MoreHorizontal className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-white/10 text-white">
                                                        <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Logística de Orden</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem onClick={() => handleMarkAsPaid(o.id)} className="text-xs font-bold hover:bg-primary/10 hover:text-primary cursor-pointer">
                                                            <RefreshCw className="mr-2 h-4 w-4" /> Marcar como Pagado
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusChange(o.id, 'DELIVERED')} className="text-xs font-bold hover:bg-primary/10 hover:text-primary cursor-pointer">
                                                            <RefreshCw className="mr-2 h-4 w-4" /> Marcar como Entregado
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem onClick={() => toast({ title: "Acceso Restringido", description: "Vista de detalle en desarrollo para auditoría profunda." })} className="text-xs font-bold hover:bg-primary/10 hover:text-primary cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" /> Ver Auditoría Interna
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Navegación Paginada */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-8 text-sm font-bold text-muted-foreground uppercase tracking-widest px-2">
                             <p>Página {page} de {totalPages} ({total} totales)</p>
                             <div className="flex gap-2">
                                <Button variant="outline" size="default" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-white/10 h-10 px-6">Anterior</Button>
                                <Button variant="outline" size="default" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="border-white/10 h-10 px-6">Siguiente</Button>
                             </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
