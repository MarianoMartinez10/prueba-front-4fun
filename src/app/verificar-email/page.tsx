"use client";

/**
 * Capa de Interfaz: Activación Registral de Identidad (Verify Email)
 * --------------------------------------------------------------------------
 * Orquesta la validación asíncrona de tokens de seguridad para la 
 * activación de cuentas de usuario. 
 * Responsabilidades:
 * 1. Consumo de Tokens: Captura el parámetro 'token' desde la URI (Query String).
 * 2. Validación Registral: Sincroniza con el API para dar de alta el estado 'verified'.
 * 3. Gestión de Flujos: Redirige al login ante éxito o provee mecanismos de recuperación ante fallo.
 * (MVC / View)
 */

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthApiService } from "@/lib/services/AuthApiService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    /**
     * RN - Sincronización de Identidad: Ejecuta la lógica de verificación institucional.
     */
    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Identificador de seguridad (token) ausente o íntegridad comprometida.');
            return;
        }

        const verify = async () => {
            try {
                const response = await AuthApiService.verifyEmail(token);
                if (response.success) {
                    setStatus('success');
                } else {
                    setStatus('error');
                    setMessage(response.message || 'El token ha expirado o ya ha sido procesado por el sistema.');
                }
            } catch (error: any) {
                console.error("[EmailVerification] Fallo en validación:", error);
                setStatus('error');
                setMessage(error.message || 'Error de sincronización con el servidor de identidades.');
            }
        };
        verify();
    }, [token]);

    return (
        <div className="container flex items-center justify-center min-h-[85vh] px-4 animate-in fade-in zoom-in-95 duration-700">
            <Card className="w-full max-w-md border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-white/10">
                <CardHeader className="pt-12 pb-6 text-center">
                    <CardTitle className="text-3xl font-headline font-bold text-white tracking-tighter">Protocolo de Activación</CardTitle>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 mt-2">Verificación de Credenciales en el Padrón</p>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-8 pb-12 px-10">
                    
                    {/* Estado: Procesamiento asíncrono */}
                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                                <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">Sincronizando con el Servidor...</p>
                        </div>
                    )}

                    {/* Estado: Verificación Exitosa (Activo Registrado) */}
                    {status === 'success' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500 w-full flex flex-col items-center gap-6">
                            <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-full relative group">
                                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full opacity-50" />
                                <ShieldCheck className="h-14 w-14 text-green-400 relative z-10" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold font-headline text-white">¡Identidad Validada!</h3>
                                <p className="text-sm text-muted-foreground">Sus credenciales han sido normalizadas. La cuenta ahora posee privilegios de acceso completos.</p>
                            </div>
                            <Button asChild className="w-full h-14 bg-primary text-black hover:bg-primary/90 font-black uppercase text-[10px] tracking-widest rounded-xl shadow-xl transition-all mt-4">
                                <Link href="/login">Acceder al Sistema <ArrowRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    )}

                    {/* Estado: Anomalía en Verificación (Fallo de Integridad) */}
                    {status === 'error' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-500 w-full flex flex-col items-center gap-6">
                            <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-full relative">
                                <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full opacity-50" />
                                <XCircle className="h-14 w-14 text-destructive relative z-10" />
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold font-headline text-white">Fallo de Protocolo</h3>
                                <p className="text-xs font-bold text-destructive uppercase tracking-widest bg-destructive/5 py-1 px-3 rounded-md border border-destructive/10 mt-2">
                                    {message}
                                </p>
                                <p className="text-sm text-muted-foreground pt-3">No se pudo constatar la validez de la solicitud. Por favor, genere un nuevo identificador desde su perfil.</p>
                            </div>
                            <Button asChild variant="outline" className="w-full h-12 border-white/10 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/5 transition-all mt-4">
                                <Link href="/">Regresar a la Terminal</Link>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="fixed bottom-10 flex flex-col items-center gap-2 opacity-30 select-none">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Email Verification Module v2.0</span>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] w-full items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
