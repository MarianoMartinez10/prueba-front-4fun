"use client";

/**
 * Capa de Gestión Comercial: Inventario del Vendedor (Seller Products)
 * --------------------------------------------------------------------------
 * Permite al vendedor gestionar su propio catálogo de forma segura.
 * Implementa auditoría de stock mediante reportes segmentados.
 * (MVC / View)
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ProductApiService } from "@/lib/services/ProductApiService";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeletons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Search, Download, Plus, Pencil, Trash2, Package, FileSpreadsheet, FilePieChart, LayoutDashboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import type { ProductEntity } from "@/domain/entities/ProductEntity";
import type { Meta } from "@/lib/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Badge } from "@/components/ui/badge";

export default function SellerProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<ProductEntity[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { toast } = useToast();

  /**
   * RN - Filtro de Autoría: Recupera únicamente los productos creados por este vendedor.
   */
  const loadProducts = useCallback(async (page = 1, searchQuery = "") => {
    try {
      setLoading(true);
      const { products: fetchedProducts, meta: fetchedMeta } = await ProductApiService.getSellerProducts({ page, limit: 10, search: searchQuery });
      setProducts(fetchedProducts);
      setMeta(fetchedMeta);
    } catch (error) {
      toast({ variant: "destructive", title: "Fallo de Carga", description: "No se pudieron obtener tus productos." });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!authLoading && user) loadProducts(1, debouncedSearch);
  }, [authLoading, user, debouncedSearch, loadProducts]);

  /**
   * RN - Gestión de Ciclo de Vida: El vendedor elimina lógicamente sus propios productos.
   */
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de quitar "${name}" de la tienda? Esta acción es irreversible.`)) return;
    try {
      await ProductApiService.delete(id);
      toast({ title: "Producto Eliminado", description: "El catálogo se ha actualizado correctamente." });
      loadProducts(meta.page, search);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "No posees permisos para eliminar este activo." });
    }
  };

  // ─── SUBSISTEMA DE REPORTES (SEGMENTADO) ───
  
  const handleExportPDF = () => {
    if (!products.length) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text(`Inventario Privado: ${user?.sellerProfile?.storeName}`, 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Fecha del Reporte: ${new Date().toLocaleString("es-AR")}`, 14, 30);
    
    autoTable(doc, {
      startY: 40,
      head: [["ID", "PRODUCTO", "PLATAFORMA", "PRECIO", "STOCK", "TIPO"]],
      body: products.map(p => p.toReportRow()),
      headStyles: { fillColor: [142, 68, 173] }
    });

    doc.save(`mis_productos_${new Date().getTime()}.pdf`);
    toast({ title: "PDF Generado" });
  };

  if (loading && !products.length) return <div className="p-10"><TableSkeleton rows={8} columns={4} /></div>;

  return (
    <div className="container mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
      
      {/* HEADER DE GESTIÓN */}
      <Card className="border-none bg-card/40 backdrop-blur-3xl shadow-2xl rounded-[3rem] overflow-hidden">
        <CardHeader className="p-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5">
          <div className="space-y-1.5 text-center md:text-left">
            <h1 className="text-4xl font-headline font-black italic flex items-center gap-3 justify-center md:justify-start">
              <Package className="h-8 w-8 text-primary" /> Mis Publicaciones
            </h1>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest opacity-60">
              Gestioná tus artículos de {user?.sellerProfile?.storeName}
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" asChild>
               <Link href="/seller/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" /> Panel</Link>
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Exportar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-2xl border-white/10 p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-headline italic">Exportar Mis Publicaciones</DialogTitle>
                  <DialogDescription className="text-xs font-black uppercase tracking-widest opacity-60 mt-2">
                    Resumen técnico de artículos
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-8">
                  <Button variant="outline" className="h-20 justify-start px-6 gap-5" onClick={handleExportPDF}>
                    <FilePieChart className="h-6 w-6 text-destructive" />
                    <div className="text-left">
                      <p className="font-bold text-white">Descargar PDF</p>
                      <p className="text-xs text-muted-foreground">Formato oficial 4Fun</p>
                    </div>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button asChild className="px-8">
              <Link href="/seller/products/new"><Plus className="mr-2 h-5 w-5" /> Crear Publicación</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-10">
          {/* BUSCADOR */}
          <div className="relative mb-10 max-w-md">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground opacity-30" />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              placeholder="Buscar entre mis publicaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="rounded-[2rem] border border-white/5 overflow-hidden ring-1 ring-white/5 bg-black/20">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="hover:bg-transparent border-white/5">
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground p-6">Info del Juego</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Valorización</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">Estado Stock</TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] text-muted-foreground text-right p-6">Gestión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="h-40 text-center text-muted-foreground italic">
                         No tenés publicaciones activas aún. ¡Empezá a vender ahora!
                     </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => {
                    const stockStatus = p.getStockStatus();
                    return (
                      <TableRow key={p.getId()} className="border-white/5 hover:bg-white/5 transition-colors group">
                        <TableCell className="p-6">
                           <div className="flex items-center gap-4">
                             <div className="h-12 w-12 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                               <img src={p.getImageUrl()} alt={p.getDisplayName()} className="h-full w-full object-cover" />
                             </div>
                             <div>
                               <p className="font-bold text-white group-hover:text-primary transition-colors">{p.getDisplayName()}</p>
                               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter opacity-40">
                                 {p.getPlatformName()} · {p.type}
                               </p>
                             </div>
                           </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-black text-white">{p.getDisplayPrice()}</div>
                          {p.isOnDiscount() && <Badge className="bg-green-500/10 text-green-400 border-none text-[8px] font-black mt-1">OFERTA {p.getDiscountBadge()}</Badge>}
                        </TableCell>
                        <TableCell>
                           <Badge className={cn(
                             "text-[9px] font-black tracking-widest px-3 py-1 rounded-lg border-none",
                             stockStatus === 'available' ? "bg-green-500/10 text-green-400" :
                             stockStatus === 'low' ? "bg-yellow-500/10 text-yellow-500 animate-pulse" :
                             "bg-destructive/10 text-destructive"
                           )}>
                             {stockStatus === 'available' ? `${p.stock} EN STOCK` : stockStatus === 'low' ? 'STOCK BAJO' : 'SIN STOCK'}
                           </Badge>
                        </TableCell>
                        <TableCell className="text-right p-6">
                           <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                             <Button variant="ghost" size="icon" asChild>
                               <Link href={`/seller/products/${p.getId()}`}><Pencil className="h-4 w-4" /></Link>
                             </Button>
                             <Button variant="ghost" size="icon" onClick={() => handleDelete(p.getId(), p.getDisplayName())}>
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
          
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-10 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
              <p>Página {meta.page} de {meta.totalPages}</p>
              <div className="flex gap-2">
                 <Button variant="outline" size="sm" disabled={meta.page === 1} onClick={() => loadProducts(meta.page - 1, search)} className="border-white/10 rounded-xl">Anterior</Button>
                 <Button variant="outline" size="sm" disabled={meta.page === meta.totalPages} onClick={() => loadProducts(meta.page + 1, search)} className="border-white/10 rounded-xl">Siguiente</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
