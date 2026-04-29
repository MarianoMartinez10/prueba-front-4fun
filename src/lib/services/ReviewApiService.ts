import { HttpTransport } from '../transport';
import { Logger } from '../logger';

export interface Review {
  id: string;
  user: { id: string; name: string; avatar?: string | null };
  productId: string;
  rating: number;
  title: string;
  text: string;
  verified: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

/**
 * Capa de Servicio: Reseñas y Valoraciones (Domain Service)
 * --------------------------------------------------------------------------
 */
export class ReviewApiService {
  private static readonly logger = new Logger('ReviewApiService');

  static async getByProduct(productId: string, params?: any): Promise<any> {
    const qs = HttpTransport.buildQuery(params);
    return HttpTransport.request(`/reviews/product/${productId}${qs}`);
  }

  static async getRatingStats(productId: string): Promise<any> {
    return HttpTransport.request(`/reviews/product/${productId}/stats`);
  }

  static async create(productId: string, data: any): Promise<any> {
    return HttpTransport.request(`/reviews/product/${productId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async voteHelpful(reviewId: string): Promise<any> {
    return HttpTransport.request(`/reviews/${reviewId}/helpful`, {
      method: 'POST'
    });
  }

  static async delete(reviewId: string): Promise<any> {
    return HttpTransport.request(`/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  }
}
