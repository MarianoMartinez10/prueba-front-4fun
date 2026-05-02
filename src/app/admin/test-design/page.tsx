"use client";

import React from "react";
import { 
    Card, 
    CardContent, 
    CardHeader, 
    CardTitle, 
    CardDescription,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    Gamepad2, 
    ShieldCheck, 
    Zap, 
    Trophy,
    ArrowRight,
    Download,
    Share2,
    Star
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * RN - Componente de Auditoría Visual (Design Lab)
 * --------------------------------------------------------------------------
 * Esta página actúa como un Sandbox para validar la nueva tipografía (Outfit + Inter)
 * y el sistema de diseño premium del marketplace. Permite evaluar jerarquías,
 * legibilidad y estética gaming sin afectar datos reales.
 */

export default function DesignTestPage() {
    return (
        <div className="min-h-screen bg-background p-8 md:p-16 space-y-16 animate-in fade-in duration-1000">
            
            {/* HEROC SECCIÓN: Validación de Tipografía de Títulos (Outfit) */}
            <header className="max-w-4xl space-y-6">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 text-xs font-black uppercase tracking-[0.3em]">
                    Design System v2.0
                </Badge>
                <h1 className="text-6xl md:text-8xl font-headline font-black text-white leading-none tracking-tight">
                    DOMINÁ <span className="text-primary italic">EL JUEGO</span> CON ESTILO.
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground font-sans leading-relaxed max-w-2xl">
                    Experimentá una identidad visual unificada con la legibilidad cristalina de <span className="text-white font-bold">Inter</span>. 
                    Diseñado para ofrecer una experiencia gamer coherente y profesional.
                </p>
                <div className="flex gap-4 pt-4">
                    <Button size="lg" className="h-14 px-8 rounded-full text-base font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                        Explorar Ahora <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-base font-black uppercase tracking-widest border-white/10 hover:bg-white/5">
                        Leer Documentación
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* CARD PREMIUM: Validación de Elevación y Gradientes */}
                <Card className="lg:col-span-2 border-none bg-gradient-to-br from-primary/10 via-card/50 to-background shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Gamepad2 size={120} />
                    </div>
                    <CardHeader className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-black text-yellow-500 uppercase tracking-widest">Oferta Relámpago</span>
                        </div>
                        <CardTitle className="text-4xl font-headline font-black text-white mb-2">Elden Ring: Shadow of the Erdtree</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground italic">"Un viaje épico que redefine los límites de la fantasía oscura."</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                        <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                        <div className="flex items-center gap-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Precio Sugerido</p>
                                <p className="text-3xl font-black text-white">$45.999,00</p>
                            </div>
                            <Badge className="h-12 px-4 text-xl font-black bg-green-500 text-white">-35%</Badge>
                        </div>
                    </CardContent>
                    <CardFooter className="p-8 border-t border-white/5 bg-white/5">
                        <Button className="w-full h-12 text-sm font-black uppercase tracking-[0.2em]">Añadir al carrito</Button>
                    </CardFooter>
                </Card>

                {/* SIDEBAR DE STATS: Validación de Micro-Datos */}
                <div className="space-y-8">
                    <Card className="border-white/5 bg-card/30 backdrop-blur-sm">
                        <CardHeader className="p-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Reputación del Vendedor</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 pb-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Trophy className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white uppercase text-sm">Elite Seller</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">+500 ventas</p>
                                    </div>
                                </div>
                                <ShieldCheck className="h-6 w-6 text-green-500" />
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full w-[95%] bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <span>Seguridad: 100%</span>
                                <span>Confianza: 9.8/10</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/5 bg-card/30 backdrop-blur-sm">
                        <CardHeader className="p-6 pb-2">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Reseñas de la comunidad</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            {[1, 2].map((i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, idx) => <Star key={idx} className="h-3 w-3 text-yellow-500 fill-yellow-500" />)}
                                    </div>
                                    <p className="text-xs text-white/70 italic leading-relaxed">
                                        "Este juego es simplemente increíble. El diseño artístico es superior y la tipografía Outfit se ve genial en la interfaz."
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* TABLA DE AUDITORÍA: Validación de Grillas y Legibilidad */}
            <section className="space-y-6 text-center lg:text-left">
                <div className="space-y-2">
                    <h2 className="text-3xl font-headline font-black text-white uppercase tracking-tight">Registro de Transacciones</h2>
                    <p className="text-muted-foreground font-sans">Muestra de legibilidad en tablas de alto volumen de datos.</p>
                </div>
                
                <div className="rounded-2xl border border-white/5 bg-card/20 overflow-hidden shadow-2xl">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="py-5 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground pl-8">ID Transacción</TableHead>
                                <TableHead className="py-5 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Usuario</TableHead>
                                <TableHead className="py-5 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Estado</TableHead>
                                <TableHead className="py-5 font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground text-right pr-8">Valor Neto</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[
                                { id: "TX-90821", user: "Enrique Martinez", status: "VERIFICADO", price: 125000 },
                                { id: "TX-44211", user: "Mateo Rossi", status: "PENDIENTE", price: 8900 },
                                { id: "TX-12093", user: "Koro Ninja", status: "VERIFICADO", price: 440500 },
                            ].map((row) => (
                                <TableRow key={row.id} className="border-white/5 hover:bg-white/5 transition-all group">
                                    <TableCell className="py-4 font-mono text-xs text-muted-foreground pl-8">#{row.id}</TableCell>
                                    <TableCell className="py-4 font-bold text-white text-sm uppercase">{row.user}</TableCell>
                                    <TableCell className="py-4">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] font-black uppercase py-0",
                                            row.status === "VERIFICADO" ? "text-green-500 border-green-500/20 bg-green-500/5" : "text-yellow-500 border-yellow-500/20 bg-yellow-500/5"
                                        )}>
                                            {row.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-4 text-right font-black text-white text-base pr-8">
                                        ${row.price.toLocaleString("es-AR")}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </section>

            {/* FOOTER DE MUESTRA: Descargas y Acciones */}
            <footer className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-12 pb-24 gap-8">
                <div className="flex items-center gap-6">
                    <Button variant="ghost" className="text-muted-foreground hover:text-white group">
                        <Download className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> Versión PDF
                    </Button>
                    <Button variant="ghost" className="text-muted-foreground hover:text-white group">
                        <Share2 className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" /> Compartir Proyecto
                    </Button>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-30">
                    Propiedad Intelectual de 4Fun Store &copy; 2026
                </p>
            </footer>

        </div>
    );
}
