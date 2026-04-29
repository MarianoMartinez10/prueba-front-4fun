import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserApiService } from "@/lib/services/UserApiService";
import { useToast } from "@/hooks/use-toast";

/**
 * RN - Validación de Fortaleza: Protocolo mínimo de seguridad del padrón.
 * Se traslada al ViewModel para centralizar las reglas de negocio de identidad.
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

export type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>;

/**
 * ViewModel: Orquestación de Mutación de Credenciales (Reset Password)
 * --------------------------------------------------------------------------
 * Encapsula la validación de tokens y la persistencia de nuevas passwords.
 * Cumple con el patrón MVVM exigido para la arquitectura de la tesis.
 */
export function useResetPasswordViewModel(token: string) {
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
   * RN - Persistencia de Credencial: Sincroniza el nuevo secreto con el API.
   * Maneja errores registrales y redirección post-proceso.
   */
  const handleSubmit = async (values: ResetPasswordValues) => {
    setIsSubmitting(true);
    try {
      await UserApiService.resetPassword({ token, password: values.password });
      
      toast({
        title: "Actualización Exitosa",
        description: "Sus credenciales han sido normalizadas. Redirigiendo al login.",
        className: "bg-green-50/10 border-green-500/20 text-green-400"
      });
      
      router.push("/login");
    } catch (err: unknown) {
      const error = err as Error;
      console.error("[ResetPasswordViewModel] Fallo en mutación:", error.message);
      
      toast({
        variant: "destructive",
        title: "Fallo de Integridad",
        description: error.message || "El token de sesión ha expirado o es técnicamente inválido.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((v) => !v);
  const toggleConfirmVisibility = () => setShowConfirm((v) => !v);

  return {
    form,
    isSubmitting,
    showPassword,
    showConfirm,
    togglePasswordVisibility,
    toggleConfirmVisibility,
    onSubmit: form.handleSubmit(handleSubmit)
  };
}
