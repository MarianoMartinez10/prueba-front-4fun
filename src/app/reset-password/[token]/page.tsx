"use client";

/**
 * Capa de Interfaz: Mutación de Credenciales de Acceso (Reset Password)
 * --------------------------------------------------------------------------
 * Provee la interfaz para la actualización definitiva de la contraseña.
 * Responsabilidades:
 * 1. Validación de Integridad: Verifica la vigencia del token de sesión transitorio.
 * 2. Consistencia de Datos: Aplica reglas de coincidencia y complejidad de password.
 * 3. Actualización Registral: Sincroniza la nueva clave con el motor de identidades.
 * (MVC / View)
 */

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Loader2, KeyRound, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";

/**
 * RN - Validación de Fortaleza: Protocolo mínimo de seguridad del padrón.
 */
const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "La credencial debe poseer una longitud mínima de 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Discrepancia en la validación de contraseñas",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  /**
   * RN - Mutación de Identidad: Ejecuta la persistencia de la nueva credencial.
   */
  const onSubmit = async (values: ResetPasswordValues) => {
    setIsSubmitting(true);
    try {
      await ApiClient.resetPassword(token, values.password);
      toast({
        title: "Actualización Exitosa",
        description: "Sus credenciales han sido normalizadas. Redirigiendo al login.",
        className: "bg-green-50/10 border-green-500/20 text-green-400"
      });
      router.push("/login");
    } catch (err: any) {
      console.error("[ResetPassword] Fallo en mutación:", err);
      toast({
        variant: "destructive",
        title: "Fallo de Integridad",
        description: err.message || "El token de sesión ha expirado o es técnicamente inválido.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[90vh] py-8 px-4 animate-in fade-in zoom-in-95 duration-700">
      <Card className="w-full max-w-md border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/10">
        <CardHeader className="pt-12 pb-6 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl relative group">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                <KeyRound className="h-8 w-8 text-primary relative z-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-white tracking-tighter">
            Actualizar Credencial
          </CardTitle>
          <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70">
            Protocolo de Actualización Registral de Password
          </CardDescription>
        </CardHeader>

        <CardContent className="px-10 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nueva Contraseña</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={isSubmitting}
                          className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white placeholder:opacity-20 pr-12"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
                      <div className="relative group">
                        <Input
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={isSubmitting}
                          className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white placeholder:opacity-20 pr-12"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                          onClick={() => setShowConfirm((v) => !v)}
                          tabIndex={-1}
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold text-destructive uppercase tracking-tighter" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest transition-all rounded-xl shadow-xl shadow-primary/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Ejecutando Restauración...
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Normalizar Acceso
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex justify-center pb-12">
          <Link
            href="/forgot-password"
            className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Solicitar Identificador Alternativo
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
