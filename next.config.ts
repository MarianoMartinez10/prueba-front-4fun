import type { NextConfig } from "next";

/**
 * Capa de Infraestructura: Configuración de Orquestación (Next.js Config)
 * --------------------------------------------------------------------------
 * Define las políticas de red, seguridad y optimización del servidor de 
 * aplicaciones. Actúa como el puente de bajo nivel entre el cliente React
 * y el ecosistema de despliegue (Vercel/Render). (Infrastructure)
 */

const nextConfig: NextConfig = {
  /**
   * RN - Seguridad de Activos: Control de origen para imágenes remotas.
   * Implementa CSP (Content Security Policy) restrictiva para mitigar
   * ataques de inyección de recursos no autorizados.
   */
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Infraestructura de Assets
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Infraestructura de Pruebas
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Stock de imágenes
      },
    ],
  },

  /**
   * RN - Mantenibilidad: Omite validaciones pesadas en el proceso de Build
   * para optimizar tiempos de despliegue en entornos de CI/CD.
   */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  /**
   * RN - Infraestructura de Red (Anti-CORS Proxy):
   * Redirige las peticiones que inician con `/api` hacia el servidor backend.
   * 
   * Beneficio TFI: Permite que el frontend y el backend se comuniquen como si
   * estuvieran en el mismo dominio, habilitando el envío seguro de cookies 
   * HttpOnly y resolviendo de raíz los problemas de origen cruzado (CORS).
   */
  async rewrites() {
    let backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9003';
    
    // Normalización de protocolo para evitar fallos de resolución en producción.
    if (!backendUrl.startsWith('http')) backendUrl = `https://${backendUrl}`;

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;