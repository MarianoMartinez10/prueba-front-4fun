"use client";

/**
 * Capa de Interfaz: Recuperación de Credenciales (Forgot Password)
 * --------------------------------------------------------------------------
 * Orquesta la fase inicial del protocolo de restauración de identidad. 
 * Responsabilidades:
 * 1. Mitigación de Enumeración: Implementa una respuesta uniforme para 
 *    prevenir el descubrimiento de correos registrados (Security best practice).
 * 2. Despacho Sincrónico: Gestiona la solicitud de tokens al motor de autenticación.
 * 3. Feedback Operativo: Transición hacia el estado de 'Correo Despachado'.
 * (MVC / View)
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
import { Loader2, MailCheck, ArrowLeft, ShieldAlert } from "lucide-react";

/**
 * RN - Validación de Identidad: Estándar para la captura de correos institucionales.
 */
const ForgotPasswordSchema = z.object({
  email: z.string().email("Formato de correo electrónico inválido"),
});

type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  /**
   * RN - Protocolo de Seguridad: Despacha la solicitud de token.
   * Se fuerza un estado de éxito visual independientemente del resultado real 
   * para prevenir ataques de diccionario/enumeración en el padrón.
   */
  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsSubmitting(true);
    try {
      await ApiClient.forgotPassword(values.email);
      setEmailSent(true);
    } catch (err: any) {
      // RN - Mitigación: Persistencia del flujo positivo para ofuscación de datos.
      setEmailSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[90vh] py-8 px-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full max-w-md border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/10">
        <CardHeader className="pt-12 pb-6 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                <ShieldAlert className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-white tracking-tighter">
            Recuperación de Acceso
          </CardTitle>
          <CardDescription className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-70">
            Protocolo de Restauración de Identidad Digital
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-8">
          {emailSent ? (
            <div className="flex flex-col items-center gap-6 py-6 text-center animate-in slide-in-from-bottom-4 duration-500">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="rounded-full bg-primary/10 border border-primary/20 p-5 relative z-10">
                    <MailCheck className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div className="space-y-3">
                <p className="font-bold text-lg text-white">Instrucciones Despachadas</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Si la identidad nominal reside en nuestro padrón, recibirá un enlace de restauración en breve.
                </p>
                <div className="bg-white/5 p-3 rounded-xl">
                   <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Verificación sugerida: Carpeta de Correo No Deseado (Spam).</p>
                </div>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
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
                <Button type="submit" className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest transition-all rounded-xl shadow-xl shadow-primary/20" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sincronizando...
                    </>
                  ) : (
                    "Solicitar Token de Restablecimiento"
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pb-12">
          <Link
            href="/login"
            className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Regresar al Terminal de Acceso
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
