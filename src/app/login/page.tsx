"use client";

/**
 * Capa de Interfaz: Terminal de Acceso y Autenticación (Login Page)
 * --------------------------------------------------------------------------
 * Orquesta el ingreso de identidades al sistema central. 
 * Responsabilidades:
 * 1. Validación de Credenciales: Aplica esquemas de seguridad (Zod) para 
 *    prevenir la inyección de datos malformados.
 * 2. Orquestación de Sesión: Sincroniza con el AuthContext para la 
 *    persistencia de tokens JWT.
 * 3. Gestión de Redirección: Implementa lógica de retorno post-autenticación 
 *    mediante parámetros de búsqueda (Search Params).
 * (MVC / View)
 */

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Loader2, LogIn, ShieldCheck, ArrowRight, UserKey } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, type LoginValues } from "@/lib/schemas";
import { useToast } from "@/hooks/use-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const { toast } = useToast();

  const { login, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * RN - Integridad de Captura: React Hook Form con persistencia Zod.
   */
  const form = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * RN - Protocolo de Ingreso: Procesa la validación de identidad.
   */
  const onSubmit = async (values: LoginValues) => {
    setIsSubmitting(true);
    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        toast({
          title: "Sincronización Exitosa",
          description: "Bienvenido al ecosistema 4Fun. Sesión iniciada.",
          className: "bg-green-50/10 border-green-500/20 text-green-400"
        });
        router.push(redirectPath);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Fallo de Identidad",
          description: result.message || "Las credenciales no coinciden con nuestros registros.",
        });
      }
    } catch (err: any) {
      console.error("[LoginModule] Error crítico:", err);
      toast({
        variant: "destructive",
        title: "Interrupción Técnica",
        description: err.message || "Ocurrió una anomalía al procesar el acceso.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Estado de Carga Inicial (Hydration)
   */
  if (authLoading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[85vh] py-8 px-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full max-w-md border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/10">
        <CardHeader className="pt-12 pb-6 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                <Image src="/logo.png" alt="4Fun Logo" width={100} height={100} className="h-20 w-20 object-contain relative z-10" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold text-white tracking-tighter italic">
              Terminal de Acceso
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">
              Protocolo de Autenticación Centralizada
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-10 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identificador de Correo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="usuario@dominio.com"
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Credencial de Seguridad</FormLabel>
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
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                >
                  ¿Restaurar Acceso?
                </Link>
              </div>
              <Button type="submit" className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl shadow-xl shadow-primary/20 transition-all group" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Validando Identidad...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-3 h-4 w-4" />
                    Ingresar al Sistema
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 text-center px-10 pb-12">
          <div className="w-full h-px bg-white/5" />
          <div className="text-xs text-muted-foreground">
            ¿No posee credenciales activas?{" "}
            <Link href="/register" className="text-primary hover:text-white transition-colors font-black uppercase tracking-widest text-[10px] ml-2 flex items-center justify-center mt-3 gap-2 group">
              Iniciar Registro <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex items-center justify-center gap-2 opacity-30 select-none pt-4">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Secure Auth Node TFI v1.2</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
    }>
      <LoginForm />
    </Suspense>
  );
}