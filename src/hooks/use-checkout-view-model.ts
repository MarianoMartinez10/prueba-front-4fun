import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/use-auth";
import { OrderApiService } from "@/lib/services/OrderApiService";
import { useToast } from "@/hooks/use-toast";

export function useCheckoutViewModel() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    document: "",
    paymentMethod: "mercadopago"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const nextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.document) {
        toast({ variant: "destructive", title: "Datos Incompletos", description: "Todos los campos personales son obligatorios para continuar." });
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Fallo de Sesión", description: "Es imperativo iniciar sesión para vincular el instrumento." });
      router.push("/login");
      return;
    }

    if (cart.length === 0) {
      toast({ variant: "destructive", title: "Operación Vacía", description: "No es factible originar un checkout sin inventario." });
      router.push("/productos");
      return;
    }

    setIsSubmitting(true);

    // ✅ REGLA QA E-COMMERCE #004: CARGA ÚTIL ESTERILIZADA (Payload Seguro)
    // El frontend JAMÁS remite precios. Solo el inventario base y parámetros logísticos.
    // El backend recaba precios de DB e incauta la orden.
    const secureOrderData = {
      userId: user.id,
      paymentMethod: formData.paymentMethod,
      shippingAddress: {
        nombre: formData.firstName,
        apellido: formData.lastName,
        correoElectronico: formData.email,
        documento: formData.document
      },
      orderItems: cart.map(item => ({
        offerId: item.offerId,
        quantity: item.quantity
      }))
      // INCISUM DE SEGURIDAD ELIMINADO: itemsPrice, shippingPrice, totalPrice, image, name.
    };

    try {
      const response = await OrderApiService.create(secureOrderData as any);

      if (response.paymentLink) {
        // Soporte robusto por si ObjectId llega anidado en distintas formas según Backend Node
        const resolvedOrderId = response.orderId || (response.order && (response.order.id || response.order._id));
        const query = new URLSearchParams({
          payment_link: String(response.paymentLink),
        });
        if (resolvedOrderId) query.set("order_id", String(resolvedOrderId));

        toast({ title: "Orden Sincronizada", description: "Estableciendo conexión encriptada con la pasarela..." });
        router.push(`/checkout/success?${query.toString()}`);
      } else {
        throw new Error("El motor no consolidó la liquidación externa.");
      }
    } catch (error: any) {
      console.error("[useCheckoutViewModel] Excepción de Liquidación:", error);
      toast({
        variant: "destructive",
        title: "Liquidación Interrumpida",
        description: error.response?.data?.message || error.message || "Fallo en la comunicación con el motor de pagos / Sin Stock."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    cart,
    cartTotal,
    user,
    isSubmitting,
    currentStep,
    formData,
    setFormData,
    handleChange,
    nextStep,
    prevStep,
    handleSubmit
  };
}
