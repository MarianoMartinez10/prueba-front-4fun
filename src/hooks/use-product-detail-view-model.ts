import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/utils";
import type { Game } from "@/lib/types";

export function useProductDetailViewModel(game: Game) {
    const router = useRouter();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { toast } = useToast();

    /**
     * RN - Integración Multimedia: Orquesta la normalización de activos visuales.
     * Transforma enlaces de YouTube en reproductores embebidos con parámetros optimizados.
     */
    const getEmbedUrl = (url: string) => {
        if (!url) return null;
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = url.match(youtubeRegex);
        if (match && match[1]) {
            return { type: 'youtube', src: `https://www.youtube-nocookie.com/embed/${match[1]}?autoplay=1&mute=1&loop=1&playlist=${match[1]}&rel=0&modestbranding=1&playsinline=1` };
        }
        return { type: 'video', src: url };
    };

    /**
     * Lógica de Presentación
     */
    const media = getEmbedUrl(game.trailerUrl || "");
    const isWishlisted = isInWishlist(game.id);
    const imageUrl = getImageUrl(game.imageId, "https://placehold.co/600x800/222/FFF?text=Sin+Imagen");
    const breadcrumbLabel = (game.name || "").trim() || "Detalle";

    const hasDiscount = (game.discountPercentage ?? 0) > 0;
    const finalPriceVal = game.finalPrice ?? game.price;
    const isFree = finalPriceVal <= 0;
    const isOutOfStock = game.stock === 0;

    /**
     * RN - Autoría y RBAC: Determina si el usuario tiene privilegios de edición sobre el activo.
     */
    const isAdmin = user?.role === "ADMIN";
    const isOwner = user?.id === game.seller?.id || (game as any).sellerId === user?.id;
    const canEdit = isAdmin || isOwner;

    // RN - Enrutamiento Dinámico: Direcciona al panel según el nivel de privilegio.
    const editUrl = isAdmin
        ? `/admin/products/${game.id}`
        : `/seller/products/${game.id}`;

    /**
     * Orquestadores Analíticos/Acción
     */
    const handleAddToCart = () => {
        if (isOutOfStock) {
            toast({ variant: "destructive", title: "Operación Restringida", description: "El activo se encuentra sin unidades en circulación." });
            return;
        }

        const cheapestOffer = game.offers?.length 
            ? game.offers.reduce((prev, curr) => (prev.price < curr.price ? prev : curr))
            : null;

        if (!cheapestOffer) {
            toast({ variant: "destructive", title: "Sin Ofertas", description: "No hay ofertas disponibles para añadir al carrito." });
            return;
        }

        addToCart({
            offerId: cheapestOffer.id,
            name: game.name,
            price: cheapestOffer.price,
            stock: cheapestOffer.stock,
            image: getImageUrl(game.imageId),
            platform: game.platform
        });
        toast({ title: "Carrito Actualizado", description: `${game.name} reservado exitosamente a través de ${cheapestOffer.storeName}.` });
    };

    const handleToggleWishlist = () => {
        toggleWishlist(game);
    };

    return {
        // Entidad Base
        game,
        // Estados Derivados / Validaciones
        user,
        media,
        isWishlisted,
        imageUrl,
        breadcrumbLabel,
        hasDiscount,
        isFree,
        isOutOfStock,
        finalPriceVal,
        canEdit,
        editUrl,
        // Protocolos de Red/Handler
        handleAddToCart,
        handleToggleWishlist
    };
}
