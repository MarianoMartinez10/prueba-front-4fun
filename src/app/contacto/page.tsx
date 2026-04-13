"use client";

/**
 * Capa de Interfaz: Central de Consultas y Soporte Técnico (Contact Page)
 * --------------------------------------------------------------------------
 * Orquesta la captura de requerimientos de usuarios externos e integradores.
 * Responsabilidades:
 * 1. Validación de Esquemas: Aplica reglas estrictas vía Zod para integridad de datos.
 * 2. Gestión de Mensajería: Despacha los registros al motor de notificaciones.
 * 3. Feedback Operativo: Gestiona los estados de envío exitoso y reintentos.
 * (MVC / View)
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import { Loader2, CheckCircle, Mail, MessageSquare, Send, ArrowRight, User } from "lucide-react";

/**
 * RN - Validación de Identidad y Contenido: Protocolo de seguridad registral.
 */
const contactSchema = z.object({
  firstName: z.string().min(2, "Identificador nominal demasiado breve (mínimo 2 caracteres)"),
  lastName: z.string().min(2, "Identificador registral demasiado breve (mínimo 2 caracteres)"),
  email: z.string().email("Formato de correo electrónico institucional/personal inválido"),
  message: z.string().min(10, "El cuerpo del requerimiento debe ser descriptivo (mínimo 10 caracteres)").max(1000, "Límite de caracteres excedido (máximo 1000)")
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactoPage() {
  const { toast } = useToast();
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { firstName: "", lastName: "", email: "", message: "" }
  });

  /**
   * RN - Despacho de Requerimientos: Procesa la ingesta de la consulta.
   */
  const onSubmit = async (data: ContactFormData) => {
    try {
      await ApiClient.sendContactMessage(data);
      setSent(true);
      reset();
      toast({
        title: "Registro de Consulta Exitoso",
        description: "Su requerimiento ha sido ingresado al sistema de tickets.",
        className: "bg-green-50/10 border-green-500/20 text-green-400"
      });
    } catch (error: any) {
      console.error("[ContactModule] Fallo en despacho:", error);
      toast({
        title: "Atención: Error de Red",
        description: error.message || "No se pudo sincronizar la consulta con el servidor de soporte.",
        variant: "destructive"
      });
    }
  };

  /**
   * Layer - Confirmación de Recepción: Estado visual post-despacho.
   */
  if (sent) {
    return (
      <div className="container mx-auto max-w-2xl py-24 px-4 animate-in fade-in zoom-in-95 duration-700">
        <Card className="text-center border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="pt-16 pb-12 space-y-6">
            <div className="mx-auto bg-green-500/10 border border-green-500/20 p-6 rounded-full w-fit relative">
              <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full opacity-50 animate-pulse" />
              <CheckCircle className="h-12 w-12 text-green-400 relative z-10" />
            </div>
            <div className="space-y-2">
                <h2 className="text-3xl font-headline font-bold text-white tracking-tighter">Requerimiento Recibido</h2>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Su solicitud de contacto ha sido normalizada e ingresada. Un operador técnico responderá vía correo electrónico en breve.
                </p>
            </div>
            <Button variant="outline" onClick={() => setSent(false)} className="mt-6 h-12 px-8 border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5 rounded-xl transition-all">
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Enviar otro Requerimiento
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-20 px-4 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <Card className="border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="pt-12 px-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
                <CardTitle className="text-4xl font-headline font-bold text-white tracking-tighter">Consultas</CardTitle>
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-70">Soporte y Asesoría</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-10 pb-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User className="h-3 w-3" /> Nombre
                </Label>
                <Input id="firstName" {...register("firstName")} className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white placeholder:opacity-20" placeholder="" />
                {errors.firstName && (
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-tighter">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User className="h-3 w-3" /> Apellido
                </Label>
                <Input id="lastName" {...register("lastName")} className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white placeholder:opacity-20" placeholder="" />
                {errors.lastName && (
                  <p className="text-[10px] font-bold text-destructive uppercase tracking-tighter">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Mail className="h-3 w-3" /> Correo Electrónico
              </Label>
              <Input id="email" type="email" placeholder="institucional@dominio.com" {...register("email")} className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40 text-white placeholder:opacity-20" />
              {errors.email && (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-tighter">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Mensaje
              </Label>
              <Textarea
                id="message"
                className="min-h-[160px] bg-white/5 border-white/10 rounded-2xl focus:ring-primary/40 text-white placeholder:opacity-20 resize-none p-4"
                placeholder="Describa su consulta..."
                {...register("message")}
              />
              {errors.message && (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-tighter">{errors.message.message}</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="h-14 px-10 bg-primary text-black hover:bg-primary/90 font-black uppercase text-sm tracking-widest transition-all rounded-xl shadow-xl shadow-primary/20 group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    Enviar
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}