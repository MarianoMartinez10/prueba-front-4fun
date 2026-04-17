"use client";

/**
 * Capa de Interfaz: Pie de Página Institucional (Footer)
 * --------------------------------------------------------------------------
 * Orquesta los enlaces de navegación secundaria, acceso a documentación corporativa
 * y datos de contacto técnicos. 
 * Implementa una estrategia de 'Client-Side Only rendering' para garantizar
 * la estabilidad de hidratación en Next.js 15.
 */

import React, { forwardRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AboutDialog } from "@/components/about-dialog";
import { FaqDialog } from "@/components/faq-dialog";

export function Footer() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // RN - Estabilidad: Si no ha montado, no renderizamos estructura compleja
  // para evitar el mismatch de hidratación con el servidor.
  if (!mounted) return <footer className="w-full h-20 bg-background" />;

  const footerLinks = {
    "Asistencia": [
      { title: "Centro de ayuda", href: "/contacto" },
      { title: "Preguntas frecuentes", href: "#faq" },
    ],
    "Institucional": [
      { title: "Sobre 4Fun", href: "#about" },
    ],
  };

  return (
    <footer className="w-full border-t border-white/5 bg-background/95 mt-16 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="container relative z-10 mx-auto max-w-screen-2xl px-4 py-8 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          
          {/* Identidad y Propósito */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center mb-6 hover:opacity-80 transition-opacity">
              <div className="relative h-16 w-16 md:h-20 md:w-20 transition-all duration-700">
                 <Image src="/logo.png" alt="4Fun Logo" fill className="object-contain" />
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Tu tienda de juegos digitales y fisicos en un solo lugar.
              Precios competitivos, entregas rapidas y soporte cuando lo necesites.
            </p>
          </div>

          {/* Mapeo Generativo de Categorías con Estética HTML Solicidada */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-headline font-bold text-white mb-6 uppercase tracking-[0.2em] text-xs underline decoration-primary/30 underline-offset-8 decoration-2">
                 {category}
              </h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.title}>
                    {link.href === "#about" ? (
                      <AboutDialog>
                         <FooterLink text={link.title} />
                      </AboutDialog>
                    ) : link.href === "#faq" ? (
                      <FaqDialog>
                         <FooterLink text={link.title} />
                      </FaqDialog>
                    ) : (
                      <Link href={link.href} className="inline-block w-full">
                         <FooterLink text={link.title} />
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

/**
 * Atómico: Enlace con Micro-animación (Sincronizado con HTML)
 */
const FooterLink = forwardRef<HTMLSpanElement, { text: string; onClick?: () => void }>(
  ({ text, onClick, ...props }, ref) => {
    return (
      <span 
        ref={ref}
        onClick={onClick}
        {...props}
        className="text-sm text-muted-foreground hover:text-primary transition-all uppercase font-medium tracking-tight cursor-pointer"
      >
        {text}
      </span>
    );
  }
);

FooterLink.displayName = "FooterLink";