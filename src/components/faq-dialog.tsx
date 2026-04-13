"use client";

/**
 * Capa de Interfaz: Central de Consultas Frecuentes (FAQ Dialog)
 * --------------------------------------------------------------------------
 * Provee un repositorio de respuestas técnicas y operativas para el usuario.
 * Documenta la logística de entrega de licencias, la integración con 
 * Mercado Pago y las políticas de post-venta para productos digitales. 
 * Implementa una arquitectura de acordeones para optimizar la legibilidad. 
 * (MVC / View)
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

/**
 * RN - Base de Conocimiento: Mapeo de reglas de negocio operativas.
 */
const faqItems = [
  {
    question: "¿Cómo recibo mi licencia después de la transacción?",
    answer:
      "Tras la validación de la pasarela de pagos, el sistema asigna automáticamente las claves de activación (E-Keys) a su perfil. Recibirá una notificación instantánea vía E-mail y podrá auditar el registro en la sección 'Mi Cuenta' → 'Mis Pedidos'."
  },
  {
    question: "¿Qué protocolos de pago soporta la plataforma?",
    answer:
      "Operamos íntegramente a través de Mercado Pago, soportando transacciones mediante tarjetas de crédito/débito, transferencias bancarias (Vía CVU), y redes de cobranza extrabancaria (Pago Fácil / Rapipago)."
  },
  {
    question: "¿Cuál es la política de restitución para bienes digitales?",
    answer:
      "Al tratarse de licencias digitales de un solo uso, las transacciones se consideran definitivas una vez emitido el despacho técnico. Ante inconsistencias técnicas con una licencia, nuestro departamento de soporte realizará la auditoría correspondiente para su resolución."
  },
  {
    question: "¿La entrega de activos es inmediata?",
    answer:
      "Correcto. El flujo está automatizado mediante Webhooks. Una vez que la entidad financiera confirma la operación, el motor de inventario despacha la licencia en milisegundos."
  },
  {
    question: "¿Cómo se garantiza la procedencia de los productos?",
    answer:
      "4Fun Marketplace actúa como un canal oficial. Todas las licencias y medios físicos son 100% originales, legítimos y provistos directamente por sellos editoriales autorizados."
  },
  {
    question: "¿Existen facilidades de financiación?",
    answer:
      "La plataforma permite planes de pago en cuotas, sujetos a las condiciones vigentes de las entidades emisoras y las promociones activas en la pasarela de Mercado Pago al momento del checkout."
  }
];

interface FaqDialogProps {
  children: React.ReactNode;
}

export function FaqDialog({ children }: FaqDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-white/10 shadow-3xl custom-scrollbar">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-3 text-3xl font-headline font-bold text-white uppercase tracking-tight">
            <HelpCircle className="h-8 w-8 text-primary shadow-glow-primary rounded-full" />
            Preguntas Frecuentes
          </DialogTitle>
          <p className="text-xs text-primary font-bold uppercase tracking-[0.2em] mt-2">Centro de Asistencia Operativa</p>
        </DialogHeader>
        
        <Accordion type="single" collapsible className="w-full mt-4 border-t border-white/5">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-white/5">
              <AccordionTrigger className="text-left text-sm font-bold text-white hover:text-primary transition-colors py-4 uppercase tracking-tighter decoration-transparent">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-sm leading-relaxed border-l-2 border-primary/20 pl-4 py-2">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}
