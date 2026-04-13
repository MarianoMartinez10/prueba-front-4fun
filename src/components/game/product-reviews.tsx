"use client";

/**
 * Capa de Interfaz: Sistema de Reseñas y Feedback (Product Reviews)
 * --------------------------------------------------------------------------
 * Orquesta la captura y visualización de la experiencia del usuario.
 * Implementa el análisis de sentimiento automatizado (IA), métricas de 
 * utilidad y validación de compra veríficada para asegurar la integridad 
 * de la reputación del catálogo. (MVC / View)
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient, ApiError } from "@/lib/api";
import type { Review, ReviewStats, ReviewSentiment } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

/**
 * RN - Configuración de Semántica: Mapeo de estados del análisis de sentimiento IA.
 */
const sentimentConfig: Record<ReviewSentiment, { label: string; color: string; emoji: string }> = {
  positive: { label: "Positivo", color: "bg-green-500/15 text-green-400 border-green-500/30", emoji: "😄" },
  neutral: { label: "Neutral", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", emoji: "😐" },
  negative: { label: "Negativo", color: "bg-red-500/15 text-red-400 border-red-500/30", emoji: "😞" },
  mixed: { label: "Mixto", color: "bg-purple-500/15 text-purple-400 border-purple-500/30", emoji: "🤔" },
};

/**
 * Componente Atómico: Selector de Calificación (Escala 1-5).
 */
function StarRating({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn(
            "transition-all duration-150 hover:scale-110 focus:outline-none disabled:cursor-not-allowed",
            (hover || value) >= star ? "text-yellow-400" : "text-muted-foreground/30"
          )}
        >
          <Star className={cn("h-7 w-7", (hover || value) >= star && "fill-current")} />
        </button>
      ))}
    </div>
  );
}

/**
 * Componente Atómico: Visualizador de Estrellas (Solo Lectura).
 */
function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            rating >= star ? "text-yellow-400 fill-yellow-400" : rating >= star - 0.5 ? "text-yellow-400 fill-yellow-400/50" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sort, setSort] = useState("recent");
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState("");
  const [formText, setFormText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const userReview = reviews.find((r) => r.user.id === user?.id);

  /**
   * RN - Tracción de Datos: Recupera el listado de reseñas con soporte para paginación y ordenamiento.
   */
  const fetchReviews = useCallback(async () => {
    try {
      const res = await ApiClient.getProductReviews(productId, { page, limit: 5, sort });
      setReviews(res.reviews || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch {
      // RN - Mantenibilidad: Fallo silencioso preventivo para no interrumpir la ficha técnica.
    }
  }, [productId, page, sort]);

  /**
   * RN - Analítica: Recupera las estadísticas agregadas de reputación.
   */
  const fetchStats = useCallback(async () => {
    try {
      const res = await ApiClient.getProductRatingStats(productId);
      setStats(res.data);
    } catch {
      // RN - Mantenibilidad: Fallo silencioso preventivo.
    }
  }, [productId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchReviews(), fetchStats()]).finally(() => setLoading(false));
  }, [fetchReviews, fetchStats]);

  /**
   * RN - Captura de Feedback: Procesa la creación de una nueva reseña.
   * Justificación TFI: Implementa validaciones de integridad antes del despacho al API.
   */
  const handleSubmit = async () => {
    if (!formRating) {
      toast({ title: "Falta Calificación", variant: "destructive" });
      return;
    }
    if (formText.length < 10) {
      toast({ title: "Reseña Insuficiente", description: "Mínimo 10 caracteres para asegurar feedback de calidad.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      await ApiClient.createReview(productId, {
        rating: formRating,
        title: formTitle || undefined,
        text: formText,
      });
      toast({ title: "¡Feedback Publicado!", description: "Su opinión ha sido integrada al análisis de sentimiento." });
      setShowForm(false);
      setFormRating(0);
      setFormTitle("");
      setFormText("");
      setPage(1);
      await Promise.all([fetchReviews(), fetchStats()]);
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : "Error crítico al publicar";
      toast({ title: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * RN - Interacción Comunitaria: Registra votos de utilidad 'Helpful'.
   */
  const handleHelpful = async (reviewId: string) => {
    if (!user) {
      toast({ title: "Autenticación Requerida", description: "Inicie sesión para valorar opiniones.", variant: "destructive" });
      return;
    }
    try {
      const res = await ApiClient.voteReviewHelpful(reviewId);
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, helpfulCount: res.data.helpfulCount } : r
        )
      );
    } catch (err: any) {
      const message = err instanceof ApiError ? err.message : "Error al registrar voto";
      toast({ title: message, variant: "destructive" });
    }
  };

  /**
   * RN - Moderación: Eliminación de reseñas por autoría o rol administrativo.
   */
  const handleDelete = async (reviewId: string) => {
    try {
      await ApiClient.deleteReview(reviewId);
      toast({ title: "Reseña Eliminada Correctamente" });
      await Promise.all([fetchReviews(), fetchStats()]);
    } catch (err: any) {
      toast({ title: "Fallo en Moderación", variant: "destructive" });
    }
  };

  return (
    <section className="space-y-8">
      <h2 className="text-2xl font-bold border-l-4 border-primary pl-4 flex items-center gap-2 text-white">
        <MessageSquare className="h-6 w-6 text-primary" />
        Opiniones de la Comunidad
      </h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Layer - Resumen Estadístico (RN - Algoritmos de Calidad) */}
          {stats && stats.totalReviews > 0 && (
            <div className="bg-card/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 items-center">
                
                {/* Score Promedio */}
                <div className="text-center md:text-left space-y-1">
                  <div className="text-6xl font-black text-white">{stats.averageRating}</div>
                  <StarDisplay rating={stats.averageRating} size="md" />
                  <p className="text-xs text-muted-foreground uppercase tracking-widest pt-2">
                    {stats.totalReviews} opinión{stats.totalReviews !== 1 ? "es" : ""}
                  </p>
                </div>

                {/* Histograma de Distribución */}
                <div className="space-y-1.5 px-4 border-x border-white/5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.distribution[star] || 0;
                    const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-4 text-right text-muted-foreground font-mono">{star}</span>
                        <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                        <Progress value={pct} className="h-2 flex-1 bg-white/5 [&>div]:bg-yellow-400" />
                        <span className="w-8 text-right text-[10px] font-bold text-white">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Síntesis Semántica (IA Analysis) */}
                <div className="space-y-3">
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    Sentimiento IA
                  </p>
                  {(["positive", "neutral", "negative", "mixed"] as ReviewSentiment[]).map((s) => {
                    const count = stats.sentiment[s] || 0;
                    if (count === 0) return null;
                    const cfg = sentimentConfig[s];
                    return (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <span role="img" aria-label={cfg.label}>{cfg.emoji}</span>
                        <span className="text-muted-foreground">{cfg.label}:</span>
                        <span className="font-bold text-white">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* RN - Acceso a Feedback: Formulario reactivo para nuevos aportes. */}
          {user && !userReview && (
            <div className="animate-in fade-in duration-500">
              {!showForm ? (
                <Button onClick={() => setShowForm(true)} variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary font-bold">
                  <Star className="mr-2 h-4 w-4" />
                  Calificar Producto
                </Button>
              ) : (
                <div className="bg-card/40 border border-primary/20 rounded-2xl p-6 space-y-4 shadow-2xl">
                  <h3 className="font-headline font-bold text-xl text-white">Tu Crítica: {productName}</h3>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Valoracion</label>
                    <StarRating value={formRating} onChange={setFormRating} disabled={submitting} />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Resumen (Opcional)</label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Excelente juego, muy entretenido"
                      className="bg-background/50 border-white/10"
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Comentario</label>
                    <Textarea
                      value={formText}
                      onChange={(e) => setFormText(e.target.value)}
                      placeholder="Contanos que te gusto del juego y como fue tu experiencia."
                      rows={5}
                      className="bg-background/50 border-white/10 resize-none"
                      disabled={submitting}
                    />
                    <p className="text-[10px] text-muted-foreground text-right font-mono">{formText.length} / 2000</p>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <Button onClick={handleSubmit} disabled={submitting} className="font-bold shadow-lg">
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Publicar Opinión
                    </Button>
                    <Button variant="ghost" onClick={() => setShowForm(false)} disabled={submitting} className="text-muted-foreground hover:text-white">
                      CANCELAR
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!user && (
            <p className="text-sm text-muted-foreground italic">
              Inicia sesión para dejar tu opinión. 
              <a href="/login" className="text-primary font-bold hover:underline ml-1">Ingresar →</a>
            </p>
          )}

          {/* Layer - Listado de Opiniones con Clasificación IA */}
          {(stats?.totalReviews ?? 0) > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Críticas de la Comunidad</span>
                <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
                  <SelectTrigger className="w-[200px] h-9 text-xs bg-card/20 border-primary/20 text-white font-mono">
                    <SelectValue placeholder="Ordenar Por" />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-xl">
                    <SelectItem value="recent">Recientes</SelectItem>
                    <SelectItem value="helpful">Más Útiles</SelectItem>
                    <SelectItem value="highest">Mejor Calificadas</SelectItem>
                    <SelectItem value="lowest">Baja Calificación</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    currentUserId={user?.id}
                    isAdmin={user?.role === "admin"}
                    onHelpful={handleHelpful}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* RN - Paginación de Opiniones */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-3 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 text-xs"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Retroceder
                  </Button>
                  <span className="text-xs font-mono text-white flex items-center px-4 bg-primary/10 rounded-full border border-primary/20">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary/20 text-xs"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Avanzar
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Empty State: Sin datos de reputación. */}
          {stats?.totalReviews === 0 && (
            <div className="text-center py-24 bg-card/10 rounded-3xl border border-dashed border-white/5">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-10 text-primary" />
              <p className="text-xl font-headline font-bold text-white">Sin opiniones aún</p>
              <p className="text-sm text-muted-foreground mt-2">Sé el primero en calificar este producto.</p>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/**
 * Componente de Presentación: Tarjeta de Reseña Individual.
 */
function ReviewCard({
  review,
  currentUserId,
  isAdmin,
  onHelpful,
  onDelete,
}: {
  review: Review;
  currentUserId?: string;
  isAdmin?: boolean;
  onHelpful: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOwner = currentUserId === review.user.id;
  const canDelete = isOwner || isAdmin;
  const initials = review.user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="bg-card/20 backdrop-blur-sm border border-white/5 rounded-2xl p-6 space-y-4 hover:border-primary/20 transition-all duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 ring-1 ring-primary/20">
            {review.user.avatar && <AvatarImage src={review.user.avatar} alt={review.user.name} />}
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{review.user.name}</span>
              {review.verified && (
                <Badge variant="outline" className="text-[9px] border-green-500/20 bg-green-500/5 text-green-400 gap-1 px-2 py-0 uppercase tracking-tighter">
                  <ShieldCheck className="h-3 w-3" /> Adquisición Verificada
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <StarDisplay rating={review.rating} size="sm" />
              <span className="text-[10px] text-muted-foreground font-mono uppercase">
                {new Date(review.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Badge de Sentimiento (RN - Auditoría IA) */}
        {review.sentiment && (
          <Badge variant="outline" className={cn("text-[9px] gap-1 px-2 py-1 shrink-0 uppercase tracking-widest font-bold", sentimentConfig[review.sentiment].color)}>
            <Sparkles className="h-2.5 w-2.5" />
            {sentimentConfig[review.sentiment].label}
          </Badge>
        )}
      </div>

      <div className="space-y-2 pl-14">
        {review.title && <h4 className="font-headline font-bold text-white tracking-wide">{review.title}</h4>}
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line border-l-2 border-white/5 pl-4">{review.text}</p>
        
        {/* Keywords extraídas por IA */}
        {review.sentimentKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {review.sentimentKeywords.map((kw) => (
              <span key={kw} className="text-[10px] font-mono text-primary/60 bg-primary/5 px-2 py-0.5 rounded border border-primary/10 capitalize">
                #{kw}
              </span>
            ))}
          </div>
        )}
      </div>

      <Separator className="bg-white/5" />

      <div className="flex items-center justify-between pl-14">
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] font-bold text-muted-foreground hover:text-primary gap-2 h-8 px-3 rounded-full border border-transparent hover:border-primary/10"
          onClick={() => onHelpful(review.id)}
          disabled={isOwner}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          ¿Es útil? ({review.helpfulCount})
        </Button>

        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="text-[10px] font-bold text-muted-foreground hover:text-red-400 gap-2 h-8 px-3 rounded-full border border-transparent hover:border-red-500/10"
            onClick={() => onDelete(review.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar Opinión
          </Button>
        )}
      </div>
    </div>
  );
}
