"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderStatus } from "@/lib/types";
import { MoreHorizontal, Search, Loader2, ChevronLeft, ChevronRight, Download, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// ── POO: ViewModel encapsula toda la lógica de presentación de órdenes ────────
import { OrderViewModel } from "@/lib/viewmodels";
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
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// STATUS_LABELS y getStatusBadge eliminados — encapsulados en OrderViewModel

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiClient.getAllOrders({
                page,
                limit: 15,
                status: statusFilter !== "all" ? statusFilter : undefined,
            });
            setOrders(res.orders);
            setTotal(res.total);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({ title: "Error", description: "No se pudieron cargar las órdenes.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, toast]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Reset page on filter change
    useEffect(() => {
        setPage(1);
    }, [statusFilter]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await ApiClient.updateOrderStatus(orderId, newStatus);
            // ── POO: OrderViewModel.getStatusLabel() — Encapsulamiento ─────────
            const tempVm = new OrderViewModel({ id: orderId, status: newStatus as OrderStatus } as any);
            toast({ title: "Estado actualizado", description: `Orden actualizada a "${tempVm.getStatusLabel()}".` });
            fetchOrders();
        } catch (error) {
            toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
        }
    };

    // ── POO: Instanciamos ViewModels — getCustomerName/Email eliminados ────────
    // HERENCIA: cada OrderViewModel hereda getSummaryLine() de BaseViewModel
    const orderViewModels = orders.map(o => new OrderViewModel(o));

    // Client-side search filter usando el ViewModel (Encapsulamiento)
    const filteredVMs = searchTerm
        ? orderViewModels.filter(vm => {
            const term = searchTerm.toLowerCase();
            return (
                vm.getDisplayId().toLowerCase().includes(term) ||
                vm.getCustomerName().toLowerCase().includes(term) ||
                vm.getCustomerEmail().toLowerCase().includes(term)
            );
        })
        : orderViewModels;

    // ── POO: toReportRow() — Abstracción: el formato del reporte está en el ViewModel
    const handleExportCSV = () => {
        if (!filteredVMs.length) {
            toast({ title: "Atención", description: "No hay órdenes para exportar.", variant: "destructive" });
            return;
        }
        const headers = ["ID Orden", "Cliente", "Email", "Método", "Total", "Estado", "Pago", "Fecha"];
        const rows = filteredVMs.map(vm => vm.toReportRow()); // ← Abstracción pura
        const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_ordenes_4fun_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = () => {
        if (!filteredVMs.length) {
            toast({ title: "Atención", description: "No hay órdenes para exportar.", variant: "destructive" });
            return;
        }
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Reporte de Órdenes — 4Fun", 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`Generado: ${new Date().toLocaleDateString("es-AR")}`, 14, 27);
        doc.setTextColor(0);
        autoTable(doc, {
            startY: 32,
            head: [["ID Orden", "Cliente", "Email", "Total", "Estado", "Pago", "Fecha"]],
            body: filteredVMs.map(vm => vm.toReportRow()), // ← Abstracción pura
            styles: { fontSize: 8 },
            headStyles: { fillColor: [30, 30, 40] },
        });
        doc.save(`reporte_ordenes_4fun_${new Date().toISOString().split("T")[0]}.pdf`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline">Gestión de Órdenes</h1>
                <p className="text-muted-foreground">Revisa y actualiza el estado de los pedidos.</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por ID o cliente..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="processing">Procesando</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
                <div className="ml-auto flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                disabled={loading || filteredVMs.length === 0}
                            >
                                <Download className="h-4 w-4" /> Descargar datos
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-sm">
                            <DialogHeader>
                                <DialogTitle>Descargar en</DialogTitle>
                                <DialogDescription>
                                    Seleccione el formato preferido para exportar las órdenes.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex flex-col gap-3 py-4">
                                <Button variant="outline" className="flex items-center gap-2 justify-center w-full" onClick={handleExportCSV}>
                                    <Download className="h-4 w-4" /> Formato CSV (Excel)
                                </Button>
                                <Button variant="outline" className="flex items-center gap-2 justify-center w-full" onClick={handleExportPDF}>
                                    <FileText className="h-4 w-4" /> Formato PDF Documento
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Órdenes</CardTitle>
                    <CardDescription>Total: {total} órdenes.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredVMs.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            No se encontraron órdenes.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Orden</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Pago</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* ── POO: iteramos ViewModels, no datos crudos ─────────────────── */}
                                {filteredVMs.map((vm) => {
                                    const payStatus = vm.getPaymentStatus(); // Encapsulamiento
                                    return (
                                    <TableRow key={vm.getDisplayId()}>
                                        {/* ABSTRACCIÓN: getDisplayId() oculta la lógica del UUID */}
                                        <TableCell className="font-mono text-xs">{vm.getDisplayId()}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                {/* ENCAPSULAMIENTO: nombre y email resueltos en el ViewModel */}
                                                <span className="text-sm">{vm.getCustomerName()}</span>
                                                <span className="text-xs text-muted-foreground">{vm.getCustomerEmail()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {/* POLIMORFISMO: getStatusBadgeVariant/Color encapsulados en OrderViewModel */}
                                            <Badge variant={vm.getStatusBadgeVariant()} className={vm.getStatusBadgeColor()}>
                                                {vm.getStatusLabel()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={payStatus.color}>{payStatus.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{vm.getFormattedDate()}</TableCell>
                                        {/* POLIMORFISMO: toDisplayPrice() diferente a ProductViewModel */}
                                        <TableCell className="text-right font-bold">{vm.toDisplayPrice()}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Cambiar estado</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusChange(vm._data.id, 'processing')}>
                                                        Procesando
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(vm._data.id, 'shipped')}>
                                                        Enviado
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(vm._data.id, 'delivered')}>
                                                        Entregado
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleStatusChange(vm._data.id, 'cancelled')}
                                                    >
                                                        Cancelar Orden
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                                Página {page} de {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Siguiente <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
