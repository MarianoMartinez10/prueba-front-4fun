"use client";

/**
 * Capa de Interfaz: Orquestador de Finalización de Compra (Checkout Page)
 * --------------------------------------------------------------------------
 * Gestiona el flujo crítico de liquidación de activos mediante un sistema 
 * de terminal por etapas (Stepper). 
 * Responsabilidades:
 * 1. Logística de Envío: Captura y valida datos registrales para el despacho.
 * 2. Orquestación Financiera: Delega la ejecución del cobro a la pasarela 
 *    externa (Mercado Pago) mediante preferencias seguras.
 * 3. Validación de Stock: Garantiza la integridad de la oferta antes del pago.
 * (MVC / View)
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, ShieldCheck, MapPin, CheckCircle2, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

/**
 * RN - Arquitectura de Flujo: Definición de fases del ciclo de checkout.
 */
const steps = [
  { id: 1, title: 'Datos de Despacho', icon: MapPin },
  { id: 2, title: 'Configuración Instrumental', icon: CreditCard },
  { id: 3, title: 'Auditoría Final', icon: CheckCircle2 },
];

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Argentina",
    paymentMethod: "mercadopago"
  });

  /**
   * RN - Integración de Estado: Previene discrepancias si el carro se vacía en sesión.
   */
  if (cart.length === 0) {
    return (
      <div className="container mx-auto py-32 text-center animate-in fade-in zoom-in-95 duration-700 px-4">
        <div className="h-24 w-24 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground opacity-20" />
        </div>
        <h1 className="text-4xl font-headline font-semibold mb-4 text-white tracking-tight">Carrito Vacío</h1>
        <p className="text-muted-foreground mb-10 text-sm uppercase tracking-widest font-medium opacity-60">No tienes productos seleccionados todavía.</p>
        <Button onClick={() => router.push("/productos")} className="h-12 px-8 rounded-full font-medium uppercase tracking-widest text-[10px] bg-primary text-black hover:bg-primary/90 shadow-xl transition-all">
            Ir al Catálogo
        </Button>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * RN - Validación de Fases: Controla el avance del stepper tras auditoría de datos.
   */
  const nextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep === 1) {
      if (!formData.street || !formData.city || !formData.zipCode) {
        toast({ variant: "destructive", title: "Error de Validación", description: "Los parámetros de localización son obligatorios para el despacho." });
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  /**
   * RN - Generación de Orden y Checkout: Orquesta la persistencia y el cobro.
   * Delega el protocolo financiero a Mercado Pago mediante un token de preferencia.
   */
  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Fallo de Sesión", description: "Inicie sesión para normalizar la transacción." });
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      userId: user.id,
      orderItems: cart.map(item => ({
        product: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image || ''
      })),
      shippingAddress: {
        fullName: user.name,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zipCode,
        country: formData.country
      },
      paymentMethod: formData.paymentMethod,
      itemsPrice: cartTotal,
      shippingPrice: 0,
      totalPrice: cartTotal,
    };

    try {
      const response = await ApiClient.createOrder(orderData as any);

      if (response.paymentLink) {
        toast({ title: "Orden Sincronizada", description: "Redirigiendo a pantalla de liquidación..." });
        router.push(`/checkout/success?payment_link=${encodeURIComponent(response.paymentLink)}&order_id=${response.orderId}`);
      } else {
        throw new Error("No se pudo obtener el enlace de liquidación de la pasarela.");
      }
    } catch (error: any) {
      console.error("[CheckoutEngine] Error Crítico:", error);
      toast({
        variant: "destructive",
        title: "Interrupción en Transacción",
        description: error.message || "Fallo en la comunicación con el motor de pagos."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-16 animate-in fade-in duration-1000">
      <div className="flex flex-col items-center mb-16 text-center">
        <h1 className="text-5xl font-semibold font-headline text-white tracking-tighter mb-4 italic uppercase">Finalizar Compra</h1>
        <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground opacity-60">Proceso de Pago Seguro - 4Fun Store</p>
      </div>

      {/* Stepper Dinámico (UX Premium) */}
      <div className="flex justify-center mb-16 px-4">
        <div className="flex items-center w-full max-w-3xl">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center relative gap-3">
                    <div className={cn(
                        "flex items-center justify-center w-14 h-14 rounded-2xl border transition-all duration-500",
                        isActive ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/10" :
                        isCompleted ? "border-primary bg-primary text-black" : "border-white/10 bg-white/5 text-muted-foreground"
                    )}>
                        <Icon className={cn("w-6 h-6", isCompleted && "animate-in zoom-in-50")} />
                    </div>
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest absolute -bottom-8 whitespace-nowrap",
                        isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                    {step.title}
                    </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 px-4">
                      <div className={cn("h-[2px] transition-all duration-700", isCompleted ? "bg-primary" : "bg-white/5")} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-12">
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {/* ETAPA 1: LOCALIZACIÓN */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="pt-10 px-10">
                    <CardTitle className="text-2xl font-semibold font-headline text-white">Datos de Envío</CardTitle>
                    <CardDescription className="text-xs">Completa la información para recibir tus productos.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10 space-y-6">
                    <form id="shipping-form" onSubmit={nextStep} className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dirección (Calle y Altura)</Label>
                        <Input name="street" required value={formData.street} onChange={handleChange} className="h-12 bg-white/5 border-white/10 rounded-xl" placeholder="Av. del Libertador 4500" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ciudad / Localidad</Label>
                            <Input name="city" required value={formData.city} onChange={handleChange} className="h-12 bg-white/5 border-white/10 rounded-xl" placeholder="Buenos Aires" />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Provincia / Región</Label>
                            <Input name="state" required value={formData.state} onChange={handleChange} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">C.P.</Label>
                            <Input name="zipCode" required value={formData.zipCode} onChange={handleChange} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                        </div>
                        <div className="col-span-2 space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">País / Jurisdicción</Label>
                            <Input name="country" required value={formData.country} onChange={handleChange} className="h-12 bg-white/5 border-white/10 rounded-xl" />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="bg-white/5 px-10 py-6 flex justify-between">
                    <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3 text-primary" /> Datos protegidos vía SSL
                    </p>
                    <Button type="submit" form="shipping-form" className="h-12 px-8 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary/90 transition-all">
                        Seleccionar Método <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* ETAPA 2: INSTRUMENTOS */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="pt-10 px-10">
                    <CardTitle className="text-2xl font-semibold font-headline text-white">Medio de Pago</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Selecciona cómo quieres pagar tu compra.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <RadioGroup defaultValue={formData.paymentMethod} onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })} className="gap-4">
                      <div className={cn(
                        "flex items-center space-x-4 border border-white/10 p-6 rounded-2xl cursor-pointer transition-all duration-300",
                        formData.paymentMethod === 'mercadopago' ? "bg-primary/10 border-primary ring-1 ring-primary" : "hover:bg-white/5"
                      )}>
                        <RadioGroupItem value="mercadopago" id="mercadopago" className="border-primary text-primary" />
                        <Label htmlFor="mercadopago" className="flex items-center gap-4 cursor-pointer w-full">
                          <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                             <CreditCard className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-bold text-white uppercase tracking-widest text-[11px]">Mercado Pago</p>
                            <p className="text-xs text-muted-foreground">Tarjetas de Crédito, Débito y Dinero en cuenta.</p>
                          </div>
                          <Badge variant="outline" className="ml-auto text-[10px] border-white/10 text-muted-foreground font-black uppercase tracking-widest">Enlace Certificado</Badge>
                        </Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                  <CardFooter className="bg-white/5 px-10 py-6 flex justify-between">
                    <Button variant="ghost" onClick={prevStep} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-all">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                    </Button>
                    <Button onClick={() => nextStep()} className="h-12 px-8 bg-primary text-black font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/10">
                        Siguiente Paso <CheckCircle2 className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* ETAPA 3: AUDITORÍA */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="border-none bg-card/40 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden">
                  <CardHeader className="pt-10 px-10">
                    <CardTitle className="text-2xl font-semibold font-headline text-white">Resumen de Compra</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Revisa los datos antes de finalizar el pedido.</CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-medium uppercase tracking-widest text-primary flex items-center gap-2">
                              <MapPin className="h-3 w-3" /> Confirmación de Destino
                          </h4>
                          <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                             <p className="text-sm text-white font-medium">{formData.street}</p>
                             <p className="text-xs text-muted-foreground mt-1">{formData.city}, {formData.zipCode}</p>
                             <p className="text-xs text-muted-foreground">{formData.state}, {formData.country}</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-medium uppercase tracking-widest text-primary flex items-center gap-2">
                              <CreditCard className="h-3 w-3" /> Protocolo de Liquidación
                          </h4>
                          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 flex items-center justify-between">
                             <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Mercado Pago (ARS)</span>
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          </div>
                       </div>
                    </div>
                    
                    <div className="bg-destructive/5 border border-destructive/20 p-6 rounded-2xl text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-destructive mb-2">Advertencia Legal</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Al proceder, usted autoriza la generación de la orden técnica y su posterior liquidación vía pasarela. Se aplicarán los términos de servicio vigentes.
                        </p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-white/5 px-10 py-8 flex justify-between">
                    <Button variant="ghost" onClick={prevStep} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-white transition-all">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Instrumentos
                    </Button>
                    <Button className="h-14 px-10 bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30" onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <ShieldCheck className="mr-3 h-5 w-5" />}
                      Finalizar y Ejecutar Pago
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Panel Sidebar: Ticket Maestro */}
        <div className="lg:col-span-4">
          <Card className="sticky top-24 border-none bg-card/60 backdrop-blur-3xl shadow-3xl rounded-[2.5rem] overflow-hidden ring-1 ring-primary/20">
            <CardHeader className="bg-primary/10 py-8 text-center border-b border-white/5">
              <CardTitle className="text-xl font-headline font-bold text-white tracking-widest uppercase">Ticket de Pedido</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-xs group">
                    <div className="space-y-1">
                        <p className="text-white font-bold transition-colors group-hover:text-primary">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.quantity} Unidad(es) x {formatCurrency(item.price)}</p>
                    </div>
                    <span className="text-white font-black tabular-nums">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-white/10 space-y-4">
                 <div className="flex justify-between text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    <span>Subtotal Operativo</span>
                    <span>{formatCurrency(cartTotal)}</span>
                 </div>
                 <div className="flex justify-between text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    <span>Logística Nacional</span>
                    <span className="text-green-400">Bonificado (0.00)</span>
                 </div>
                 
                 <div className="bg-white/5 p-6 rounded-2xl flex justify-between items-center ring-1 ring-white/10">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Total Inversión</span>
                    <span className="text-3xl font-black text-white tracking-tighter">{formatCurrency(cartTotal)}</span>
                 </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 flex flex-col items-center gap-4 opacity-40 grayscale group-hover:grayscale-0 transition-all">
             <div className="flex items-center gap-4 border border-white/10 px-4 py-2 rounded-full">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Integración Certificada: Mercado Pago Protocol</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
