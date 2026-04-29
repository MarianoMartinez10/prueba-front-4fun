/**
 * ViewModel Helper: Transacciones (Escrow)
 * --------------------------------------------------------------------------
 * ⚠️  REFACTORIZACIÓN POO (Purga de Obsolescencia):
 *   Los métodos de fetch() directos han sido eliminados de este archivo y
 *   migrados a OrderApiService (src/lib/services/OrderApiService.ts).
 *
 * Este archivo contiene SOLO helpers de presentación (sin lógica HTTP).
 *
 * Para fetch de transacciones, usar:
 *   import { OrderApiService } from '@/lib/services/OrderApiService';
 *   await OrderApiService.getAllOrders(params);
 *
 * Principio de Responsabilidad Única (SRP — GoF):
 *   Un ViewModel no debe hacer llamadas HTTP. Ese es el rol de un Service.
 */

export interface Transaction {
  id: string;
  _id?: string;
  orderId: string;
  sellerId: string;
  amount: number;
  status: 'PENDING_APPROVAL' | 'FUNDS_RELEASED' | 'REJECTED' | 'CANCELLED';
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  seller?: { id: string; name: string; email: string; };
  order?: { id: string; totalPrice: number; };
  approvalAdmin?: { id: string; name: string; email: string; };
}

export interface EscrowBalance {
  totalEscrow: number;
  totalReleased: number;
  pendingCount: number;
  totalBalance: number;
}

export interface FinancialStats {
  totalEscrow: number;
  pendingTransactionCount: number;
  totalApproved: number;
  approvedTransactionCount: number;
  rejectedCount: number;
}

class TransactionHelpers {
  formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING_APPROVAL: '⏳ Pendiente de aprobación',
      FUNDS_RELEASED: '✅ Fondos liberados',
      REJECTED: '❌ Rechazada',
      CANCELLED: '🚫 Cancelada',
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      PENDING_APPROVAL: '#f59e0b',
      FUNDS_RELEASED: '#10b981',
      REJECTED: '#ef4444',
      CANCELLED: '#6b7280',
    };
    return colorMap[status] || '#9ca3af';
  }

  getDaysSince(createdAt: Date | string): number {
    const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    return Math.ceil(Math.abs(new Date().getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  isValidAmount(amount: number): boolean {
    return typeof amount === 'number' && amount > 0 && isFinite(amount);
  }
}

export default new TransactionHelpers();
