"use client";

/**
 * Capa de Interfaz: Pie de Página Institucional (Footer)
 * --------------------------------------------------------------------------
 * Orquesta los enlaces de navegación secundaria, acceso a documentación 
 * corporativa (Sobre Nosotros, FAQ) y datos de contacto técnicos. 
 * Centraliza la información institucional y legal del ecosistema. (MVC / View-Global)
 */

import Image from "next/image";
import Link from "next/link";
import { AboutDialog } from "@/components/about-dialog";
import { FaqDialog } from "@/components/faq-dialog";

/**
 * RN - Taxonomía Informativa: Agrupación lógica de enlaces institucionales.
 */
const footerLinks = {
  "Ecosistema": [
    { title: "Explorar catalogo", href: "/productos" },
    { title: "Juegos por plataforma", href: "/productos" },
    { title: "Juegos por genero", href: "/productos" },
  ],
  "Asistencia": [
    { title: "Centro de ayuda", href: "/contacto" },
    { title: "Preguntas frecuentes", href: "#faq" },
  ],
  "Institucional": [
    { title: "Sobre 4Fun", href: "#about" },
  ],
};

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-background/95 mt-16 backdrop-blur-xl">
      <div className="container mx-auto max-w-screen-2xl px-4 py-8 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          
          {/* Identidad y Propósito */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center mb-6 hover:opacity-80 transition-opacity">
              <Image src="/logo.png" alt="4Fun Logo" width={110} height={110} className="h-16 w-16 md:h-20 md:w-20 object-contain" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu tienda de juegos digitales y fisicos en un solo lugar.
              Precios competitivos, entregas rapidas y soporte cuando lo necesites.
            </p>
          </div>

          {/* Mapeo Generativo de Categorías */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-headline font-bold text-white mb-6 uppercase tracking-[0.2em] text-xs underline decoration-primary/30 underline-offset-8 decoration-2">{category}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.title}>
                    {link.href === "#about" ? (
                      <AboutDialog>
                        <button className="text-sm text-muted-foreground hover:text-primary transition-all text-left cursor-pointer uppercase font-medium tracking-tight">
                          {link.title}
                        </button>
                      </AboutDialog>
                    ) : link.href === "#faq" ? (
                      <FaqDialog>
                        <button className="text-sm text-muted-foreground hover:text-primary transition-all text-left cursor-pointer uppercase font-medium tracking-tight">
                          {link.title}
                        </button>
                      </FaqDialog>
                    ) : (
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-all uppercase font-medium tracking-tight">
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Layer - Auditoría de Propiedad Intelectual */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p className="font-mono uppercase tracking-widest">
            &copy; {new Date().getFullYear()} 4Fun Marketplace. Derechos Reservados.
          </p>
          <div className="flex gap-6 italic opacity-50">
            <span>Tienda oficial</span>
          </div>
        </div>
      </div>
    </footer>
  );
}