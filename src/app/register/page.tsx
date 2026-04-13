"use client";

/**
 * Capa de Interfaz: Portal de Altas de Identidad (Register Page)
 * --------------------------------------------------------------------------
 * Orquesta el proceso de incorporación de nuevos usuarios al padrón.
 * Responsabilidades:
 * 1. Validación de Integridad: Aplica reglas de coincidencia de password y 
 *    complejidad mínima (Zod).
 * 2. Captura de Perfil: Recolecta biometría básica (Nombre, Email) para la 
 *    creación del recurso en el motor de identidades.
 * 3. Orquestación Operativa: Delega la persistencia al AuthContext y gestiona 
 *    el flujo de éxito post-registro.
 * (MVC / View)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Loader2, UserPlus, ShieldCheck, ArrowRight, IdentificationCard } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterValues } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * RN - Integridad de Captura: React Hook Form con validación refinada (coincidencia).
   */
  const form = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  /**
   * RN - Protocolo Registral: Procesa la creación de la nueva identidad.
   */
  const onSubmit = async (values: RegisterValues) => {
    setIsSubmitting(true);
    try {
      const result = await register(
        values.name,
        values.email,
        values.password
      );

      if (result.success) {
        toast({
          title: "Sincronización Exitosa",
          description: "Identidad registrada en el padrón nacional. Redirigiendo...",
          className: "bg-green-50/10 border-green-500/20 text-green-400"
        });
        router.push("/");
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Fallo en Registro",
          description: result.message || "No se ha podido consolidar la identidad solicitada.",
        });
      }
    } catch (err: any) {
      console.error("[RegisterModule] Error Crítico:", err);
      toast({
        variant: "destructive",
        title: "Interrupción de Servicio",
        description: err.message || "Anomalía técnica durante el despachamiento de datos.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Estado de Carga por Hidratación
   */
  if (authLoading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[90vh] py-12 px-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full max-w-lg border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/10">
        <CardHeader className="pt-12 pb-6 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="h-20 w-20 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 relative z-10">
                    <IdentificationCard className="h-10 w-10 text-primary" />
                </div>
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold text-white tracking-tighter italic">
              Alta de Identidad
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
              Protocolo de Incorporación al Padrón Gamer
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nombre Nominativo</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="Usuario Ej."
                            disabled={isSubmitting}
                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white placeholder:opacity-20"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-destructive uppercase tracking-tighter" />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Correo de Identidad</FormLabel>
                        <FormControl>
                        <Input
                            placeholder="tu@email.com"
                            type="email"
                            disabled={isSubmitting}
                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white placeholder:opacity-20"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-destructive uppercase tracking-tighter" />
                    </FormItem>
                    )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nueva Credencial</FormLabel>
                        <FormControl>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            disabled={isSubmitting}
                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white placeholder:opacity-20"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-destructive uppercase tracking-tighter" />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Confirmar Credencial</FormLabel>
                        <FormControl>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            disabled={isSubmitting}
                            className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white placeholder:opacity-20"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-destructive uppercase tracking-tighter" />
                    </FormItem>
                    )}
                />
              </div>

              <Button type="submit" className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-xl shadow-primary/20 transition-all group mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Comprometiendo Identidad...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-3 h-4 w-4" />
                    Consolidar Registro
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 text-center px-10 pb-12">
          <div className="w-full h-px bg-white/5" />
          <div className="text-xs text-muted-foreground">
            ¿Ya posee una identidad validada?{" "}
            <Link href="/login" className="text-primary hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] ml-2 flex items-center justify-center mt-3 gap-2 group">
              Iniciar Sesión <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-2 opacity-30 select-none pt-4">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Secure Onboarding TFI v1.2</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}