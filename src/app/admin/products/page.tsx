"use client";

/**
 * Capa de Administración: Gestión de Inventario Maestro (Admin Products)
 * --------------------------------------------------------------------------
 * Orquesta la administración centralizada del catálogo global. 
 * Implementa motores de búsqueda indexada y un subsistema de auditoría 
 * mediante la generación de reportes técnicos (PDF/CSV). 
 * Garantiza la trazabilidad del stock y la integridad de precios. (MVC / Page)
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeletons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Search, Download, Plus, Pencil, Trash2, Package, FileSpreadsheet, FilePieChart, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import type { Product } from "@/lib/schemas";
import type { Meta } from "@/lib/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProductViewModel } from "@/lib/viewmodels";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AdminProductsPage() {
  const { loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { toast } = useToast();

  /**
   * RN - Auditoría de Catálogo: Sincroniza el listado maestro con filtros activos.
   */
  const loadProducts = async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      const response = await ApiClient.getProducts({ page, limit: 10, sort: 'order', search: searchQuery });
      setProducts(Array.isArray(response.products) ? response.products : []);
      setMeta(response.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      toast({ variant: "destructive", title: "Fallo de Sincronía", description: "No se pudo recuperar el inventario del servidor." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) loadProducts(1, debouncedSearch);
  }, [authLoading, debouncedSearch]);

  /**
   * RN - Moderación: Ejecuta la baja lógica del registro.
   */
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Confirma el cese de comercialización y baja lógica del producto: ${name}?`)) return;
    try {
      await ApiClient.deleteProduct(id);
      toast({ title: "Baja Sincronizada", description: "El producto ha sido marcado como inactivo en el catálogo." });
      loadProducts(meta.page, search);
    } catch (error) {
      toast({ variant: "destructive", title: "Error en Operación", description: "No se pudo procesar la baja técnica." });
    }
  };

  // ─── SUBSISTEMA DE AUDITORÍA Y REPORTES ───

  /**
   * RN - Generación de Documentación (PDF): Orquesta la creación de un informe
   * de stock con validez administrativa para el TFI.
   */
  const handleExportPDF = () => {
    if (!products.length) return;
    
    // MVVM: Transformación a ViewModels para lógica de presentación homogénea.
    const vms = products.map(p => new ProductViewModel(p));
    
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("4Fun Marketplace — Auditoría de Inventario", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha de Corte: ${new Date().toLocaleString("es-AR")}`, 14, 30);
    doc.text(`Cobertura: ${meta.total} ítems registrados en catálogo`, 14, 35);
    doc.setTextColor(0);

    autoTable(doc, {
      startY: 45,
      head: [["IDENTIDAD", "ESPECIFICACIÓN", "PLATAFORMA", "VALORIZACIÓN", "EXISTENCIA", "TIPO"]],
      body: vms.map(vm => vm.toReportRow()),
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [45, 45, 55], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: { 3: { halign: "right" }, 4: { halign: "center" } },
      alternateRowStyles: { fillColor: [245, 245, 250] }
    });

    doc.save(`auditoria_stock_${new Date().getTime()}.pdf`);
    toast({ title: "Reporte Generado", description: "Documento PDF exportado correctamente." });
  };

  const handleExportCSV = () => {
    if (!products.length) return;
    const vms = products.map(p => new ProductViewModel(p));
    const headers = ["ID", "Nombre", "Plataforma", "Precio Final", "Stock", "Tipo"];
    const rows = vms.map(vm => vm.toReportRow());
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `matriz_inventario_${new Date().getTime()}.csv`;
    link.click();
    toast({ title: "Matriz Exportada", description: "Archivo CSV listo para análisis externo." });
  };

  if (loading && !products.length) return <div className="p-8"><TableSkeleton rows={10} columns={5} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold text-white flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              Gestión de Catálogo Maestro
            </CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
              Control de Existencias, Valorización y Auditoría Técnica
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold">
                  <Download className="mr-2 h-4 w-4" /> REPORTE OPERATIVO
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-headline text-white">Exportación de Datos</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                    Seleccione el formato de salida para la auditoría de stock actual.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 py-6">
                  <Button variant="outline" className="h-16 justify-between px-6 border-white/10 hover:border-primary/50 group" onClick={handleExportCSV}>
                    <div className="flex items-center gap-4">
                      <FileSpreadsheet className="h-6 w-6 text-green-500" />
                      <div className="text-left">
                        <p className="font-bold text-white uppercase text-xs">Microsoft Excel (CSV)</p>
                        <p className="text-[10px] text-muted-foreground">Datos crudos para análisis en planilla.</p>
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-16 justify-between px-6 border-white/10 hover:border-primary/50 group" onClick={handleExportPDF}>
                    <div className="flex items-center gap-4">
                      <FilePieChart className="h-6 w-6 text-destructive" />
                      <div className="text-left">
                        <p className="font-bold text-white uppercase text-xs">Documento Portable (PDF)</p>
                        <p className="text-[10px] text-muted-foreground">Formato oficial para auditoría técnica.</p>
                      </div>
                    </div>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button asChild className="font-black tracking-tighter">
              <Link href="/admin/products/new"><Plus className="mr-2 h-5 w-5" /> PUBLICAR NUEVO</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {/* Barra de Búsqueda de Inventario */}
          <div className="relative mb-8 max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground opacity-50" />
            <input
              className="w-full bg-muted/20 border border-white/10 rounded-xl h-12 pl-12 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              placeholder="Buscar por Título o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-white/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Entidad</TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Valorización</TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Existencias</TableHead>
                  <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-right">Acciones Técnicas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-white/5">
                      <TableCell colSpan={4}><div className="h-12 bg-muted/20 animate-pulse rounded-lg" /></TableCell>
                    </TableRow>
                  ))
                ) : products.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">No se hallaron registros en la base de datos.</TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => {
                    const hasStock = p.stock > 0;
                    return (
                      <TableRow key={p.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-bold text-white text-sm group-hover:text-primary transition-colors">{p.name}</p>
                            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter opacity-70">
                              {typeof p.platform === 'object' ? p.platform.name : p.platform} · {p.type}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-black text-white">{formatCurrency(p.finalPrice ?? p.price)}</div>
                          {(p.discountPercentage ?? 0) > 0 && <Badge variant="outline" className="text-[8px] py-0 border-destructive/30 text-destructive mt-1 font-black">-{p.discountPercentage}%</Badge>}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] font-bold py-0.5 px-3",
                              hasStock ? "border-green-500/30 text-green-400 bg-green-500/5" : "border-destructive/30 text-destructive bg-destructive/5 animate-pulse"
                            )}
                          >
                            {hasStock ? `${p.stock} UNIDADES` : "STOCK AGOTADO"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" asChild className="hover:bg-primary/20 hover:text-primary">
                              <Link href={`/admin/products/${p.id}`}><Pencil className="h-4 w-4" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id, p.name)} className="hover:bg-destructive/20 hover:text-destructive" title="Dar de baja">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Paginación Operativa */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">
              <p>Página {meta.page} de {meta.totalPages} ({meta.total} totales)</p>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" disabled={meta.page === 1} onClick={() => loadProducts(meta.page - 1, search)} className="border-white/10">Anterior</Button>
                 <Button variant="outline" size="sm" disabled={meta.page === meta.totalPages} onClick={() => loadProducts(meta.page + 1, search)} className="border-white/10">Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}