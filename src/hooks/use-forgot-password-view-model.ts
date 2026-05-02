import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthApiService } from "@/lib/services/AuthApiService";

const ForgotPasswordSchema = z.object({
  email: z.string().email("Formato de correo electrónico inválido"),
});

export type ForgotPasswordValues = z.infer<typeof ForgotPasswordSchema>;

/**
 * ViewModel del Ecosistema de Recuperación (Forgot Password)
 * --------------------------------------------------------------------------
 * Encapsula la llamada a la API y el control de estado de envío (emailSent),
 * respetando el patrón para no acoplar la vista a la red.
 */
export function useForgotPasswordViewModel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (values: ForgotPasswordValues) => {
    setIsSubmitting(true);
    try {
      await AuthApiService.forgotPassword(values.email);
      setEmailSent(true);
    } catch (err: unknown) {
      // RN - Fake positive para evitar ataques de enumeración (Seguridad de Diseño)
      // No exponemos si el correo existe o no en el sistema.
      setEmailSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    emailSent,
    onSubmit: form.handleSubmit(handleSubmit)
  };
}
