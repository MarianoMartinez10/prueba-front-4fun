"use client";

/**
 * Capa de Administración: Gestión de Usuarios y Permisos (Admin Users)
 * --------------------------------------------------------------------------
 * Orquesta la administración de cuentas y el control de acceso (RBAC). 
 * Provee herramientas para la moderación de roles, auditoría de perfiles y 
 * exportación de registros registrales para fines contables y de seguridad.
 * (MVC / Page)
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
    Loader2,
    Search,
    MoreVertical,
    Shield,
    User as UserIcon,
    Trash2,
    Filter,
    Download,
    FileSpreadsheet,
    FilePieChart,
    Users,
    ShieldAlert,
    RefreshCw
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";

// RN - Tipografía de Dominio: Definición local para la auditoría de usuarios.
interface User {
    id?: string;
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    isVerified: boolean;
    avatar?: string | null;
    createdAt: string;
}

export default function UsersPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const debouncedSearch = useDebounce(searchTerm);

    /**
     * RN - Auditoría de Identidad: Recupera el listado de usuarios con filtros aplicados.
     */
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await ApiClient.getUsers({
                page,
                limit: 10,
                search: debouncedSearch,
                role: roleFilter
            });

            if (res.success) {
                setUsers((Array.isArray(res.data) ? res.data : []) as any[]);
                setTotalPages(res.totalPages || 1);
            }
        } catch (error) {
            console.error("[UsersAdmin] Error synchronization:", error);
            toast({ title: "Fallo de Carga", description: "No se pudo recuperar la nómina de usuarios.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, roleFilter, toast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    /**
     * RN - Moderación RBAC: Gestiona la escalación de privilegios (Admin vs User).
     */
    const handleRoleUpdate = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        setActionLoading(userId);
        try {
            await ApiClient.updateUser(userId, { role: newRole });
            toast({ title: "Jerarquía Actualizada", description: `El usuario ha sido transicionado al rol: ${newRole.toUpperCase()}` });
            fetchUsers();
        } catch (err: any) {
            toast({ title: "Fallo en Moderación", description: err.message, variant: "destructive" });
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * RN - Baja de Entidades: Implementa la eliminación irreversible de perfiles.
     */
    const handleDelete = async (userId: string, name: string) => {
        if (!confirm(`¿Confirma el cese de actividad y baja lógica del perfil: ${name}?`)) return;

        setActionLoading(userId);
        try {
            await ApiClient.deleteUser(userId);
            toast({ title: "Baja Sincronizada", description: "El registro ha sido desactivado del sistema según normativa." });
            fetchUsers();
        } catch (err: any) {
            toast({ title: "Error en Operación", description: err.message, variant: "destructive" });
        } finally {
            setActionLoading(null);
        }
    };

    // ─── SUBSISTEMA DE AUDITORÍA REGISTRAL ───

    const handleExportCSV = () => {
        if (!users.length) return;
        const headers = ["Nombre", "Email", "Rol", "Verificado", "Registrado"];
        const rows = users.map(u => [
            u.name, u.email, u.role, u.isVerified ? "Sí" : "No", new Date(u.createdAt).toLocaleDateString("es-AR")
        ]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = Object.assign(document.createElement("a"), {
            href: url,
            download: `auditoria_usuarios_${new Date().getTime()}.csv`,
        });
        link.click();
    };

    const handleExportPDF = () => {
        if (!users.length) return;
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Reporte de Auditoría: Nómina de Usuarios", 14, 22);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha: ${new Date().toLocaleString("es-AR")} | 4Fun Marketplace`, 14, 30);
        doc.setTextColor(0);

        autoTable(doc, {
            startY: 40,
            head: [["IDENTIDAD", "E-MAIL CORPORATIVO", "JERARQUÍA", "VERIFICACIÓN", "ALTA SISTEMA"]],
            body: users.map(u => [
                u.name,
                u.email,
                u.role === "admin" ? "ADMINISTRADOR" : "USUARIO FINAL",
                u.isVerified ? "VERIFICADO" : "PENDIENTE",
                new Date(u.createdAt).toLocaleDateString("es-AR"),
            ]),
            styles: { fontSize: 8, cellPadding: 4 },
            headStyles: { fillColor: [45, 45, 55], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [245, 245, 250] }
        });
        doc.save(`auditoria_usuarios_${new Date().getTime()}.pdf`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <Card className="border-none bg-card/40 backdrop-blur-md shadow-2xl">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-1">
                        <CardTitle className="text-3xl font-headline font-bold text-white flex items-center gap-3">
                            <Users className="h-8 w-8 text-primary" />
                            Gestión de Cuentas y Accesos
                        </CardTitle>
                        <CardDescription className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                            Control RBAC, Moderación de Perfiles y Auditoría de Identidad
                        </CardDescription>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold" disabled={loading || users.length === 0}>
                                    <Download className="mr-2 h-4 w-4" /> EXPORTAR PADRÓN
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 sm:max-w-[400px]">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-headline text-white">Exportación Registral</DialogTitle>
                                    <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground mt-1">Formato de Auditoría de Identidad</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-3 py-6">
                                    <Button variant="outline" className="h-16 justify-between px-6 border-white/10 hover:border-primary/50" onClick={handleExportCSV}>
                                        <div className="flex items-center gap-4">
                                            <FileSpreadsheet className="h-6 w-6 text-green-500" />
                                            <p className="font-bold text-white uppercase text-xs">Planilla Excel (CSV)</p>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="h-16 justify-between px-6 border-white/10 hover:border-primary/50" onClick={handleExportPDF}>
                                        <div className="flex items-center gap-4">
                                            <FilePieChart className="h-6 w-6 text-destructive" />
                                            <p className="font-bold text-white uppercase text-xs">PDF Documento Auditor</p>
                                        </div>
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-8">
                    {/* Barra de Búsqueda y Filtrado */}
                    <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground opacity-50" />
                            <input
                                className="w-full bg-muted/20 border border-white/10 rounded-xl h-12 pl-12 pr-4 text-sm text-white placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                placeholder="Localizar por ID, Nombre o E-mail..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger className="w-full md:w-[220px] h-12 bg-muted/20 border-white/10 rounded-xl text-white font-bold text-xs uppercase tracking-widest">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <SelectValue placeholder="FILTRAR ROL" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10 text-white">
                                    <SelectItem value="all">TODOS LOS PERFILES</SelectItem>
                                    <SelectItem value="admin">ADMINISTRADORES</SelectItem>
                                    <SelectItem value="user">SOLO USUARIOS</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-white/5">
                                    <TableHead className="w-[80px] font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Activo</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Identidad de Usuario</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-center">Jerarquía</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-center">Estado</TableHead>
                                    <TableHead className="font-bold uppercase tracking-widest text-[10px] text-muted-foreground text-center">Alta</TableHead>
                                    <TableHead className="text-right font-bold uppercase tracking-widest text-[10px] text-muted-foreground">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i} className="border-white/5"><TableCell colSpan={6}><div className="h-14 bg-muted/10 animate-pulse rounded-lg" /></TableCell></TableRow>
                                    ))
                                ) : users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic">No se hallaron registros en el padrón.</TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id || user._id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                            <TableCell>
                                                <Avatar className="h-10 w-10 ring-2 ring-white/5">
                                                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                                                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{(user.name || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-white text-sm group-hover:text-primary transition-colors">{user.name}</span>
                                                    <span className="text-[10px] text-muted-foreground opacity-70 italic truncate max-w-[200px]">{user.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {user.role === 'admin' ? (
                                                    <Badge variant="default" className="bg-destructive text-white border-none gap-1 py-0 font-black text-[9px] uppercase tracking-tighter">
                                                        <ShieldAlert className="h-3 w-3" /> Admin
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="gap-1 py-0 font-bold text-[9px] uppercase tracking-tighter bg-muted/30">
                                                        <UserIcon className="h-3 w-3" /> Usuario
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {user.isVerified ? (
                                                    <Badge variant="outline" className="border-green-500/30 text-green-500 font-bold text-[9px] py-0 bg-green-500/5 uppercase">Verificado</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 font-bold text-[9px] py-0 bg-yellow-500/5 uppercase">Pendiente</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center text-xs font-mono text-muted-foreground opacity-60 italic">
                                                {new Date(user.createdAt).toLocaleDateString('es-AR')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="hover:bg-white/5" disabled={actionLoading === (user.id || user._id)}>
                                                            {actionLoading === (user.id || user._id) ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <MoreVertical className="h-4 w-4 text-muted-foreground" />}
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-xl border-white/10 text-white">
                                                        <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Moderación de Perfil</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id || user._id}`)} className="text-xs font-bold hover:bg-primary/10 hover:text-primary cursor-pointer">
                                                            Visualizar Auditoría
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleRoleUpdate(user.id || user._id, user.role)} className={cn("text-xs font-bold hover:bg-primary/10 hover:text-primary cursor-pointer", user.role === 'admin' ? "text-destructive" : "text-green-400")}>
                                                            <RefreshCw className="mr-2 h-4 w-4" /> {user.role === 'admin' ? 'Degradar a Cliente' : 'Elevar a Administrador'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-white/5" />
                                                        <DropdownMenuItem className="text-red-500 font-black text-xs hover:bg-red-500/10 cursor-pointer" onClick={() => handleDelete(user.id || user._id, user.name)}>
                                                            <Trash2 className="mr-2 h-4 w-4" /> DAR DE BAJA
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

                    {/* Barra de Navegación de Nómina */}
                    <div className="flex items-center justify-between mt-8 text-xs font-bold text-muted-foreground uppercase tracking-widest px-2">
                         <p>Página {page} de {totalPages}</p>
                         <div className="flex gap-2">
                             <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="border-white/10">Anterior</Button>
                             <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading} className="border-white/10">Siguiente</Button>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

