"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Loader2,
    ArrowLeft,
    Shield,
    User as UserIcon,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CheckCircle2,
    XCircle,
    Package,
    DollarSign,
    ShoppingCart,
    Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface UserOrder {
    id: string;
    createdAt: string;
    totalPrice: number;
    orderStatus: string;
    isPaid: boolean;
    itemCount: number;
    items: { name: string; quantity: number; price: number }[];
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    address?: string | null;
    role: "user" | "admin";
    isVerified: boolean;
    createdAt: string;
    stats: {
        totalSpent: number;
        orderCount: number;
        totalOrders: number;
        lastOrderDate: string | null;
    };
    orders: UserOrder[];
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "delivered":
            return (
                <Badge className="bg-green-500 hover:bg-green-600">
                    Entregado
                </Badge>
            );
        case "processing":
            return (
                <Badge className="bg-blue-500 hover:bg-blue-600">
                    Procesando
                </Badge>
            );
        case "pending":
            return (
                <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-600"
                >
                    Pendiente
                </Badge>
            );
        case "shipped":
            return (
                <Badge className="bg-purple-500 hover:bg-purple-600">
                    Enviado
                </Badge>
            );
        case "cancelled":
            return <Badge variant="destructive">Cancelado</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

export default function UserProfilePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const userId = params.id as string;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await ApiClient.getUserById(userId);
                if ((res as any).success && (res as any).data) {
                    setProfile((res as any).data);
                }
            } catch (error: any) {
                console.error("Error loading user profile:", error);
                toast({
                    title: "Error",
                    description:
                        error.message || "No se pudo cargar el perfil.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchProfile();
    }, [userId, toast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/admin/users")}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Usuarios
                </Button>
                <Card>
                    <CardContent className="py-16 text-center text-muted-foreground">
                        <UserIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>Usuario no encontrado.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const initials = (profile.name || "U").substring(0, 2).toUpperCase();
    const memberSince = new Date(profile.createdAt).toLocaleDateString(
        "es-AR",
        { year: "numeric", month: "long", day: "numeric" }
    );
    const lastOrder = profile.stats.lastOrderDate
        ? new Date(profile.stats.lastOrderDate).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "Sin compras";

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Button
                variant="ghost"
                onClick={() => router.push("/admin/users")}
                className="gap-2"
            >
                <ArrowLeft className="h-4 w-4" /> Volver a Usuarios
            </Button>

            {/* Profile Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar className="h-20 w-20 border-4 border-primary/20">
                            {profile.avatar ? (
                                <AvatarImage
                                    src={profile.avatar}
                                    alt={profile.name}
                                />
                            ) : null}
                            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold font-headline">
                                {profile.name}
                            </h1>
                            <p className="text-muted-foreground flex items-center gap-2 justify-center sm:justify-start mt-1">
                                <Mail className="h-4 w-4" /> {profile.email}
                            </p>
                            <div className="flex items-center gap-3 mt-2 justify-center sm:justify-start flex-wrap">
                                {profile.role === "admin" ? (
                                    <Badge className="bg-red-500 hover:bg-red-600 gap-1">
                                        <Shield className="h-3 w-3" /> Admin
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="gap-1">
                                        <UserIcon className="h-3 w-3" /> Usuario
                                    </Badge>
                                )}
                                {profile.isVerified ? (
                                    <Badge
                                        variant="outline"
                                        className="border-green-500 text-green-500 gap-1"
                                    >
                                        <CheckCircle2 className="h-3 w-3" />{" "}
                                        Verificado
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="border-yellow-500 text-yellow-500 gap-1"
                                    >
                                        <XCircle className="h-3 w-3" /> Sin
                                        verificar
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="text-center sm:text-right text-sm text-muted-foreground space-y-1">
                            <p className="flex items-center gap-1 justify-center sm:justify-end">
                                <Calendar className="h-3.5 w-3.5" /> Miembro
                                desde {memberSince}
                            </p>
                            {profile.phone && (
                                <p className="flex items-center gap-1 justify-center sm:justify-end">
                                    <Phone className="h-3.5 w-3.5" />{" "}
                                    {profile.phone}
                                </p>
                            )}
                            {profile.address && (
                                <p className="flex items-center gap-1 justify-center sm:justify-end">
                                    <MapPin className="h-3.5 w-3.5" />{" "}
                                    {profile.address}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <DollarSign className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Gasto Total
                                </p>
                                <p className="text-xl font-bold">
                                    {formatCurrency(profile.stats.totalSpent)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <ShoppingCart className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Pedidos Pagados
                                </p>
                                <p className="text-xl font-bold">
                                    {profile.stats.orderCount}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <Package className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Órdenes
                                </p>
                                <p className="text-xl font-bold">
                                    {profile.stats.totalOrders}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Clock className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Última Compra
                                </p>
                                <p className="text-xl font-bold">
                                    {lastOrder}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Orders Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" /> Historial de Pedidos
                    </CardTitle>
                    <CardDescription>
                        Todos los pedidos realizados por este usuario.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {profile.orders.length === 0 ? (
                        <div className="py-12 text-center text-muted-foreground">
                            <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>Este usuario no tiene pedidos.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID Orden</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Pago</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead className="text-right">
                                        Total
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {profile.orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs">
                                            {order.id.slice(-8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleDateString("es-AR")}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(order.orderStatus)}
                                        </TableCell>
                                        <TableCell>
                                            {order.isPaid ? (
                                                <Badge
                                                    variant="outline"
                                                    className="text-green-600 border-green-600"
                                                >
                                                    Pagado
                                                </Badge>
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-red-500 border-red-500"
                                                >
                                                    Sin pagar
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                {order.items
                                                    .slice(0, 3)
                                                    .map((item, idx) => (
                                                        <p
                                                            key={idx}
                                                            className="text-xs text-muted-foreground"
                                                        >
                                                            {item.name}{" "}
                                                            <span className="opacity-60">
                                                                x{item.quantity}
                                                            </span>
                                                        </p>
                                                    ))}
                                                {order.items.length > 3 && (
                                                    <p className="text-xs text-muted-foreground opacity-50">
                                                        +
                                                        {order.items.length - 3}{" "}
                                                        más
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(order.totalPrice)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
