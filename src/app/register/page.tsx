"use client";

/**
 * Capa de Interfaz: Registro de Usuario (Register Page)
 * --------------------------------------------------------------------------
 * Componente asintomático (Dumb Component) que consume su respectivo
 * ViewModel sin ensuciar la rama de renderizado.
 */

import { Suspense } from "react";
import Link from "next/link";
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
import { Loader2, UserPlus, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

// ✅ INYECCIÓN MVC
import { useRegisterViewModel } from "@/hooks/use-register-view-model";

function RegisterForm() {
  const { form, isSubmitting, authLoading, onSubmit } = useRegisterViewModel();

  if (authLoading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-[90vh] py-12 px-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full max-w-lg border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/10 relative">
        
        {/* Adorno Top gradient */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-80" />

        <CardHeader className="pt-12 pb-6 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-50 transition-opacity duration-1000 group-hover:opacity-100" />
                <div className="h-20 w-20 flex items-center justify-center bg-black/40 rounded-2xl border border-white/5 relative z-10 hover:rotate-6 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    <UserPlus className="h-10 w-10 text-primary" />
                </div>
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-headline font-bold text-white tracking-tight">
              Creá tu cuenta
            </CardTitle>
            <CardDescription className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-80">
              Sumate a la comunidad
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-6 md:px-10 pb-8">
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nombre de usuario</FormLabel>
                        <FormControl>
                        <Input
                            disabled={isSubmitting}
                            maxLength={50}
                            className="h-12 bg-white/5 border-white/5 rounded-2xl focus:ring-primary/40 text-white placeholder:opacity-20 transition-all hover:bg-white/10"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-destructive tracking-wide ml-1" />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Correo electrónico</FormLabel>
                        <FormControl>
                        <Input
                            type="email"
                            disabled={isSubmitting}
                            maxLength={100}
                            className="h-12 bg-white/5 border-white/5 rounded-2xl focus:ring-primary/40 text-white placeholder:opacity-20 transition-all hover:bg-white/10"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-destructive tracking-wide ml-1" />
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
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Contraseña</FormLabel>
                        <FormControl>
                        <Input
                            type="password"
                            disabled={isSubmitting}
                            maxLength={50}
                            className="h-12 bg-white/5 border-white/5 rounded-2xl focus:ring-primary/40 text-white placeholder:opacity-20 transition-all hover:bg-white/10"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-destructive tracking-wide ml-1" />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Confirmá tu contraseña</FormLabel>
                        <FormControl>
                        <Input
                            type="password"
                            disabled={isSubmitting}
                            maxLength={50}
                            className="h-12 bg-white/5 border-white/5 rounded-2xl focus:ring-primary/40 text-white placeholder:opacity-20 transition-all hover:bg-white/10"
                            {...field}
                        />
                        </FormControl>
                        <FormMessage className="text-[10px] font-bold text-destructive tracking-wide ml-1" />
                    </FormItem>
                    )}
                />
              </div>

              <Button type="submit" className="w-full h-14 bg-white/5 text-white hover:bg-primary hover:text-black border border-white/10 hover:border-primary font-black uppercase text-xs tracking-[0.15em] rounded-2xl shadow-xl hover:shadow-primary/20 transition-all duration-300 group mt-4" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Crear mi cuenta
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-6 text-center px-10 pb-10 mt-2">
          <div className="text-sm text-muted-foreground/80 font-medium tracking-tight">
            ¿Ya tenés una cuenta activada?{" "}
            <Link href="/login" className="text-white hover:text-primary transition-colors font-bold flex items-center justify-center mt-3 gap-2 group">
               <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1.5 transition-transform text-primary" /> Volver al Inicio de Sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}