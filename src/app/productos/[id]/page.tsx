import type { Metadata } from 'next';
import { ApiClient, ApiError } from '@/lib/api';
import { ProductDetailView } from '@/components/game/product-detail-view';
import { notFound } from 'next/navigation';
import { Game } from '@/lib/types';

/**
 * Capa de Presentación: Controlador de Ficha Técnica Dinámica (Product Details SSR)
 * --------------------------------------------------------------------------
 * Orquesta la recuperación de datos unitarios del catálogo y la inyección 
 * de metadatos SEO en tiempo de ejecución.
 * (MVC / View-Controller)
 */

/**
 * RN - Optimización de Rastreo (SEO): Genera metadatos dinámicos para indexadores.
 * Mantenibilidad: Centraliza la lógica de OpenGraph para mejorar el CTR en RRSS.
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    try {
        const game = await ApiClient.getProductById(id) as unknown as Game;
        return {
            title: `${game.name} | Hub Oficial 4Fun`,
            description: game.description ? game.description.substring(0, 160) : `Adquiera ${game.name} con las mejores condiciones financieras en 4Fun Store.`,
            openGraph: {
                title: game.name,
                description: game.description || undefined,
                images: game.imageId ? [game.imageId] : undefined,
                type: 'website',
            }
        };
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            return { title: 'Producto no encontrado | 4Fun' };
        }
        return { title: 'Error temporal | 4Fun' };
    }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    try {
        /**
         * RN - Hidratación en Servidor: Recupera la entidad técnica antes del renderizado.
         * Resiliencia: Si el activo no existe en el motor de persistencia, activa 
         * el protocolo de excepción 404 (Not Found).
         */
        const game = await ApiClient.getProductById(id) as unknown as Game;
        
        if (!game) {
            console.warn(`[ProductDetail] Activo ID ${id} no localizado en el padrón.`);
            notFound();
        }

        /**
         * RN - Renderizado Detallado: Delega la visualización al componente atómico 
         * de ficha técnica, inyectando la entidad pre-hidratada.
         */
        return <ProductDetailView game={game} />;
        
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
            notFound();
        }

        console.error('[ProductDetail] Error operativo en resolución de servidor:', error);
        throw error;
    }
}
