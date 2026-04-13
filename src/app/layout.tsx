import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AppProviders } from './providers';
import { Inter, Space_Grotesk } from 'next/font/google';

/**
 * Capa de Infraestructura: Layout de Raíz (Root Layout)
 * --------------------------------------------------------------------------
 * Actúa como el armazón estructural de toda la aplicación Next.js.
 * Responsable de la orquestación de proveedores globales, configuración de 
 * SEO, optimización de fuentes y normalización del DOM base. (Infrastructure)
 */

/**
 * RN - SEO (Search Engine Optimization): Configuración de metadatos globales.
 * Define la identidad del sitio para motores de búsqueda y redes sociales.
 */
export const metadata: Metadata = {
  title: '4Fun | Tu destino gamer',
  description: 'La mejor tienda de videojuegos digitales y físicos. Ofertas increíbles, entrega inmediata y soporte premium.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
};

/**
 * RN - Mantenibilidad (Web Vitals): Optimización de fuentes.
 * Se inyectan fuentes nativas de Google Fonts con políticas de 'swap' para
 * mejorar el tiempo de primera pintura (FCP) y evitar saltos de layout (CLS).
 */
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-headline', display: 'swap' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          inter.variable,
          spaceGrotesk.variable
        )}
      >
        {/* RN - Arquitectura de Estado: Inyección de proveedores de contexto globales. */}
        <AppProviders>
          <div className="relative flex min-h-dvh flex-col bg-background">
            {/* Capa de Navegación Global */}
            <Header />
            
            {/* Contenedor dinámico de rutas (Page Router) */}
            <main className="flex-1">{children}</main>
            
            {/* Capa de Información Institucional */}
            <Footer />
          </div>
          
          {/* RN - Notificaciones: Portal de mensajes efímeros del sistema. */}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
